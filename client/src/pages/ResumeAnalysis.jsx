import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { FileText, Upload, Sparkles, Check, AlertTriangle, Lightbulb } from 'lucide-react';

const ResumeAnalysis = () => {
    const [file, setFile] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchResumesList();
    }, []);

    const fetchResumesList = async () => {
        try {
            const res = await api.get('/resumes');
            setResumes(res.data.data);
            if (res.data.data.length > 0) {
                setSelectedResume(res.data.data[0]);
            }
            setLoading(false);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to fetch resume uploads logging');
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setErrorMessage('');
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setErrorMessage('Please select a PDF file first to upload');
            return;
        }

        setUploading(true);
        setErrorMessage('');

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await api.post('/resumes/upload', formData);
            const newResume = res.data.data;
            setResumes(prev => [newResume, ...prev]);
            setSelectedResume(newResume);
            setFile(null);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Upload failed. File must be a valid PDF under 5MB.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    const activeReview = selectedResume?.evaluation;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 animate-fadeIn">

            {/* Left Column: File upload & history log list (4 cols) */}
            <div className="lg:col-span-4 space-y-6">

                {/* Upload form container */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100/50 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-800">Scan New Resume</h3>

                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50/50 transition cursor-pointer relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-xs font-semibold text-gray-700 block">
                                {file ? file.name : 'Select PDF (Max 5MB)'}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-1 block">Click to select files</span>
                        </div>

                        {errorMessage && (
                            <p className="text-[11px] font-medium text-red-650">{errorMessage}</p>
                        )}

                        <button
                            type="submit"
                            disabled={uploading || !file}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-305 px-4 py-3 text-xs font-semibold text-white transition shadow-lg shadow-purple-50"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            {uploading ? 'Analyzing Resume...' : 'Analyze PDF Resume'}
                        </button>
                    </form>
                </div>

                {/* Upload History logs */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100/50 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-808">Upload History Log</h3>
                    {resumes.length === 0 ? (
                        <p className="text-xs text-gray-400 py-4 text-center">No resumes uploaded yet.</p>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {resumes.map((res) => {
                                const isActive = selectedResume?._id === res._id;
                                return (
                                    <button
                                        key={res._id}
                                        onClick={() => {
                                            setSelectedResume(res);
                                            setErrorMessage('');
                                        }}
                                        className={`flex w-full items-center gap-3 p-3 rounded-xl border text-left text-xs transition ${isActive ? 'bg-purple-50/50 border-purple-300 font-semibold text-purple-750' : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-650'}`}
                                    >
                                        <FileText className="h-4.5 w-4.5 text-gray-400 shrink-0" />
                                        <div className="truncate">
                                            <p className="truncate font-semibold text-gray-800">{res.fileName}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">Score: {res.evaluation.overallScore}/100</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: AI Critique Analysis breakdown (8 cols) */}
            <div className="lg:col-span-8">
                {!selectedResume ? (
                    <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center h-full min-h-[400px]">
                        <FileText className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-base font-bold text-gray-800">No Resume Loaded</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                            Upload your technical curriculum vitae to view resume score benchmarks and structural feedback.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-3xl border border-gray-100/50 shadow-sm space-y-8 animate-scaleUp">

                        {/* Top Score Summary Ring */}
                        <div className="flex flex-col md:flex-row items-center gap-6 border-b border-gray-100 pb-6">
                            <div className="relative flex items-center justify-center shrink-0">
                                {/* Score Circle */}
                                <div className="h-28 w-28 rounded-full border-8 border-purple-50 flex flex-col items-center justify-center bg-purple-50/30">
                                    <span className="text-2xl font-extrabold text-purple-700">{activeReview?.overallScore}%</span>
                                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mt-0.5">ATS SCORE</span>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-extrabold text-gray-901">ATS Resume Checklist</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Extracted: "{selectedResume.fileName}"</p>

                                {/* Score Breakdown bar */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    {[
                                        { name: 'Tech Skills', val: activeReview?.technicalSkillsScore },
                                        { name: 'Projects', val: activeReview?.projectsScore },
                                        { name: 'Experience', val: activeReview?.experienceScore },
                                        { name: 'Formatting', val: activeReview?.formattingScore }
                                    ].map((cat, idx) => (
                                        <div key={idx} className="bg-gray-50/50 p-2 rounded-xl border border-gray-100 text-center">
                                            <span className="text-[10px] font-bold text-gray-400 block">{cat.name}</span>
                                            <span className="text-sm font-extrabold text-gray-750 block mt-0.5">{cat.val}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Strengths list */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                                    <Check className="h-4.5 w-4.5" />
                                    Key Strengths Detected
                                </h3>
                                <ul className="space-y-2">
                                    {activeReview?.strengths.map((str, idx) => (
                                        <li key={idx} className="text-xs text-gray-650 leading-relaxed list-disc list-inside">
                                            {str}
                                        </li>
                                    ))}
                                    {(!activeReview?.strengths || activeReview.strengths.length === 0) && (
                                        <p className="text-xs text-gray-405">Overall profile checks satisfactory.</p>
                                    )}
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-orange-600 flex items-center gap-1.5">
                                    <AlertTriangle className="h-4.5 w-4.5" />
                                    Weaknesses / Critique
                                </h3>
                                <ul className="space-y-2">
                                    {activeReview?.weakDescriptions?.map((weak, idx) => (
                                        <li key={idx} className="text-xs text-gray-650 leading-relaxed list-disc list-inside">
                                            {weak}
                                        </li>
                                    ))}
                                    {(!activeReview?.weakDescriptions || activeReview.weakDescriptions.length === 0) && (
                                        <p className="text-xs text-gray-405">No specific structural weaknesses noted.</p>
                                    )}
                                </ul>
                            </div>

                            {/* Missing skills list */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-1.5">
                                    <AlertTriangle className="h-4.5 w-4.5" />
                                    Critical Skills Gaps
                                </h3>
                                <ul className="space-y-2">
                                    {activeReview?.missingSkills.map((gap, idx) => (
                                        <li key={idx} className="text-xs text-gray-650 leading-relaxed list-disc list-inside">
                                            {gap}
                                        </li>
                                    ))}
                                    {(!activeReview?.missingSkills || activeReview.missingSkills.length === 0) && (
                                        <p className="text-xs text-gray-405">No critical technical skills gaps marked.</p>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Improvement Recommendations list */}
                        <div className="pt-6 border-t border-gray-100 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-purple-650 flex items-center gap-1.5">
                                <Lightbulb className="h-4.5 w-4.5" />
                                Resume Action Tips
                            </h3>
                            <div className="grid grid-cols-1 gap-2.5">
                                {activeReview?.improvementSuggestions.map((tip, idx) => (
                                    <div key={idx} className="flex items-start gap-3 bg-purple-50/30 p-3.5 rounded-2xl border border-purple-105 text-xs text-purple-900 leading-normal">
                                        <span className="font-extrabold text-purple-500 shrink-0">#{idx + 1}</span>
                                        <span>{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>

        </div>
    );
};

export default ResumeAnalysis;
