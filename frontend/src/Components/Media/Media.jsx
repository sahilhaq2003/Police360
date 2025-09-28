// src/pages/Media.jsx
import React from "react";
import { motion } from "framer-motion";
import { Camera, Video, Newspaper } from "lucide-react";
import Nav from "../Nav/Nav";
import hero from "../../assets/loginbg.jpg";

export default function Media() {
  const news = [
    {
      title: "Launch of Police360 Digital Platform",
      date: "September 2025",
      desc: "The Police360 system was officially launched to modernize law enforcement processes and strengthen public trust.",
    },
    {
      title: "Road Safety Awareness Program",
      date: "August 2025",
      desc: "Police officers conducted island-wide awareness campaigns to reduce road accidents and promote safe driving.",
    },
    {
      title: "Cybercrime Awareness Week",
      date: "July 2025",
      desc: "A special program was conducted to educate the public on online fraud, scams, and digital safety measures.",
    },
  ];

  const gallery = [
    { type: "image", src: "/images/Officer.jpeg", caption: "Community Safety Workshop" },
    { type: "image", src: "/images/Accident.png", caption: "Accident Reporting Awareness" },
    { type: "video", src: "/images/police360-ve.mp4", caption: "Police360 System Overview" },
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
          viewport={{ once: false }}
        >
          <h1 className="text-4xl font-extrabold text-white flex items-center justify-center gap-2">
            <Camera className="text-indigo-400" /> Media Center
          </h1>
          <p className="mt-3 text-slate-200 text-lg">
            Explore official news updates, press releases, images, and videos
            from Police360 activities and initiatives.
          </p>
        </motion.header>

        {/* News / Press Releases */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: false }}
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-8"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Newspaper className="text-indigo-600" /> News & Press Releases
          </h2>
          <div className="space-y-6">
            {news.map((item, i) => (
              <motion.div
                key={i}
                className="border-b pb-4 last:border-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: false }}
              >
                <h3 className="text-lg font-semibold text-slate-800">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500">{item.date}</p>
                <p className="text-slate-600 mt-2">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Gallery */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: false }}
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-8"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Video className="text-indigo-600" /> Photo & Video Gallery
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {gallery.map((item, i) => (
              <motion.div
                key={i}
                className="rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-100"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: false }}
                whileHover={{ scale: 1.03 }}
              >
                {item.type === "image" ? (
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <video
                    controls
                    className="w-full h-48 object-cover bg-black"
                  >
                    <source src={item.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                <div className="p-3 text-center text-sm text-slate-600">
                  {item.caption}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
        </div>
      </div>
    </div>
  );
}
