import React from 'react';
import HeroSection from '../../components/public/HeroSection';
import './LegalPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <HeroSection
        title="Privacy Policy"
        tagline="Our commitment to your digital security and privacy."
        backgroundImage="https://images.pexels.com/photos/1483053/pexels-photo-1483053.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2"
        videoUrl="https://player.vimeo.com/external/434045526.sd.mp4?s=c27dbed98d4d10134444565780521e64906f236e&profile_id=164&oauth2_token_id=57447761"
      />

      <div className="container">
        <div className="legal-content">
          <span className="last-updated">Global Protocol Version 4.2 | Last Updated: May 10, 2026</span>
          
          <div className="legal-section">
            <h3><i className="fas fa-fingerprint section-icon"></i> 1. Introduction</h3>
            <p>
              At LuxuryStay Hospitality Group, we understand that privacy is an essential part of the luxury experience. 
              This Privacy Policy describes how we collect, use, and share information about you when you use our 
              website, mobile applications, and during your stay at any of our global properties.
            </p>
          </div>

          <div className="legal-section">
            <h3><i className="fas fa-database section-icon"></i> 2. Information We Collect</h3>
            <p>
              We collect several types of information from and about users of our services:
            </p>
            <ul>
              <li><strong>Personal Identification:</strong> Name, date of birth, passport or ID number, and nationality for legal registration.</li>
              <li><strong>Contact Details:</strong> Email address, phone number, and physical address.</li>
              <li><strong>Stay Preferences:</strong> Room preferences, pillow menus, dietary requirements, and past stay history.</li>
              <li><strong>Financial Data:</strong> Encrypted payment card information and transaction history.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h3><i className="fas fa-concierge-bell section-icon"></i> 3. How We Use Your Information</h3>
            <p>
              Your information is used to provide a seamless and personalized luxury service:
            </p>
            <ul>
              <li><strong>Operational Excellence:</strong> Fulfilling your reservations and managing check-ins/outs.</li>
              <li><strong>Personalization:</strong> Tailoring our services and amenities to your unique preferences.</li>
              <li><strong>Security and Safety:</strong> Protecting our guests, staff, and properties.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h3><i className="fas fa-shield-alt section-icon"></i> 4. Data Security</h3>
            <p>
              We use military-grade encryption and administrative, technical, and physical security measures to help 
              protect your personal information. Our systems are monitored 24/7 for potential threats.
            </p>
          </div>

          <div className="legal-section">
            <h3><i className="fas fa-user-check section-icon"></i> 5. Your Privacy Rights</h3>
            <p>
              Depending on your location, you may have rights to:
            </p>
            <ul>
              <li>Access the personal information we hold about you.</li>
              <li>Request the correction of inaccurate data.</li>
              <li>Request the deletion of your data (the "right to be forgotten").</li>
            </ul>
          </div>

          <div className="legal-section" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h3><i className="fas fa-envelope-open-text section-icon"></i> Contact Our Privacy Officer</h3>
            <p>
              For any inquiries regarding your data, please contact our Global Privacy Office:
              <br />
              <strong>Email:</strong> privacy.office@luxurystay.com
              <br />
              <strong>Address:</strong> LuxuryStay HQ, Quai du Mont-Blanc 12, 1201 Genève, Switzerland
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
