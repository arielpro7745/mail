import { useState, useEffect, useRef } from "react";
import { Clock, Play, Pause, RotateCcw, CheckCircle2, Target, TrendingUp } from "lucide-react";

const TIME_OPTIONS = [
  { value: 3, label: "3 שעות", hours: 3 },
  { value: 3.5, label: "3.5 שעות", hours: 3.5 },
  { value: 4, label: "4 שעות", hours: 4 },
  { value: 4.5, label: "4.5 שעות", hours: 4.5 },
  { value: 5, label: "5 שעות", hours: 5 },
];

export default function DailyWorkTimer() {
  const [selectedHours, setSelectedHours] = useState<number>(4);
  const [totalSeconds, setTotalSeconds] = useState<number>(4 * 60 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(4 * 60 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // טען מצב מ-localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dailyWorkTimer");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const today = new Date().toDateString();

        if (data.date === today) {
          setSelectedHours(data.selectedHours || 4);
          setTotalSeconds(data.totalSeconds || 4 * 60 * 60);
          setRemainingSeconds(data.remainingSeconds || data.totalSeconds || 4 * 60 * 60);
          setIsRunning(data.isRunning || false);
          setIsPaused(data.isPaused || false);
          setCompletedToday(data.completedToday || false);
        } else {
          // יום חדש - איפוס
          resetTimer();
        }
      } catch (e) {
        console.error("Error loading timer state:", e);
      }
    }
  }, []);

  // שמור מצב ב-localStorage
  useEffect(() => {
    const data = {
      date: new Date().toDateString(),
      selectedHours,
      totalSeconds,
      remainingSeconds,
      isRunning,
      isPaused,
      completedToday,
    };
    localStorage.setItem("dailyWorkTimer", JSON.stringify(data));
  }, [selectedHours, totalSeconds, remainingSeconds, isRunning, isPaused, completedToday]);

  // הפעל טיימר
  useEffect(() => {
    if (isRunning && !isPaused && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setCompletedToday(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
            // הצג התראה
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('🎉 סיימת את יום העבודה!', {
                body: `עבדת ${selectedHours} שעות היום. כל הכבוד!`,
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, remainingSeconds, selectedHours]);

  const handleTimeSelect = (hours: number) => {
    if (!isRunning) {
      setSelectedHours(hours);
      const seconds = hours * 60 * 60;
      setTotalSeconds(seconds);
      setRemainingSeconds(seconds);
      setCompletedToday(false);
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    // בקש הרשאה להתראות
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setRemainingSeconds(totalSeconds);
    setCompletedToday(false);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  const elapsedSeconds = totalSeconds - remainingSeconds;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3">
          <Clock className="text-white" size={28} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">טיימר יומי לחלוקה</h3>
          <p className="text-sm text-gray-600">עקוב אחרי שעות העבודה שלך היום</p>
        </div>
      </div>

      {completedToday && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={32} />
            <div>
              <h4 className="text-lg font-bold text-green-800">כל הכבוד! סיימת את יום העבודה!</h4>
              <p className="text-sm text-green-700">עבדת {selectedHours} שעות היום. מגיע לך מנוחה!</p>
            </div>
          </div>
        </div>
      )}

      {!isRunning && !completedToday && (
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">בחר יעד שעות לחלוקה היום:</label>
          <div className="grid grid-cols-5 gap-2">
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTimeSelect(option.value)}
                className={`py-3 px-2 rounded-lg font-bold transition-all ${
                  selectedHours === option.value
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              completedToday
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">
            {progressPercentage.toFixed(1)}% הושלם
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-2">
            <Target size={16} />
            <span>יעד</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{formatTime(totalSeconds)}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-2">
            <TrendingUp size={16} />
            <span>עבדת</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{formatTime(elapsedSeconds)}</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 mb-6 text-center">
        <div className="text-6xl font-bold text-white mb-2 font-mono tracking-wider">
          {formatTime(remainingSeconds)}
        </div>
        <div className="text-lg text-gray-400">
          {isRunning && !isPaused ? 'זמן נותר' : isPaused ? 'מושהה' : 'מוכן להתחלה'}
        </div>
      </div>

      <div className="flex gap-3">
        {!isRunning && !completedToday && (
          <button
            onClick={startTimer}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Play size={20} />
            התחל עבודה
          </button>
        )}

        {isRunning && !isPaused && (
          <button
            onClick={pauseTimer}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Pause size={20} />
            השהה
          </button>
        )}

        {isRunning && isPaused && (
          <button
            onClick={resumeTimer}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Play size={20} />
            המשך
          </button>
        )}

        {(isRunning || completedToday) && (
          <button
            onClick={resetTimer}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            אפס
          </button>
        )}
      </div>

      {isRunning && (
        <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-center">
          <p className="text-sm text-blue-700">
            {isPaused ? (
              <span className="font-bold">⏸️ הטיימר מושהה - לחץ "המשך" כשאתה חוזר לעבודה</span>
            ) : (
              <span>⏰ הטיימר פועל - תוכל להשהות בכל עת</span>
            )}
          </p>
        </div>
      )}

      <div className="mt-6 bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
        <h4 className="font-bold text-gray-800 mb-2 text-sm">💡 טיפים:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• הטיימר נשמר אוטומטית - תוכל לסגור ולפתוח את האפליקציה</li>
          <li>• בסוף היום הטיימר מתאפס אוטומטית</li>
          <li>• אם עשית הפסקה - פשוט השהה והמשך</li>
          <li>• בסוף התזמון תקבל התראה (אם נתת הרשאה)</li>
        </ul>
      </div>
    </div>
  );
}
