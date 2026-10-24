import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { ExternalLink, Sparkles, BookOpen, AlertCircle, CheckCircle, Lightbulb, Play } from 'lucide-react';

const ProblemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [submitSpinner, setSubmitSpinner] = useState(false);

    // Form states
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [status, setStatus] = useState('Solved');
    const [timeTaken, setTimeTaken] = useState('20');
    const [hintsUsed, setHintsUsed] = useState(0);

    // AI Helper states
    const [loadingHint, setLoadingHint] = useState(false);
    const [aiHints, setAiHints] = useState({}); // Stores level -> hintText
    const [activeHintLevel, setActiveHintLevel] = useState(1);
    const [loadingReview, setLoadingReview] = useState(false);
    const [codeReview, setCodeReview] = useState('');

    useEffect(() => {
        fetchProblemDetails();
    }, [id]);

    const fetchProblemDetails = async () => {
        try {
            const res = await api.get(`/problems/${id}`);
            setProblem(res.data.data);
            setLoading(false);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to populate problem details');
            setLoading(false);
        }
    };

    const handleSubmitAttempt = async (e) => {
        e.preventDefault();
        setSubmitSpinner(true);
        setErrorMessage('');

        try {
            await api.post('/problems/attempts', {
                problemId: id,
                status,
                codeSubmitted: code,
                programmingLanguage: language,
                timeTakenMinutes: Number(timeTaken) || 20,
                hintsUsedCount: Number(hintsUsed)
            });
            // Force user profile streak update trigger
            try {
                await api.post('/users/streak/update');
            } catch (streakErr) {
                console.warn('Silent failure updating user streak');
            }

            navigate('/problems');
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to submit problem attempt');
            setSubmitSpinner(false);
        }
    };

    const triggerProgressiveHint = async () => {
        setLoadingHint(true);
        try {
            const nextLevel = hintsUsed + 1;

            const res = await api.post('/ai/hint', {
                code,
                problemTitle: problem.title,
                language,
                hintLevel: nextLevel
            });

            const newHint = res.data.data.hint;
            setAiHints(prev => ({ ...prev, [nextLevel]: newHint }));
            setHintsUsed(nextLevel);
            setActiveHintLevel(nextLevel);
        } catch (err) {
            setErrorMessage('Failed to connect to AI Mentor for Hints');
        } finally {
            setLoadingHint(false);
        }
    };

    const triggerCodeReview = async () => {
        if (!code || code.trim().length < 10) {
            setErrorMessage('Please paste some code inside the editor block first to audit');
            return;
        }
        setLoadingReview(true);
        setCodeReview('');
        try {
            const res = await api.post('/ai/analyze-solution', {
                code,
                problemTitle: problem.title,
                language
            });
            setCodeReview(res.data.data.analysis);
        } catch (err) {
            setErrorMessage('Failed to trigger AI code auditing');
        } finally {
            setLoadingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    if (errorMessage && !problem) {
        return (
            <div className="rounded-2xl bg-red-50 p-6 text-sm font-medium text-red-650 border border-red-100">
                {errorMessage}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 animate-fadeIn">

            {/* Left Column: Problem metadata & Submission form (7 cols) */}
            <div className="lg:col-span-7 space-y-6">

                {/* Header Block */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100/50 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-purple-50 text-purple-650 px-3 py-1 rounded-full">
                            {problem.topic?.name || 'DSA Pattern'}
                        </span>
                        <span className="text-xs font-semibold text-gray-400">Est. Time: {problem.estimatedTime || 30} mins</span>
                    </div>

                    <h1 className="text-2xl font-extrabold text-gray-950">{problem.title}</h1>

                    <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-500">
                        <span>Difficulty: <strong className="text-purple-600">{problem.difficulty}</strong></span>
                        <span>•</span>
                        <span>Platform: <strong>{problem.platform}</strong></span>
                    </div>

                    <p className="text-sm text-gray-550 leading-relaxed pt-2">
                        This problem is hosted externally on <strong>{problem.platform}</strong>. Click below to view specifications and solve it in their interface.
                    </p>

                    <a
                        href={problem.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl bg-purple-50 hover:bg-purple-100/70 border border-purple-200 px-6 py-3.5 text-sm font-semibold text-purple-600 transition"
                    >
                        Solve Externally on {problem.platform}
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </div>

                {/* Logging Submission Form */}
                <form onSubmit={handleSubmitAttempt} className="bg-white p-8 rounded-3xl border border-gray-100/50 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-gray-901">Log Your Solver Progress</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Outcome</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="block w-full rounded-xl border border-gray-150 px-3 py-2.5 text-xs focus:outline-none bg-white transition"
                            >
                                <option value="Solved">Solved Successfully</option>
                                <option value="Attempted">Attempted (Partially Working)</option>
                                <option value="Failed">Failed / Compilation Errors</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Time Taken (Mins)</label>
                            <input
                                type="number"
                                value={timeTaken}
                                onChange={(e) => setTimeTaken(e.target.value)}
                                className="block w-full rounded-xl border border-gray-150 px-3 py-2.5 text-xs focus:outline-none transition"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="block w-full rounded-xl border border-gray-150 px-3 py-2.5 text-xs focus:outline-none bg-white transition"
                            >
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Paste Code (Optional for AI support)</label>
                        <textarea
                            rows="8"
                            spellCheck="false"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="block w-full rounded-2xl border border-gray-150 p-4 text-xs font-mono placeholder-gray-400 focus:border-purple-500 focus:outline-none transition bg-gray-50/50"
                            placeholder={`// Paste your codebase solution here...\nvoid solve() {\n  // Code\n}`}
                        />
                    </div>

                    {errorMessage && (
                        <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-650 border border-red-200">
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={submitSpinner}
                            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 px-6 py-3.5 text-sm font-semibold text-white transition flex-1 shadow-lg shadow-purple-100"
                        >
                            {submitSpinner ? 'Submitting...' : 'Log Attempt Status'}
                        </button>

                        <button
                            type="button"
                            onClick={triggerCodeReview}
                            disabled={loadingReview}
                            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-6 py-3.5 text-sm font-semibold text-indigo-700 transition"
                        >
                            <Sparkles className="h-4 w-4" />
                            {loadingReview ? 'Reviewing...' : 'AI Code Review'}
                        </button>
                    </div>
                </form>

                {/* Code Review Result Box */}
                {codeReview && (
                    <div className="bg-gradient-to-tr from-purple-50 to-indigo-50 border border-purple-100 p-6 rounded-3xl space-y-4 animate-scaleUp">
                        <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                            <Sparkles className="h-5 w-5" />
                            <h4>AI Code Review Audit</h4>
                        </div>
                        <pre className="text-xs whitespace-pre-wrap leading-relaxed text-purple-950 font-sans">
                            {codeReview}
                        </pre>
                    </div>
                )}
            </div>

            {/* Right Column: AI Hint Panel (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-105 shadow-sm space-y-6">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-purple-600 shrink-0" />
                        <h3 className="text-sm font-bold text-gray-805">Escalating AI Hint System</h3>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">
                        Stuck? Get progressive guidance. System issues hints from conceptually gentle clues to complete solution code recursively.
                    </p>

                    {hintsUsed > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 flex-1 rounded-full ${i < hintsUsed ? 'bg-purple-600' : 'bg-gray-100'}`}
                                    />
                                ))}
                            </div>

                            <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] uppercase font-bold text-purple-700">Active Hint: Level {activeHintLevel}</span>
                                    <div className="flex gap-1.5">
                                        {Array.from({ length: hintsUsed }).map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setActiveHintLevel(i + 1)}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeHintLevel === i + 1 ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`}
                                            >
                                                L{i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <pre className="text-xs whitespace-pre-wrap leading-relaxed text-purple-950 font-sans">
                                    {aiHints[activeHintLevel] || 'Select level above.'}
                                </pre>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={triggerProgressiveHint}
                        disabled={loadingHint || hintsUsed >= 6}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 px-6 py-3.5 text-xs font-semibold text-white transition shadow-lg shadow-purple-100"
                    >
                        <Lightbulb className="h-4 w-4" />
                        {loadingHint ? 'Generating clue...' : hintsUsed >= 6 ? 'All hints unlocked' : hintsUsed === 0 ? 'Request first hint clue' : `Call Hint Level ${hintsUsed + 1}`}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ProblemDetails;
