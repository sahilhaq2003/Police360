// src/pages/OpenData.jsx
import React from "react";
import { motion } from "framer-motion";
import { Database, Download, FileText, BarChart3 } from "lucide-react";
import Nav from "../Nav/Nav";
import hero from "../../assets/loginbg.jpg";
import Footer from "../Footer/Footer";

export default function OpenData() {
  const datasets = [
    {
      title: "Crime Statistics",
      description:
        "Monthly and yearly breakdown of reported crimes categorized by type, location, and status.",
      file: "/data/crime-statistics.pdf",
    },
    {
      title: "Accident Reports",
      description:
        "Traffic accident records including severity, locations, and involved parties (anonymized).",
      file: "/data/accident-reports.xlsx",
    },
    {
      title: "Officer Deployment",
      description:
        "Deployment schedules and duty rosters (public version, excludes sensitive data).",
      file: "/data/officer-deployment.csv",
    },
    {
      title: "Case Status Overview",
      description:
        "Open vs. closed case statistics with progress and average resolution times.",
      file: "/data/case-status.pdf",
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

      {/* Content above background */}
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
            <Database className="text-indigo-400" /> Open Data
          </h1>
          <p className="mt-4 text-white text-lg max-w-3xl mx-auto">
            Police360 promotes transparency by providing public access to
            anonymized datasets and reports. These resources can be used for
            research, analysis, and community awareness.
          </p>
        </motion.header>

        {/* Dataset List */}
        <section className="grid md:grid-cols-2 gap-8">
          {datasets.map((ds, i) => (
            <motion.div
              key={i}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="text-indigo-600" size={24} />
                  <h3 className="text-lg font-semibold text-slate-800">
                    {ds.title}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm mb-4">{ds.description}</p>
              </div>
              <a
                href={ds.file}
                download
                className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition"
              >
                <Download size={18} /> Download
              </a>
            </motion.div>
          ))}
        </section>

        {/* Visualization / Charts Placeholder */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
            <BarChart3 className="text-indigo-400" /> Data Insights
          </h2>
          <p className="text-slate-200 max-w-3xl mx-auto mb-8">
            Explore visualized insights from our datasets. This section can
            include interactive charts and graphs powered by open-source tools.
          </p>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-10 text-slate-500">
            📊 Coming soon: Interactive dashboards and live charts.
          </div>
        </motion.section>
        </div>
      </div>
      <br></br><br></br><br></br><br></br>
      <Footer />
    </div>
  );
}
