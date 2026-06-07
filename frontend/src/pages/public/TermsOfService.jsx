import React from 'react';
import HeroSection from '../../components/public/HeroSection';
import './LegalPages.css';

const TermsOfService = () => {
  return (
    <div className="legal-page">
      <HeroSection
        title="Terms of Service"
        tagline="Defining the standards of excellence for our guests."
        videoUrl="https://player.vimeo.com/external/370331493.sd.mp4?s=338c48ac2dfcb1d4c068996aa5d4f362a93b4d4a&profile_id=164&oauth2_token_id=57447761"
      />

      <div className="container">
        <div className="legal-content">
          <span className="last-updated">Official Guest Agreement | Version 2026.1</span>
          
          <div className="legal-section">
            <h3><i className="fas fa-file-contract section-icon"></i> 1. Acceptance of Terms</h3>
            <p>
              By accessing the LuxuryStay website or booking a stay at any of our properties, you 
              acknowledge that you have read, understood, and agree to be bound by these Terms of 
              Service and our Privacy Policy.
            </p>
          </div>

          <div className="legal-section">
            <h3><i className="fas fa-credit-card section-icon"></i> 2. Reservations and Payment</h3>
            <ul>
              <li><strong>Guarantee:</strong> A valid credit card is required at the time of booking to guarantee your reservation.</li>
              <li><strong>Payment:</strong> Full payment is typically required upon check-out, unless a non-refundable advanced purchase rate was selected.</li>
              <li><strong>Currency:</strong> Rates are quoted in the local currency of the property.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h3><i className="fas fa-calendar-times section-icon"></i> 3. Cancellation Policy</h3>
            <p>
              Cancellation policies vary by property and rate type. For most standard reservations:
            </p>
            <ul>
              <li>Cancellations must be made at least 48 hours prior to arrival.</li>
              <li>Late cancellations or no-shows will result in a charge equal to the first night's stay.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h3><i className="fas fa-clock section-icon"></i> 4. Check-in and Check-out</h3>
            <ul>
              <li><strong>Check-in:</strong> Available from 3:00 PM local time.</li>
              <li><strong>Identification:</strong> A valid passport or national ID is required for all guests.</li>
              <li><strong>Check-out:</strong> Guests must vacate rooms by 11:00 AM local time.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h3><i className="fas fa-smoking-ban section-icon"></i> 5. Guest Conduct</h3>
            <ul>
              <li><strong>Smoke-Free:</strong> All LuxuryStay properties are 100% smoke-free environments.</li>
              <li><strong>Noise:</strong> We maintain a strict quiet-hours policy from 10:00 PM to 8:00 AM.</li>
              <li><strong>Damages:</strong> Guests are responsible for any damage caused to hotel property.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h3><i className="fas fa-gavel section-icon"></i> 6. Governing Law</h3>
            <p>
              These terms are governed by the laws of Switzerland. Any disputes shall be resolved 
              exclusively in the courts of Geneva, Switzerland.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
