import { Link } from 'react-router-dom';
import './PublicComponents.css';

const CtaBanner = ({ title, subtitle, buttonText, buttonLink }) => {
  return (
    <section className="cta-banner">
      <div className="container cta-container">
        <h2 className="cta-title">{title}</h2>
        {subtitle && <p className="cta-subtitle">{subtitle}</p>}
        <Link to={buttonLink} className="btn btn-primary cta-btn">
          {buttonText}
        </Link>
      </div>
    </section>
  );
};

export default CtaBanner;
