import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-wrnQunRbKSvWN8CNFaX1Rlnmc-5iiDo",
  authDomain: "speakflow-chat.firebaseapp.com",
  projectId: "speakflow-chat",
  storageBucket: "speakflow-chat.firebasestorage.app",
  messagingSenderId: "460581650334",
  appId: "1:460581650334:web:214d55c9051be0d82c208f",
  measurementId: "G-Z8XZE80WJE"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// BU EKSPORTLAR APPNI OCHISH UCHUN SHART
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();