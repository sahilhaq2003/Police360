import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [activeService, setActiveService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const services = [
    [
      '/images/2190967.png',
      'Reporting Services',
      'E-services for reporting and inquiring about incidents',
      [
        {
          icon: '/images/2190967.png',
          title: 'OCEC',
          desc: 'This service allows handling of banking info.',
          link: '/apply/ocec'
        },
        {
          icon: '/images/893905.png',
          title: 'Tourist Police',
          desc: 'Submit a report related to tourism.',
          link: '/apply/tourist-police'
        },
        {
          icon: '/images/893881.png',
          title: 'Police Report Inquiry',
          desc: 'Check status of existing police reports.',
          link: '/apply/report-inquiry'
        }
      ]
    ],
    [
      '/images/4344337.png',
      'Traffic Services',
      'E-services for traffic, designed for drivers and vehicles',
      [
        {
          icon: '/images/traffic1.png',
          title: 'Pay Traffic Fines',
          desc: 'Pay your outstanding traffic fines online.',
          link: '/apply/pay-fines'
        },
        {
          icon: '/images/traffic2.png',
          title: 'Traffic Violation Inquiry',
          desc: 'Check and inquire about violations.',
          link: '/apply/violations'
        }
      ]
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
          link: '/apply/event-permit'
        },
        {
          icon: '/images/permit2.png',
          title: 'Photography Permit',
          desc: 'Request photo/video shooting permits.',
          link: '/apply/photo-permit'
        }
      ]
    ],
    [
      '/images/893881.png',
      'Certificate Services',
      'E-services for issuing accredited certificates',
      [
        {
          icon: '/images/permit1.png',
          title: 'Event Permit',
          desc: 'Apply for public event permits.',
          link: '/apply/event-permit'
        },
        {
          icon: '/images/permit2.png',
          title: 'Photography Permit',
          desc: 'Request photo/video shooting permits.',
          link: '/apply/photo-permit'
        }
      ]
    ],
    [
      '/images/1414884.png',
      'Community Services',
      'E-services designed to satisfy and serve the community',
      [
        {
          icon: '/images/permit1.png',
          title: 'Event Permit',
          desc: 'Apply for public event permits.',
          link: '/apply/event-permit'
        },
        {
          icon: '/images/permit2.png',
          title: 'Photography Permit',
          desc: 'Request photo/video shooting permits.',
          link: '/apply/photo-permit'
        }
      ]
    ]
  ];

  return (
    <div>
      <header className="main-header">
        <div className="left-header">
          <img src="/images/PTLogo.png" alt="Police360 Logo" className="logom" />
          <div className="logo">Police360</div>
        </div>
        <nav className="navbar">
          <a href="Home.jsx" className="active">Home</a>
          <a href="#">About Us</a>
          <a href="#">Open Data</a>
          <a href="#">Application Status</a>
          <a href="#">Information</a>
          <a href="#">Media</a>
        </nav>
        <div className="top-actions">
          <input type="text" placeholder="Search..." className="top-search" />
          <select>
            <option>English</option>
            <option>සිංහල</option>
            <option>தமிழ்</option>
          </select>
          <button
          className="login-btn"
          onClick={() => navigate('/login')} // Add this onClick
        >
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
          <h1>Police </h1>
          <p>A smart solution to enhance Police360 emergency response</p>
          <input type="text" placeholder="Search for the service..." />
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
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
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
                    onClick={() => navigate(sub.link)}
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
