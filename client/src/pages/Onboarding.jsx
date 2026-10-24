import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

const Onboarding = () => {
    const { updateProfile } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [cgpa, setCgpa] = useState('');
    const [branch, setBranch] = useState('Computer Science');
    const [targetCompanies, setTargetCompanies] = useState([]);
    const [targetRoles, setTargetRoles] = useState([]);
    const [dailyHours, setDailyHours] = useState('2');
    const [errorDetails, setErrorDetails] = useState('');
    const [submitSpinner, setSubmitSpinner] = useState(false);

    const rolesList = ['SDE', 'Frontend Engineer', 'Backend Engineer', 'Fullstack Engineer', 'Data Analyst', 'QA Engineer'];
    const companiesList = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Meta', 'Netflix'];

    const toggleCompany = (companyName) => {
        setTargetCompanies(prev =>
            prev.includes(companyName)
                ? prev.filter(c => c !== companyName)
                : [...prev, companyName]
        );
    };

    const toggleRole = (roleName) => {
        setTargetRoles(prev =>
            prev.includes(roleName)
                ? prev.filter(r => r !== roleName)
                : [...prev, roleName]
        );
    };

    const handleNext = () => {
        if (step === 1 && (!cgpa || isNaN(cgpa) || Number(cgpa) < 0 || Number(cgpa) > 10)) {
            setErrorDetails('Please enter a valid CGPA between 0 and 10');
            return;
        }
        setErrorDetails('');
        setStep(prev => prev + 1);
    };

    const handlePrev = () => {
        setErrorDetails('');
        setStep(prev => prev - 1);
    };

    const handleComplete = async () => {
        if (targetRoles.length === 0) {
            setErrorDetails('Please select at least one target role');
            return;
        }

        setSubmitSpinner(true);
        const profilePayload = {
            cgpa: Number(cgpa),
            branch,
            targetCompanies,
            targetRoles,
            dailyPrepTimeHours: Number(dailyHours) || 2,
            isOnboarded: true
        };

        const res = await updateProfile(profilePayload);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setErrorDetails(res.message);
            setSubmitSpinner(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-4">
            <div className="w-full max-w-lg space-y-6 rounded-3xl bg-white p-10 shadow-xl shadow-gray-100 ring-1 ring-black/5">
                {/* Progress header bar */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-widest">Onboarding Wizard</span>
                    <span className="text-xs font-bold text-gray-400">Step {step} of 3</span>
                </div>

                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {errorDetails && (
                    <div className="rounded-xl bg-red-50 p-4 text-xs font-medium text-red-650 border border-red-200">
                        {errorDetails}
                    </div>
                )}

                {/* Step 1: Academic Profile */}
                {step === 1 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Academic Background</h2>
                            <p className="text-sm text-gray-500 mt-1">Let's start with your college education details.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Branch / Major</label>
                            <select
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                                className="block w-full rounded-2xl border border-gray-150 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none bg-white transition"
                            >
                                <option value="Computer Science">Computer Science & Engineering</option>
                                <option value="Information Technology">Information Technology</option>
                                <option value="Electronics & Communication">Electronics & Communication</option>
                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                <option value="Civil Engineering">Civil Engineering</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">CGPA (0 - 10)</label>
                            <input
                                type="text"
                                placeholder="e.g. 8.5"
                                value={cgpa}
                                onChange={(e) => setCgpa(e.target.value)}
                                className="block w-full rounded-2xl border border-gray-150 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Target Preferences */}
                {step === 2 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Career Aspirations</h2>
                            <p className="text-sm text-gray-500 mt-1">Select the roles and companies you want to work at.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">Roles of Interest</label>
                            <div className="grid grid-cols-2 gap-2">
                                {rolesList.map(r => {
                                    const active = targetRoles.includes(r);
                                    return (
                                        <button
                                            key={r}
                                            onClick={() => toggleRole(r)}
                                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition ${active ? 'border-purple-600 bg-purple-50/50 text-purple-600' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                                        >
                                            {r}
                                            {active && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block">Dream Companies</label>
                            <div className="grid grid-cols-3 gap-2">
                                {companiesList.map(comp => {
                                    const active = targetCompanies.includes(comp);
                                    return (
                                        <button
                                            key={comp}
                                            onClick={() => toggleCompany(comp)}
                                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition ${active ? 'border-purple-600 bg-purple-50/50 text-purple-600' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                                        >
                                            {comp}
                                            {active && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Timings Settings */}
                {step === 3 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Preparation Frequency</h2>
                            <p className="text-sm text-gray-500 mt-1">Configure your daily training schedules.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Daily allocation time (Hours)</label>
                            <input
                                type="number"
                                placeholder="2"
                                min="1"
                                max="10"
                                value={dailyHours}
                                onChange={(e) => setDailyHours(e.target.value)}
                                className="block w-full rounded-2xl border border-gray-150 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">We will scale daily practice recommended problems to fit inside your calendar hours.</p>
                        </div>
                    </div>
                )}

                {/* Navigation Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {step > 1 ? (
                        <button
                            onClick={handlePrev}
                            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700 transition"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            className="inline-flex items-center gap-1 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition"
                        >
                            Continue
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={submitSpinner}
                            className="inline-flex items-center gap-1 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:bg-purple-400 transition"
                        >
                            {submitSpinner ? 'Saving...' : 'Finish Setup'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
