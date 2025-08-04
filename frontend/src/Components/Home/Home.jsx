import React, { useState } from 'react';
import './Home.css';

function Home() {
  const [activeService, setActiveService] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const services = [
    ['/images/2190967.png', 'Reporting Services', 'E-services for reporting and inquiring about incidents'],
    ['/images/4344337.png', 'Traffic Services', 'E-services for traffic, designed for drivers and vehicles'],
    ['/images/893905.png', 'Permit Services', 'E-services for issuing different kinds of permits'],
    ['/images/893881.png', 'Certificate Services', 'E-services for issuing accredited certificates'],
    ['/images/1414884.png', 'Community Services', 'E-services designed to satisfy and serve the community']
  ];

  return (
    <div>
      {/* Header h */}
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
          <button className="login-btn">Login</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="overlay" />
        <video autoPlay muted loop playsInline className="background-video">
          <source src="/images/police360-ve.mp4" type="video/mp4" />
        </video>
        <div className="hero-content">
          <h1>Drone Box</h1>
          <p>A smart solution to enhance Police360 emergency response</p>
          <input type="text" placeholder="Search for the service..." />
        </div>
      </section>

      {/* Services Section */}
      <section className="services-grid">
        {services.map(([icon, title, desc], i) => (
          <div
            className="service-tile"
            key={i}
            onClick={() => {
              setActiveService({ icon, title, desc });
              setShowModal(true);
            }}
          >
            <div className="service-icon"><img src={icon} alt={title} /></div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </section>

      {/* Modal Popup */}
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
              {/* Example Subcategories */}
              <div className="service-option">
                <img src="/images/2190967.png" alt="OCEC" />
                <div>
                  <h4>OCEC</h4>
                  <p>This service allows handling of banking info.</p>
                </div>
                <button className="apply-btn">Apply</button>
              </div>
              <div className="service-option">
                <img src="/images/893905.png" alt="Tourist Police" />
                <div>
                  <h4>Tourist Police</h4>
                  <p>Submit a report related to tourism.</p>
                </div>
                <button className="apply-btn">Apply</button>
              </div>
              <div className="service-option">
                <img src="/images/893881.png" alt="Police Report" />
                <div>
                  <h4>Police Report Inquiry</h4>
                  <p>Check the status of existing police reports.</p>
                </div>
                <button className="apply-btn">Apply</button>
              </div>
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
