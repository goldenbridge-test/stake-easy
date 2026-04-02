import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      // Get stored user to check role (login updates both state and localStorage)
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

      if (storedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/academy');
      }
    } catch (err: any) {

      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

      {/* Bouton Retour */}
      <div className="w-full max-w-md mb-8">
        <Link to="/" className="inline-flex items-center text-primary font-bold hover:text-gold transition gap-2">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>

      {/* Carte Blanche */}
      <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-xl shadow-lg border border-gray-100">

        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-gold mb-2">GoldenBridge</h1>
          <p className="text-gray-500">Welcome back, please sign in</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* Username or Email (Backend uses username for now) */}
          <div>
            <label className="block text-sm font-bold text-primary mb-2">Username</label>
            <input
              type="text"
              required
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-primary">Password</label>
              <Link to="/forgot-password" className="text-xs text-gold hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gold hover:bg-gold-hover text-white font-heading font-bold py-3.5 rounded-lg transition shadow-md mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        {/* Footer du formulaire */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-secondary font-bold hover:underline">
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignIn;