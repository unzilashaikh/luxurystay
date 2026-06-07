import { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const dotRef = useRef(null);
  const outlineRef = useRef(null);
  
  const mousePos = useRef({ x: 0, y: 0 });
  const outlinePos = useRef({ x: 0, y: 0 });
  const requestRef = useRef();

  useEffect(() => {
    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };

    const onMouseOver = (e) => {
      if (e.target.closest('a, button, .clickable, .social-icon, .btn')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const animate = () => {
      // Interpolation for smooth follow effect
      const dx = mousePos.current.x - outlinePos.current.x;
      const dy = mousePos.current.y - outlinePos.current.y;
      
      outlinePos.current.x += dx * 0.15;
      outlinePos.current.y += dy * 0.15;

      if (outlineRef.current) {
        outlineRef.current.style.left = `${outlinePos.current.x}px`;
        outlineRef.current.style.top = `${outlinePos.current.y}px`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
      <div 
        ref={dotRef}
        className={`cursor-dot ${isHovering ? 'hover' : ''}`}
      />
      <div 
        ref={outlineRef}
        className={`cursor-outline ${isHovering ? 'hover' : ''}`}
      />
    </>
  );
};

export default CustomCursor;
