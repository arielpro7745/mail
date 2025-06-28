import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_Q-2csWkkehcMsHsnLAAt2JnfylY23Bg",
  authDomain: "mail-5b7f9.firebaseapp.com",
  projectId: "mail-5b7f9",
  storageBucket: "mail-5b7f9.firebasestorage.app",
  messagingSenderId: "158583453090",
  appId: "1:158583453090:web:51603942c910a804f96efb",
  measurementId: "G-2JD8Y3D7SH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);