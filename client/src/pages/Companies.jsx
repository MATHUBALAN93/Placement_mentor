import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Building, Search, Briefcase, TrendingUp, AlertCircle, Bookmark } from 'lucide-react';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [errorDetails, setErrorDetails] = useState('');

    useEffect(() => {
        fetchCompanies();
    }, [search]); // Naive search, in a real app would be debounced

    const fetchCompanies = async () => {
        try {
            const res = await api.get('/companies', { params: { search } });
            setCompanies(res.data.data);
            setLoading(false);
        } catch (err) {
            setErrorDetails(err.response?.data?.message || 'Failed to fetch companies list');
            setLoading(false);
        }
    };

    if (loading && companies.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Target Companies Database</h2>
                <p className="text-sm text-gray-500 mt-1">Browse tech companies and discover their common interview topics and readiness requirements.</p>
            </div>

            {errorDetails && (
                <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-650 border border-red-200">
                    {errorDetails}
                </div>
            )}

            {/* Filter panel */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100/50 shadow-sm">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by company name or domain..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full rounded-xl border border-gray-150 pl-10 pr-4 py-2.5 text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none transition"
                    />
                </div>
            </div>

            {/* Companies Grid */}
            {companies.length === 0 && !loading ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 shadow-sm text-gray-500 flex flex-col items-center">
                    <Building className="h-10 w-10 text-gray-300 mb-4" />
                    <h3 className="text-base font-bold text-gray-800">No organizations found</h3>
                    <p className="text-xs text-gray-400 mt-1">Try a different search query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map(company => (
                        <div key={company._id} className="bg-white rounded-3xl border border-gray-100/50 shadow-sm hover:shadow-md transition p-6 flex flex-col h-full relative overflow-hidden">
                            {/* Threshold Badge */}
                            <div className="absolute top-0 right-0 bg-purple-50 px-3 py-1.5 rounded-bl-xl border-l border-b border-purple-100">
                                <span className="text-[10px] font-bold text-purple-700 tracking-widest uppercase">Req: {company.readinessThreshold}% Score</span>
                            </div>

                            <div className="flex items-center gap-3 mb-6 pr-16">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center shrink-0 text-xl font-black text-gray-800 shadow-inner">
                                    {company.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-901">{company.name}</h3>
                                    <p className="text-xs font-semibold text-gray-400 mt-0.5">{company.industry || 'Technology'}</p>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    <span className="font-medium">Avg CTC: <span className="font-bold text-gray-800">{company.averageCtcMultiplier || 'Industry Standard'}</span></span>
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Bookmark className="h-3 w-3" />
                                        Common Topics Analyzed
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {company.commonInterviewTopics.slice(0, 4).map((topic, tIdx) => (
                                            <span key={tIdx} className="bg-gray-50 border border-gray-200 text-gray-650 px-2 py-0.5 rounded text-[10px] font-semibold">
                                                {topic}
                                            </span>
                                        ))}
                                        {company.commonInterviewTopics.length > 4 && (
                                            <span className="bg-gray-50 border border-gray-200 text-gray-650 px-2 py-0.5 rounded text-[10px] font-semibold">
                                                +{company.commonInterviewTopics.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                                <span className="text-gray-450 font-medium">{company.rolesHired.length} Roles active</span>
                                <button className="text-purple-600 font-bold hover:text-purple-750 transition flex items-center gap-1">
                                    View Profile <Briefcase className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Companies;
