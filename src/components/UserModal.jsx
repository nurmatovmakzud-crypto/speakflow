import React from 'react';
import { X, MessageCircle, UserPlus, Globe, Award } from 'lucide-react';

export default function UserModal({ user, onClose, isMe, onSendMessage }) {
  if (!user) return null;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={closeBtn}><X size={24} /></button>
        
        <div style={coverPhoto} />
        
        <div style={profileContent}>
          <div style={avatarContainer}>
            <img src={user.photo || `https://ui-avatars.com/api/?name=${user.name}`} style={largeAvatar} alt="profile" />
          </div>

          <h2 style={profileName}>{user.name}</h2>
          <p style={profileBio}>{user.bio || "Language learner & World traveler 🌍"}</p>

          <div style={tagRow}>
            <div style={tag}><Globe size={14}/> {user.native || "Uzbek"}</div>
            <div style={tag}><Award size={14}/> {user.learning || "English"}</div>
          </div>

          <div style={actionButtons}>
            {!isMe && (
              <>
                <button style={primaryBtn} onClick={() => onSendMessage(user)}>
                  <MessageCircle size={20} /> Send Message
                </button>
                <button style={secondaryBtn}><UserPlus size={20} /> Follow</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// STILLAR (Xatosiz versiya)
const overlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 };
const modal = { background: '#1c2128', width: '90%', maxWidth: '400px', borderRadius: '32px', overflow: 'hidden', position: 'relative', border: '1px solid #333' };
const coverPhoto = { height: '100px', background: 'linear-gradient(45deg, #7c4dff, #b392ff)' };
const profileContent = { padding: '0 25px 30px 25px', textAlign: 'center', marginTop: '-50px' };
const avatarContainer = { position: 'relative', display: 'inline-block' };
const largeAvatar = { width: '100px', height: '100px', borderRadius: '30px', border: '5px solid #1c2128', objectFit: 'cover' };
const profileName = { margin: '15px 0 5px 0', fontSize: '1.4rem', fontWeight: 'bold', color: 'white' };
const profileBio = { fontSize: '0.9rem', opacity: 0.7, marginBottom: '20px', color: '#e4e6eb' };
const tagRow = { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '25px' };
const tag = { background: 'rgba(255,255,255,0.05)', padding: '6 : 12px', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#b0b3b8' };
const actionButtons = { display: 'flex', flexDirection: 'column', gap: '12px' };
const primaryBtn = { background: '#7c4dff', color: 'white', border: 'none', padding: '14px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const secondaryBtn = { background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', padding: '14px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const closeBtn = { position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', zIndex: 10 };