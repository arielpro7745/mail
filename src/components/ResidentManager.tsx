import { useState, useEffect } from 'react';
import {
  Users, Search, Plus, Edit2, Trash2, Phone, Mail, MapPin,
  Building, Star, AlertCircle, Check, X, Filter, ChevronDown
} from 'lucide-react';
import { Area } from '../types';
import { getAreaColor, getAreaName } from '../utils/areaColors';
import { streets } from '../data/streets';

interface Resident {
  id: string;
  name: string;
  street: string;
  building: string;
  apartment: string;
  area: Area;
  phone?: string;
  email?: string;
  notes?: string;
  isVIP: boolean;
  hasIssues: boolean;
  lastDelivery?: string;
  createdAt: string;
}

const RESIDENTS_STORAGE_KEY = 'residents_database';

export default function ResidentManager() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<Area | 'all'>('all');
  const [selectedStreet, setSelectedStreet] = useState<string>('all');
  const [showVIPOnly, setShowVIPOnly] = useState(false);
  const [showIssuesOnly, setShowIssuesOnly] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    street: '',
    building: '',
    apartment: '',
    area: 12 as Area,
    phone: '',
    email: '',
    notes: '',
    isVIP: false,
    hasIssues: false
  });

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = () => {
    try {
      const saved = localStorage.getItem(RESIDENTS_STORAGE_KEY);
      if (saved) {
        setResidents(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading residents:', error);
    }
  };

  const saveResidents = (newResidents: Resident[]) => {
    localStorage.setItem(RESIDENTS_STORAGE_KEY, JSON.stringify(newResidents));
    setResidents(newResidents);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // עדכון דייר קיים
      const updated = residents.map(r =>
        r.id === editingId
          ? { ...r, ...formData, id: editingId }
          : r
      );
      saveResidents(updated);
      setEditingId(null);
    } else {
      // הוספת דייר חדש
      const newResident: Resident = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      saveResidents([newResident, ...residents]);
    }

    resetForm();
    setIsAdding(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      street: '',
      building: '',
      apartment: '',
      area: 12,
      phone: '',
      email: '',
      notes: '',
      isVIP: false,
      hasIssues: false
    });
  };

  const handleEdit = (resident: Resident) => {
    setFormData({
      name: resident.name,
      street: resident.street,
      building: resident.building,
      apartment: resident.apartment,
      area: resident.area,
      phone: resident.phone || '',
      email: resident.email || '',
      notes: resident.notes || '',
      isVIP: resident.isVIP,
      hasIssues: resident.hasIssues
    });
    setEditingId(resident.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('האם למחוק את הדייר?')) {
      saveResidents(residents.filter(r => r.id !== id));
    }
  };

  const toggleVIP = (id: string) => {
    const updated = residents.map(r =>
      r.id === id ? { ...r, isVIP: !r.isVIP } : r
    );
    saveResidents(updated);
  };

  const toggleIssues = (id: string) => {
    const updated = residents.map(r =>
      r.id === id ? { ...r, hasIssues: !r.hasIssues } : r
    );
    saveResidents(updated);
  };

  // סינון דיירים
  const filteredResidents = residents.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.building.includes(searchTerm) ||
      (r.phone && r.phone.includes(searchTerm));
    const matchesArea = selectedArea === 'all' || r.area === selectedArea;
    const matchesStreet = selectedStreet === 'all' || r.street === selectedStreet;
    const matchesVIP = !showVIPOnly || r.isVIP;
    const matchesIssues = !showIssuesOnly || r.hasIssues;

    return matchesSearch && matchesArea && matchesStreet && matchesVIP && matchesIssues;
  });

  // קיבוץ לפי רחובות
  const groupedByStreet = filteredResidents.reduce((acc, r) => {
    if (!acc[r.street]) {
      acc[r.street] = [];
    }
    acc[r.street].push(r);
    return acc;
  }, {} as Record<string, Resident[]>);

  const streetNames = Object.keys(groupedByStreet).sort();

  // רחובות לפי אזור נבחר
  const areaStreets = selectedArea === 'all'
    ? streets
    : streets.filter(s => s.area === selectedArea);

  return (
    <div className="space-y-6">
      {/* כותרת */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">ניהול דיירים</h2>
              <p className="text-cyan-100">חיפוש, עדכון ומעקב אחר דיירים</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-3xl font-bold">{residents.length}</p>
              <p className="text-sm text-cyan-100">דיירים רשומים</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingId(null);
                setIsAdding(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
            >
              <Plus size={20} />
              הוסף דייר
            </button>
          </div>
        </div>
      </div>

      {/* טופס הוספה/עריכה */}
      {isAdding && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="font-bold text-lg mb-4">
            {editingId ? 'עריכת דייר' : 'הוספת דייר חדש'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="שם הדייר"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">רחוב</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="שם הרחוב"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אזור</label>
                <select
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: parseInt(e.target.value) as Area })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={12}>אזור 12</option>
                  <option value={14}>אזור 14</option>
                  <option value={45}>אזור 45</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">בניין</label>
                <input
                  type="text"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="מספר דירה"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="מספר טלפון (אופציונלי)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="הערות מיוחדות..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVIP}
                  onChange={(e) => setFormData({ ...formData, isVIP: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                />
                <Star size={18} className="text-yellow-500" />
                <span className="text-sm font-medium">דייר VIP</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasIssues}
                  onChange={(e) => setFormData({ ...formData, hasIssues: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                />
                <AlertCircle size={18} className="text-red-500" />
                <span className="text-sm font-medium">יש בעיות</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                {editingId ? 'עדכן' : 'הוסף'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}

      {/* סינון וחיפוש */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          {/* חיפוש */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="חיפוש לפי שם, רחוב, טלפון..."
            />
          </div>

          {/* בחירת אזור */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as Area)}
            className="p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">כל האזורים</option>
            <option value={12}>אזור 12</option>
            <option value={14}>אזור 14</option>
            <option value={45}>אזור 45</option>
          </select>

          {/* פילטרים */}
          <button
            onClick={() => setShowVIPOnly(!showVIPOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              showVIPOnly ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Star size={16} />
            VIP
          </button>

          <button
            onClick={() => setShowIssuesOnly(!showIssuesOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              showIssuesOnly ? 'bg-red-100 text-red-700 border-2 border-red-300' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <AlertCircle size={16} />
            בעיות
          </button>
        </div>
      </div>

      {/* רשימת דיירים מקובצת לפי רחובות */}
      <div className="space-y-4">
        {streetNames.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">לא נמצאו דיירים</p>
          </div>
        ) : (
          streetNames.map(streetName => (
            <div key={streetName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-gray-400" />
                  <h4 className="font-bold text-gray-800">{streetName}</h4>
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                    {groupedByStreet[streetName].length} דיירים
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {groupedByStreet[streetName].map(resident => {
                  const areaColor = getAreaColor(resident.area);

                  return (
                    <div key={resident.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${areaColor.bgSolid} rounded-lg flex items-center justify-center text-white font-bold`}>
                            {resident.name.charAt(0)}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-gray-800">{resident.name}</h5>
                              {resident.isVIP && <Star size={14} className="text-yellow-500 fill-current" />}
                              {resident.hasIssues && <AlertCircle size={14} className="text-red-500" />}
                            </div>
                            <p className="text-sm text-gray-500">
                              בניין {resident.building}, דירה {resident.apartment}
                            </p>
                            {resident.phone && (
                              <p className="text-sm text-blue-600 flex items-center gap-1">
                                <Phone size={12} />
                                {resident.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 ${areaColor.bg} ${areaColor.text} text-xs font-medium rounded-lg`}>
                            אזור {resident.area}
                          </span>

                          <button
                            onClick={() => toggleVIP(resident.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              resident.isVIP ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100 text-gray-400'
                            }`}
                            title="סמן כ-VIP"
                          >
                            <Star size={16} />
                          </button>

                          <button
                            onClick={() => handleEdit(resident)}
                            className="p-2 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors"
                            title="ערוך"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(resident.id)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                            title="מחק"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {resident.notes && (
                        <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          📝 {resident.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
