import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase'; 
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Komponentlar (O'chirilmagan)
import MomentsTab from './components/MomentsTab';
import PartnerTab from './components/PartnerTab';
import VoiceTab from './components/VoiceTab';
import Settings from './components/Settings'; 

// Ikonkalar
import { Mic2, Users, Layout, LogOut, Moon, Sun, Settings as SettingsIcon, LogIn } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('moments');
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const docRef = doc(db, "users", u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (e) {
          console.error("Data fetch error:", e);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => {
      unsub();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login Error:", err);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Rostdan ham SpeakFlow'dan chiqmoqchimisiz?")) {
      signOut(auth);
    }
  };

  const getFlag = (lang) => {
    const flags = { en: '🇺🇸', uz: '🇺🇿', ru: '🇷🇺', tr: '🇹🇷', ko: '🇰🇷' };
    return flags[lang] || '🌐';
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0d1117', color: 'white' }}>
      Loading SpeakFlow...
    </div>
  );
  
  if (!user) return (
    <div style={{ background: '#0d1117', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#7c4dff', fontSize: '3.5rem', marginBottom: '10px', fontWeight: '900' }}>SpeakFlow</h1>
      <p style={{ opacity: 0.6, marginBottom: '30px' }}>Join the community. Please sign in with Google.</p>
      <button onClick={handleLogin} style={{ background: '#7c4dff', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '15px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <LogIn size={22} /> Sign in with Google
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', background: isDark ? '#0d1117' : '#f0f2f5', color: isDark ? 'white' : 'black', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: isMobile ? '100%' : '280px',
        height: isMobile ? '75px' : '100vh',
        background: isDark ? '#161b22' : 'white',
        padding: isMobile ? '0' : '30px',
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        position: isMobile ? 'fixed' : 'relative',
        bottom: 0,
        zIndex: 1000,
        justifyContent: isMobile ? 'space-around' : 'flex-start',
        borderTop: isMobile ? (isDark ? '1px solid #30363d' : '1px solid #ddd') : 'none'
      }}>
        {!isMobile && <h2 style={{ color: '#7c4dff', marginBottom: '50px', fontWeight: '900' }}>SpeakFlow</h2>}
        
        <nav style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '0' : '12px', flex: isMobile ? 'none' : 1, width: isMobile ? '100%' : 'auto' }}>
          <TabBtn icon={<Layout size={22}/>} label="Moments" active={activeTab === 'moments'} onClick={() => setActiveTab('moments')} isMobile={isMobile} />
          <TabBtn icon={<Users size={22}/>} label="Partners" active={activeTab === 'partner'} onClick={() => setActiveTab('partner')} isMobile={isMobile} />
          <TabBtn icon={<Mic2 size={22}/>} label="Voice" active={activeTab === 'voice'} onClick={() => setActiveTab('voice')} isMobile={isMobile} />
          <TabBtn icon={<SettingsIcon size={22}/>} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} isMobile={isMobile} />
        </nav>
        
        {!isMobile && (
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <button onClick={() => setIsDark(!isDark)} style={{ background: 'none', border: 'none', color: isDark ? 'white' : 'black', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
              {isDark ? <Sun size={22} /> : <Moon size={22} />} {isDark ? "Light" : "Dark"}
            </button>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LogOut size={22} /> Logout
            </button>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: isMobile ? '75px' : 0 }}>
        <header style={{ padding: '15px 25px', background: isDark ? '#161b22' : 'white', borderBottom: isDark ? '1px solid #30363d' : '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#7c4dff' }}>{activeTab.toUpperCase()}</span>
            {userData?.targetLanguage && <span>{getFlag(userData.targetLanguage)}</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {isMobile && <button onClick={() => setIsDark(!isDark)} style={{ background: 'none', border: 'none', color: isDark ? 'white' : 'black' }}>{isDark ? <Sun size={22} /> : <Moon size={22} />}</button>}
            <div style={{ textAlign: 'right', display: isMobile ? 'none' : 'block' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{user.displayName}</div>
              <div style={{ fontSize: '0.75rem', color: '#238636', fontWeight: 'bold' }}>● Online</div>
            </div>
            <img src={user.photoURL} style={{ width: '40px', height: '40px', borderRadius: '12px', border: '2px solid #7c4dff' }} alt="" />
            {isMobile && <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff4d4d' }}><LogOut size={22}/></button>}
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'moments' && <MomentsTab isDark={isDark} />}
          {activeTab === 'partner' && <PartnerTab isDark={isDark} />}
          {activeTab === 'voice' && <VoiceTab isDark={isDark} />}
          {activeTab === 'settings' && <Settings isDark={isDark} />}
        </div>
      </main>
    </div>
  );
}

const TabBtn = ({ icon, label, active, onClick, isMobile }) => (
  <button onClick={onClick} style={{ 
    display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? '4px' : '15px', 
    padding: isMobile ? '10px 5px' : '16px 20px', borderRadius: '18px', border: 'none', 
    background: active && !isMobile ? '#7c4dff' : 'transparent', 
    color: active ? (isMobile ? '#7c4dff' : 'white') : '#8b949e', 
    fontWeight: 'bold', cursor: 'pointer', flex: isMobile ? 1 : 'none'
  }}>
    {icon} <span style={{ fontSize: isMobile ? '0.65rem' : '1rem' }}>{label}</span>
  </button>
);