import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignIn = () => {
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

        {/* Formulaire */}
        <form className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-primary mb-2">Email</label>
            <input 
              type="email" 
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-primary">Password</label>
              <a href="#" className="text-xs text-gold hover:underline">Forgot password?</a>
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
            />
          </div>

          {/* Bouton Submit */}
          <button className="w-full bg-gold hover:bg-gold-hover text-white font-heading font-bold py-3.5 rounded-lg transition shadow-md mt-2">
            Sign In
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