import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { paymentsApi } from "../services/api";

const PaymentReturn = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "paid" | "failed" | "cancelled">("loading");
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
        const transactionId = localStorage.getItem("pending_transaction_id");
        const redirectPath = localStorage.getItem("payment_redirect") || "/academy/catalog";

        if (!transactionId) {
            setStatus("failed");
            return;
        }

        const poll = async () => {
            try {
                const data = await paymentsApi.getStatus(transactionId);

                if (data.status === "paid") {
                    localStorage.removeItem("pending_transaction_id");
                    localStorage.removeItem("payment_redirect");
                    setStatus("paid");
                    setTimeout(() => navigate(redirectPath), 2500);
                } else if (data.status === "failed" || data.status === "cancelled") {
                    setStatus(data.status);
                } else if (attempts < 5) {
                    setAttempts((a) => a + 1);
                    setTimeout(poll, 3000);
                } else {
                    setStatus("failed");
                }
            } catch {
                setStatus("failed");
            }
        };

        poll();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col font-body text-dark">
            <Navbar />
            <div className="flex-grow flex items-center justify-center px-4 pt-24 pb-10">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center">

                    {status === "loading" && (
                        <>
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                            <h2 className="text-xl font-heading font-bold text-primary mb-2">Verifying payment...</h2>
                            <p className="text-gray-400 text-sm">Please wait, this may take a few seconds.</p>
                        </>
                    )}

                    {status === "paid" && (
                        <>
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-xl font-heading font-bold text-primary mb-2">Payment Successful!</h2>
                            <p className="text-gray-400 text-sm">You will be redirected shortly...</p>
                        </>
                    )}

                    {(status === "failed" || status === "cancelled") && (
                        <>
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-heading font-bold text-primary mb-2">
                                {status === "cancelled" ? "Payment Cancelled" : "Payment Failed"}
                            </h2>
                            <p className="text-gray-400 text-sm mb-6">
                                {status === "cancelled"
                                    ? "You cancelled the payment. You can try again anytime."
                                    : "Something went wrong. Please try again."}
                            </p>
                            <button
                                onClick={() => navigate("/academy/catalog")}
                                className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition"
                            >
                                Back to Catalog
                            </button>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentReturn;
