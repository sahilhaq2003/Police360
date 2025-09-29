// src/pages/ApplicationStatus.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, ShieldCheck, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import hero from "../../assets/loginbg.jpg";
import Footer from "../Footer/Footer";

export default function ApplicationStatus() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [type, setType] = useState("complaint");
  const navigate = useNavigate();

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    // Navigate to the general progress/listing pages based on selected type
    if (type === "complaint") {
      navigate('/cases/progress');
      return;
    }
    if (type === "accident") {
      navigate('/accidents/track');
      return;
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${hero})` }} aria-hidden />
      <div className="absolute inset-0 bg-black/30" aria-hidden />

      <div className="relative z-10 py-8 px-4">
        <Nav /><br /><br /><br />
        <div className="max-w-3xl mx-auto space-y-12">
          <motion.header className="text-center" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-4xl font-extrabold text-white flex items-center justify-center gap-2">
              <ShieldCheck className="text-indigo-400" /> Application Status
            </h1>
            <p className="mt-3 text-white text-lg">Track the progress of your complaint, case, or service request using your reference number.</p>
          </motion.header>

          <motion.form
            onSubmit={handleCheckStatus}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm bg-white"
            >
              <option value="complaint">Complaint</option>
              <option value="accident">Accident</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B214A] px-6 py-3 font-medium text-white shadow hover:bg-[#0B114C] transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} {loading ? "Opening..." : "Open Progress"}
            </button>
          </motion.form>

          {status && (
            <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              {status === "Completed" ? <CheckCircle className="mx-auto text-emerald-600 mb-3" size={48} /> : status === "Rejected" ? <XCircle className="mx-auto text-rose-600 mb-3" size={48} /> : <Loader2 className="mx-auto text-indigo-600 mb-3 animate-pulse" size={48} />}
              <h2 className="text-xl font-bold text-slate-700">Status: {status}</h2>
              <p className="mt-2 text-slate-600">
                {status === "Pending Review" && "Your application has been received and is awaiting review."}
                {status === "In Progress" && "Your case is currently being processed by the assigned officers."}
                {status === "Completed" && "Your application has been successfully resolved."}
                {status === "Rejected" && "Unfortunately, your application was not approved. Please contact support."}
              </p>
            </motion.div>
          )}
        </div>
      </div>
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <Footer />
    </div>
  );
}
