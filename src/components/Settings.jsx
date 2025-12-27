import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { User, AtSign, FileText, Camera, Check, AlertCircle, Info, Languages, ChevronDown } from 'lucide-react';

export default function Settings({ isDark }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({
    displayName: auth.currentUser?.displayName || "",
    username: "",
    bio: "",
    photoURL: auth.currentUser?.photoURL || "",
    targetLanguage: "en", 
    lastUsernameChange: null
  });
  const [originalUsername, setOriginalUsername] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            displayName: data.displayName || auth.currentUser?.displayName || "",
            username: data.username || "",
            bio: data.bio || "",
            photoURL: data.photoURL || auth.currentUser?.photoURL || "",
            targetLanguage: data.targetLanguage || "en",
            lastUsernameChange: data.lastUsernameChange || null
          });
          setOriginalUsername(data.username || "");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchProfileData();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, photoURL: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setError("");
    
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const updates = { 
        displayName: profile.displayName, 
        bio: profile.bio,
        photoURL: profile.photoURL,
        targetLanguage: profile.targetLanguage,
        updatedAt: serverTimestamp()
      };

      if (profile.username !== originalUsername) {
        const cleanUsername = profile.username.toLowerCase().trim().replace(/\s/g, '');
        
        if (cleanUsername.length < 6) {
          setError("Username must be at least 6 characters long.");
          setLoading(false);
          return;
        }

        if (profile.lastUsernameChange) {
          const now = new Date().getTime();
          const lastChangeDate = profile.lastUsernameChange.toDate().getTime();
          const limitTime = 180 * 24 * 60 * 60 * 1000; // 180 kun ms da

          if ((now - lastChangeDate) < limitTime) {
            const daysLeft = Math.ceil((limitTime - (now - lastChangeDate)) / (1000 * 60 * 60 * 24));
            setError(`Username can only be changed twice a year. Try again in ${daysLeft} days.`);
            setLoading(false);
            return;
          }
        }
        updates.username = cleanUsername;
        updates.lastUsernameChange = serverTimestamp();
      }

      await updateProfile(auth.currentUser, { 
        displayName: profile.displayName, 
        photoURL: profile.photoURL 
      });
      await updateDoc(userRef, updates);

      setOriginalUsername(profile.username);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("An error occurred: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', opacity: 0.9, color: isDark ? '#c9d1d9' : '#444' };
  
  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '12px', 
    border: isDark ? '1px solid #30363d' : '1px solid #ddd', 
    background: isDark ? '#0d1117' : '#ffffff', 
    color: isDark ? 'white' : 'black', outline: 'none', fontSize: '1rem'
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ 
        background: isDark ? '#161b22' : '#ffffff', 
        padding: '40px', 
        borderRadius: '24px', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        border: isDark ? '1px solid #30363d' : '1px solid #eaeaea'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: '800', color: isDark ? 'white' : 'black' }}>Profile Settings</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '35px', background: isDark ? '#0d1117' : '#f8f9fa', padding: '20px', borderRadius: '20px' }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}`} 
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #7c4dff' }} 
              alt="Avatar" 
            />
            <label style={{ position: 'absolute', bottom: '0', right: '0', background: '#7c4dff', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', border: '3px solid ' + (isDark ? '#161b22' : 'white'), display: 'flex' }}>
              <Camera size={16} />
              <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
            </label>
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: isDark ? 'white' : 'black' }}>{profile.displayName || "User"}</h4>
            <p style={{ margin: 0, color: '#7c4dff', fontWeight: '600' }}>@{profile.username || 'username'}</p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#ff4d4d15', color: '#ff4d4d', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}><User size={16} /> Full Name</label>
            <input style={inputStyle} value={profile.displayName} onChange={(e) => setProfile({...profile, displayName: e.target.value})} />
          </div>

          <div>
            <label style={labelStyle}><AtSign size={16} /> Username</label>
            <input style={inputStyle} value={profile.username} onChange={(e) => setProfile({...profile, username: e.target.value})} />
            <p style={{ fontSize: '0.75rem', color: '#7c4dff', marginTop: '5px' }}><Info size={14} /> Min 6 chars. Twice a year.</p>
          </div>

          <div>
            <label style={labelStyle}><FileText size={16} /> Bio</label>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'none' }} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} />
          </div>

          <div>
            <label style={labelStyle}><Languages size={16} /> Translation Language</label>
            <select style={inputStyle} value={profile.targetLanguage} onChange={(e) => setProfile({...profile, targetLanguage: e.target.value})}>
              <option value="en">English</option>
              <option value="uz">Uzbek</option>
              <option value="ru">Russian</option>
              <option value="tr">Turkish</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleSaveChanges} 
          disabled={loading} 
          style={{ width: '100%', marginTop: '30px', padding: '16px', borderRadius: '16px', border: 'none', background: saved ? '#238636' : '#7c4dff', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? "Saving..." : (saved ? "Saved!" : "Save Changes")}
        </button>
      </div>
    </div>
  );
}