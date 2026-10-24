import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { Award, ArrowRight, CheckCircle2, ChevronRight, AlertCircle, Clock } from 'lucide-react';

const Assessment = () => {
    const navigate = useNavigate();

    const [assessment, setAssessment] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOpt, setSelectedOpt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submittingAnswers, setSubmittingAnswers] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [resultsMode, setResultsMode] = useState(false);

    // Simple Timer
    const [secondsElapsed, setSecondsElapsed] = useState(0);

    useEffect(() => {
        fetchActiveAssessment();
    }, []);

    useEffect(() => {
        let timer;
        if (assessment && assessment.status === 'In-Progress' && !resultsMode) {
            timer = setInterval(() => {
                setSecondsElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [assessment, resultsMode]);

    const fetchActiveAssessment = async () => {
        try {
            const res = await api.get('/assessments/history');
            if (res.data.data.length > 0) {
                // Has past completed test, check if they want to restart or review
                setAssessment(res.data.data[0]);
                setResultsMode(true);
                setLoading(false);
            } else {
                // Start or resume test
                await startNewQuiz();
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to read assessments history');
            setLoading(false);
        }
    };

    const startNewQuiz = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const res = await api.post('/assessments/start');
            setAssessment(res.data.data);
            setCurrentIdx(0);
            setSelectedOpt(null);
            setResultsMode(false);
            setSecondsElapsed(0);
            setLoading(false);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to start diagnostic assessment');
            setLoading(false);
        }
    };

    const handleOptionSelect = (index) => {
        setSelectedOpt(index);
    };

    const handleNextQuestion = async () => {
        if (selectedOpt === null) {
            setErrorMessage('Please select an option before moving forward');
            return;
        }

        setSubmittingAnswers(true);
        setErrorMessage('');

        try {
            const currentQuestion = assessment.questions[currentIdx];
            await api.post(`/assessments/${assessment._id}/answer`, {
                questionId: currentQuestion.questionId._id,
                studentAnswerIndex: selectedOpt,
                timeTakenSeconds: secondsElapsed
            });

            // Clear selection and advance
            setSelectedOpt(null);
            setSecondsElapsed(0);

            if (currentIdx + 1 < assessment.questions.length) {
                setCurrentIdx(prev => prev + 1);
            } else {
                // Complete the test automatically
                await finishAssessment();
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to save answer');
        } finally {
            setSubmittingAnswers(false);
        }
    };

    const finishAssessment = async () => {
        setCompleting(true);
        try {
            const res = await api.post(`/assessments/${assessment._id}/complete`);
            setAssessment(res.data.data);
            setResultsMode(true);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to complete assessment');
        } finally {
            setCompleting(false);
        }
    };

    const formatTime = (sec) => {
        const min = Math.floor(sec / 60);
        const s = sec % 60;
        return `${min}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    if (resultsMode && assessment) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fadeIn">
                <div className="bg-white p-8 rounded-3xl border border-gray-105 shadow-sm text-center">
                    <div className="h-16 w-16 bg-purple-50 text-purple-650 flex items-center justify-center rounded-full mx-auto mb-6">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-901">Diagnostic Quiz Complete</h2>
                    <p className="text-gray-400 text-xs mt-1">Calculated readiness results and seeded curriculum profile</p>

                    <div className="my-8 flex justify-center gap-8">
                        <div className="bg-gray-50 px-6 py-4 rounded-2xl">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Base Score</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">{assessment.score} / {assessment.totalQuestions}</h3>
                        </div>
                        <div className="bg-purple-50 px-6 py-4 rounded-2xl">
                            <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest">Readiness Set</p>
                            <h3 className="text-3xl font-extrabold text-purple-700 mt-1">Seeded</h3>
                        </div>
                    </div>

                    <div className="text-left bg-purple-50/50 border border-purple-100 p-6 rounded-2xl mb-8">
                        <h4 className="text-sm font-bold text-purple-800 mb-2">Mentor Feedback Analysis</h4>
                        <p className="text-xs text-purple-900 leading-relaxed">
                            {assessment.aiSummary || "Reviewing strengths... Your readiness status has been synched to the primary student dashboard."}
                        </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-700 px-6 py-3 text-sm font-semibold text-white transition shadow-lg shadow-purple-100"
                        >
                            Go to Dashboard
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={startNewQuiz}
                            className="inline-flex items-center gap-2 rounded-2xl bg-gray-100 hover:bg-gray-250/20 px-6 py-3 text-sm font-semibold text-gray-650 transition"
                        >
                            Retake Assessement
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!assessment || !assessment.questions || assessment.questions.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <AlertCircle className="h-10 w-10 text-gray-450 mx-auto mb-4" />
                <h3 className="text-base font-bold text-gray-850">No questions available</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Verify database has Assessment Questions loaded, then refresh page.</p>
                <button
                    onClick={startNewQuiz}
                    className="mt-6 rounded-xl bg-purple-605 px-4 py-2 text-xs font-semibold text-white"
                >
                    Retry Load
                </button>
            </div>
        );
    }

    const activeQuestion = assessment.questions[currentIdx]?.questionId;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fadeIn">
            {/* Quiz progress track */}
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Timer: {formatTime(secondsElapsed)}</span>
                </div>
                <span>Question {currentIdx + 1} of {assessment.questions.length}</span>
            </div>

            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
                <div
                    className="h-full bg-purple-650 transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / assessment.questions.length) * 100}%` }}
                />
            </div>

            {errorMessage && (
                <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-650 border border-red-200">
                    {errorMessage}
                </div>
            )}

            {/* Question Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-105 shadow-sm space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-purple-50 text-purple-600 px-3 py-1 rounded-full">
                    {activeQuestion?.difficulty || 'Medium'} Topic MCQ
                </span>

                <h3 className="text-base font-bold text-gray-850 leading-relaxed">
                    {activeQuestion?.questionText}
                </h3>

                {/* Options */}
                <div className="space-y-2">
                    {activeQuestion?.options.map((opt, oIdx) => {
                        const isSelected = selectedOpt === oIdx;
                        return (
                            <button
                                key={oIdx}
                                onClick={() => handleOptionSelect(oIdx)}
                                className={`flex w-full items-center justify-between p-4 rounded-2xl border text-sm font-medium text-left transition ${isSelected ? 'border-purple-650 bg-purple-50/50 text-purple-680' : 'border-gray-150 hover:bg-gray-50 text-gray-700'}`}
                            >
                                <span>{opt}</span>
                                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-purple-600' : 'border-gray-300'}`}>
                                    {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-purple-600" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Action button */}
                <div className="flex justify-end pt-4 border-t border-gray-50">
                    <button
                        onClick={handleNextQuestion}
                        disabled={submittingAnswers || completing}
                        className="inline-flex items-center gap-1.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 px-6 py-3.5 text-sm font-semibold text-white transition shadow-lg shadow-purple-100"
                    >
                        {currentIdx + 1 === assessment.questions.length ? 'Submit Assessment' : 'Next Question'}
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Assessment;
