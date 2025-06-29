import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useBuildings } from "../hooks/useBuildings";
import { useDistribution } from "../hooks/useDistribution";
import { Task } from "../types";
import { streets } from "../data/streets";
import LoadingSpinner from "./LoadingSpinner";
import TaskOptimizer from "./TaskOptimizer";
import TaskTemplates from "./TaskTemplates";
import { 
  Plus, Edit, Trash2, Clock, CheckCircle, AlertTriangle, 
  Calendar, MapPin, Building, User, Play, Pause, Square,
  Filter, Search, X, Zap
} from "lucide-react";
import { nanoid } from "nanoid";

interface OptimizedTask extends Task {
  optimizationScore: number;
  suggestedOrder: number;
  estimatedEfficiency: number;
}

export default function TaskManager() {
  const { tasks, addTask, updateTask, deleteTask, completeTask, loading } = useTasks();
  const { buildings } = useBuildings();
  const { todayArea } = useDistribution();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [optimizedTasks, setOptimizedTasks] = useState<OptimizedTask[]>([]);
  const [showOptimized, setShowOptimized] = useState(false);

  if (loading) return <LoadingSpinner />;

  // סינון משימות
  const filteredTasks = (showOptimized ? optimizedTasks : tasks).filter(task => {
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    switch (filter) {
      case 'pending':
        return task.status === 'pending' || task.status === 'in-progress';
      case 'completed':
        return task.status === 'completed';
      case 'overdue':
        return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
      default:
        return true;
    }
  });

  // פונקציות טיימר
  const startTimer = (taskId: string) => {
    setActiveTimer(taskId);
    setTimerStart(new Date());
    updateTask(taskId, { status: 'in-progress' });
  };

  const stopTimer = (taskId: string) => {
    if (timerStart) {
      const elapsed = Math.floor((Date.now() - timerStart.getTime()) / 60000); // דקות
      completeTask(taskId, elapsed);
    }
    setActiveTimer(null);
    setTimerStart(null);
  };

  const pauseTimer = () => {
    setActiveTimer(null);
    setTimerStart(null);
  };

  // קבלת שם רחוב
  const getStreetName = (streetId?: string) => {
    if (!streetId) return '';
    return streets.find(s => s.id === streetId)?.name || streetId;
  };

  // קבלת כתובת בניין
  const getBuildingAddress = (buildingId?: string) => {
    if (!buildingId) return '';
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return buildingId;
    const streetName = getStreetName(building.streetId);
    return `${streetName} ${building.number}${building.entrance ? ` כניסה ${building.entrance}` : ''}`;
  };

  // יצירת משימה מתבנית
  const handleCreateFromTemplate = (template: any, customData?: Partial<Task>) => {
    const taskData = {
      title: template.name,
      description: template.description,
      type: template.type,
      priority: template.priority,
      status: 'pending' as const,
      estimatedTime: template.estimatedTime,
      ...customData
    };
    addTask(taskData);
  };

  // יצירת משימה מהצעה חכמה
  const handleCreateSuggestedTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    addTask(taskData);
  };

  // אופטימיזציה של משימות
  const handleOptimize = (optimized: OptimizedTask[]) => {
    setOptimizedTasks(optimized);
    setShowOptimized(true);
  };

  // טופס הוספת/עריכת משימה
  const TaskForm = ({ task, onClose }: { task?: Task; onClose: () => void }) => {
    const isEdit = Boolean(task);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      
      const taskData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string || undefined,
        type: formData.get('type') as Task['type'],
        priority: formData.get('priority') as Task['priority'],
        status: (formData.get('status') as Task['status']) || 'pending',
        dueDate: formData.get('dueDate') as string || undefined,
        assignedArea: formData.get('assignedArea') ? Number(formData.get('assignedArea')) as 14 | 45 : undefined,
        streetId: formData.get('streetId') as string || undefined,
        buildingId: formData.get('buildingId') as string || undefined,
        estimatedTime: formData.get('estimatedTime') ? Number(formData.get('estimatedTime')) : undefined,
        notes: formData.get('notes') as string || undefined,
      };

      if (isEdit && task) {
        updateTask(task.id, taskData);
      } else {
        addTask(taskData);
      }
      
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {isEdit ? 'עריכת משימה' : 'משימה חדשה'}
              </h3>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label>
                <input
                  name="title"
                  defaultValue={task?.title}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סוג</label>
                <select
                  name="type"
                  defaultValue={task?.type || 'delivery'}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="delivery">חלוקה</option>
                  <option value="sorting">מיון דואר</option>
                  <option value="maintenance">תחזוקה</option>
                  <option value="other">אחר</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">עדיפות</label>
                <select
                  name="priority"
                  defaultValue={task?.priority || 'medium'}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">נמוכה</option>
                  <option value="medium">בינונית</option>
                  <option value="high">גבוהה</option>
                  <option value="urgent">דחופה</option>
                </select>
              </div>

              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
                  <select
                    name="status"
                    defaultValue={task?.status}
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">ממתין</option>
                    <option value="in-progress">בביצוע</option>
                    <option value="completed">הושלם</option>
                    <option value="cancelled">בוטל</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תאריך יעד</label>
                <input
                  name="dueDate"
                  type="date"
                  defaultValue={task?.dueDate?.split('T')[0]}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אזור</label>
                <select
                  name="assignedArea"
                  defaultValue={task?.assignedArea?.toString()}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">כל האזורים</option>
                  <option value="14">אזור 14</option>
                  <option value="45">אזור 45</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">רחוב</label>
                <select
                  name="streetId"
                  defaultValue={task?.streetId}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">בחר רחוב</option>
                  <optgroup label="אזור 45">
                    {streets.filter(s => s.area === 45).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="אזור 14">
                    {streets.filter(s => s.area === 14).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">בניין</label>
                <select
                  name="buildingId"
                  defaultValue={task?.buildingId}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">בחר בניין</option>
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>
                      {getBuildingAddress(b.id)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">זמן משוער (דקות)</label>
                <input
                  name="estimatedTime"
                  type="number"
                  defaultValue={task?.estimatedTime}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
                <textarea
                  name="description"
                  defaultValue={task?.description}
                  rows={3}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
                <textarea
                  name="notes"
                  defaultValue={task?.notes}
                  rows={2}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg"
              >
                {isEdit ? 'עדכן' : 'הוסף'} משימה
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-colors font-medium"
              >
                בטל
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // קבלת צבע לפי עדיפות
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  // קבלת צבע לפי סטטוס
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <section className="mt-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md">
            <CheckCircle size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">ניהול משימות חכם</h2>
            <p className="text-gray-600 font-medium text-sm md:text-base">
              משימות יומיות עם אופטימיזציה אוטומטית
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {showOptimized && (
            <button
              onClick={() => setShowOptimized(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
            >
              <X size={16} />
              <span className="hidden sm:inline">בטל אופטימיזציה</span>
            </button>
          )}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 shadow-lg"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">משימה חדשה</span>
          </button>
        </div>
      </div>

      {/* תבניות משימות */}
      <TaskTemplates 
        onCreateFromTemplate={handleCreateFromTemplate}
        currentArea={todayArea}
      />

      {/* אופטימיזציה חכמה */}
      <TaskOptimizer
        tasks={tasks}
        buildings={buildings}
        currentArea={todayArea}
        onOptimize={handleOptimize}
        onCreateSuggestedTask={handleCreateSuggestedTask}
      />

      {/* הודעה על אופטימיזציה */}
      {showOptimized && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Zap size={20} className="text-purple-600" />
            <div>
              <h3 className="font-semibold text-purple-800">רשימה מותאמת</h3>
              <p className="text-sm text-purple-600">
                המשימות מוצגות לפי סדר אופטימלי בהתבסס על עדיפות, מיקום וזמן
              </p>
            </div>
          </div>
        </div>
      )}

      {/* סינון וחיפוש */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="חפש משימות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'הכל' },
              { key: 'pending', label: 'ממתין' },
              { key: 'completed', label: 'הושלם' },
              { key: 'overdue', label: 'באיחור' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* רשימת משימות */}
      <div className="space-y-4">
        {filteredTasks.map((task, index) => {
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
          const isActive = activeTimer === task.id;
          const isOptimized = 'optimizationScore' in task;

          return (
            <div
              key={task.id}
              className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
              } ${isOptimized ? 'border-purple-300 bg-purple-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {isOptimized && (
                      <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                        <Zap size={12} />
                        #{(task as OptimizedTask).suggestedOrder}
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-800">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'urgent' ? 'דחוף' : 
                       task.priority === 'high' ? 'גבוה' :
                       task.priority === 'medium' ? 'בינוני' : 'נמוך'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                      {task.status === 'completed' ? 'הושלם' :
                       task.status === 'in-progress' ? 'בביצוע' :
                       task.status === 'cancelled' ? 'בוטל' : 'ממתין'}
                    </span>
                    {isOptimized && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        יעילות: {(task as OptimizedTask).estimatedEfficiency}%
                      </span>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString('he-IL')}
                      </div>
                    )}
                    {task.assignedArea && (
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        אזור {task.assignedArea}
                      </div>
                    )}
                    {task.streetId && (
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        {getStreetName(task.streetId)}
                      </div>
                    )}
                    {task.buildingId && (
                      <div className="flex items-center gap-1">
                        <Building size={12} />
                        {getBuildingAddress(task.buildingId)}
                      </div>
                    )}
                    {task.estimatedTime && (
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {task.estimatedTime} דק׳
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {task.status === 'pending' && !isActive && (
                    <button
                      onClick={() => startTimer(task.id)}
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      title="התחל"
                    >
                      <Play size={16} />
                    </button>
                  )}
                  
                  {isActive && (
                    <>
                      <button
                        onClick={() => stopTimer(task.id)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        title="סיים"
                      >
                        <Square size={16} />
                      </button>
                      <button
                        onClick={pauseTimer}
                        className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                        title="השהה"
                      >
                        <Pause size={16} />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setEditingTask(task)}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    title="עריכה"
                  >
                    <Edit size={16} />
                  </button>
                  
                  <button
                    onClick={() => {
                      if (window.confirm('בטוח למחוק משימה זו?')) {
                        deleteTask(task.id);
                      }
                    }}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="מחיקה"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {isActive && timerStart && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-700 font-medium">משימה פעילה</span>
                    <span className="text-blue-600 font-mono text-lg">
                      {Math.floor((Date.now() - timerStart.getTime()) / 60000).toString().padStart(2, '0')}:
                      {Math.floor(((Date.now() - timerStart.getTime()) % 60000) / 1000).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              )}

              {task.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{task.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">אין משימות</h3>
          <p className="text-sm">
            {searchTerm ? 'לא נמצאו משימות התואמות לחיפוש' : 'התחל בהוספת משימה חדשה או השתמש בתבניות'}
          </p>
        </div>
      )}

      {/* טפסים */}
      {showAddForm && (
        <TaskForm onClose={() => setShowAddForm(false)} />
      )}

      {editingTask && (
        <TaskForm task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </section>
  );
}