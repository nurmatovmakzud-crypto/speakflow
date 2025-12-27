import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore';

export default function SetupProfile({ onComplete }) {
  const [form, setForm] = useState({
    username: '',
    country: '',
    age: '',
    gender: 'Male'
  });
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    if(!form.username || !form.country || !form.age) return alert("Please fill in all fields!");
    
    setLoading(true);
    try {
      // Username uniqueness check
      const q = query(collection(db, "users"), where("username", "==", form.username.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("This username is already taken! Please try another one.");
        setLoading(false);
        return;
      }

      // Save profile if username is available
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        ...form,
        username: form.username.toLowerCase(),
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName,
        photo: auth.currentUser.photoURL,
        isProfileComplete: true,
        createdAt: serverTimestamp()
      }, { merge: true });
      
      onComplete();
    } catch (err) {
      alert("Error saving profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b0e14', color: 'white' }}>
      <form onSubmit={saveProfile} style={formStyle}>
        <h2 style={{ color: '#7c4dff', textAlign: 'center', marginBottom: '10px' }}>Create Your Profile</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '20px' }}>Let others know who you are</p>
        
        <label style={labelStyle}>Username</label>
        <input 
          placeholder="e.g. alex_learns" 
          style={inp} 
          onChange={e => setForm({...form, username: e.target.value})} 
          required 
        />

        <label style={labelStyle}>Country</label>
        <input 
          placeholder="e.g. Uzbekistan" 
          style={inp} 
          onChange={e => setForm({...form, country: e.target.value})} 
          required 
        />

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Age</label>
            <input 
              type="number" 
              placeholder="Your age" 
              style={inp} 
              onChange={e => setForm({...form, age: e.target.value})} 
              required 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Gender</label>
            <select style={inp} onChange={e => setForm({...form, gender: e.target.value})}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        <button type="submit" disabled={loading} style={loading ? {...btnStyle, opacity: 0.5} : btnStyle}>
          {loading ? "Checking Username..." : "Save and Get Started"}
        </button>
      </form>
    </div>
  );
}

// Styles
const formStyle = { background: '#1c2128', padding: '40px', borderRadius: '25px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' };
const labelStyle = { fontSize: '0.85rem', color: '#7c4dff', fontWeight: 'bold', marginLeft: '5px' };
const inp = { padding: '12px', borderRadius: '12px', border: '1px solid #30363d', background: '#0d1117', color: 'white', fontSize: '1rem', width: '100%' };
const btnStyle = { background: '#7c4dff', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '15px', transition: '0.3s' };