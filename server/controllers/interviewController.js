import InterviewSession from '../models/InterviewSession.js';
import { evaluateInterviewTurn } from '../services/aiService.js';

// Define initial questions for mock interviews based on type
const INITIAL_QUESTIONS = {
    DSA: "Explain the difference between a tree and a graph. In what scenarios would you choose BFS over DFS for traversal?",
    Java: "What is the difference between an abstract class and an interface in Java? When would you use one over the other?",
    SQL: "Can you explain the differences between INNER JOIN, LEFT JOIN, and RIGHT JOIN, and write a query prototype demonstrating them?",
    OOP: "What are the four core pillars of Object-Oriented Programming? Provide a real-world coding analog for inheritance.",
    DBMS: "What is database normalization? Explain 1NF, 2NF, and 3NF simply.",
    HR: "Tell me about a challenging technical project you worked on and how you resolved conflicts or design hurdles in it.",
    Technical: "What happens under the hood when you type a URL into a web browser and hit Enter?",
    Mixed: "Explain complexity in terms of Big-O notations. What is the average time complexity of Quick Sort versus Merge Sort?"
};

// @desc    Start a mock interview session
// @route   POST /api/interviews/start
// @access  Private
export const startMockInterview = async (req, res, next) => {
    const { type } = req.body;

    try {
        if (!type || !INITIAL_QUESTIONS[type]) {
            return res.status(400).json({ success: false, message: 'Please provide a valid interview type (DSA, Java, SQL, OOP, DBMS, HR, Technical, Mixed)' });
        }

        // Terminate any active sessions to avoid multi-thread conflicts
        await InterviewSession.updateMany(
            { userId: req.user._id, status: 'In-Progress' },
            { $set: { status: 'Completed', completedAt: new Date() } }
        );

        const firstQuestionText = INITIAL_QUESTIONS[type];

        const session = await InterviewSession.create({
            userId: req.user._id,
            type,
            questions: [{
                questionText: firstQuestionText,
                studentAnswer: '',
                feedback: null
            }],
            status: 'In-Progress',
            currentQuestionIndex: 0
        });

        res.status(201).json({
            success: true,
            message: 'Interview session started',
            data: session
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit reply to active question & receive next
// @route   POST /api/interviews/:id/answer
// @access  Private
export const submitInterviewAnswer = async (req, res, next) => {
    const { studentAnswer } = req.body;

    try {
        const session = await InterviewSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ success: false, message: 'Interview session not found' });
        }

        if (session.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Interview session already completed' });
        }

        const currentIndex = session.currentQuestionIndex;
        const currentQuestion = session.questions[currentIndex];

        if (!studentAnswer || studentAnswer.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Please enter a non-empty answer' });
        }

        currentQuestion.studentAnswer = studentAnswer;

        // Call AI to evaluate answer
        const turnFeedback = await evaluateInterviewTurn(session.type, currentQuestion.questionText, studentAnswer);

        currentQuestion.feedback = {
            isCorrect: turnFeedback.isCorrect,
            score: turnFeedback.score || 5,
            analysis: turnFeedback.analysis || 'Answer captured.',
            followUpQuestion: turnFeedback.followUpQuestion || ''
        };

        // We restrict the session size to 3 questions/turns
        const MAX_TURNS = 3;

        if (currentIndex + 1 >= MAX_TURNS) {
            // Complete mock session
            session.status = 'Completed';
            session.completedAt = new Date();

            // Compile final overall weights
            let totalScores = 0;
            session.questions.forEach(q => {
                if (q.feedback) totalScores += q.feedback.score;
            });

            const avgScorePercent = Math.round((totalScores / (MAX_TURNS * 10)) * 100);

            session.evaluation = {
                technicalScore: avgScorePercent,
                communicationScore: Math.min(100, Math.round(avgScorePercent + (Math.random() * 10 - 5))),
                problemSolvingScore: Math.min(100, Math.round(avgScorePercent + (Math.random() * 10 - 5))),
                confidenceScore: studentAnswer.length > 50 ? 85 : 60,
                overallScore: avgScorePercent,
                suggestions: [
                    "Try to introduce specific examples when discussing architectural elements.",
                    "Frame coding challenges using the STAR method (Situation, Task, Action, Result).",
                    "Deepen your understanding of time/space complexity analyses."
                ]
            };

            await session.save();

            return res.json({
                success: true,
                message: 'Mock interview completed successfully',
                data: session
            });
        } else {
            // Append next question
            const nextQuestionText = turnFeedback.followUpQuestion || `Tell me more about how you would implement these ideas in high-throughput production frameworks.`;

            session.questions.push({
                questionText: nextQuestionText,
                studentAnswer: '',
                feedback: null
            });

            session.currentQuestionIndex += 1;
            await session.save();

            res.json({
                success: true,
                message: 'Answer processed, follow-up loaded',
                data: session
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get mock interview history list
// @route   GET /api/interviews/history
// @access  Private
export const getInterviewHistory = async (req, res, next) => {
    try {
        const history = await InterviewSession.find({ userId: req.user._id, status: 'Completed' })
            .sort({ completedAt: -1 });

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get specific mock interview details
// @route   GET /api/interviews/:id
// @access  Private
export const getInterviewDetail = async (req, res, next) => {
    try {
        const session = await InterviewSession.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ success: false, message: 'Mock interview not found' });
        }

        if (session.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this interview session' });
        }

        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        next(error);
    }
};
