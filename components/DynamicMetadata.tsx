'use client';

import { useEffect } from 'react';

export default function DynamicMetadata() {
  useEffect(() => {
    const updateMetadata = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          const { siteName, favicon } = data.settings;
          
          // Update page title
          if (siteName) {
            document.title = siteName;
          }
          
          // Update favicon
          if (favicon) {
            // Remove existing favicon links
            const existingLinks = document.querySelectorAll("link[rel*='icon']");
            existingLinks.forEach(link => link.remove());
            
            // Add new favicon
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = favicon;
            document.head.appendChild(link);
            
            // Also add apple-touch-icon for iOS
            const appleLink = document.createElement('link');
            appleLink.rel = 'apple-touch-icon';
            appleLink.href = favicon;
            document.head.appendChild(appleLink);
          }
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    updateMetadata();
    
    // Poll for settings changes every 5 seconds
    const interval = setInterval(updateMetadata, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return null;
}
