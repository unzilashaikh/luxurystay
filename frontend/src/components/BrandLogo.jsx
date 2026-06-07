import logoSrc from '../assets/logo.png';
import './BrandLogo.css';

const SIZES = {
  sm: 52,
  md: 68,
  lg: 92,
  xl: 130,
};

const BrandLogo = ({ size = 'md', className = '', alt = 'Luxury Stay' }) => (
  <img
    src={logoSrc}
    alt={alt}
    className={`brand-logo-img ${className}`.trim()}
    style={{ height: SIZES[size] || SIZES.md }}
    draggable={false}
  />
);

export default BrandLogo;
