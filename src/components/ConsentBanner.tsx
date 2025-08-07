import React, { useEffect, useState } from 'react';

// Type declaration for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: any) => void;
  }
}

const ConsentBanner: React.FC = () => {
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

  if (!showBanner) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: '#1a1a1a',
      color: 'white',
      padding: '20px',
      textAlign: 'center',
      zIndex: 9999,
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
      borderTop: '2px solid #1877f2',
      fontSize: '16px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <span style={{ flex: '1', minWidth: '250px' }}>
          🍪 This site uses cookies to serve ads and improve your experience. By continuing, you agree to our use of cookies.
        </span>
        <button 
          onClick={acceptCookies} 
          style={{
            padding: '12px 24px',
            backgroundColor: '#1877f2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#166fe5';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(24, 119, 242, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#1877f2';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(24, 119, 242, 0.3)';
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default ConsentBanner;
