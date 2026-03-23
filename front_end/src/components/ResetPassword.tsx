import React, { useState } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const ResetPassword = () => {
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await authApi.confirmPasswordReset(token, password);
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/signin');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md mb-8">
                <Link to="/signin" className="inline-flex items-center text-primary font-bold hover:text-gold transition gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Login
                </Link>
            </div>

            <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-gold" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold text-gold mb-2">Reset Password</h1>
                    <p className="text-gray-500 text-sm">Enter the code received by email and your new password.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6 text-sm">
                        {message}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-bold text-primary mb-2">Reset Code (Token)</label>
                        <input
                            type="text"
                            required
                            placeholder="Enter 6-digit code"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-primary mb-2">New Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-primary mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!message}
                        className={`w-full bg-gold hover:bg-gold-hover text-white font-heading font-bold py-3.5 rounded-lg transition shadow-md mt-2 ${loading || message ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
