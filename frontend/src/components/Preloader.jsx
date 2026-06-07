import { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo';

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="preloader">
      <div className="preloader-content">
        <BrandLogo size="xl" className="preloader-brand-logo" />
        <div className="preloader-bar"></div>
      </div>
    </div>
  );
};

export default Preloader;
