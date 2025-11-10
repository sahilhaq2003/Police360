// src/pages/About.jsx
import React from "react";
import { ShieldCheck, Users, Target, Eye, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import hero from "../../assets/loginbg.jpg";

export default function About() {
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

      {/* Content above bg */}
      <div className="relative z-10 py-6 px-4">
        <Nav /><br /><br /><br />
        <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <motion.header
          className="text-center"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-extrabold text-white flex items-center justify-center gap-2">
            <ShieldCheck className="text-indigo-600" /> About Police360
          </h1>
          <p className="mt-4 text-slate-200 text-lg max-w-3xl mx-auto">
            Police360 is a modern digital platform designed to streamline police
            operations, improve transparency, and enhance public engagement
            through technology.
          </p>
        </motion.header>

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-8">
          {[
            {
              icon: <Target className="text-indigo-600" size={28} />,
              title: "Our Mission",
              text: "To digitize and modernize police station workflows by providing a unified platform for complaint management, case tracking, accident reporting, officer management, and public services. We aim to ensure efficiency, accountability, and citizen trust.",
            },
            {
              icon: <Eye className="text-indigo-600" size={28} />,
              title: "Our Vision",
              text: "To become a benchmark system for law enforcement digitization in Sri Lanka — promoting transparency, faster response times, and improved coordination between officers and citizens.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center gap-3 mb-4">
                {item.icon}
                <h2 className="text-xl font-bold text-slate-800">{item.title}</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </section>

        {/* Core Values */}
        <section>
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <BookOpen className="mx-auto text-indigo-600 mb-3" size={32} />,
                title: "Integrity",
                text: "Ensuring fairness, honesty, and transparency in every process.",
              },
              {
                icon: <Users className="mx-auto text-indigo-600 mb-3" size={32} />,
                title: "Service",
                text: "Dedicated to serving citizens by simplifying reporting and improving access to justice.",
              },
              {
                icon: <ShieldCheck className="mx-auto text-indigo-600 mb-3" size={32} />,
                title: "Security",
                text: "Protecting sensitive data while maintaining public confidence through robust digital systems.",
              },
            ].map((val, i) => (
              <motion.div
                key={i}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(0,0,0,0.1)" }}
              >
                {val.icon}
                <h3 className="text-lg font-semibold text-slate-700">{val.title}</h3>
                <p className="text-slate-600 text-sm mt-2">{val.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team / Credits */}
        <section>
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Our Team
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
            {[
              { name: "Tharusha Thathsara", role: "Complaint Management" },
              { name: "Sahil Haq", role: "Officer Management" },
              { name: "Enuri Illesinghe", role: "Accident Reporting" },
              { name: "K P Nirmal", role: "Case Management" },
              { name: "Thisara Denuwan", role: "Criminal Records" },
            ].map((member, i) => (
              <motion.div
                key={i}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <h3 className="text-lg font-semibold text-slate-800">
                  {member.name}
                </h3>
                <p className="text-slate-600 text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </section>
        </div>
      </div>
      <br></br><br></br><br></br><br></br>
      <Footer />
    </div>
  );
}
