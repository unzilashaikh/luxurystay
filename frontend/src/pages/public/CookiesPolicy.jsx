import React from 'react';
import HeroSection from '../../components/public/HeroSection';
import './LegalPages.css';

const CookiesPolicy = () => {
  return (
    <div className="legal-page">
      <HeroSection
        title="Cookie Policy"
        tagline="How we use technology to enhance your digital stay."
        backgroundImage="https://images.pexels.com/photos/1483053/pexels-photo-1483053.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2"
        videoUrl="https://player.vimeo.com/external/440539169.sd.mp4?s=d7e35f99f36f33d4554f605068205f0a0d4c818a&profile_id=164&oauth2_token_id=57447761"
      />

      <div className="container">
        <div className="legal-content">
          <span className="last-updated">Digital Experience Protocol | Last Updated: May 10, 2026</span>
          
          <div className="legal-section">
            <h3><i className="fas fa-cookie-bite section-icon"></i> 1. Introduction</h3>
            <p>
              At LuxuryStay, we believe in being clear and open about how we collect and use data 
              related to you. In the spirit of transparency, this policy provides detailed 
              information about how and when we use cookies on our website.
            </p>
          </div>

          <div className="legal-section">
            <h3><i className="fas fa-layer-group section-icon"></i> 2. Cookie Categories</h3>
            <p>
              We categorize our cookies into the following functional groups:
            </p>
            <ul>
              <li><strong>Essential:</strong> Required for secure bookings and site stability.</li>
              <li><strong>Analytical:</strong> Helping us understand guest preferences through anonymous data.</li>
              <li><strong>Personalization:</strong> Remembering your language and stay preferences.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h3><i className="fas fa-tools section-icon"></i> 3. Specific Technologies</h3>
            <p>
              Our platform utilizes the following industry-standard technologies:
            </p>
            <ul>
              <li><strong>LS_SESSION:</strong> Primary booking state management.</li>
              <li><strong>_ga:</strong> Performance analytics via Google.</li>
              <li><strong>_fbp:</strong> Curated advertising delivery.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h3><i className="fas fa-user-cog section-icon"></i> 4. Managing Preferences</h3>
            <p>
              You have full control over your digital footprint. Manage your settings via:
            </p>
            <div className="flex gap-4" style={{ marginTop: '20px' }}>
              <a href="#" className="btn btn-outline btn-sm">Cookie Settings</a>
              <a href="#" className="btn btn-primary btn-sm">Accept All</a>
            </div>
          </div>

          <div className="legal-section">
            <h3><i className="fas fa-history section-icon"></i> 5. Policy Updates</h3>
            <p>
              We periodically refine our technology stack. Re-visit this policy to stay 
              informed about our use of cookies and related digital services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicy;
