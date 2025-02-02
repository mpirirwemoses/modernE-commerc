import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const ScrollToTop = () => {
  const location = useLocation();
  const offset = window.innerHeight / 100; // Adjust this value for more/less offset
window.scrollTo(0, offset); // Scrolls a fraction of the viewport height


  useEffect(() => {
    window.scrollTo(0, 300); // Scrolls to the top of the window
  }, [location]); // Re-run the effect when the location changes

  return null;
};

export default ScrollToTop;
