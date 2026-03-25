import React, { useState, useEffect } from 'react';
import { ArrowLeft, Youtube, Globe, Send, Clock, CheckCircle, XCircle, FileText, MapPin, Hash, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { instructorApplicationsApi } from '../../services/api';

const InstructorApplicationForm = () => {
    const [youtube, setYoutube] = useState('');
    const [otherPlatforms, setOtherPlatforms] = useState('');

    // KYC Fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [ifu, setIfu] = useState('');
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [idCard, setIdCard] = useState<File | null>(null);

    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const data = await instructorApplicationsApi.list();
            // The API returns a list, we take the most recent one if it exists
            if (data && data.length > 0) {
                setStatus(data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch application status", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        if (!idCard) {
            setError('Please upload your ID Card or Passport.');
            setSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('youtube_channel', youtube);
            formData.append('other_platforms', otherPlatforms);
            formData.append('ifu', ifu);
            formData.append('address', address);
            formData.append('country', country);
            formData.append('city', city);
            formData.append('id_card', idCard);

            await instructorApplicationsApi.submit(formData);
            setSuccess(true);
            fetchStatus();
        } catch (err: any) {
            setError(err.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-body text-dark flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <Link to="/academy" className="inline-flex items-center text-primary font-bold hover:text-gold transition gap-2 mb-8">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Academy
                    </Link>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-gradient-to-r from-primary to-blue-900 p-8 text-white">
                            <h1 className="text-3xl font-heading font-bold mb-2">Become an Instructor</h1>
                            <p className="opacity-80">Share your knowledge and earn rewards on GoldenBridge.</p>
                        </div>

                        <div className="p-8">
                            {status ? (
                                <div className="text-center py-10">
                                    <div className="mb-6 inline-flex p-4 rounded-full bg-gray-50">
                                        {status.status === 'pending' && <Clock className="w-12 h-12 text-blue-500 animate-pulse" />}
                                        {status.status === 'approved' && <CheckCircle className="w-12 h-12 text-green-500" />}
                                        {status.status === 'rejected' && <XCircle className="w-12 h-12 text-red-500" />}
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2 capitalize">Application Status: {status.status}</h2>
                                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                        {status.status === 'pending' && "Your application is currently being reviewed by our team. We'll get back to you soon!"}
                                        {status.status === 'approved' && "Congratulations! Your application has been approved. You now have access to the Instructor Dashboard."}
                                        {status.status === 'rejected' && `Unfortunately, your application was not approved at this time. Admin notes: ${status.admin_notes || 'No notes provided.'}`}
                                    </p>
                                    {status.status === 'approved' && (
                                        <Link to="/instructor" className="bg-gold hover:bg-gold-hover text-white font-bold px-8 py-3 rounded-xl transition shadow-lg">
                                            Go to Instructor Dashboard
                                        </Link>
                                    )}
                                </div>
                            ) : success ? (
                                <div className="text-center py-10">
                                    <div className="mb-6 inline-flex p-4 rounded-full bg-green-50">
                                        <Send className="w-12 h-12 text-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
                                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                        Thank you for your interest. Our team will review your application and notify you of the decision.
                                    </p>
                                    <button onClick={() => setSuccess(false)} className="text-gold font-bold hover:underline">
                                        View Application Status
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 italic">
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="John"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Doe"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                                            <Youtube className="w-4 h-4 text-red-600" />
                                            YouTube Channel URL
                                        </label>
                                        <input
                                            type="url"
                                            required
                                            placeholder="https://youtube.com/@yourchannel"
                                            value={youtube}
                                            onChange={(e) => setYoutube(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                                        />
                                        <p className="text-xs text-gray-400 mt-2">Link to your main educational content platform.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                                                <Hash className="w-4 h-4 text-gray-500" />
                                                IFU (Tax ID) <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Your IFU Number"
                                                value={ifu}
                                                onChange={(e) => setIfu(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                                                <FileText className="w-4 h-4 text-gray-500" />
                                                ID Card / Passport
                                            </label>
                                            <input
                                                type="file"
                                                required
                                                accept="image/*,.pdf"
                                                onChange={(e) => setIdCard(e.target.files ? e.target.files[0] : null)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition bg-white text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            Residential Address
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="123 Main St, Appt 4B"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition mb-4"
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                required
                                                placeholder="City"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                                            />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Country"
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
                                            <Globe className="w-4 h-4 text-secondary" />
                                            Other Platforms / Portfolio
                                        </label>
                                        <textarea
                                            placeholder="Twitter/X, LinkedIn, Personal Blog, or other teaching experiences..."
                                            value={otherPlatforms}
                                            onChange={(e) => setOtherPlatforms(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition resize-none"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className={`w-full bg-gold hover:bg-gold-hover text-white font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    Submitting Application...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    Submit Application
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <p className="text-center text-xs text-gray-400">
                                        By submitting, you agree to our Instructor Terms of Service.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default InstructorApplicationForm;
