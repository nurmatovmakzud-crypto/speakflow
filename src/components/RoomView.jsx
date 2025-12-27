import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { Mic, MicOff, PhoneOff, Users, MessageSquare, Hand, Crown, Trash2, ShieldCheck } from 'lucide-react';

export default function RoomView({ room, onLeave, isDark }) {
  const [roomData, setRoomData] = useState(room);
  const [isMuted, setIsMuted] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMsg, setChatMsg] = useState("");

  const myId = auth.currentUser?.uid;
  const isHost = myId === roomData?.hostId;

  // 1. Real-time ma'lumotlarni yangilash
  useEffect(() => {
    if (!room.id) return;
    const unsub = onSnapshot(doc(db, "rooms", room.id), (snapshot) => {
      if (snapshot.exists()) {
        setRoomData({ id: snapshot.id, ...snapshot.data() });
      } else {
        onLeave(); // Xona o'chirilsa chiqib ketish
      }
    });
    return () => unsub();
  }, [room.id]);

  // 2. Qo'l ko'tarish (Gapirish so'rovi)
  const toggleHand = async () => {
    const roomRef = doc(db, "rooms", room.id);
    const isRequesting = roomData.requests?.includes(myId);
    await updateDoc(roomRef, {
      requests: isRequesting ? arrayRemove(myId) : arrayUnion(myId)
    });
  };

  // 3. Admin: Spiker sifatida qabul qilish
  const approveSpeaker = async (userId, userName, userPhoto) => {
    const roomRef = doc(db, "rooms", room.id);
    await updateDoc(roomRef, {
      speakers: arrayUnion(userId),
      requests: arrayRemove(userId),
      [`speakerData.${userId}`]: { name: userName, photo: userPhoto }
    });
  };

  // 4. Admin: Xonani butunlay yopish
  const closeRoom = async () => {
    if (window.confirm("Xonani yopmoqchimisiz?")) {
      await deleteDoc(doc(db, "rooms", room.id));
      onLeave();
    }
  };

  if (!roomData) return null;

  return (
    <div style={container(isDark)}>
      {/* HEADER SECTION */}
      <div style={headerStyle}>
        <button onClick={onLeave} style={leaveBtn}><PhoneOff size={18} /> Exit</button>
        <div style={roomTitleBox}>
          <h2 style={{margin: 0, fontSize: '1.2rem'}}>{roomData.title}</h2>
          <span style={topicTag}>{roomData.topic}</span>
        </div>
        {isHost ? (
          <button onClick={closeRoom} style={deleteBtn}><Trash2 size={20} /></button>
        ) : (
          <div style={userCount}><Users size={18} /> {roomData.speakers?.length + 1}</div>
        )}
      </div>

      {/* MAIN SPEAKERS AREA */}
      <div style={mainScrollArea}>
        <div style={speakersSection}>
          <h4 style={sectionTitle}>Speakers</h4>
          <div style={avatarGrid}>
            {/* HOST */}
            <div style={userCard}>
              <div style={avatarRing(true)}>
                <img src={roomData.hostPhoto} style={avatarImg} alt="host" />
                <div style={crownIcon}><Crown size={12} color="white" /></div>
              </div>
              <span style={nameText}>{roomData.hostName}</span>
            </div>

            {/* OTHER SPEAKERS */}
            {roomData.speakers?.map(id => (
              <div key={id} style={userCard}>
                <div style={avatarRing(false)}>
                  <img src={roomData.speakerData?.[id]?.photo} style={avatarImg} alt="" />
                </div>
                <span style={nameText}>{roomData.speakerData?.[id]?.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* REQUESTS LIST (Only for Host) */}
        {isHost && roomData.requests?.length > 0 && (
          <div style={requestBox(isDark)}>
            <h4 style={{margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Hand size={18} color="#7c4dff" /> Requests to speak
            </h4>
            {roomData.requests.map(reqId => (
              <div key={reqId} style={requestItem}>
                <span>User {reqId.substring(0,5)}...</span>
                <button 
                  onClick={() => approveSpeaker(reqId, "User", "")} 
                  style={approveBtn}
                >Approve</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS */}
      <div style={controlsContainer(isDark)}>
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          style={isMuted ? controlBtn : activeControlBtn}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button 
          onClick={toggleHand} 
          style={roomData.requests?.includes(myId) ? activeControlBtn : controlBtn}
        >
          <Hand size={24} />
        </button>

        <button onClick={() => setShowChat(!showChat)} style={controlBtn}>
          <MessageSquare size={24} />
        </button>
      </div>
    </div>
  );
}

// STYLES (Professional UI)
const container = (dark) => ({
  height: '100%', display: 'flex', flexDirection: 'column', 
  background: dark ? '#0d1117' : '#f8f9fa', color: dark ? 'white' : '#1a1a1a'
});
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #33333322' };
const leaveBtn = { background: '#ff4d4d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' };
const roomTitleBox = { textAlign: 'center' };
const topicTag = { fontSize: '0.7rem', background: '#7c4dff22', color: '#7c4dff', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' };
const deleteBtn = { background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' };
const userCount = { display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.6 };

const mainScrollArea = { flex: 1, overflowY: 'auto', padding: '20px' };
const sectionTitle = { opacity: 0.5, fontSize: '0.9rem', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' };
const speakersSection = { marginBottom: '40px' };
const avatarGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '20px' };
const userCard = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' };
const avatarRing = (isHost) => ({ position: 'relative', width: '70px', height: '70px', borderRadius: '50%', padding: '3px', border: isHost ? '3px solid #7c4dff' : '3px solid transparent' });
const avatarImg = { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#333' };
const crownIcon = { position: 'absolute', bottom: '-5px', right: '-5px', background: '#7c4dff', borderRadius: '50%', padding: '4px', border: '2px solid #0d1117' };
const nameText = { fontSize: '0.8rem', fontWeight: '600', textAlign: 'center' };

const requestBox = (dark) => ({ background: dark ? '#1c2128' : '#fff', padding: '15px', borderRadius: '15px', marginTop: '20px', border: '1px dashed #7c4dff' });
const requestItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #33333311' };
const approveBtn = { background: '#238636', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' };

const controlsContainer = (dark) => ({ display: 'flex', justifyContent: 'center', gap: '20px', padding: '30px', background: dark ? '#161b22' : 'white', borderTop: '1px solid #33333322' });
const controlBtn = { width: '55px', height: '55px', borderRadius: '50%', border: 'none', background: '#33333311', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' };
const activeControlBtn = { ...controlBtn, background: '#7c4dff', color: 'white' };