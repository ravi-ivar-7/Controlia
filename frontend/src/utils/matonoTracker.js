import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function MatomoTracker() {
  const location = useLocation();

  useEffect(() => {
    if (window && window._paq) {
      window._paq.push(['setCustomUrl', location.pathname]);
      window._paq.push(['trackPageView']);
    }
  }, [location]);

  return null; // No need to render anything
}

export default MatomoTracker;
