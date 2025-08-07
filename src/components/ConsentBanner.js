import { useEffect, useState } from 'react';

const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      // Tell Google ads consent has been given
      window.gtag && window.gtag('consent', 'update', {
        ad_storage: 'granted',
        analytics_storage: 'granted'
      });
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'true');

    // Update Google consent
    window.gtag && window.gtag('consent', 'update', {
      ad_storage: 'granted',
      analytics_storage: 'granted'
    });

    setShowBanner(false);
  };

  return (
    showBanner && (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#333',
        color: 'white',
        padding: '15px',
        textAlign: 'center',
        zIndex: 1000
      }}>
        <span>This site uses cookies to serve ads. By continuing, you agree.</span>
        <button onClick={acceptCookies} style={{
          marginLeft: '15px',
          padding: '8px 12px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Accept
        </button>
      </div>
    )
  );
};

export default ConsentBanner;
