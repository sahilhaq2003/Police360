import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './nav.css'

function Nav() {

  const location = useLocation();
  const activeStyle = { borderBottom: '3px solid #fff', paddingBottom: '4px' };
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

    // Load Google Translate widget
      useEffect(() => {
        if (!window.googleTranslateElementInit) {
          window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
              { pageLanguage: 'en', includedLanguages: 'en,si,ta' },
              'google_translate_element'
            );
          };
    
          const script = document.createElement('script');
          script.src =
            '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
          document.body.appendChild(script);
        }
      }, []);

      // Change language with retry until .goog-te-combo exists
  const changeLanguage = (lang) => {
    let tries = 0;
    const tryChange = () => {
      const combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = lang;
        combo.dispatchEvent(new Event('change'));
      } else if (tries < 20) {
        tries++;
        setTimeout(tryChange, 100);
      }
    };
    tryChange();
  };


  return (
    <div>
      <header className="main-header">
        <div className="left-header">
          <img
            src="/images/PTLogo.png"
            alt="Police360 Logo"
            className="logom"
          />
          <div className="logo">Police360</div>
        </div>
        <nav className="navbar">
          <Link to="/" className="nav-link" style={isActive('/') ? activeStyle : {}}>Home</Link>
          <Link to="/about" className="nav-link" style={isActive('/about') ? activeStyle : {}}>About Us</Link>
          <Link to="/open-data" className="nav-link" style={isActive('/open-data') ? activeStyle : {}}>Open Data</Link>
          <Link to="/application-status" className="nav-link" style={isActive('/application-status') ? activeStyle : {}}>Application Status</Link>
          <Link to="/information" className="nav-link" style={isActive('/information') ? activeStyle : {}}>Information</Link>
          <Link to="/media" className="nav-link" style={isActive('/media') ? activeStyle : {}}>Media</Link>
        </nav>
        <div className="top-actions">
          <input type="text" placeholder="Search..." className="top-search" />

          {/* Language selector */}
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            defaultValue="en"
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>

          {/* Google Translate element (hidden but needs to be present) */}
          <div
            id="google_translate_element"
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
          />

          {/* <button className="login-btn" onClick={() => navigate('/login')}>
            Login
          </button> */}
          <Link to="/login" className="login-btn">
            Login
          </Link>
        </div>
      </header>
    </div>
  )
}

export default Nav
