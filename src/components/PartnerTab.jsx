import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import PrivateChat from './PrivateChat';
import { MessageCircle, Search, UserPlus } from 'lucide-react';

export default function PartnerTab({ isDark }) {
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;

    // Barcha foydalanuvchilarni olish (o'zimizdan tashqari)
    const q = query(collection(db, "users"), where("uid", "!=", auth.currentUser.uid));

    const unsubscribe = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Foydalanuvchilarni yuklashda xato:", err));

    return () => unsubscribe();
  }, []);

  if (activeChat) {
    return <PrivateChat targetUser={activeChat} onBack={() => setActiveChat(null)} isDark={isDark} />;
  }

  // Instagram uslubida username bo'yicha qidirish
  const filteredUsers = users.filter(u => {
    const searchLow = searchTerm.toLowerCase().replace('@', ''); // @ belgisini olib tashlab qidirish
    const username = (u.username || u.displayName || "").toLowerCase();
    return username.includes(searchLow);
  });

  return (
    <div style={{ padding: '20px', height: '100%' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '10px' }}>Find Partners</h2>
        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Dunyo bo'ylab hamkorlarni toping</p>
      </div>
      
      {/* SEARCH BAR (INSTAGRAM STYLE) */}
      <div style={searchBox(isDark)}>
        <Search size={20} color={isDark ? '#8b949e' : '#888'} />
        <input 
          style={searchInput(isDark)}
          placeholder="@username orqali qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={gridStyle}>
        {filteredUsers.map(u => (
          <div key={u.uid} style={userCard(isDark)}>
            <div style={avatarWrapper}>
              <img 
                src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}`} 
                style={avatarImg} 
                alt=""
              />
              <div style={statusDot} />
            </div>
            
            <h3 style={{ margin: '15px 0 2px 0', fontSize: '1.1rem' }}>{u.displayName}</h3>
            <p style={{ color: '#7c4dff', fontWeight: '500', fontSize: '0.85rem', marginBottom: '15px' }}>
              @{u.username || u.displayName?.toLowerCase().replace(/\s/g, '_') || 'user'}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setActiveChat({ 
                  uid: u.uid, 
                  name: u.displayName, 
                  photo: u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}`
                })}
                style={chatBtn}
              >
                <MessageCircle size={18} /> Chat
              </button>
              <button style={followBtn(isDark)}><UserPlus size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <Search size={48} color="#888" style={{ marginBottom: '15px', opacity: 0.3 }} />
          <p style={{ opacity: 0.5 }}>Hech kim topilmadi. Boshqa username yozib ko'ring.</p>
        </div>
      )}
    </div>
  );
}

// STILLAR
const searchBox = (dark) => ({
  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px',
  background: dark ? '#161b22' : '#f0f2f5', borderRadius: '12px',
  marginBottom: '30px', border: dark ? '1px solid #30363d' : '1px solid #e1e4e8'
});
const searchInput = (dark) => ({
  flex: 1, background: 'none', border: 'none', outline: 'none',
  color: dark ? 'white' : 'black', fontSize: '1rem'
});
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' };
const userCard = (dark) => ({
  background: dark ? '#1c2128' : 'white', padding: '20px', borderRadius: '20px',
  textAlign: 'center', border: dark ? '1px solid #30363d' : '1px solid #e1e4e8'
});
const avatarWrapper = { position: 'relative', width: '75px', height: '75px', margin: '0 auto' };
const avatarImg = { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #7c4dff' };
const statusDot = { 
  position: 'absolute', bottom: '2px', right: '2px', width: '14px', height: '14px', 
  background: '#238636', borderRadius: '50%', border: '2px solid white' 
};
const chatBtn = {
  flex: 1, background: '#7c4dff', color: 'white', border: 'none',
  padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
};
const followBtn = (dark) => ({
  background: dark ? '#30363d' : '#f0f2f5', border: 'none', padding: '10px',
  borderRadius: '10px', cursor: 'pointer', color: dark ? 'white' : 'black'
});