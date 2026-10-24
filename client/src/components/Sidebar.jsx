import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import {
    LayoutDashboard,
    Award,
    Map,
    Code,
    MessageSquare,
    FileText,
    Briefcase,
    Video,
    Building,
    LogOut,
    User
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { logout, user } = useAuth();

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Assessment', path: '/assessments', icon: Award },
        { name: 'Roadmap', path: '/roadmap', icon: Map },
        { name: 'Problems', path: '/problems', icon: Code },
        { name: 'AI Mentor', path: '/mentor', icon: MessageSquare },
        { name: 'Resume Review', path: '/resume', icon: FileText },
        { name: 'Job Matcher', path: '/jobs', icon: Briefcase },
        { name: 'Mock Interview', path: '/interviews', icon: Video },
        { name: 'Companies', path: '/companies', icon: Building },
    ];

    const adminLinks = [
        { name: 'Admin Control', path: '/admin', icon: User }
    ];

    const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-1";
    const activeClasses = "bg-purple-50 text-purple-600 font-semibold shadow-sm";
    const inactiveClasses = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 z-40 bg-gray-950/20 backdrop-blur-sm lg:hidden"
                />
            )}

            <aside className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-100 px-4 py-6 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Brand Logo */}
                <div className="mb-8 px-4 flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-purple-200">
                        A
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900">
                        Antigravity<span className="text-purple-600">.prep</span>
                    </span>
                </div>

                {/* Links */}
                <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => toggleSidebar(false)}
                            className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                        >
                            <link.icon className="h-5 w-5 shrink-0" />
                            {link.name}
                        </NavLink>
                    ))}

                    {user && user.role === 'ADMIN' && (
                        <div className="pt-4 mt-4 border-t border-gray-100">
                            <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Admin Area</p>
                            {adminLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => toggleSidebar(false)}
                                    className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                                >
                                    <link.icon className="h-5 w-5 shrink-0" />
                                    {link.name}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </nav>

                {/* Footer profile & logout */}
                <div className="mt-auto border-t border-gray-100 pt-4 px-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center">
                            {user?.name ? user.name[0].toUpperCase() : 'S'}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Student'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email || 'student@college.edu'}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
