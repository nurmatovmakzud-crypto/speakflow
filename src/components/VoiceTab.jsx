import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Loader2, Mic2 } from 'lucide-react';
import RoomView from './RoomView'; // Bu fayl mavjudligini tekshiring!

export default function VoiceTab({ isDark }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ title: '', topic: 'General', announcement: '' });

  useEffect(() => {
    try {
      const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }, (error) => {
        console.error("Firestore xatosi:", error);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Ekranni yuklashda xato:", err);
    }
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.title.trim()) return;

    try {
      await addDoc(collection(db, "rooms"), {
        title: newRoom.title,
        topic: newRoom.topic,
        announcement: newRoom.announcement || "Welcome! Be kind and respectful.",
        hostName: auth.currentUser.displayName || "User",
        hostPhoto: auth.currentUser.photoURL || "",
        hostId: auth.currentUser.uid,
        speakers: [auth.currentUser.uid], // Yaratuvchi darhol spiker bo'ladi
        requests: [],
        createdAt: serverTimestamp()
      });
      setShowModal(false);
      setNewRoom({ title: '', topic: 'General', announcement: '' });
    } catch (err) { console.error("Xona yaratishda xato:", err); }
  };

  if (activeRoom) return <RoomView room={activeRoom} onLeave={() => setActiveRoom(null)} isDark={isDark} />;

  return (
    <div style={{ padding: '20px', color: isDark ? 'white' : '#1a1a1a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{display: 'flex', alignItems: 'center', gap: '10px'}}><Mic2 color="#7c4dff"/> Voice Rooms</h2>
        <button onClick={() => setShowModal(true)} style={createBtn}>+ Create Room</button>
      </div>

      {loading ? <div style={{textAlign:'center', marginTop: '50px'}}><Loader2 className="animate-spin" /></div> : (
        <div style={gridStyle}>
          {rooms.map(room => (
            <div key={room.id} style={cardStyle(isDark)}>
              <div style={topicBadge}>{room.topic}</div>
              <h3 style={{ margin: '15px 0' }}>{room.title}</h3>
              <p style={announcementPreview}>{room.announcement}</p>
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                 <img src={room.hostPhoto} style={{width:'24px', height:'24px', borderRadius:'50%'}} alt=""/>
                 <span style={{fontSize:'0.8rem', opacity:0.7}}>Host: {room.hostName}</span>
              </div>
              <button onClick={() => setActiveRoom(room)} style={joinBtn}>Join Room</button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent(isDark)}>
            <h3 style={{ marginBottom: '20px' }}>Setup Your Room</h3>
            <form onSubmit={handleCreateRoom} style={formStyle}>
              <input 
                style={inputStyle(isDark)} 
                placeholder="Room Title (e.g. Let's talk!)" 
                value={newRoom.title} 
                onChange={e => setNewRoom({...newRoom, title: e.target.value})} 
                required 
              />
              <textarea 
                style={{...inputStyle(isDark), height: '80px', resize: 'none'}} 
                placeholder="Announcement (e.g. Only English please!)" 
                value={newRoom.announcement} 
                onChange={e => setNewRoom({...newRoom, announcement: e.target.value})} 
              />
              <button type="submit" style={createBtn}>Launch Now</button>
              <button type="button" onClick={() => setShowModal(false)} style={cancelBtn}>Close</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// STILLAR (O'zgarishsiz qoldi)
const createBtn = { background: '#7c4dff', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' };
const cardStyle = (dark) => ({ background: dark ? '#1c2128' : 'white', padding: '20px', borderRadius: '24px', border: '1px solid #30363d' });
const topicBadge = { background: 'rgba(124, 77, 255, 0.15)', color: '#7c4dff', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', display: 'inline-block' };
const announcementPreview = { fontSize: '0.85rem', opacity: 0.6, marginBottom: '20px' };
const joinBtn = { width: '100%', background: '#238636', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = (dark) => ({ background: dark ? '#1c2128' : 'white', padding: '30px', borderRadius: '28px', width: '380px', color: dark ? 'white' : 'black' });
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputStyle = (dark) => ({ padding: '14px', borderRadius: '12px', border: '1px solid #333', background: dark ? '#0d1117' : '#f5f5f5', color: dark ? 'white' : 'black', outline: 'none' });
const cancelBtn = { background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginTop: '5px' };