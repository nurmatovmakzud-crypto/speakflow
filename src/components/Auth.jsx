import React from 'react';
import { signInWithGoogle } from '../firebase';

export default function Auth() {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      // OnAuthStateChanged App.jsx'da avtomatik ushlab oladi
    } catch (error) {
      alert("Login xatosi: " + error.message);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0b0e14', color: 'white' }}>
      <h1 style={{ fontSize: '3rem', color: '#7c4dff', marginBottom: '10px' }}>SpeakFlow</h1>
      <p style={{ color: '#888', marginBottom: '30px' }}>Practice English with real people</p>
      
      <button onClick={handleLogin} style={googleBtn}>
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="g" />
        Sign in with Google
      </button>
      <p style={{ marginTop: '20px', color: '#555', fontSize: '0.9rem' }}>No password required. Fast and Secure.</p>
    </div>
  );
}

const googleBtn = { padding: '15px 30px', fontSize: '1rem', borderRadius: '30px', border: 'none', background: 'white', color: 'black', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' };