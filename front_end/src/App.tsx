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
import CoachingPrograms from './components/academy/CoachingPrograms';
import CoursePlayer from './components/academy/CoursePlayer';
import CourseCertificate from './components/academy/CourseCertificate';
import CourseUploadForm from './components/academy/CourseUploadForm';
import InstructorDashboard from './components/academy/InstructorDashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import InstructorApplicationForm from './components/academy/InstructorApplicationForm';

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

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="/academy" element={<AcademyHome />} />
            <Route path="/academy/catalog" element={<AcademyCatalog />} />
            <Route path="/academy/my-learning" element={<MyLearning />} />
            <Route path="/academy/course/:id" element={<CourseDetails />} />
            <Route path="/academy/course/:id/player" element={<CoursePlayer />} />
            <Route path="/academy/course/:id/player/:chapterId" element={<CoursePlayer />} />
            <Route path="/academy/course/:id/certificate" element={<CourseCertificate />} />
            <Route path="/academy/course/:id/upload" element={<CourseUploadForm />} />
            <Route path="/academy/coaching" element={<CoachingPrograms />} />
            <Route path="/academy/become-instructor" element={<InstructorApplicationForm />} />
            <Route path="/instructor" element={<InstructorDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;