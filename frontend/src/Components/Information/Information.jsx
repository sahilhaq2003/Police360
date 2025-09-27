// src/pages/Information.jsx
import React from "react";
import { motion } from "framer-motion";
import { Info, Phone, FileText, HelpCircle, Shield } from "lucide-react";
import Nav from "../Nav/Nav";
import hero from "../../assets/loginbg.jpg";

export default function Information() {
  const contacts = [
    { label: "Emergency Hotline", value: "119" },
    { label: "Tourist Police", value: "1912" },
    { label: "Child & Women Bureau", value: "011-244-4444" },
    { label: "General Inquiries", value: "011-242-1111" },
  ];

  const faqs = [
    {
      q: "How can I file a complaint?",
      a: "You can file a complaint online through the Police360 portal under 'File a Complaint' or visit your nearest police station.",
    },
    {
      q: "Can I track my complaint?",
      a: "Yes. Use the 'Application Status' page and enter your Tracking ID to check the progress of your complaint or case.",
    },
    {
      q: "Is my personal information kept confidential?",
      a: "Yes. All complaints and case records are stored securely. Only authorized officers can access sensitive details.",
    },
    {
      q: "What documents are needed for accident reporting?",
      a: "Typically, you will need your ID, vehicle details, insurance details (if applicable), and any supporting evidence like photos or witness information.",
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${hero})` }}
        aria-hidden
      />
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/30" aria-hidden />

      <div className="relative z-10 py-6 px-4">
        <Nav /><br /><br /><br />
        <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <motion.header
          className="text-center"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false }} // 👈 always animate
        >
          <h1 className="text-4xl font-extrabold text-white flex items-center justify-center gap-2">
            <Info className="text-indigo-400" /> Information Center
          </h1>
          <p className="mt-3 text-slate-200 text-lg">
            Find essential information, resources, and guidance related to police
            services, complaints, and public safety.
          </p>
        </motion.header>

        {/* Emergency Contacts */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false }} // 👈 always animate
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-8"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Phone className="text-indigo-600" /> Emergency Contacts
          </h2>
          <ul className="space-y-3">
            {contacts.map((c, i) => (
              <li
                key={i}
                className="flex justify-between items-center border-b last:border-0 pb-2"
              >
                <span className="text-slate-700 font-medium">{c.label}</span>
                <span className="text-indigo-600 font-semibold">{c.value}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* How to File Complaint */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: false }} // 👈 always animate
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-8"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="text-indigo-600" /> How to File a Complaint
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Filing a complaint is simple with Police360. You can submit details
            of your complaint online or at a physical police station. Be sure to
            include accurate information such as date, location, involved
            persons, and supporting documents. After submission, you will
            receive a unique Tracking ID which you can use to follow the status
            of your complaint.
          </p>
        </motion.section>

        {/* FAQs */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: false }} // 👈 always animate
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-8"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <HelpCircle className="text-indigo-600" /> Frequently Asked Questions
          </h2>
          <div className="space-y-5">
            {faqs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: false }} // 👈 always animate
                className="border-b last:border-0 pb-4"
              >
                <h3 className="text-lg font-semibold text-slate-700">
                  {item.q}
                </h3>
                <p className="text-slate-600 mt-1 text-sm leading-relaxed">
                  {item.a}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Rights & Responsibilities */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          viewport={{ once: false }} // 👈 always animate
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-8"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="text-indigo-600" /> Citizen Rights & Responsibilities
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Every citizen has the right to fair treatment, protection, and
            access to justice. Police360 ensures transparency and accountability
            in this process. As a citizen, you are also responsible for
            providing accurate information, cooperating with investigations, and
            respecting the law.
          </p>
        </motion.section>
        </div>
      </div>
    </div>
  );
}
