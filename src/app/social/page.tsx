'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ModernSocialPage from '@/components/ModernSocialPage';

export default function SocialPageClient() {
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Synchronisation optimisée
    const interval = setInterval(loadData, 30000); // 30 secondes - Optimisé
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [socialRes, settingsRes] = await Promise.all([
        fetch('/api/cloudflare/social-links', { cache: 'no-store' }),
        fetch('/api/cloudflare/settings', { cache: 'no-store' })
      ]);
      
      if (socialRes.ok) {
        const socialData = await socialRes.json();
        setSocialLinks(socialData || []);
      }
      
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData || {});
      }
    } catch (error) {
      console.error('❌ Erreur chargement social:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen loading-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="global-overlay"></div>
      <div className="content-layer">
        <Header />
        
        <ModernSocialPage socialLinks={socialLinks} settings={settings} />
        
        <BottomNav />
      </div>
    </div>
  );
}