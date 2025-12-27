import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, updateDoc, doc, arrayUnion, deleteDoc 
} from 'firebase/firestore';
import { Camera, X, Trash2, Eye, Heart, MessageSquare } from 'lucide-react';

export default function MomentsTab({ isDark }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const postsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(postsData);
      
      // Har bir post uchun "Ko'rish" qo'shish mantiqi
      postsData.forEach(post => {
        if (post.userId !== auth.currentUser.uid && !post.views?.includes(auth.currentUser.uid)) {
          addView(post.id);
        }
      });
    });
    return () => unsub();
  }, []);

  // Ko'rishlar sonini oshirish
  const addView = async (postId) => {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      views: arrayUnion(auth.currentUser.uid)
    });
  };

  // Postni o'chirish
  const handleDelete = async (postId) => {
    if (window.confirm("Ushbu postni o'chirmoqchimisiz?")) {
      try {
        await deleteDoc(doc(db, "posts", postId));
      } catch (err) {
        console.error("O'chirishda xato:", err);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !image) return;
    setIsPosting(true);
    try {
      let imageUrl = "";
      if (image) {
        const reader = new FileReader();
        imageUrl = await new Promise((resolve) => {
          reader.readAsDataURL(image);
          reader.onload = () => resolve(reader.result);
        });
      }

      await addDoc(collection(db, "posts"), {
        text: newPost,
        imageUrl: imageUrl,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        userPhoto: auth.currentUser.photoURL,
        likes: [],
        views: [], // Ko'rishlar uchun bo'sh massiv
        createdAt: serverTimestamp()
      });

      setNewPost("");
      setImage(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Post yaratish qismi avvalgidek qoldi... */}
      <div style={postBox(isDark)}>
        <textarea 
          style={inputStyle(isDark)} 
          placeholder="Nimalar yangilik?..." 
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        {preview && (
          <div style={{position: 'relative', marginTop: '10px'}}>
            <img src={preview} style={previewImg} alt="" />
            <button onClick={() => {setPreview(null); setImage(null);}} style={removeBtn}><X size={16}/></button>
          </div>
        )}
        <div style={footer}>
          <label style={{cursor: 'pointer', color: '#7c4dff'}}><Camera size={24} /><input type="file" accept="image/*" hidden onChange={handleImageChange} /></label>
          <button onClick={handlePost} disabled={isPosting} style={sendBtn}>{isPosting ? '...' : 'Post'}</button>
        </div>
      </div>

      {/* Postlar ro'yxati */}
      {posts.map(post => (
        <div key={post.id} style={card(isDark)}>
          <div style={cardHeader}>
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
              <img src={post.userPhoto} style={avatar} alt=""/>
              <strong>{post.userName}</strong>
            </div>
            {/* Faqat o'z postini o'chirish imkoniyati */}
            {post.userId === auth.currentUser.uid && (
              <button onClick={() => handleDelete(post.id)} style={deleteIconBtn}><Trash2 size={18} /></button>
            )}
          </div>

          <p style={{margin: '10px 0'}}>{post.text}</p>
          {post.imageUrl && <img src={post.imageUrl} style={postImg} alt="" />}

          <div style={cardFooter}>
             <div style={{display: 'flex', gap: '15px'}}>
               <span style={statItem}><Heart size={18} /> {post.likes?.length || 0}</span>
               <span style={statItem}><MessageSquare size={18} /> {post.comments?.length || 0}</span>
             </div>
             {/* KO'RISHLAR SONI */}
             <div style={statItem}>
               <Eye size={18} /> 
               <span>{post.views?.length || 0}</span>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// STILLAR (Qisqacha)
const postBox = (dark) => ({ background: dark ? '#1c2128' : 'white', padding: '15px', borderRadius: '20px', border: '1px solid #333' });
const inputStyle = (dark) => ({ width: '100%', border: 'none', background: 'none', color: dark ? 'white' : 'black', outline: 'none', resize: 'none', minHeight: '60px' });
const footer = { display: 'flex', justifyContent: 'space-between', padding: '10px 0' };
const previewImg = { width: '100%', borderRadius: '15px' };
const removeBtn = { position: 'absolute', top: 5, right: 5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer' };
const sendBtn = { background: '#7c4dff', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer' };
const card = (dark) => ({ background: dark ? '#161b22' : 'white', padding: '15px', borderRadius: '20px', margin: '20px 0', border: '1px solid #333' });
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const avatar = { width: '35px', height: '35px', borderRadius: '50%' };
const deleteIconBtn = { background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', opacity: 0.6 };
const postImg = { width: '100%', borderRadius: '15px', marginTop: '10px' };
const cardFooter = { display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #33333322' };
const statItem = { display: 'flex', alignItems: 'center', gap: '5px', color: '#888', fontSize: '0.9rem' };