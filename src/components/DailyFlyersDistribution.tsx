import { useState, useEffect } from "react";
import { FileText, CheckCircle2, Circle, Calendar, TrendingUp, Zap } from "lucide-react";

interface DailyRecord {
  date: string;
  completed: boolean;
  completedAt?: string;
}

export default function DailyFlyersDistribution() {
  const [completed, setCompleted] = useState(false);
  const [completedTime, setCompletedTime] = useState<string | null>(null);
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const today = new Date().toDateString();

  // טען נתונים מ-localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dailyFlyers");
    if (saved) {
      try {
        const data = JSON.parse(saved);

        if (data.date === today) {
          setCompleted(data.completed || false);
          setCompletedTime(data.completedAt || null);
        } else {
          // יום חדש - שמור את אתמול והתחל מחדש
          if (data.completed) {
            const yesterday: DailyRecord = {
              date: data.date,
              completed: data.completed,
              completedAt: data.completedAt,
            };
            const updatedHistory = [yesterday, ...(data.history || [])].slice(0, 30);
            setHistory(updatedHistory);
            localStorage.setItem("dailyFlyers", JSON.stringify({
              date: today,
              completed: false,
              completedAt: null,
              history: updatedHistory,
            }));
          }
          setCompleted(false);
          setCompletedTime(null);
        }

        if (data.history) {
          setHistory(data.history);
        }
      } catch (e) {
        console.error("Error loading flyers data:", e);
      }
    }
  }, [today]);

  // שמור נתונים ב-localStorage
  useEffect(() => {
    const data = {
      date: today,
      completed,
      completedAt: completedTime,
      history,
    };
    localStorage.setItem("dailyFlyers", JSON.stringify(data));
  }, [completed, completedTime, history, today]);

  const markAsCompleted = () => {
    setCompleted(true);
    const now = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    setCompletedTime(now);

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 עלונים חולקו בהצלחה!', {
        body: 'סימנת את חלוקת העלונים כהושלמה. כל הכבוד!',
      });
    }
  };

  const markAsIncomplete = () => {
    setCompleted(false);
    setCompletedTime(null);
  };

  // סטטיסטיקות
  const completedDaysLast7 = history.slice(0, 7).filter(r => r.completed).length;
  const completedDaysLast30 = history.filter(r => r.completed).length;
  const streakDays = (() => {
    let streak = completed ? 1 : 0;
    for (const record of history) {
      if (record.completed) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  })();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-3">
            <FileText className="text-white" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">חלוקת עלונים יומית</h3>
            <p className="text-sm text-gray-600">משימה יומית - פעם אחת ביום</p>
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

      {completed ? (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-600" size={48} />
              <div>
                <h4 className="text-2xl font-bold text-green-800">עלונים חולקו!</h4>
                <p className="text-sm text-green-700 mt-1">הושלם בשעה {completedTime}</p>
                <p className="text-xs text-green-600 mt-1">המשימה היומית הושלמה בהצלחה</p>
              </div>
            </div>
            <button
              onClick={markAsIncomplete}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
            >
              בטל סימון
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Circle className="text-orange-600" size={48} />
              <div>
                <h4 className="text-2xl font-bold text-orange-800">עלונים לא חולקו עדיין</h4>
                <p className="text-sm text-orange-700 mt-1">לחץ על הכפתור כשתסיים לחלק</p>
              </div>
            </div>
            <button
              onClick={markAsCompleted}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 text-lg"
            >
              <CheckCircle2 size={24} />
              סיימתי לחלק!
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">7 ימים אחרונים</div>
          <div className="text-3xl font-bold text-gray-800">{completedDaysLast7}/7</div>
          <div className="text-xs text-gray-500 mt-1">
            {completedDaysLast7 === 7 ? '🌟 שבוע מושלם!' : `${Math.round((completedDaysLast7 / 7) * 100)}%`}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-1">
            <TrendingUp size={14} />
            <span>30 יום</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{completedDaysLast30}/30</div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round((completedDaysLast30 / Math.min(history.length + 1, 30)) * 100)}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-1">
            <Zap size={14} />
            <span>רצף</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{streakDays}</div>
          <div className="text-xs text-gray-500 mt-1">
            {streakDays >= 7 ? '🔥 רצף חזק!' : 'ימים רצופים'}
          </div>
        </div>
      </div>

      {showHistory && history.length > 0 && (
        <div className="mt-6 bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar size={18} />
            היסטוריית חלוקה (30 ימים אחרונים)
          </h4>
          <div className="grid grid-cols-7 gap-2">
            {history.map((record) => {
              const date = new Date(record.date);
              const day = date.getDate();
              const isCompleted = record.completed;

              return (
                <div
                  key={record.date}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 ${
                    isCompleted
                      ? 'bg-green-100 border-green-300'
                      : 'bg-red-100 border-red-300'
                  }`}
                  title={date.toLocaleDateString('he-IL')}
                >
                  <div className="text-xs font-bold text-gray-700">{day}</div>
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="text-green-600 mt-1" />
                  ) : (
                    <Circle size={16} className="text-red-600 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
              <span>חולק</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
              <span>לא חולק</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
        <h4 className="font-bold text-orange-800 mb-2 text-sm">💡 חשוב לדעת:</h4>
        <ul className="text-xs text-orange-700 space-y-1">
          <li>• חלוקת עלונים היא משימה יומית - פעם אחת ביום</li>
          <li>• לחץ "סיימתי לחלק" רק אחרי שחילקת את כל העלונים</li>
          <li>• המערכת שומרת היסטוריה של 30 יום</li>
          <li>• נסה לשמור על רצף ימים רצופים לביצועים מעולים!</li>
        </ul>
      </div>
    </div>
  );
}
