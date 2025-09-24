// src/pages/ReportSuccess.jsx
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function ReportSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const reportNumber = location.state?.reportNumber || params.id || null;
  const reportType = location.state?.reportType || "Police Report";
  const passedReport = location.state?.report || null;
  const [copied, setCopied] = useState(false);

  const copyNumber = async () => {
    if (!reportNumber) return;
    try {
      await navigator.clipboard.writeText(reportNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-xl ring-1 ring-black/5">
          {/* Decorative top blur */}
          <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/40 blur-3xl" />

          <div className="relative p-8 sm:p-10">
            {/* Success emblem */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner">
              {/* Check icon (no external libs) */}
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-center text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Report Submitted Successfully
            </h1>

            {/* Subtitle */}
            <p className="mt-2 text-center text-slate-600">
              Thank you. Your <span className="font-medium text-slate-800">{reportType}</span> has been received.
            </p>

            {/* Report Number box */}
            <div className="mt-6">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Report Number</div>
                    <div className="truncate font-semibold text-slate-900">
                      {reportNumber ?? "Pending assignment"}
                    </div>
                </div>
                <button
                  onClick={copyNumber}
                  disabled={!reportNumber}
                  className={`ml-3 shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition
                  ${reportNumber
                      ? "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    }`}
                >
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
              {reportNumber && (
                <p className="mt-2 text-center text-xs text-slate-500">
                  Keep this number for future reference and tracking.
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-slate-700 hover:bg-slate-50 transition"
              >
                Go to Home
              </button>
              <button
                onClick={() => navigate("/apply/file-complaint")}
                className="w-full sm:w-auto rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white shadow-sm hover:bg-emerald-700 transition"
              >
                Submit Another
              </button>
              
                
              <button
                onClick={() => navigate(`/cases/update/${reportNumber}`, { state: { report: passedReport } })}
                className="w-full sm:w-auto rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-sm hover:bg-indigo-700 transition"
              >
                View / Edit
              </button>

              
            </div>
          </div>

          {/* Bottom ribbon */}
          <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500" />
        </div>

        {/* Tiny helper below card */}
        <p className="mt-4 text-center text-sm text-slate-500">
          Need help?{" "}
          <button
            onClick={() => navigate("/")}
            className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
          >
            Contact support
          </button>
        </p>
      </div>
    </div>
  );
}
