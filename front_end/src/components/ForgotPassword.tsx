import React, { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await authApi.requestPasswordReset(email);
            setMessage('A reset code has been sent to your email.');
            // Rediriger vers la page de confirmation après un court délai
            setTimeout(() => {
                navigate('/reset-password');
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
                        <Mail className="w-8 h-8 text-gold" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold text-gold mb-2">Forgot Password?</h1>
                    <p className="text-gray-500 text-sm">Enter your email and we'll send you a code to reset your password.</p>
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
                        <label className="block text-sm font-bold text-primary mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!message}
                        className={`w-full bg-gold hover:bg-gold-hover text-white font-heading font-bold py-3.5 rounded-lg transition shadow-md mt-2 ${loading || message ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
