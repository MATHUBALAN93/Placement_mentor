import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Shield, Home, Users, Code, LogOut } from 'lucide-react';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
            {/* Top Admin Bar */}
            <header className="bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        A
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                        Antigravity <span className="text-xs bg-purple-900/50 text-purple-400 border border-purple-800 px-2 py-0.5 rounded-full">ADMIN</span>
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">Welcome, {user?.name || 'Administrator'}</span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Admin Area */}
            <div className="flex flex-1">
                {/* Navigation Sidebar */}
                <aside className="w-64 bg-gray-950/50 border-r border-gray-800 p-4 space-y-2">
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition">
                        <Home className="h-4 w-4" />
                        Student View
                    </Link>
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-100 bg-gray-800 font-semibold transition">
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                    </Link>
                </aside>

                {/* Console Container */}
                <main className="flex-1 p-8 bg-gray-900/60 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
