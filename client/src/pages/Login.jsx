import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorDetails, setErrorDetails] = useState('');
    const [loadingForm, setLoadingForm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorDetails('');
        setLoadingForm(true);

        const result = await login(email, password);

        if (result.success) {
            // Fetch stored profile from session to check onboarding status
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser && !storedUser.isOnboarded) {
                navigate('/onboarding');
            } else {
                navigate('/dashboard');
            }
        } else {
            setErrorDetails(result.message);
            setLoadingForm(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                {errorDetails && (
                    <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-650 border border-red-200">
                        {errorDetails}
                    </div>
                )}

                <div className="space-y-1">
                    <label htmlFor="email-address" className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        Email address
                    </label>
                    <input
                        id="email-address"
                        name="email"
                        type="email"
                        required
                        spellCheck="false"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-2xl border border-gray-150 px-4 py-3 text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none transition"
                        placeholder="student@college.edu"
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="password-field" className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        Password
                    </label>
                    <input
                        id="password-field"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-2xl border border-gray-150 px-4 py-3 text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none transition"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loadingForm}
                    className="group relative flex w-full justify-center rounded-2xl bg-purple-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-none disabled:bg-purple-400 transition"
                >
                    {loadingForm ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="text-center pt-2">
                    <span className="text-xs text-gray-400">
                        New to platform?{' '}
                        <Link to="/register" className="font-semibold text-purple-600 hover:text-purple-700">
                            Create an account
                        </Link>
                    </span>
                </div>
            </form>
        </>
    );
};

export default Login;
