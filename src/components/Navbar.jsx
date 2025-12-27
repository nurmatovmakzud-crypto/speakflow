import React from 'react';
import { Plus, Sun, Moon, Settings as SettingsIcon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isDark, setIsDark, user }) {
  
  const navLink = (active) => ({
    cursor: 'pointer',
    fontWeight: active ? 'bold' : 'normal',
    color: active ? '#7c4dff' : (isDark ? '#888' : '#555'),
    borderBottom: active ? '2px solid #7c4dff' : 'none',
    paddingBottom: '5px',
    transition: '0.3s'
  });

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 30px',
      borderBottom: isDark ? '1px solid #30363d' : '1px solid #d0d7de',
      background: isDark ? '#0d1117' : '#ffffff'
    }}>
      {/* Chap tomon: Logo va Linklar */}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <h2 style={{ color: '#7c4dff', margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>SpeakFlow</h2>
        <span onClick={() => setActiveTab('voice')} style={navLink(activeTab === 'voice')}>Voice Rooms</span>
        <span onClick={() => setActiveTab('partners')} style={navLink(activeTab === 'partners')}>Find Partner</span>
        <span onClick={() => setActiveTab('settings')} style={navLink(activeTab === 'settings')}>Settings</span>
      </div>

      {/* O'ng tomon: Actionlar va Profil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button style={{
          background: '#7c4dff',
          color: 'white',
          border: 'none',
          padding: '10px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          <Plus size={18}/> Create Room
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Dark Mode o'chirgich (Navbar'da ham qolgani ma'qul, qulaylik uchun) */}
          <div onClick={() => setIsDark(!isDark)} style={{ cursor: 'pointer', display: 'flex' }}>
            {isDark ? <Sun size={20} color="#888"/> : <Moon size={20} color="#555"/>}
          </div>

          {/* Profil rasmi - buni bossa ham Settingsga o'tadi */}
          <img 
            src={user?.photoURL} 
            alt="Profile"
            onClick={() => setActiveTab('settings')}
            style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '50%', 
              cursor: 'pointer',
              border: activeTab === 'settings' ? '2px solid #7c4dff' : '2px solid transparent',
              transition: '0.2s'
            }} 
          />
        </div>
      </div>
    </nav>
  );
}