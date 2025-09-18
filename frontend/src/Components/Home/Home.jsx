import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [activeService, setActiveService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const navigate = useNavigate();

  // Load Google Translate widget
  useEffect(() => {
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', includedLanguages: 'en,si,ta',
           },
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

  const services = [
    [
      '/images/2190967.png',
      'Reporting Services',
      'E-services for reporting and inquiring about incidents',
      [
        {
          icon: '/images/2190967.png',
          title: 'eCrime',
          desc: 'This service allows applicants to file an e-crime complaint, whether the c.',
          link: '/apply/ecrime',
        },
        {
          icon: '/images/893905.png',
          title: 'Tourist Police',
          desc: 'This service allows tourists to submit a report or complaint to the Tourist Police.',
          link: '/apply/tourist-police',
        },
        {
          icon: '/images/893881.png',
          title: 'Police Report Inquiry',
          desc: 'Check status of existing police reports.',
          link: '/apply/report-inquiry',
        },
        {
          icon: '/images/893881.png',
          title: 'File Criminal Complaint',
          desc: 'This service allows users to file a criminal complaint.',
          link: '/apply/file-complaint',
        },
        {
          icon: '/images/893881.png',
          title: 'Criminal Status of Financial Cases',
          desc: 'This service allows users to check the criminal status of financial cases.',
          link: '/apply/criminal-status-financial-cases',
        },
      ],
    ],
    [
      '/images/4344337.png',
      'Traffic Services',
      'E-services for traffic, designed for drivers and vehicles',
      [
        {
          icon: '/images/traffic1.png',
          title: 'Unknown Accident Report',
          desc: 'This service allows users to report unknown accidents.',
          link: '/apply/unknown-accident-report',
        },
        {
          icon: '/images/traffic2.png',
          title: 'Reporting Vehicle Obstruction',
          desc: 'This service allows users to report vehicle obstructions.',
          link: '/apply/vehicle-obstruction',
        },
        {
          icon: '/images/traffic2.png',
          title: 'Traffic Violations Copy',
          desc: 'This service enables applicants to obtain information related to a traffic violation.',
          link: '/apply/violations',
        },
        {
          icon: '/images/traffic2.png',
          title: 'Change Vehicle Color',
          desc: 'This service allows users to change the color of their vehicle in official records.',
          link: '/apply/change-vehicle-color',
        },
        {
          icon: '/images/traffic2.png',
          title: 'Traffic Fines Installment',
          desc: 'This service aims to enable vehicle owners (individuals - business sector).',
          link: '/apply/traffic-fines-installment',
        },
      ],
    ],
    [
      '/images/893905.png',
      'Permit Services',
      'E-services for issuing different kinds of permits',
      [
        {
          icon: '/images/permit1.png',
          title: 'Event Permit',
          desc: 'Apply for public event permits.',
          link: '/apply/event-permit',
        },
        {
          icon: '/images/permit2.png',
          title: 'Photography Permit',
          desc: 'Request photo/video shooting permits.',
          link: '/apply/photo-permit',
        },
        {
          icon: '/images/permit2.png',
          title: 'Sailing Permit',
          desc: 'Request sailing permits for water activities.',
          link: '/apply/sailing-permit',
        },
        {
          icon: '/images/permit2.png',
          title: 'Road Closure Permit',
          desc: 'Request road closure permits.',
          link: '/apply/road-closure-permit',
        },
        {
          icon: '/images/permit2.png',
          title: 'Detainee Visit Request',
          desc: 'Request detainee visit permits.',
          link: '/apply/detainee-visit-request',
        },
        {
          icon: '/images/permit2.png',
          title: 'Police Museum Visit Permit',
          desc: 'Request police museum visit permits.',
          link: '/apply/police-museum-visit-permit',
        },
        {
          icon: '/images/permit2.png',
          title: 'Inmate Visit Permit',
          desc: 'Request inmate visit permits.',
          link: '/apply/inmate-visit-permit',
        },
      ],
    ],
    [
      '/images/893881.png',
      'Certificate Services',
      'E-services for issuing accredited certificates',
      [
        {
          icon: '/images/permit1.png',
          title: 'Traffic Status Certificate',
          desc: 'This service enables applicants to obtain a certificate that shows the dri.',
          link: '/apply/traffic-status-certificate',
        },
        {
          icon: '/images/permit2.png',
          title: 'Lost Item Certificate',
          desc: 'This service enables applicants to obtain a certificate for lost items.',
          link: '/apply/lost-item-certificate',
        },
        {
          icon: '/images/permit2.png',
          title: 'Gold Management Platform',
          desc: 'This service enables applicants to obtain a certificate for gold management.',
          link: '/apply/gold-management-platform',
        },
      ],
    ],
    [
      '/images/1414884.png',
      'Community Services',
      'E-services designed to satisfy and serve the community',
      [
        {
          icon: '/images/permit1.png',
          title: 'Human Trafficking Victims',
          desc: 'A service that allows the public to report human trafficking practices or .',
          link: '/apply/human-trafficking-victims',
        },
        {
          icon: '/images/permit2.png',
          title: 'File a Labor Complaint',
          desc: 'This service enables labor workers to submit individual or collective comp.',
          link: '/apply/labor-complaint',
        },
        {
          icon: '/images/permit2.png',
          title: 'Child and Women Protection',
          desc: 'This service provides social support and legal protection for children an.',
          link: '/apply/child-and-women-protection',
        },
        {
          icon: '/images/permit2.png',
          title: 'Home Security',
          desc: 'A smart security service for villas in the Emirate of Dubai that provides .',
          link: '/apply/home-security',
        },
        {
          icon: '/images/permit2.png',
          title: 'Suggestion',
          desc: 'This service allows applicants to submit their suggestions with regards to.',
          link: '/apply/suggestion',
        },
        {
          icon: '/images/permit2.png',
          title: 'Feedback',
          desc: 'The service allows customers to provide their opinions and comments aimed at improving police services.',
          link: '/apply/feedback',
        },
        
      ],
    ],
  ];

  const handleApplyClick = (service) => {
    // Prefer direct link if provided; otherwise go to generic report form
    if (service.link) {
      navigate(service.link);
      return;
    }
    navigate('/report-form', { state: { reportType: service.title } });
  };

  return (
    <div>
      <header className="main-header">
        <div className="left-header">
          <img src="/images/PTLogo.png" alt="Police360 Logo" className="logom" />
          <div className="logo">Police360</div>
        </div>
        <nav className="navbar">
          <a href="Home.jsx" className="active">
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
          <select onChange={(e) => changeLanguage(e.target.value)} defaultValue="en">
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>

          {/* Google Translate element (hidden but needs to be present) */}
          <div
            id="google_translate_element"
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
          />

          <button className="login-btn" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="overlay" />
        <video autoPlay muted loop playsInline className="background-video">
          <source src="/images/police360-ve.mp4" type="video/mp4" />
        </video>
        <div className="hero-content">
          <h1>Police Service</h1>
          <p>A smart solution to enhance Police360 emergency response</p>
          <button className="report-btn" onClick={() => navigate('/report-form')}>
            Report an Incident
          </button>
        </div>
      </section>

      {/* Services */}
      <section className="services-grid">
        {services.map(([icon, title, desc, subServices], i) => (
          <div
            className="service-tile"
            key={i}
            onClick={() => {
              setActiveService({ icon, title, desc, subServices });
              setShowModal(true);
            }}
          >
            <div className="service-icon">
              <img src={icon} alt={title} />
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              ×
            </button>
            <div className="modal-header">
              <img src={activeService.icon} alt={activeService.title} />
              <h2>{activeService.title}</h2>
              <p>{activeService.desc}</p>
            </div>

            <div className="modal-content">
              {activeService.subServices.map((sub, index) => (
                <div className="service-option" key={index}>
                  <img src={sub.icon} alt={sub.title} />
                  <div>
                    <h4>{sub.title}</h4>
                    <p>{sub.desc}</p>
                  </div>
                  <button
                    className="apply-btn"
                    onClick={() => handleApplyClick(sub)}
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <p>© 2025 Police360 | Powered by Government IT Solutions</p>
        <div className="social-icons">
          <i className="fab fa-facebook-f" />
          <i className="fab fa-twitter" />
          <i className="fab fa-youtube" />
        </div>
      </footer>
    </div>
  );
}

export default Home;