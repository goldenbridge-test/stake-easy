import React, { useState, useEffect } from 'react';
import { Check, X, ExternalLink, Loader2, Youtube, Globe, MessageSquare, FileText, MapPin, Hash, User } from 'lucide-react';
import { instructorApplicationsApi } from '../services/api';

const AdminInstructorApplications = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await instructorApplicationsApi.list();
            setApplications(data);
        } catch (err) {
            console.error("Failed to fetch applications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        setProcessingId(id);
        try {
            await instructorApplicationsApi.approve(id, adminNotes[id] || "Approved");
            fetchApplications();
        } catch (err) {
            alert("Failed to approve application");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: number) => {
        if (!adminNotes[id]) {
            alert("Please provide rejection notes");
            return;
        }
        setProcessingId(id);
        try {
            await instructorApplicationsApi.reject(id, adminNotes[id]);
            fetchApplications();
        } catch (err) {
            alert("Failed to reject application");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
        );
    }

    const pendingApps = applications.filter(app => app.status === 'pending');
    const historyApps = applications.filter(app => app.status !== 'pending');

    return (
        <div className="space-y-10">
            {/* Pending Applications */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-heading font-bold text-primary">Pending Applications</h2>
                    <span className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        {pendingApps.length} Required Action
                    </span>
                </div>

                {pendingApps.length > 0 ? (
                    <div className="grid gap-6">
                        {pendingApps.map((app) => (
                            <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                                <div className="p-6 flex-grow border-b md:border-b-0 md:border-r border-gray-50">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary font-bold">
                                            {app.username?.[0].toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">
                                                {app.first_name || app.last_name ? `${app.first_name || ''} ${app.last_name || ''}` : app.username}
                                            </h3>
                                            <p className="text-xs text-gray-400">@{app.username} • Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Youtube className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">YouTube Channel</p>
                                                <a href={app.youtube_channel} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 group">
                                                    {app.youtube_channel}
                                                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Globe className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Platform/Portfolio Info</p>
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.other_platforms}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-start gap-3">
                                                <Hash className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">IFU (Tax ID)</p>
                                                    <p className="text-sm text-gray-700">{app.ifu || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Location</p>
                                                    <p className="text-sm text-gray-700">{app.city ? `${app.city}, ` : ''}{app.country || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 pt-2">
                                            <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">ID Card / Passport</p>
                                                {app.id_card ? (
                                                    <a href={app.id_card} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 group">
                                                        View Document
                                                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-gray-500 italic">No document</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 w-full md:w-80 flex flex-col">
                                    <div className="mb-4">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2">
                                            <MessageSquare className="w-3 h-3" /> Admin Notes
                                        </label>
                                        <textarea
                                            placeholder="Notes for the student..."
                                            value={adminNotes[app.id] || ''}
                                            onChange={(e) => setAdminNotes({ ...adminNotes, [app.id]: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-gold outline-none transition h-24 resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <button
                                            onClick={() => handleReject(app.id)}
                                            disabled={processingId === app.id}
                                            className="bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 text-sm"
                                        >
                                            <X className="w-4 h-4" /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleApprove(app.id)}
                                            disabled={processingId === app.id}
                                            className="bg-gold text-white hover:bg-gold-hover font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 text-sm shadow-md"
                                        >
                                            {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                        <p className="text-gray-400">No pending applications at the moment.</p>
                    </div>
                )}
            </section>

            {/* Application History */}
            {historyApps.length > 0 && (
                <section>
                    <h2 className="text-xl font-heading font-bold text-primary mb-6">Application History</h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">User</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Decision Date</th>
                                    <th className="px-6 py-4 font-semibold">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {historyApps.map((app) => (
                                    <tr key={app.id}>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-primary">{app.username}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${app.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400">
                                            {new Date(app.updated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 italic">
                                            {app.admin_notes || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default AdminInstructorApplications;
