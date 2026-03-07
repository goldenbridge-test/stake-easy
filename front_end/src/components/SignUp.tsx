import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password, firstName, lastName);
      // Success: redirect to login
      navigate('/signin', { state: { message: 'Account created! Please sign in.' } });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

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
          <p className="text-gray-500">Create your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* Username */}
          <div>
            <label className="block text-sm font-bold text-primary mb-2">Username</label>
            <input
              type="text"
              required
              placeholder="Chosen username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">First Name</label>
              <input
                type="text"
                required
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">Last Name</label>
              <input
                type="text"
                required
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
              />
            </div>
          </div>


          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-primary mb-2">Email</label>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-primary mb-2">Password</label>
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-primary mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Bouton Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gold hover:bg-gold-hover text-white font-heading font-bold py-3.5 rounded-lg transition shadow-md mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

        </form>

        {/* Footer du formulaire */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/signin" className="text-secondary font-bold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignUp;