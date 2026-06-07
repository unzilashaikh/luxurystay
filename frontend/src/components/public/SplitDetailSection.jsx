import './PublicComponents.css';

const SplitDetailSection = ({ image, title, subtitle, description, reverse = false }) => {
  return (
    <section className="split-detail-section">
      <div className={`container split-detail-grid ${reverse ? 'reverse' : ''}`}>
        <div className="split-image-wrapper">
          <img src={image} alt={title} className="split-image" />
        </div>
        <div className="split-content">
          {subtitle && <p className="split-subtitle">{subtitle}</p>}
          <h2 className="split-title">{title}</h2>
          <div className="split-divider"></div>
          <p className="split-description">{description}</p>
        </div>
      </div>
    </section>
  );
};

export default SplitDetailSection;
