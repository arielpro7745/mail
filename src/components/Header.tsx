import ThemeToggle from "./ThemeToggle";
import Settings from "./Settings";
import { useState, useEffect } from "react";
import { Clock, Wifi, WifiOff, Mail, Sparkles } from "lucide-react";
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

    const checkFirebase = async () => {
      const connected = await testFirebaseConnection();
      setFirebaseConnected(connected);
    };

    checkFirebase();
    const firebaseTimer = setInterval(checkFirebase, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(firebaseTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const dayOfWeek = currentTime.toLocaleDateString('he-IL', { weekday: 'long' });
  const dateStr = currentTime.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' });

  return (
    <header className="relative overflow-hidden">
      {/* רקע עם גרדיאנט מודרני */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700" />

      {/* אפקט זוהר */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />

      {/* תבנית רקע */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 px-4 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* לוגו וכותרת */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                  <Mail className="text-white" size={28} />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <Sparkles size={10} className="text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  דואר ישראל
                </h1>
                <p className="text-sm text-blue-100 font-medium">
                  מערכת מעקב חלוקת דואר
                </p>
              </div>
            </div>

            {/* מידע ופעולות */}
            <div className="flex items-center gap-6">
              {/* תאריך ושעה */}
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Clock size={16} className="text-blue-200" />
                  <span className="text-lg tabular-nums">
                    {currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className="text-sm text-blue-200">
                  {dayOfWeek}, {dateStr}
                </span>
              </div>

              {/* סטטוס חיבור */}
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                  isOnline
                    ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                    : 'bg-red-500/20 text-red-100 border border-red-400/30'
                }`}>
                  {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                  <span>{isOnline ? 'מחובר' : 'לא מחובר'}</span>
                </div>
              </div>

              {/* כפתורי פעולה */}
              <div className="flex items-center gap-2">
                <Settings />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* קו תחתון דקורטיבי */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400" />
    </header>
  );
}