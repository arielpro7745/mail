import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_Q-2csWkkehcMsHsnLAAt2JnfylY23Bg",
  authDomain: "mail-5b7f9.firebaseapp.com",
  projectId: "mail-5b7f9",
  storageBucket: "mail-5b7f9.firebasestorage.app",
  messagingSenderId: "158583453090",
  appId: "1:158583453090:web:51603942c910a804f96efb",
  measurementId: "G-2JD8Y3D7SH"
};

console.log("🔥 מתחיל אתחול Firebase...");
console.log("📋 Firebase Config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize analytics only in browser
if (typeof window !== 'undefined') {
  try {
    getAnalytics(app);
    console.log("📊 Firebase Analytics מופעל");
  } catch (error) {
    console.warn("⚠️ Firebase Analytics לא זמין:", error);
  }
}

console.log("✅ Firebase אותחל בהצלחה!");
console.log("📊 Firestore מוכן לשימוש");

// Test Firebase connection
import { doc, getDoc } from "firebase/firestore";

const testFirebaseConnection = async () => {
  try {
    console.log("🧪 בודק חיבור ל-Firebase...");
    const testDoc = await getDoc(doc(db, "test", "connection"));
    console.log("✅ חיבור ל-Firebase עובד!");
    return true;
  } catch (error) {
    console.error("❌ שגיאה בחיבור ל-Firebase:", error);
    if (error.code === 'permission-denied') {
      console.error("🚫 אין הרשאות ל-Firestore. בדוק את ה-Security Rules!");
    }
    return false;
  }
};

// Test connection when module loads
testFirebaseConnection();

export { testFirebaseConnection };