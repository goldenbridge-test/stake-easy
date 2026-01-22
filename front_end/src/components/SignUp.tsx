import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SignUp = () => {
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
            <label className="block text-sm font-bold text-primary mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-primary mb-2">Confirm Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition text-dark"
            />
          </div>

          {/* Bouton Submit */}
          <button className="w-full bg-gold hover:bg-gold-hover text-white font-heading font-bold py-3.5 rounded-lg transition shadow-md mt-2">
            Sign Up
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