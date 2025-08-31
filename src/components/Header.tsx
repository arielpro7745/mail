import ThemeToggle from "./ThemeToggle";
import Settings from "./Settings";
import { useState, useEffect } from "react";
import { Clock, Wifi, WifiOff, Database, DatabaseZap } from "lucide-react";
import { testFirebaseConnection } from "../firebase";

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // בדוק חיבור Firebase
    const checkFirebase = async () => {
      const connected = await testFirebaseConnection();
      setFirebaseConnected(connected);
    };
    
    checkFirebase();
    // בדוק כל 30 שניות
    const firebaseTimer = setInterval(checkFirebase, 30000);
    
    return () => {
      clearInterval(timer);
      clearInterval(firebaseTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-lg">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <span className="text-xl">📮</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">מעקב חלוקת דואר – דואר ישראל</h1>
            <div className="flex items-center gap-4 text-sm text-blue-100">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-1">
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                {isOnline ? 'מחובר' : 'לא מחובר'}
              </div>
              <div className="flex items-center gap-1">
                {firebaseConnected ? <DatabaseZap size={14} /> : <Database size={14} />}
                {firebaseConnected ? 'Firebase פעיל' : 'Firebase כבוי'}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Settings />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}