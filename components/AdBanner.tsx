'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

interface SiteSettings {
  enableAds?: boolean;
  adType?: 'google' | 'custom';
  googleAdSenseId?: string;
  customAdImage?: string;
  customAdLink?: string;
}

interface AdBannerProps {
  className?: string;
  position?: string; // For tracking different ad positions
}

export default function AdBanner({ className = '', position = 'default' }: AdBannerProps) {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching ad settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if ads are disabled or still loading
  if (isLoading || !settings.enableAds) {
    return null;
  }

  const handleCustomAdClick = () => {
    if (settings.customAdLink) {
      window.open(settings.customAdLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`w-full flex justify-center py-4 ${className}`}>
      <div className="max-w-4xl w-full">
        {settings.adType === 'google' && settings.googleAdSenseId ? (
          // Google AdSense
          <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Advertisement</p>
              <div className="min-h-[100px] flex items-center justify-center">
                {/* Google AdSense ad unit will be inserted here */}
                <ins 
                  className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client={settings.googleAdSenseId}
                  data-ad-slot="auto"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
                <Script
                  strategy="afterInteractive"
                  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
                />
                <Script
                  id={`adsense-${position}`}
                  strategy="afterInteractive"
                >{`
                  (adsbygoogle = window.adsbygoogle || []).push({});
                `}</Script>
              </div>
            </div>
          </div>
        ) : settings.adType === 'custom' && settings.customAdImage ? (
          // Custom Banner Ad
          <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Advertisement</p>
              <div 
                className={`cursor-pointer transition-transform hover:scale-[1.02] ${
                  !settings.customAdLink ? 'cursor-default hover:scale-100' : ''
                }`}
                onClick={handleCustomAdClick}
              >
                <img
                  src={settings.customAdImage}
                  alt="Advertisement"
                  className="w-full max-w-full h-auto rounded-lg shadow-lg"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
              {settings.customAdLink && (
                <p className="text-xs text-gray-400 mt-2">
                  Click to visit advertiser
                </p>
              )}
            </div>
          </div>
        ) : (
          // Fallback: Ad space placeholder (only in development)
          process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-4">
              <div className="text-center min-h-[100px] flex items-center justify-center">
                <div className="text-gray-500">
                  <p className="text-sm">Ad Space</p>
                  <p className="text-xs">Configure ads in admin panel</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}