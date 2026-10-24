import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl shadow-gray-100 ring-1 ring-black/5 animate-fadeIn">
                <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-purple-200">
                        A
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-905">
                        Antigravity Prep
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Your personal AI placement mentor
                    </p>
                </div>

                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
