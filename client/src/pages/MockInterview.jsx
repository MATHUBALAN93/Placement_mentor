import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api.js';
import { PlayCircle, MessageSquare, Send, StopCircle, Award, Target, BrainCircuit, CheckSquare, FastForward } from 'lucide-react';

const MockInterview = () => {
    const [session, setSession] = useState(null);
    const [sessionStatus, setSessionStatus] = useState('UNSTARTED'); // UNSTARTED, ACTIVE, COMPLETED
    const [setupData, setSetupData] = useState({ companyId: '', roleTarget: 'SDE' });
    const [companies, setCompanies] = useState([]);

    const [transcript, setTranscript] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [processingAnswer, setProcessingAnswer] = useState(false);
    const [ending, setEnding] = useState(false);
    const [errorDetails, setErrorDetails] = useState('');

    const endOfScrollRef = useRef(null);

    useEffect(() => {
        fetchConfigs();
    }, []);

    useEffect(() => {
        endOfScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const fetchConfigs = async () => {
        try {
            const res = await api.get('/companies');
            setCompanies(res.data.data);
            if (res.data.data.length > 0) {
                setSetupData(prev => ({ ...prev, companyId: res.data.data[0]._id }));
            }
        } catch (err) {
            console.warn('Failed to load companies for mock interview setup');
        }
    };

    const handleStartSession = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorDetails('');
        try {
            const res = await api.post('/interviews/start', setupData);
            setSession(res.data.data);
            setSessionStatus('ACTIVE');
            setTranscript([
                { role: 'system', text: `Welcome to the interview for ${setupData.roleTarget}. The recruiter AI has joined. Let's begin parsing the initial prompts...` }
            ]);
        } catch (err) {
            setErrorDetails(err.response?.data?.message || 'Failed to initialize session');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async (e) => {
        e.preventDefault();
        if (!currentAnswer.trim() || processingAnswer) return;

        const myAnswer = currentAnswer;
        setCurrentAnswer('');

        // Add User response optimistically
        setTranscript(prev => [...prev, { role: 'user', text: myAnswer }]);
        setProcessingAnswer(true);

        try {
            const res = await api.post(`/interviews/${session._id}/converse`, {
                studentAnswerText: myAnswer
            });
            // The backend will have appended the user's turn and the AI's next turn. 
            // We will refresh the transcript from the response.
            const freshTranscript = res.data.data.transcript;
            setTranscript(
                freshTranscript.map(t => ({ role: t.role === 'AI' ? 'system' : 'user', text: t.text }))
            );
        } catch (err) {
            // Revert if error
            setErrorDetails('Failed to process reply or receive next question');
        } finally {
            setProcessingAnswer(false);
        }
    };

    const handleEndSession = async () => {
        setEnding(true);
        try {
            const res = await api.post(`/interviews/${session._id}/finish`);
            setSession(res.data.data); // Should have metrics attached now
            setSessionStatus('COMPLETED');
        } catch (err) {
            setErrorDetails(err.response?.data?.message || 'Failed to submit ending flag');
        } finally {
            setEnding(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12 animate-fadeIn space-y-6">

            {/* Title block */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100/50 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BrainCircuit className="h-6 w-6 text-purple-600" />
                        AI Mock Interview Engine
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Simulate real-world behavioral and system design interrogations.</p>
                </div>

                {sessionStatus === 'ACTIVE' && (
                    <button
                        onClick={handleEndSession}
                        disabled={ending}
                        className="inline-flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2.5 rounded-xl text-sm font-bold transition border border-red-100"
                    >
                        <StopCircle className="h-5 w-5" />
                        {ending ? 'Grading...' : 'End Session Early'}
                    </button>
                )}

                {sessionStatus === 'COMPLETED' && (
                    <button
                        onClick={() => setSessionStatus('UNSTARTED')}
                        className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 hover:bg-purple-100 px-5 py-2.5 rounded-xl text-sm font-bold transition border border-purple-100"
                    >
                        <FastForward className="h-5 w-5" />
                        Start New Session
                    </button>
                )}
            </div>

            {errorDetails && (
                <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-650 border border-red-200">
                    {errorDetails}
                </div>
            )}

            {/* State Switcher */}
            {sessionStatus === 'UNSTARTED' && (
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-gray-100/50 shadow-sm mt-8">
                    <h3 className="text-lg font-bold text-gray-801 mb-6">Configure Next Interview</h3>
                    <form onSubmit={handleStartSession} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Role Context</label>
                            <select
                                value={setupData.roleTarget}
                                onChange={(e) => setSetupData(prev => ({ ...prev, roleTarget: e.target.value }))}
                                className="block w-full rounded-2xl border border-gray-150 px-4 py-3.5 text-sm focus:border-purple-500 focus:outline-none bg-white transition"
                            >
                                <option value="SDE">Software Development Engineer (SDE)</option>
                                <option value="Frontend Engineer">Frontend Engineer</option>
                                <option value="Backend Engineer">Backend Engineer</option>
                                <option value="Fullstack Engineer">Fullstack Engineer</option>
                                <option value="Data Scientist">Data Scientist</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Company Guidelines (Optional)</label>
                            <select
                                value={setupData.companyId}
                                onChange={(e) => setSetupData(prev => ({ ...prev, companyId: e.target.value }))}
                                className="block w-full rounded-2xl border border-gray-150 px-4 py-3.5 text-sm focus:border-purple-500 focus:outline-none bg-white transition"
                            >
                                <option value="">Agnostic General Interview</option>
                                {companies.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 px-6 py-4 text-sm font-bold text-white transition shadow-lg shadow-purple-100"
                            >
                                <PlayCircle className="h-5 w-5" />
                                {loading ? 'Booting Simulators...' : 'Launch Simulated Application'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Active Session Mode */}
            {sessionStatus === 'ACTIVE' && (
                <div className="flex flex-col h-[65vh] bg-white rounded-3xl border border-gray-100/50 shadow-sm overflow-hidden relative">
                    {/* Transcript View area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                        {transcript.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white'}`}>
                                    {msg.role === 'user' ? <MessageSquare className="h-5 w-5" /> : <BrainCircuit className="h-5 w-5" />}
                                </div>
                                <div className={`p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-white text-gray-800 rounded-tr-sm border border-gray-100' : 'bg-white text-gray-800 border-l-4 border-purple-500'}`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}

                        {processingAnswer && (
                            <div className="flex gap-4 max-w-3xl">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                                    <BrainCircuit className="h-5 w-5" />
                                </div>
                                <div className="p-4 rounded-2xl bg-white text-gray-500 rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-2">
                                    <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></span>
                                    <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={endOfScrollRef} className="h-4" />
                    </div>

                    {/* Form Reply Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSubmitAnswer} className="relative flex items-center">
                            <textarea
                                rows="2"
                                placeholder="Type or dictate your verbal response (use complete sentences to simulate speaking)..."
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                disabled={processingAnswer}
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-5 pr-16 py-4 text-sm focus:border-purple-500 focus:bg-white focus:outline-none transition resize-none disabled:opacity-60"
                            />
                            <button
                                type="submit"
                                disabled={processingAnswer || !currentAnswer.trim()}
                                className="absolute right-3 h-10 w-10 flex items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition disabled:bg-purple-300"
                            >
                                <Send className="h-4 w-4 -ml-0.5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Completed Results Mode */}
            {sessionStatus === 'COMPLETED' && session?.metrics && (
                <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100/50 shadow-sm animate-scaleUp">
                    <div className="text-center pb-8 border-b border-gray-100">
                        <div className="inline-flex items-center justify-center h-28 w-28 rounded-full border-8 border-purple-50 bg-gradient-to-tr from-purple-100 text-purple-600 to-indigo-100 mb-6">
                            <Award className="h-10 w-10 text-purple-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-901">Simulation Completed</h2>
                        <p className="text-gray-500 mt-2">The AI interviewer has compiled your transcripts and graded your behavior.</p>
                    </div>

                    <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-purple-600 flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Grading Metrics
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-150 text-sm">
                                    <span className="font-semibold text-gray-700">Communication & Clarity</span>
                                    <span className="font-extrabold text-purple-700">{session.metrics.communicationScore}/100</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-150 text-sm">
                                    <span className="font-semibold text-gray-700">Technical Accuracy (Keywords)</span>
                                    <span className="font-extrabold text-purple-700">{session.metrics.technicalScore}/100</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                <CheckSquare className="h-5 w-5" />
                                Behavioral Feedback Summary
                            </h3>
                            <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl h-full">
                                <p className="text-sm text-emerald-900 leading-relaxed font-medium">
                                    {session.feedbackSummary || 'Impressive performance! Focus on clarifying your constraints and talking through your architectural assumptions before drafting your logic.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MockInterview;
