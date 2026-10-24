import React, { useState, useEffect } from 'react';
import { Menu, Bell, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';

const Navbar = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.data.filter(n => !n.isRead));
        } catch (err) {
            console.warn('Silent count notification fetch failed');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications([]);
            setShowDropdown(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white/70 backdrop-blur-md px-6 shadow-sm shadow-gray-100/50">
            {/* Left items: Mobile toggle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => toggleSidebar(true)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 lg:hidden"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div>
                    <h2 className="hidden text-sm font-medium text-gray-500 md:block">Welcome back,</h2>
                    <h1 className="text-lg font-bold text-gray-900 md:-mt-1">{user?.name || 'Welcome Leader'}</h1>
                </div>
            </div>

            {/* Right items: Notification icons */}
            <div className="flex items-center gap-4">
                {user?.role === 'ADMIN' && (
                    <div className="hidden items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600 md:flex">
                        <Shield className="h-3.5 w-3.5" />
                        Admin Account
                    </div>
                )}

                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
                    >
                        <Bell className="h-6 w-6" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-purple-600 ring-2 ring-white"></span>
                        )}
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl ring-1 ring-black/5 z-50">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                                <span className="text-sm font-semibold text-gray-900">Notifications ({notifications.length})</span>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs font-medium text-purple-600 hover:text-purple-700"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {notifications.length === 0 ? (
                                <div className="py-8 text-center text-sm text-gray-400">
                                    All caught up! No unread notifications.
                                </div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {notifications.slice(0, 5).map((noti) => (
                                        <div key={noti._id} className="rounded-lg p-2.5 hover:bg-gray-50 transition text-left">
                                            <p className="text-xs font-semibold text-gray-800">{noti.title}</p>
                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{noti.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
