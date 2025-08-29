import { useEffect, useState } from 'react';
import { Moon, Sun, Clock, Settings } from 'lucide-react';

export default function NightModeScheduler() {
  const [autoMode, setAutoMode] = useState(() => 
    localStorage.getItem('auto_night_mode') === 'true'
  );
  const [nightStart, setNightStart] = useState(() => 
    localStorage.getItem('night_start') || '20:00'
  );
  const [nightEnd, setNightEnd] = useState(() => 
    localStorage.getItem('night_end') || '06:00'
  );
  const [currentMode, setCurrentMode] = useState<'light' | 'dark'>('light');

  // בדיקה אם עכשיו זמן לילה
  const isNightTime = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = nightStart.split(':').map(Number);
    const [endHour, endMin] = nightEnd.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    // טיפול במעבר חצות
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  // החלפת מצב אוטומטית
  useEffect(() => {
    if (!autoMode) return;

    const checkAndUpdateMode = () => {
      const shouldBeDark = isNightTime();
      const newMode = shouldBeDark ? 'dark' : 'light';
      
      if (newMode !== currentMode) {
        setCurrentMode(newMode);
        document.documentElement.classList.toggle('dark', shouldBeDark);
        localStorage.setItem('theme', newMode);
      }
    };

    // בדיקה ראשונית
    checkAndUpdateMode();

    // בדיקה כל דקה
    const interval = setInterval(checkAndUpdateMode, 60000);

    return () => clearInterval(interval);
  }, [autoMode, nightStart, nightEnd, currentMode]);

  // שמירת הגדרות
  const saveSettings = () => {
    localStorage.setItem('auto_night_mode', autoMode.toString());
    localStorage.setItem('night_start', nightStart);
    localStorage.setItem('night_end', nightEnd);
  };

  useEffect(() => {
    saveSettings();
  }, [autoMode, nightStart, nightEnd]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            {currentMode === 'dark' ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-indigo-600" />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">מצב לילה אוטומטי</h3>
            <p className="text-sm text-gray-600">
              {autoMode ? 
                `פעיל: ${nightStart} - ${nightEnd}` : 
                'כבוי - מצב ידני'
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setAutoMode(!autoMode)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            autoMode
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {autoMode ? 'פעיל' : 'כבוי'}
        </button>
      </div>

      {autoMode && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                תחילת לילה
              </label>
              <input
                type="time"
                value={nightStart}
                onChange={(e) => setNightStart(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                סוף לילה
              </label>
              <input
                type="time"
                value={nightEnd}
                onChange={(e) => setNightEnd(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-indigo-600" />
              <span className="font-medium text-indigo-800">מצב נוכחי</span>
            </div>
            <p className="text-sm text-indigo-700">
              {isNightTime() ? 
                `🌙 מצב לילה פעיל (עד ${nightEnd})` : 
                `☀️ מצב יום פעיל (עד ${nightStart})`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}