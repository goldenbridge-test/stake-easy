import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import des pages
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Investments from './components/Investments';
import Performance from './components/Performance';
import Team from './components/Team';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Staking from './components/Staking';
import AdminDashboard from './components/AdminDashboard';
import AcademyHome from './components/academy/AcademyHome';
import AcademyCatalog from './components/academy/AcademyCatalog';
import MyLearning from './components/academy/MyLearning';
import CourseDetails from './components/academy/CourseDetails';

// On crée un composant pour la Landing Page complète pour garder le code propre
const LandingPage = () => (
  <>
    <Navbar />
    <main>
      <Hero />
      <Investments />
      <Performance />
      <Team />
      <CallToAction />
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-white min-h-screen font-body text-dark">
          <Routes>
            {/* Route pour l'accueil (Landing Page) */}
            <Route path="/" element={<LandingPage />} />

            {/* Route pour la connexion */}
            <Route path="/signin" element={<SignIn />} />

            {/* Route pour l'inscription */}
            <Route path="/signup" element={<SignUp />} />

            <Route path="/staking" element={<Staking />} />

            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="/academy" element={<AcademyHome />} />
            <Route path="/academy/catalog" element={<AcademyCatalog />} />
            <Route path="/academy/my-learning" element={<MyLearning />} />
            <Route path="/academy/course/:id" element={<CourseDetails />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;