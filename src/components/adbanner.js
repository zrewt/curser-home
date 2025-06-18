import { useEffect } from 'react';

const AdBanner = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error', e);
    }
  }, []);

  return (
    <ins className="adsbygoogle"
         style={{ display: 'block', textAlign: 'center', margin: '20px auto' }}
         data-ad-client="ca-pub-3382133035017689"
         data-ad-slot="1234567890"  // ✅ Replace with your real Ad Unit ID from AdSense
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  );
};

export default AdBanner;
