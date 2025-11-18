import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Clock, Briefcase, FileText, TrendingUp, Star, Zap, Target, Trophy, AlertCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  icon: "clock" | "briefcase" | "file" | "star" | "zap" | "target" | "trophy";
  category: "morning" | "work" | "quality" | "end";
  completed: boolean;
  importance: "critical" | "high" | "normal";
  completedAt?: string;
}

const DEFAULT_TASKS: Omit<Task, "completed" | "completedAt">[] = [
  // בוקר - קריטי
  {
    id: "arrival",
    title: "הגעה לעבודה 5:00-7:00",
    description: "הגעה מוקדמת מאפשרת התחלה רגועה ומאורגנת",
    icon: "clock",
    category: "morning",
    importance: "critical"
  },
  {
    id: "sort-mail",
    title: "מיון דואר לפי אזורים",
    description: "סדר את הדואר לפי אזורי חלוקה לפני יציאה",
    icon: "briefcase",
    category: "morning",
    importance: "critical"
  },
  {
    id: "check-flyers",
    title: "בדיקת עלונים והכנתם",
    description: "וודא שיש מספיק עלונים ושהם מוכנים לחלוקה",
    icon: "file",
    category: "morning",
    importance: "high"
  },
  {
    id: "route-check",
    title: "סקירת מסלול היום",
    description: "עבור על הרחובות והמסלול המתוכנן להיום",
    icon: "target",
    category: "morning",
    importance: "high"
  },

  // עבודה - קריטי
  {
    id: "start-work",
    title: "התחלת חלוקה לפי תוכנית",
    description: "עבוד לפי המסלול המתוכנן ללא דילוגים",
    icon: "zap",
    category: "work",
    importance: "critical"
  },
  {
    id: "time-tracking",
    title: "עקוב אחרי זמן/תיקים",
    description: "הפעל טיימר או עקוב אחרי מספר התיקים",
    icon: "clock",
    category: "work",
    importance: "critical"
  },
  {
    id: "deliver-flyers",
    title: "חלוקת עלונים",
    description: "חלק עלונים בכל בניין לפי הנדרש",
    icon: "file",
    category: "work",
    importance: "high"
  },

  // איכות - חשוב
  {
    id: "check-names",
    title: "בדיקת שמות תושבים",
    description: "וודא שאתה מחלק לאנשים הנכונים",
    icon: "star",
    category: "quality",
    importance: "high"
  },
  {
    id: "mark-streets",
    title: "סימון רחובות שהושלמו",
    description: "סמן רחובות מיד אחרי סיום לעקוב אחרי התקדמות",
    icon: "briefcase",
    category: "quality",
    importance: "normal"
  },
  {
    id: "note-problems",
    title: "תיעוד בעיות/שינויים",
    description: "רשום תושבים חדשים, בעיות, או שינויים",
    icon: "target",
    category: "quality",
    importance: "normal"
  },

  // סיום יום - חשוב
  {
    id: "complete-area",
    title: "סיום אזור מלא",
    description: "סיים את כל האזור המתוכנן להיום",
    icon: "trophy",
    category: "end",
    importance: "critical"
  },
  {
    id: "update-system",
    title: "עדכון מערכת בסוף יום",
    description: "עדכן את כל הרחובות והמשימות במערכת",
    icon: "briefcase",
    category: "end",
    importance: "high"
  },
];

export default function DailySuccessTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const today = new Date().toDateString();

  useEffect(() => {
    const saved = localStorage.getItem("dailySuccessTasks");
    if (saved) {
      try {
        const data = JSON.parse(saved);

        if (data.date === today) {
          setTasks(data.tasks);
        } else {
          initializeTasks();
        }
      } catch (e) {
        console.error("Error loading tasks:", e);
        initializeTasks();
      }
    } else {
      initializeTasks();
    }
  }, [today]);

  const initializeTasks = () => {
    const newTasks: Task[] = DEFAULT_TASKS.map(task => ({
      ...task,
      completed: false
    }));
    setTasks(newTasks);
  };

  useEffect(() => {
    if (tasks.length > 0) {
      const data = {
        date: today,
        tasks,
      };
      localStorage.setItem("dailySuccessTasks", JSON.stringify(data));
    }
  }, [tasks, today]);

  const toggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newCompleted = !task.completed;
          return {
            ...task,
            completed: newCompleted,
            completedAt: newCompleted ? new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : undefined
          };
        }
        return task;
      })
    );
  };

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      clock: Clock,
      briefcase: Briefcase,
      file: FileText,
      star: Star,
      zap: Zap,
      target: Target,
      trophy: Trophy,
    };
    const IconComponent = iconMap[iconName] || Circle;
    return <IconComponent size={20} />;
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      morning: "🌅 הכנת בוקר",
      work: "💪 ביצוע עבודה",
      quality: "⭐ איכות ומעקב",
      end: "🏁 סיום יום"
    };
    return names[category] || category;
  };

  const tasksByCategory = {
    morning: tasks.filter(t => t.category === "morning"),
    work: tasks.filter(t => t.category === "work"),
    quality: tasks.filter(t => t.category === "quality"),
    end: tasks.filter(t => t.category === "end"),
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const completionPercent = (completedCount / totalCount) * 100;

  const criticalTasks = tasks.filter(t => t.importance === "critical");
  const criticalCompleted = criticalTasks.filter(t => t.completed).length;
  const allCriticalDone = criticalCompleted === criticalTasks.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-3">
          <Trophy className="text-white" size={28} />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-800">משימות יומיות להצלחה</h3>
          <p className="text-sm text-gray-600">עקוב אחרי המשימות להיות דוור מצטיין</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-700">התקדמות כללית</span>
          <span className="text-sm font-bold text-gray-700">{completedCount}/{totalCount}</span>
        </div>
        <div className="relative bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              completionPercent === 100
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
            }`}
            style={{ width: `${completionPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">
              {completionPercent.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {!allCriticalDone && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h4 className="font-bold text-red-800 text-sm">משימות קריטיות חסרות!</h4>
              <p className="text-xs text-red-700">השלם את כל המשימות הקריטיות ({criticalCompleted}/{criticalTasks.length}) להצלחה מלאה</p>
            </div>
          </div>
        </div>
      )}

      {Object.entries(tasksByCategory).map(([category, categoryTasks]) => {
        const completedInCategory = categoryTasks.filter(t => t.completed).length;
        const categoryPercent = (completedInCategory / categoryTasks.length) * 100;

        return (
          <div key={category} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800 text-lg">{getCategoryName(category)}</h4>
              <span className="text-sm font-bold text-gray-600">
                {completedInCategory}/{categoryTasks.length}
              </span>
            </div>

            <div className="space-y-2">
              {categoryTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                    task.completed
                      ? 'bg-green-50 border-green-300 hover:bg-green-100'
                      : task.importance === "critical"
                      ? 'bg-red-50 border-red-300 hover:bg-red-100'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${task.completed ? 'text-green-600' : task.importance === "critical" ? 'text-red-600' : 'text-gray-500'}`}>
                      {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`${task.completed ? 'text-green-600' : task.importance === "critical" ? 'text-red-600' : 'text-gray-600'}`}>
                          {getIcon(task.icon)}
                        </span>
                        <h5 className={`font-bold ${task.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                          {task.title}
                        </h5>
                        {task.importance === "critical" && !task.completed && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            קריטי
                          </span>
                        )}
                        {task.completedAt && (
                          <span className="text-xs text-green-600 font-bold">
                            ✓ {task.completedAt}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${task.completed ? 'text-green-700' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-3">
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    categoryPercent === 100
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${categoryPercent}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {completionPercent === 100 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-center text-white">
          <Trophy size={48} className="mx-auto mb-3" />
          <h3 className="text-2xl font-bold mb-2">יום מושלם! 🎉</h3>
          <p className="text-green-100">
            השלמת את כל המשימות היום - אתה דוור מצטיין!
          </p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h4 className="font-bold text-blue-800 mb-2 text-sm">💡 טיפים להצלחה:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• <strong>משימות קריטיות</strong> (אדום) - חובה לבצע בכל יום!</li>
          <li>• <strong>הגעה מוקדמת</strong> - נותנת לך יתרון וזמן להתארגן</li>
          <li>• <strong>מיון נכון</strong> - חוסך זמן רב במהלך החלוקה</li>
          <li>• <strong>עדכון שוטף</strong> - מונע טעויות ושכחות</li>
          <li>• סמן משימות מיד כשמסיים אותן</li>
        </ul>
      </div>
    </div>
  );
}
