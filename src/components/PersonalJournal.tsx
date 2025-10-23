import { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Calendar, Tag, Search } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  tags: string[];
  area?: number;
  streetsCompleted?: number;
}

const JOURNAL_STORAGE_KEY = 'delivery_journal_entries';

export default function PersonalJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral' as JournalEntry['mood'],
    tags: '',
    area: '',
    streetsCompleted: ''
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    try {
      const saved = localStorage.getItem(JOURNAL_STORAGE_KEY);
      if (saved) {
        setEntries(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const saveEntries = (newEntries: JournalEntry[]) => {
    try {
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(newEntries));
      setEntries(newEntries);
    } catch (error) {
      console.error('Error saving journal entries:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entry: JournalEntry = {
      id: editingId || Date.now().toString(),
      date: new Date().toISOString(),
      title: formData.title,
      content: formData.content,
      mood: formData.mood,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      area: formData.area ? parseInt(formData.area) : undefined,
      streetsCompleted: formData.streetsCompleted ? parseInt(formData.streetsCompleted) : undefined
    };

    if (editingId) {
      const updated = entries.map(e => e.id === editingId ? entry : e);
      saveEntries(updated);
      setEditingId(null);
    } else {
      saveEntries([entry, ...entries]);
    }

    resetForm();
    setIsAdding(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      mood: 'neutral',
      tags: '',
      area: '',
      streetsCompleted: ''
    });
  };

  const handleEdit = (entry: JournalEntry) => {
    setFormData({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: entry.tags.join(', '),
      area: entry.area?.toString() || '',
      streetsCompleted: entry.streetsCompleted?.toString() || ''
    });
    setEditingId(entry.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
      saveEntries(entries.filter(e => e.id !== id));
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'great': return '😄';
      case 'good': return '🙂';
      case 'neutral': return '😐';
      case 'bad': return '😕';
      case 'terrible': return '😣';
      default: return '😐';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great': return 'bg-green-100 border-green-300 text-green-800';
      case 'good': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'neutral': return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'bad': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'terrible': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMood = filterMood === 'all' || entry.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
            <BookOpen className="text-white" size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">יומן אישי</h2>
            <p className="text-sm text-gray-600">תעד את החוויות, התובנות והרגעים המיוחדים שלך</p>
          </div>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingId(null);
              resetForm();
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            רשומה חדשה
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-6">
            <h3 className="font-bold text-lg mb-4">{editingId ? 'עריכת רשומה' : 'רשומה חדשה'}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="למשל: יום מעולה בשטח"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תוכן</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[120px]"
                  placeholder="ספר על היום שלך, תובנות, אתגרים או הצלחות..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מצב רוח</label>
                  <select
                    value={formData.mood}
                    onChange={(e) => setFormData({ ...formData, mood: e.target.value as JournalEntry['mood'] })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="great">מצוין 😄</option>
                    <option value="good">טוב 🙂</option>
                    <option value="neutral">ניטרלי 😐</option>
                    <option value="bad">לא טוב 😕</option>
                    <option value="terrible">גרוע 😣</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">תגיות (מופרדות בפסיק)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="למשל: גשם, רחוב קשה, הצלחה"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">אזור (אופציונלי)</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="12, 14, 45..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">רחובות שחולקו (אופציונלי)</label>
                  <input
                    type="number"
                    value={formData.streetsCompleted}
                    onChange={(e) => setFormData({ ...formData, streetsCompleted: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="מספר רחובות"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingId ? 'עדכן' : 'שמור'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  ביטול
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="חיפוש ברשומות..."
              />
            </div>

            <select
              value={filterMood}
              onChange={(e) => setFilterMood(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">כל מצבי הרוח</option>
              <option value="great">מצוין</option>
              <option value="good">טוב</option>
              <option value="neutral">ניטרלי</option>
              <option value="bad">לא טוב</option>
              <option value="terrible">גרוע</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">אין רשומות ביומן</p>
              <p className="text-sm">התחל לתעד את החוויות שלך בלחיצה על "רשומה חדשה"</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-lg p-5 border-2 transition-all duration-300 hover:shadow-md ${getMoodColor(entry.mood)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                      <h3 className="font-bold text-xl">{entry.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(entry.date).toLocaleDateString('he-IL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {entry.area && <span>אזור {entry.area}</span>}
                      {entry.streetsCompleted && <span>{entry.streetsCompleted} רחובות</span>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 bg-white bg-opacity-50 hover:bg-opacity-100 rounded-lg transition-colors"
                      title="עריכה"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 bg-white bg-opacity-50 hover:bg-opacity-100 rounded-lg transition-colors text-red-600"
                      title="מחיקה"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{entry.content}</p>

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-50 rounded-full text-xs font-medium"
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
