import { useState, useEffect, useRef } from "react";
import { Clock, Briefcase, Play, Pause, RotateCcw, CheckCircle2, Plus, Minus, Target, TrendingUp } from "lucide-react";

type WorkMode = "timer" | "bags";

const TIME_OPTIONS = [
  { value: 3, label: "3 שעות" },
  { value: 3.5, label: "3.5 שעות" },
  { value: 4, label: "4 שעות" },
  { value: 4.5, label: "4.5 שעות" },
  { value: 5, label: "5 שעות" },
];

export default function DailyWorkTracker() {
  const [workMode, setWorkMode] = useState<WorkMode>("timer");

  // Timer mode state
  const [selectedHours, setSelectedHours] = useState<number>(4);
  const [totalSeconds, setTotalSeconds] = useState<number>(4 * 60 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(4 * 60 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Bags mode state
  const [bagsDelivered, setBagsDelivered] = useState(0);
  const [targetBags, setTargetBags] = useState(3);
  const [bagsCompleted, setBagsCompleted] = useState(false);

  const today = new Date().toDateString();

  // טען נתונים מ-localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dailyWorkTracker");
    if (saved) {
      try {
        const data = JSON.parse(saved);

        if (data.date === today) {
          setWorkMode(data.workMode || "timer");

          // Timer data
          setSelectedHours(data.selectedHours || 4);
          setTotalSeconds(data.totalSeconds || 4 * 60 * 60);
          setRemainingSeconds(data.remainingSeconds || data.totalSeconds || 4 * 60 * 60);
          setIsRunning(data.isRunning || false);
          setIsPaused(data.isPaused || false);
          setTimerCompleted(data.timerCompleted || false);

          // Bags data
          setBagsDelivered(data.bagsDelivered || 0);
          setTargetBags(data.targetBags || 3);
          setBagsCompleted(data.bagsCompleted || false);
        } else {
          // יום חדש - איפוס
          resetAll();
        }
      } catch (e) {
        console.error("Error loading work tracker state:", e);
      }
    }
  }, [today]);

  // שמור נתונים ב-localStorage
  useEffect(() => {
    const data = {
      date: today,
      workMode,
      selectedHours,
      totalSeconds,
      remainingSeconds,
      isRunning,
      isPaused,
      timerCompleted,
      bagsDelivered,
      targetBags,
      bagsCompleted,
    };
    localStorage.setItem("dailyWorkTracker", JSON.stringify(data));
  }, [workMode, selectedHours, totalSeconds, remainingSeconds, isRunning, isPaused, timerCompleted, bagsDelivered, targetBags, bagsCompleted, today]);

  // Timer logic
  useEffect(() => {
    if (workMode === "timer" && isRunning && !isPaused && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setTimerCompleted(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
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
  }, [workMode, isRunning, isPaused, remainingSeconds, selectedHours]);

  const handleModeChange = (mode: WorkMode) => {
    if (workMode === "timer" && isRunning) return; // לא לשנות אם טיימר רץ
    if (workMode === "bags" && bagsDelivered > 0) return; // לא לשנות אם התחלנו תיקים
    setWorkMode(mode);
  };

  // Timer functions
  const handleTimeSelect = (hours: number) => {
    if (!isRunning) {
      setSelectedHours(hours);
      const seconds = hours * 60 * 60;
      setTotalSeconds(seconds);
      setRemainingSeconds(seconds);
      setTimerCompleted(false);
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
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
    setTimerCompleted(false);
  };

  // Bags functions
  const incrementBags = () => {
    const newCount = bagsDelivered + 1;
    setBagsDelivered(newCount);

    if (newCount >= targetBags && !bagsCompleted) {
      setBagsCompleted(true);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎉 סיימת את יעד התיקים!', {
          body: `חילקת ${newCount} תיקים היום. מעולה!`,
        });
      }
    }
  };

  const decrementBags = () => {
    if (bagsDelivered > 0) {
      const newCount = bagsDelivered - 1;
      setBagsDelivered(newCount);
      if (newCount < targetBags) {
        setBagsCompleted(false);
      }
    }
  };

  const resetBags = () => {
    setBagsDelivered(0);
    setBagsCompleted(false);
  };

  const resetAll = () => {
    resetTimer();
    resetBags();
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  const bagsProgress = Math.min((bagsDelivered / targetBags) * 100, 100);
  const elapsedSeconds = totalSeconds - remainingSeconds;

  const isCompleted = workMode === "timer" ? timerCompleted : bagsCompleted;
  const canChangeMode = workMode === "timer" ? !isRunning : bagsDelivered === 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-3 ${workMode === "timer" ? "bg-gradient-to-br from-blue-500 to-cyan-500" : "bg-gradient-to-br from-purple-500 to-pink-500"}`}>
            {workMode === "timer" ? <Clock className="text-white" size={28} /> : <Briefcase className="text-white" size={28} />}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">מעקב עבודה יומי</h3>
            <p className="text-sm text-gray-600">בחר מצב עבודה: טיימר או מספר תיקים</p>
          </div>
        </div>
      </div>

      {/* מתג בחירת מצב */}
      <div className="bg-gray-100 rounded-xl p-2 flex gap-2 mb-6">
        <button
          onClick={() => handleModeChange("timer")}
          disabled={!canChangeMode}
          className={`flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            workMode === "timer"
              ? "bg-blue-500 text-white shadow-lg"
              : canChangeMode
              ? "bg-white text-gray-700 hover:bg-gray-50"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Clock size={20} />
          טיימר זמן
        </button>
        <button
          onClick={() => handleModeChange("bags")}
          disabled={!canChangeMode}
          className={`flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            workMode === "bags"
              ? "bg-purple-500 text-white shadow-lg"
              : canChangeMode
              ? "bg-white text-gray-700 hover:bg-gray-50"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Briefcase size={20} />
          מספר תיקים
        </button>
      </div>

      {!canChangeMode && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 mb-6 text-center">
          <p className="text-sm text-yellow-700">
            ⚠️ לא ניתן לשנות מצב במהלך עבודה. אפס כדי לשנות.
          </p>
        </div>
      )}

      {isCompleted && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={32} />
            <div>
              <h4 className="text-lg font-bold text-green-800">כל הכבוד! השלמת את יעד היום!</h4>
              <p className="text-sm text-green-700">
                {workMode === "timer"
                  ? `עבדת ${selectedHours} שעות היום - מגיע לך מנוחה!`
                  : `חילקת ${bagsDelivered} תיקים היום - עבודה נהדרת!`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* מצב טיימר */}
      {workMode === "timer" && (
        <>
          {!isRunning && !timerCompleted && (
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
                  timerCompleted
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}
                style={{ width: `${timerProgress}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700">
                {timerProgress.toFixed(1)}% הושלם
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
            {!isRunning && !timerCompleted && (
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

            {(isRunning || timerCompleted) && (
              <button
                onClick={resetTimer}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                אפס
              </button>
            )}
          </div>
        </>
      )}

      {/* מצב תיקים */}
      {workMode === "bags" && (
        <>
          {bagsDelivered === 0 && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">בחר יעד תיקים להיום:</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setTargetBags(num)}
                    className={`py-4 px-2 rounded-lg font-bold transition-all text-xl ${
                      targetBags === num
                        ? 'bg-purple-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num} {num === 1 ? 'תיק' : 'תיקים'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative mb-6">
            <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  bagsCompleted
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
                style={{ width: `${bagsProgress}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700">
                {bagsProgress.toFixed(0)}% ({bagsDelivered}/{targetBags})
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-12 mb-6 text-center">
            <div className="text-7xl font-bold text-white mb-2">
              {bagsDelivered}/{targetBags}
            </div>
            <div className="text-lg text-purple-200">תיקים היום</div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={incrementBags}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-5 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
            >
              <Plus size={24} />
              סיימתי תיק!
            </button>

            <button
              onClick={decrementBags}
              disabled={bagsDelivered === 0}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-5 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Minus size={24} />
            </button>

            {bagsDelivered > 0 && (
              <button
                onClick={resetBags}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-5 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={24} />
              </button>
            )}
          </div>
        </>
      )}

      <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h4 className="font-bold text-blue-800 mb-2 text-sm">💡 איך זה עובד:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• <strong>מצב טיימר:</strong> עובדים לפי זמן (3-5 שעות), עם אפשרות להשהיה</li>
          <li>• <strong>מצב תיקים:</strong> עובדים לפי מספר תיקים (1-4), מונים כל תיק שמסיימים</li>
          <li>• בחר מצב בתחילת היום - לא ניתן לשנות במהלך עבודה</li>
          <li>• הנתונים נשמרים אוטומטית ומתאפסים כל יום</li>
        </ul>
      </div>
    </div>
  );
}
