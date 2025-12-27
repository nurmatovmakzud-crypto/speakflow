import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, doc, getDoc } from 'firebase/firestore';
import { Send, ArrowLeft, Languages, Loader2 } from 'lucide-react';

export default function PrivateChat({ targetUser, onBack, isDark }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userLang, setUserLang] = useState("en"); 
  const [translatedTexts, setTranslatedTexts] = useState({});
  const [translatingId, setTranslatingId] = useState(null);
  const scrollRef = useRef();

  // Load user's translation preference
  useEffect(() => {
    const fetchSettings = async () => {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserLang(userDoc.data().targetLanguage || "en");
      }
    };
    fetchSettings();
  }, []);

  // Real-time Chat Listener
  useEffect(() => {
    if (!auth.currentUser || !targetUser) return;
    const combinedId = auth.currentUser.uid > targetUser.uid 
      ? `${auth.currentUser.uid}_${targetUser.uid}` 
      : `${targetUser.uid}_${auth.currentUser.uid}`;

    const q = query(
      collection(db, "chats"),
      where("combinedId", "==", combinedId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubscribe();
  }, [targetUser]);

  // Dynamic Translation Function
  const handleTranslate = async (msgId, text) => {
    if (translatedTexts[msgId]) return;
    setTranslatingId(msgId);
    try {
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${userLang}&dt=t&q=${encodeURI(text)}`);
      const data = await res.json();
      setTranslatedTexts(prev => ({ ...prev, [msgId]: data[0][0][0] }));
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setTranslatingId(null);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const combinedId = auth.currentUser.uid > targetUser.uid 
      ? `${auth.currentUser.uid}_${targetUser.uid}` 
      : `${targetUser.uid}_${auth.currentUser.uid}`;

    await addDoc(collection(db, "chats"), {
      text: newMessage,
      senderId: auth.currentUser.uid,
      receiverId: targetUser.uid,
      combinedId,
      createdAt: serverTimestamp()
    });
    setNewMessage("");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: isDark ? '#0d1117' : '#f4f7f6' }}>
      <header style={{ 
        padding: '16px 24px', background: isDark ? '#161b22' : 'white', 
        display: 'flex', alignItems: 'center', gap: '16px', 
        borderBottom: isDark ? '1px solid #30363d' : '1px solid #e1e4e8',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)', zIndex: 10
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c4dff' }}><ArrowLeft size={24} /></button>
        <img src={targetUser.photoURL} style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover' }} alt="" />
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem' }}>{targetUser.displayName}</h4>
          <span style={{ fontSize: '0.7rem', color: '#238636', fontWeight: 'bold' }}>Active Now</span>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((m) => {
          const isMe = m.senderId === auth.currentUser.uid;
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ 
                maxWidth: '75%', padding: '12px 16px', borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                background: isMe ? '#7c4dff' : (isDark ? '#161b22' : 'white'),
                color: isMe ? 'white' : (isDark ? 'white' : 'black'),
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontSize: '0.95rem' }}>{m.text}</span>
                  {!isMe && (
                    <button 
                      onClick={() => handleTranslate(m.id, m.text)} 
                      style={{ background: 'none', border: 'none', color: '#7c4dff', cursor: 'pointer', marginTop: '2px', padding: 0 }}
                    >
                      {translatingId === m.id ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
                    </button>
                  )}
                </div>
                {translatedTexts[m.id] && (
                  <div style={{ 
                    marginTop: '8px', paddingTop: '8px', 
                    borderTop: '1px solid rgba(124, 77, 255, 0.2)', 
                    fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.8
                  }}>
                    {translatedTexts[m.id]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ padding: '20px', background: isDark ? '#161b22' : 'white', display: 'flex', gap: '12px' }}>
        <input 
          style={{ 
            flex: 1, padding: '14px 18px', borderRadius: '14px', border: 'none', 
            background: isDark ? '#0d1117' : '#f0f2f5', color: isDark ? 'white' : 'black', 
            outline: 'none', fontSize: '1rem' 
          }} 
          placeholder="Type your message..." 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
        />
        <button type="submit" style={{ 
          background: '#7c4dff', color: 'white', border: 'none', 
          width: '48px', height: '48px', borderRadius: '14px', 
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}