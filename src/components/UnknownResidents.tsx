import { useState, useEffect } from 'react';
import { HelpCircle, Plus, Trash2, Check, Search, Filter } from 'lucide-react';
import { Area } from '../types';
import { getAreaColor, getAreaName } from '../utils/areaColors';

interface UnknownResident {
  id: string;
  name: string;
  building: string;
  apartment: string;
  street: string;
  area: Area;
  notes: string;
  dateAdded: string;
  resolved: boolean;
  resolvedDate?: string;
  actualName?: string;
}

const UNKNOWN_STORAGE_KEY = 'unknown_residents';

export default function UnknownResidents() {
  const [unknowns, setUnknowns] = useState<UnknownResident[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | 'all'>(12);
  const [showResolved, setShowResolved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    building: '',
    apartment: '',
    street: '',
    area: 12 as Area,
    notes: ''
  });
  const [groupByStreet, setGroupByStreet] = useState(true);

  useEffect(() => {
    loadUnknowns();
  }, []);

  const loadUnknowns = () => {
    try {
      const saved = localStorage.getItem(UNKNOWN_STORAGE_KEY);
      if (saved) {
        setUnknowns(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading unknowns:', error);
    }
  };

  const saveUnknowns = (newUnknowns: UnknownResident[]) => {
    try {
      localStorage.setItem(UNKNOWN_STORAGE_KEY, JSON.stringify(newUnknowns));
      setUnknowns(newUnknowns);
    } catch (error) {
      console.error('Error saving unknowns:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const unknown: UnknownResident = {
      id: Date.now().toString(),
      name: formData.name,
      building: formData.building,
      apartment: formData.apartment,
      street: formData.street,
      area: formData.area,
      notes: formData.notes,
      dateAdded: new Date().toISOString(),
      resolved: false
    };

    saveUnknowns([unknown, ...unknowns]);
    resetForm();
    setIsAdding(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      building: '',
      apartment: '',
      street: '',
      area: 12,
      notes: ''
    });
  };

  const handleResolve = (id: string) => {
    const actualName = prompt('מה השם האמיתי של הדייר?');
    if (actualName) {
      const updated = unknowns.map(u => {
        if (u.id === id) {
          return {
            ...u,
            resolved: true,
            resolvedDate: new Date().toISOString(),
            actualName
          };
        }
        return u;
      });
      saveUnknowns(updated);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
      saveUnknowns(unknowns.filter(u => u.id !== id));
    }
  };

  const filteredUnknowns = unknowns.filter(u => {
    const matchesArea = selectedArea === 'all' || u.area === selectedArea;
    const matchesResolved = showResolved || !u.resolved;
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (u.street || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesArea && matchesResolved && matchesSearch;
  });

  // קיבוץ לפי רחובות
  const groupedByStreet = filteredUnknowns.reduce((acc, u) => {
    const street = u.street || 'ללא רחוב';
    if (!acc[street]) {
      acc[street] = [];
    }
    acc[street].push(u);
    return acc;
  }, {} as Record<string, UnknownResident[]>);

  const streetNames = Object.keys(groupedByStreet).sort();

  const getAreaStats = (area: Area) => {
    const areaUnknowns = unknowns.filter(u => u.area === area);
    const unresolved = areaUnknowns.filter(u => !u.resolved).length;
    const resolved = areaUnknowns.filter(u => u.resolved).length;
    return { total: areaUnknowns.length, unresolved, resolved };
  };

  const areas: Area[] = [12, 14, 45];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-xl">
            <HelpCircle className="text-white" size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">לא יודעים - דיירים לזיהוי</h2>
            <p className="text-sm text-gray-600">רשימת דיירים שהשם על התיבה אינו ברור או חסר</p>
          </div>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              resetForm();
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            הוסף לא יודע
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {areas.map(area => {
            const stats = getAreaStats(area);
            const areaColor = getAreaColor(area);
            const isSelected = selectedArea === area;
            return (
              <div
                key={area}
                className={`rounded-lg p-4 shadow-sm border-2 cursor-pointer transition-all ${
                  isSelected
                    ? `${areaColor.bg} ${areaColor.border} ring-2 ${areaColor.ring}`
                    : `bg-white border-gray-200 hover:${areaColor.border}`
                }`}
                onClick={() => setSelectedArea(area)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 ${areaColor.bgSolid} rounded-lg flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{area}</span>
                    </div>
                    <h3 className={`font-bold text-lg ${areaColor.text}`}>{getAreaName(area)}</h3>
                  </div>
                  {stats.unresolved > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {stats.unresolved}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>סה"כ: <strong>{stats.total}</strong></div>
                  <div>לא פתורים: <strong className="text-red-600">{stats.unresolved}</strong></div>
                  <div>פתורים: <strong className="text-green-600">{stats.resolved}</strong></div>
                </div>
              </div>
            );
          })}
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-6">
            <h3 className="font-bold text-lg mb-4">דייר חדש לזיהוי</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם על התיבה (כפי שכתוב)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="למשל: ר. כהן, לא ברור, שם מחוק..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">רחוב</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="שם הרחוב"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">בניין</label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="מספר בניין"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">דירה</label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="מספר דירה"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">אזור</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: parseInt(e.target.value) as Area })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={12}>אזור 12</option>
                    <option value={14}>אזור 14</option>
                    <option value={45}>אזור 45</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[80px]"
                  placeholder="תיאור נוסף, סימנים מזהים, כל מידע שיכול לעזור..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  שמור
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
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
                placeholder="חיפוש..."
              />
            </div>

            <button
              onClick={() => setSelectedArea('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedArea === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Filter size={16} className="inline ml-2" />
              כל האזורים
            </button>

            <button
              onClick={() => setShowResolved(!showResolved)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showResolved
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showResolved ? 'הסתר פתורים' : 'הצג פתורים'}
            </button>

            <button
              onClick={() => setGroupByStreet(!groupByStreet)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                groupByStreet
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {groupByStreet ? 'קיבוץ לפי רחובות' : 'רשימה רגילה'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredUnknowns.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
              <HelpCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">אין דיירים לזיהוי</p>
              <p className="text-sm">
                {selectedArea === 'all'
                  ? 'כל הדיירים זוהו בהצלחה!'
                  : `כל הדיירים באזור ${selectedArea} זוהו בהצלחה!`}
              </p>
            </div>
          ) : groupByStreet ? (
            // תצוגה מקובצת לפי רחובות
            streetNames.map((streetName) => (
              <div key={streetName} className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <span>🛣️</span>
                      {streetName}
                    </h3>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-bold">
                      {groupedByStreet[streetName].length} דיירים
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {groupedByStreet[streetName].map((unknown) => (
                    <div
                      key={unknown.id}
                      className={`rounded-lg p-4 border-2 transition-all duration-300 hover:shadow-md ${
                        unknown.resolved
                          ? 'bg-green-50 border-green-300'
                          : 'bg-yellow-50 border-yellow-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{unknown.resolved ? '✅' : '❓'}</span>
                            <div>
                              <h4 className="font-bold text-lg text-gray-800">
                                {unknown.name}
                                {unknown.resolved && unknown.actualName && (
                                  <span className="text-green-600 text-base mr-2">
                                    → {unknown.actualName}
                                  </span>
                                )}
                              </h4>
                              <div className="text-sm text-gray-700 space-y-0.5">
                                <div>🏠 בניין {unknown.building}, דירה {unknown.apartment}</div>
                                <div>🗺️ אזור {unknown.area}</div>
                              </div>
                            </div>
                          </div>
                          {unknown.notes && (
                            <div className="bg-white bg-opacity-50 rounded-lg p-2 mt-2">
                              <p className="text-xs text-gray-600">
                                <strong>הערות:</strong> {unknown.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {!unknown.resolved && (
                            <button
                              onClick={() => handleResolve(unknown.id)}
                              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                              title="סמן כזוהה"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(unknown.id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            title="מחק"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // תצוגה רגילה
            filteredUnknowns.map((unknown) => (
              <div
                key={unknown.id}
                className={`rounded-lg p-5 border-2 transition-all duration-300 hover:shadow-md ${
                  unknown.resolved
                    ? 'bg-green-50 border-green-300'
                    : 'bg-yellow-50 border-yellow-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{unknown.resolved ? '✅' : '❓'}</span>
                      <div>
                        <h3 className="font-bold text-xl text-gray-800">
                          {unknown.name}
                          {unknown.resolved && unknown.actualName && (
                            <span className="text-green-600 text-base mr-2">
                              → {unknown.actualName}
                            </span>
                          )}
                        </h3>
                        <div className="text-sm text-gray-700 space-y-0.5">
                          {unknown.street && <div>🛣️ {unknown.street}</div>}
                          <div>📍 בניין {unknown.building}, דירה {unknown.apartment}</div>
                          <div>🗺️ אזור {unknown.area}</div>
                          <div>📅 נוסף ב-{new Date(unknown.dateAdded).toLocaleDateString('he-IL')}</div>
                          {unknown.resolved && unknown.resolvedDate && (
                            <div className="text-green-600 font-medium">
                              ✓ זוהה ב-{new Date(unknown.resolvedDate).toLocaleDateString('he-IL')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {unknown.notes && (
                      <div className="bg-white bg-opacity-50 rounded-lg p-3 mt-3">
                        <p className="text-sm text-gray-700">
                          <strong>הערות:</strong> {unknown.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {!unknown.resolved && (
                      <button
                        onClick={() => handleResolve(unknown.id)}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        title="סמן כזוהה"
                      >
                        <Check size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(unknown.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      title="מחק"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <HelpCircle className="text-white" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-blue-900 mb-2">טיפים לזיהוי דיירים:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>🔍 בדוק עם דיירים שכנים - לרוב הם יודעים</li>
              <li>📱 השתמש בספר הטלפונים של הבניין אם קיים</li>
              <li>🏢 בדוק בתיבות דואר סמוכות לרמזים</li>
              <li>📝 תעד כל מידע חלקי - כל רמז עוזר</li>
              <li>⏰ נסה לפגוש את הדייר בשעות אחר הצהריים</li>
              <li>🔑 לפעמים הוועד או השומר יודעים</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
