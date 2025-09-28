import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Nav.css'

function Nav() {

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
          <a href="/" className="">
            Home
          </a>
          <a href="#">About Us</a>
          <a href="#">Open Data</a>
          <a href="#">Application Status</a>
          <a href="#">Information</a>
          <a href="#">Media</a>
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
