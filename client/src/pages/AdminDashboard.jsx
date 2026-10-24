import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Users, Code, Activity, AlertCircle, PlusCircle, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorDetails, setErrorDetails] = useState('');

    // Dummy logic for 'New Problem' form state
    const [newTitle, setNewTitle] = useState('');
    const [creating, setCreating] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchAdminAnalytics();
    }, []);

    const fetchAdminAnalytics = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            setStats(res.data.data);
            setLoading(false);
        } catch (err) {
            setErrorDetails(err.response?.data?.message || 'Access Denied: Missing Admin Credentials');
            setLoading(false);
        }
    };

    const handleCreateProblem = async (e) => {
        e.preventDefault();
        if (!newTitle) return;

        setCreating(true);
        setSuccessMsg('');
        setErrorDetails('');
        try {
            // In a real app we'd map all fields (platform, difficulty)
            // This is a minimal seed trigger just to prove CRUD concept
            await api.post('/admin/seed-problems', {
                platform: 'LeetCode', difficulty: 'Medium', topics: [], pattern: 'Array'
            });
            setSuccessMsg('Bulk problems artificially seeded successfully for platform demo');
            setNewTitle('');
            fetchAdminAnalytics(); // Refresh numbers
        } catch (err) {
            setErrorDetails('Failed to process admin action: ' + (err.response?.data?.message || err.message));
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    if (errorDetails && !stats) {
        return (
            <div className="rounded-2xl bg-red-900 border border-red-700 p-6 text-sm font-medium text-red-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <div>
                    <p className="font-bold text-white">Security Block</p>
                    <p className="text-xs text-red-300 mt-1">{errorDetails}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">

            <div>
                <h2 className="text-2xl font-bold text-white">System Analytics Console</h2>
                <p className="text-sm text-gray-400 mt-1">Platform telemetry and CRUD controls for verified administrators.</p>
            </div>

            {successMsg && (
                <div className="rounded-xl bg-emerald-900/50 p-4 text-xs font-medium text-emerald-300 border border-emerald-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {successMsg}
                </div>
            )}

            {errorDetails && (
                <div className="rounded-xl bg-red-900/50 p-4 text-xs font-medium text-red-300 border border-red-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errorDetails}
                </div>
            )}

            {/* KPI Overviews (Dark Mode tailored since AdminLayout is dark) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex items-center gap-4">
                    <div className="bg-blue-900/50 text-blue-400 p-4 rounded-xl">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-0.5">Total Users</p>
                        <h3 className="text-2xl font-extrabold text-gray-100">{stats?.totalStudents || 0}</h3>
                    </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex items-center gap-4">
                    <div className="bg-purple-900/50 text-purple-400 p-4 rounded-xl">
                        <Code className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-0.5">Problems Active</p>
                        <h3 className="text-2xl font-extrabold text-gray-100">{stats?.totalProblems || 0}</h3>
                    </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 flex items-center gap-4">
                    <div className="bg-emerald-900/50 text-emerald-400 p-4 rounded-xl">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-0.5">Total Attempts</p>
                        <h3 className="text-2xl font-extrabold text-gray-100">{stats?.totalAttempts || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Seed Action Panel */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-100 mb-4">Quick Seed Action</h3>
                    <p className="text-xs text-gray-400 mb-6">Administrators can seed fundamental DSA concepts into the Question Bank quickly to unblock user tests.</p>

                    <form onClick={(e) => e.preventDefault()} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Demo Trigger Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Initialize LeetCode Pack"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-purple-500 transition"
                            />
                        </div>

                        <button
                            onClick={handleCreateProblem}
                            disabled={creating || !newTitle}
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-5 py-3 rounded-xl text-sm font-semibold transition"
                        >
                            <PlusCircle className="h-4 w-4" />
                            {creating ? 'Seeding...' : 'Run Seed Job'}
                        </button>
                    </form>
                </div>

                {/* Recently Active Users */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-100 mb-4">Recent Students</h3>

                    {stats?.recentUsers?.length === 0 ? (
                        <p className="text-xs text-gray-500">No recent students onboarded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {stats?.recentUsers?.map(user => (
                                <div key={user._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-gray-200">{user.name}</p>
                                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{user.email}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${user.isOnboarded ? 'bg-emerald-900/30 text-emerald-400' : 'bg-amber-900/30 text-amber-400'}`}>
                                        {user.isOnboarded ? 'Onboarded' : 'Pending Setup'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
