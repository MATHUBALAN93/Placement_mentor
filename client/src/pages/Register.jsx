import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorDetails, setErrorDetails] = useState('');
    const [loadingForm, setLoadingForm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorDetails('');

        if (password !== confirmPassword) {
            setErrorDetails('Passwords do not match');
            return;
        }

        setLoadingForm(true);
        const result = await register(name, email, password, confirmPassword);

        if (result.success) {
            navigate('/onboarding');
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
                    <label htmlFor="name-field" className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        Full Name
                    </label>
                    <input
                        id="name-field"
                        name="name"
                        type="text"
                        required
                        spellCheck="false"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full rounded-2xl border border-gray-150 px-4 py-3 text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none transition"
                        placeholder="John Doe"
                    />
                </div>

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

                <div className="space-y-1">
                    <label htmlFor="confirm-password-field" className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        Confirm Password
                    </label>
                    <input
                        id="confirm-password-field"
                        name="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full rounded-2xl border border-gray-150 px-4 py-3 text-sm placeholder-gray-400 focus:border-purple-500 focus:outline-none transition"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loadingForm}
                    className="group relative flex w-full justify-center rounded-2xl bg-purple-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-none disabled:bg-purple-400 transition"
                >
                    {loadingForm ? 'Creating account...' : 'Create Account'}
                </button>

                <div className="text-center pt-2">
                    <span className="text-xs text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-700">
                            Sign in
                        </Link>
                    </span>
                </div>
            </form>
        </>
    );
};

export default Register;
