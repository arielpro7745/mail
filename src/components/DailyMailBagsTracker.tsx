import { useState, useEffect } from "react";
import { Briefcase, Plus, Minus, CheckCircle2, RotateCcw, TrendingUp, Calendar } from "lucide-react";

interface DailyRecord {
  date: string;
  bagsDelivered: number;
  completedAt?: string;
}

export default function DailyMailBagsTracker() {
  const [bagsDelivered, setBagsDelivered] = useState(0);
  const [targetBags, setTargetBags] = useState(3);
  const [isCompleted, setIsCompleted] = useState(false);
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const today = new Date().toDateString();

  // טען נתונים מ-localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dailyMailBags");
    if (saved) {
      try {
        const data = JSON.parse(saved);

        if (data.date === today) {
          setBagsDelivered(data.bagsDelivered || 0);
          setTargetBags(data.targetBags || 3);
          setIsCompleted(data.isCompleted || false);
        } else {
          // יום חדש - שמור את אתמול והתחל מחדש
          if (data.bagsDelivered > 0) {
            const yesterday: DailyRecord = {
              date: data.date,
              bagsDelivered: data.bagsDelivered,
              completedAt: data.completedAt,
            };
            const updatedHistory = [yesterday, ...(data.history || [])].slice(0, 30);
            setHistory(updatedHistory);
            localStorage.setItem("dailyMailBags", JSON.stringify({
              date: today,
              bagsDelivered: 0,
              targetBags: data.targetBags || 3,
              isCompleted: false,
              history: updatedHistory,
            }));
          }
          setBagsDelivered(0);
          setIsCompleted(false);
        }

        if (data.history) {
          setHistory(data.history);
        }
      } catch (e) {
        console.error("Error loading mail bags data:", e);
      }
    }
  }, [today]);

  // שמור נתונים ב-localStorage
  useEffect(() => {
    const data = {
      date: today,
      bagsDelivered,
      targetBags,
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      history,
    };
    localStorage.setItem("dailyMailBags", JSON.stringify(data));
  }, [bagsDelivered, targetBags, isCompleted, history, today]);

  const increment = () => {
    const newCount = bagsDelivered + 1;
    setBagsDelivered(newCount);

    if (newCount >= targetBags && !isCompleted) {
      setIsCompleted(true);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎉 סיימת את יעד התיקים!', {
          body: `חילקת ${newCount} תיקים היום. מעולה!`,
        });
      }
    }
  };

  const decrement = () => {
    if (bagsDelivered > 0) {
      const newCount = bagsDelivered - 1;
      setBagsDelivered(newCount);
      if (newCount < targetBags) {
        setIsCompleted(false);
      }
    }
  };

  const reset = () => {
    setBagsDelivered(0);
    setIsCompleted(false);
  };

  const progressPercentage = Math.min((bagsDelivered / targetBags) * 100, 100);
  const avgLast7Days = history.length > 0
    ? (history.slice(0, 7).reduce((sum, r) => sum + r.bagsDelivered, 0) / Math.min(history.length, 7)).toFixed(1)
    : "0";

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-3">
            <Briefcase className="text-white" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">מעקב תיקי חלוקה יומי</h3>
            <p className="text-sm text-gray-600">כמה תיקים חילקת היום?</p>
          </div>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
        >
          <Calendar size={18} />
          היסטוריה
        </button>
      </div>

      {isCompleted && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={32} />
            <div>
              <h4 className="text-lg font-bold text-green-800">מעולה! השלמת את יעד התיקים!</h4>
              <p className="text-sm text-green-700">חילקת {bagsDelivered} תיקים היום - עבודה נהדרת!</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">יעד תיקים להיום:</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => setTargetBags(num)}
              disabled={bagsDelivered > 0}
              className={`flex-1 py-2 px-1 rounded-lg font-bold transition-all ${
                targetBags === num
                  ? 'bg-purple-500 text-white shadow-lg'
                  : bagsDelivered > 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
        {bagsDelivered > 0 && (
          <p className="text-xs text-gray-500 mt-2">* לא ניתן לשנות יעד אחרי התחלת חלוקה</p>
        )}
      </div>

      <div className="relative mb-6">
        <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isCompleted
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">
            {progressPercentage.toFixed(0)}% ({bagsDelivered}/{targetBags})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">תיקים היום</div>
          <div className="text-4xl font-bold text-gray-800">{bagsDelivered}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-1">
            <TrendingUp size={14} />
            <span>ממוצע 7 ימים</span>
          </div>
          <div className="text-4xl font-bold text-gray-800">{avgLast7Days}</div>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={increment}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          הוסף תיק
        </button>

        <button
          onClick={decrement}
          disabled={bagsDelivered === 0}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Minus size={20} />
          הסר תיק
        </button>

        <button
          onClick={reset}
          disabled={bagsDelivered === 0}
          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {showHistory && history.length > 0 && (
        <div className="mt-6 bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar size={18} />
            היסטוריית תיקים (30 ימים אחרונים)
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((record, index) => {
              const date = new Date(record.date);
              const isRecent = index < 7;
              return (
                <div
                  key={record.date}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    isRecent ? 'bg-purple-50 border border-purple-200' : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="text-sm">
                    <div className="font-semibold text-gray-800">
                      {date.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-purple-600">{record.bagsDelivered}</span>
                    <Briefcase size={16} className="text-purple-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
        <h4 className="font-bold text-purple-800 mb-2 text-sm">💡 שימושי:</h4>
        <ul className="text-xs text-purple-700 space-y-1">
          <li>• לחץ "הוסף תיק" כל פעם שמסיימים תיק חלוקה</li>
          <li>• קבע יעד תיקים בתחילת היום</li>
          <li>• המערכת תודיע לך כשמשלימים את היעד</li>
          <li>• הנתונים נשמרים ומתאפסים אוטומטית כל יום</li>
        </ul>
      </div>
    </div>
  );
}
