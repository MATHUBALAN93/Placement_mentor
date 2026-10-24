import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { Search, Code, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';

const Problems = () => {
    const navigate = useNavigate();

    const [problems, setProblems] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [errorDetails, setErrorDetails] = useState('');

    useEffect(() => {
        fetchFiltersAndProblems();
    }, [difficulty, selectedTopic]); // Fetch on filter change

    const fetchFiltersAndProblems = async () => {
        try {
            const skillsRes = await api.get('/skills');
            setSkills(skillsRes.data.data);

            const params = {};
            if (search) params.search = search;
            if (difficulty) params.difficulty = difficulty;
            if (selectedTopic) params.topic = selectedTopic;

            const probRes = await api.get('/problems', { params });
            setProblems(probRes.data.data);
            setLoading(false);
        } catch (err) {
            setErrorDetails(err.response?.data?.message || 'Failed to fetch problems catalog');
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        fetchFiltersAndProblems();
    };

    const getDifficultyBadge = (diff) => {
        switch (diff) {
            case 'Easy':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
            case 'Medium':
                return 'bg-amber-50 text-amber-700 border border-amber-100';
            case 'Hard':
            default:
                return 'bg-rose-50 text-rose-700 border border-rose-100';
        }
    };

    return (
        <div className="space-y-6 pb-12 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Practice Problems</h2>
                <p className="text-sm text-gray-500 mt-1">Strengthen your software engineering fundamentals day by day.</p>
            </div>

            {errorDetails && (
                <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-650 border border-red-200">
                    {errorDetails}
                </div>
            )}

            {/* Filter panel */}
            <form onSubmit={handleSearchSubmit} className="bg-white p-5 rounded-2xl border border-gray-100/50 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by keywords or pattern..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full rounded-xl border border-gray-150 pl-10 pr-4 py-2.5 text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none transition"
                    />
                </div>

                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="block w-full md:w-48 rounded-xl border border-gray-150 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none bg-white transition"
                >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>

                <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="block w-full md:w-56 rounded-xl border border-gray-150 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none bg-white transition"
                >
                    <option value="">All Skills</option>
                    {skills.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="w-full md:w-auto rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white transition text-center shrink-0"
                >
                    Search
                </button>
            </form>

            {/* Problem list representation */}
            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                </div>
            ) : problems.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 shadow-sm">
                    <Code className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base font-bold text-gray-800">No problems found</h3>
                    <p className="text-xs text-gray-400 mt-1">Try relaxing filters or search terms.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100/50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Problem Title</th>
                                    <th className="px-6 py-4 font-semibold">Skill Topic</th>
                                    <th className="px-6 py-4 font-semibold">Difficulty</th>
                                    <th className="px-6 py-4 font-semibold">Platform</th>
                                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {problems.map((prob) => {
                                    const isSolved = prob.userAttemptStatus === 'Solved';
                                    return (
                                        <tr key={prob._id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-4">
                                                {isSolved ? (
                                                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                                                ) : (
                                                    <div className="h-5 w-5 rounded-full border border-gray-250" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-800">
                                                {prob.title}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium">
                                                {prob.topic?.name || 'DSA'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getDifficultyBadge(prob.difficulty)}`}>
                                                    {prob.difficulty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5.5 font-medium text-gray-400 text-xs">
                                                {prob.platform}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/problems/${prob._id}`)}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 transition"
                                                >
                                                    Solve
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Problems;
