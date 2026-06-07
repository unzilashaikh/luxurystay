import { Link } from 'react-router-dom';
import './PublicComponents.css';

const parseBookLink = (linkTo) => {
  if (!linkTo?.startsWith('/?')) return null;
  const params = new URLSearchParams(linkTo.slice(2));
  return { pathname: '/', search: `?${params.toString()}` };
};

const ContentCard = ({
  image,
  title,
  subtitle,
  features,
  linkTo,
  linkText = 'View Details',
  price,
  priceLabel = '/ night',
  badge,
  onAction,
}) => {
  const bookTo = parseBookLink(linkTo);

  return (
    <article className="content-card">
      <div className="card-image-wrapper">
        <img src={image} alt={title} className="card-image" loading="lazy" />
        {price != null && (
          <div className="card-price-badge">
            <span className="card-price-from">From</span>
            <span className="card-price-value">${Number(price).toFixed(0)}</span>
            <span className="card-price-unit">{priceLabel}</span>
          </div>
        )}
        {badge && <span className="card-status-badge">{badge}</span>}
      </div>

      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}

        {features && features.length > 0 && (
          <ul className="card-features">
            {features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        )}

        {(linkTo || onAction) && (
          <div className="card-action">
            {onAction ? (
              <button type="button" className="btn btn-primary card-cta-btn" onClick={onAction}>
                {linkText}
              </button>
            ) : bookTo ? (
              <Link to={bookTo} className="btn btn-primary card-cta-btn">
                {linkText}
              </Link>
            ) : (
              <Link
                to={linkTo}
                className={`btn card-cta-btn ${linkText.toLowerCase().includes('contact') ? 'btn-outline' : 'btn-primary'}`}
              >
                {linkText}
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default ContentCard;
