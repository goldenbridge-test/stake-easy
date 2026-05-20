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
import EarnHub from './components/earn/EarnHub';
import EarnAccessRequest from './components/earn/EarnAccessRequest';
import GldStaking from './components/earn/GldStaking';
import StakingDashboard from './components/earn/StakingDashboard';
import ApiDebug from './components/earn/ApiDebug';
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
import CertificateVerify from './components/academy/CertificateVerify';
import ForgotPassword from './components/ForgotPassword';
import PaymentReturn from './components/PaymentReturn';
import ResetPassword from './components/ResetPassword';
import InstructorApplicationForm from './components/academy/InstructorApplicationForm';
import ServicesPage from './components/services/ServicesPage';
import MyServicesPage from './components/services/MyServicesPage';
import FAQPage from './components/FAQPage';

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

            <Route path="/earn" element={<EarnHub />} />
            <Route path="/earn/demo" element={<EarnAccessRequest initialStep="form" />} />
            <Route path="/earn/staking" element={<GldStaking />} />
            <Route path="/earn/dashboard" element={<StakingDashboard />} />
            <Route path="/earn/debug" element={<ApiDebug />} />

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
            <Route path="/verify/:code" element={<CertificateVerify />} />
            <Route path="/payment/return" element={<PaymentReturn />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/my-services" element={<MyServicesPage />} />
            <Route path="/faq" element={<FAQPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;