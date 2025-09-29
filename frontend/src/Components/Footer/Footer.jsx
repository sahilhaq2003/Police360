// src/components/Footer.jsx
import React from "react";
import { ShieldCheck, Mail, Phone, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        {/* Logo & About */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="text-indigo-400" size={24} />
            <span className="font-bold text-lg text-white">Police360</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Police360 is a digital platform to modernize police workflows,
            improve transparency, and enhance citizen trust.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:text-indigo-400">About Us</a></li>
            <li><a href="/open-data" className="hover:text-indigo-400">Open Data</a></li>
            <li><a href="/information" className="hover:text-indigo-400">Information</a></li>
            <li><a href="/application-status" className="hover:text-indigo-400">Application Status</a></li>
            <li><a href="/media" className="hover:text-indigo-400">Media</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-indigo-400" /> +94 11 242 1111
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-indigo-400" /> info@police360.lk
            </li>
            <li className="flex items-center gap-2">
              <Globe size={16} className="text-indigo-400" /> www.police360.lk
            </li>
          </ul>
        </div>

        {/* Disclaimer */}
        <div>
          <h4 className="text-white font-semibold mb-4">Disclaimer</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            This system is developed for educational and public awareness
            purposes as part of the Police360 project. Data shown here is
            anonymized and for demonstration only.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700 text-center py-4 text-sm text-slate-500">
        © {new Date().getFullYear()} Police360. All rights reserved.
      </div>
    </footer>
  );
}
