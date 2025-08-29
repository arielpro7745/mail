import { useState } from "react";
import { useBuildings } from "../hooks/useBuildings";
import { Building, Resident, Contact } from "../types";
import { streets } from "../data/streets";
import { nanoid } from "nanoid";
import LoadingSpinner from "./LoadingSpinner";
import BuildingEntranceManager from "./BuildingEntranceManager";
import QuickWhatsApp from "./QuickWhatsApp";
import { 
  Building2, Plus, Edit, Trash2, User, Phone, 
  Mail, DoorOpen, Crown, MapPin, Search, X,
  MessageCircle, Key, Home, Users
} from "lucide-react";

export default function BuildingManager() {
  const { buildings, addBuilding, updateBuilding, deleteBuilding, addResident, updateResident, deleteResident, loading, firebaseConnected } = useBuildings();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [editingResident, setEditingResident] = useState<{building: Building, resident: Resident} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState<'all' | '12' | '14' | '45'>('all');
  const [showWhatsApp, setShowWhatsApp] = useState<{resident: Resident, building: Building} | null>(null);

  if (loading) return <LoadingSpinner />;

  // סינון בניינים
  const filteredBuildings = buildings.filter(building => {
    const street = streets.find(s => s.id === building.streetId);
    const matchesSearch = !searchTerm || 
      building.residents.some(r => 
        r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.phone?.includes(searchTerm) ||
        r.apartment.includes(searchTerm)
      ) ||
      street?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.number.toString().includes(searchTerm);

    const matchesArea = selectedArea === 'all' || street?.area.toString() === selectedArea;

    return matchesSearch && matchesArea;
  });

  // קבלת שם רחוב
  const getStreetName = (streetId: string) => {
    const street = streets.find(s => s.id === streetId);
    return street ? street.name : streetId;
  };

  // טופס הוספת/עריכת בניין
  const BuildingForm = ({ building, onClose }: { building?: Building; onClose: () => void }) => {
    const isEdit = Boolean(building);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      
      const buildingData = {
        streetId: formData.get('streetId') as string,
        number: Number(formData.get('number')),
        entrance: (formData.get('entrance') as string) || null,
        code: (formData.get('code') as string) || null,
        residents: building?.residents || []
      };

      if (isEdit && building) {
        updateBuilding(building.id, buildingData);
      } else {
        const newBuilding: Building = {
          id: nanoid(),
          ...buildingData
        };
        addBuilding(newBuilding);
      }
      
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
            <h3 className="text-xl font-bold text-gray-800">
              {isEdit ? 'עריכת בניין' : 'בניין חדש'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">רחוב</label>
              <select
                name="streetId"
                defaultValue={building?.streetId}
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">בחר רחוב</option>
                <optgroup label="אזור 12">
                  {streets.filter(s => s.area === 12).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
                <optgroup label="אזור 14">
                  {streets.filter(s => s.area === 14).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
                <optgroup label="אזור 45">
                  {streets.filter(s => s.area === 45).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מספר בניין</label>
              <input
                name="number"
                type="number"
                defaultValue={building?.number}
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">כניסה</label>
              <input
                name="entrance"
                defaultValue={building?.entrance}
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="א׳, ב׳, וכו׳"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">קוד כניסה</label>
              <input
                name="code"
                defaultValue={building?.code}
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1234"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg"
              >
                {isEdit ? 'עדכן' : 'הוסף'} בניין
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

  // טופס הוספת/עריכת דייר
  const ResidentForm = ({ building, resident, onClose }: { building: Building; resident?: Resident; onClose: () => void }) => {
    const isEdit = Boolean(resident && resident.fullName); // רק אם יש שם זה עריכה
    const [contacts, setContacts] = useState<Contact[]>(resident?.contacts || []);
    const [formData, setFormData] = useState({
      fullName: resident?.fullName || '',
      apartment: resident?.apartment || '',
      phone: resident?.phone || '',
      allowMailbox: resident?.allowMailbox || true,
      allowDoor: resident?.allowDoor || false,
      contactPreference: resident?.contactPreference || 'whatsapp',
      notes: resident?.notes || '',
      isPrimary: resident?.isPrimary || false,
      relationship: resident?.relationship || ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log('Submitting resident form:', { isEdit, building: building.id, formData });
      
      // ולידציה
      if (!formData.fullName.trim()) {
        alert('שם מלא הוא שדה חובה');
        return;
      }
      if (!formData.apartment.trim()) {
        alert('מספר דירה הוא שדה חובה');
        return;
      }

      const residentData = {
        ...formData,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined,
        relationship: formData.relationship || undefined,
        contacts
      };
      
      console.log('Form submission - isEdit:', isEdit, 'residentData:', residentData);

      if (isEdit && resident) {
        console.log('Updating resident:', resident.id, residentData);
        updateResident(building.id, resident.id, residentData);
      } else {
        const newResident: Resident = {
          id: resident?.id || nanoid(),
          ...residentData
        };
        console.log('Adding new resident:', newResident);
        addResident(building.id, newResident);
      }
      
      onClose();
    };

    const addContact = () => {
      setContacts([...contacts, {
        id: nanoid(),
        name: '',
        phone: '',
        relationship: ''
      }]);
    };

    const updateContact = (index: number, field: keyof Contact, value: string) => {
      const newContacts = [...contacts];
      newContacts[index] = { ...newContacts[index], [field]: value };
      setContacts(newContacts);
    };

    const removeContact = (index: number) => {
      setContacts(contacts.filter((_, i) => i !== index));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {isEdit ? 'עריכת דייר' : 'דייר חדש'}
              </h3>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="שם מלא"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">דירה</label>
                <input
                  type="text"
                  value={formData.apartment}
                  onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="מספר דירה"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="050-1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">העדפת קשר</label>
                <select
                  value={formData.contactPreference}
                  onChange={(e) => setFormData({...formData, contactPreference: e.target.value as any})}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="call">שיחה</option>
                  <option value="whatsapp_photo">WhatsApp + צילום</option>
                  <option value="both">שניהם</option>
                  <option value="none">ללא קשר</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קשר משפחתי</label>
                <input
                  type="text"
                  value={formData.relationship}
                  onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="בן/בת, הורה, וכו׳"
                />
              </div>
            </div>

            {/* אנשי קשר נוספים */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">אנשי קשר נוספים</h4>
                <button
                  type="button"
                  onClick={addContact}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                >
                  <Plus size={14} />
                  הוסף
                </button>
              </div>

              <div className="space-y-3">
                {contacts.map((contact, index) => (
                  <div key={contact.id} className="bg-white border border-gray-300 rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="שם"
                        value={contact.name}
                        onChange={(e) => updateContact(index, 'name', e.target.value)}
                        className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        placeholder="טלפון"
                        value={contact.phone}
                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                        className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="קשר"
                          value={contact.relationship || ''}
                          onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                          className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeContact(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* הרשאות */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-3">הרשאות מסירה</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowMailbox}
                    onChange={(e) => setFormData({...formData, allowMailbox: e.target.checked})}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex items-center gap-1">
                    <Mail size={16} className="text-green-600" />
                    <span className="text-sm font-medium">מאשר תיבה</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowDoor}
                    onChange={(e) => setFormData({...formData, allowDoor: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-1">
                    <DoorOpen size={16} className="text-blue-600" />
                    <span className="text-sm font-medium">מאשר דלת</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({...formData, isPrimary: e.target.checked})}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <div className="flex items-center gap-1">
                    <Crown size={16} className="text-yellow-600" />
                    <span className="text-sm font-medium">דייר ראשי</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="הערות נוספות..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg"
              >
                {isEdit ? 'עדכן דייר' : 'הוסף דייר'}
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

  return (
    <section className="mt-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md">
            <Building2 size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">ניהול בניינים ודיירים</h2>
            <p className="text-gray-600 font-medium text-sm md:text-base">
              {filteredBuildings.length} בניינים, {filteredBuildings.reduce((sum, b) => sum + b.residents.length, 0)} דיירים
              <span className={`mr-2 px-2 py-1 rounded-full text-xs ${
                firebaseConnected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                💾 שמירה מקומית פעילה {firebaseConnected ? '+ Firebase' : '(Firebase כבוי)'}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 shadow-lg"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">בניין חדש</span>
        </button>
      </div>

      {/* חיפוש וסינון */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="חפש בניין, דייר, טלפון..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'כל האזורים' },
              { key: '12', label: 'אזור 12' },
              { key: '14', label: 'אזור 14' },
              { key: '45', label: 'אזור 45' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedArea(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedArea === key
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

      {/* רשימת בניינים */}
      <div className="space-y-6">
        {filteredBuildings.map(building => {
          const street = streets.find(s => s.id === building.streetId);
          
          return (
            <div key={building.id} className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <Building2 size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">
                        {getStreetName(building.streetId)} {building.number}
                        {building.entrance && ` כניסה ${building.entrance}`}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          street?.area === 12 ? 'bg-purple-100 text-purple-700' :
                          street?.area === 14 ? 'bg-blue-100 text-blue-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          אזור {street?.area}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Users size={14} />
                          {building.residents.length} דיירים
                        </span>
                        {building.code && (
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <Key size={14} />
                            קוד: {building.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingResident({building, resident: {
                        id: nanoid(),
                        fullName: '',
                        apartment: '',
                        contacts: [],
                        allowMailbox: true,
                        allowDoor: false,
                        isPrimary: false
                      } as Resident})}
                      className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                    >
                      <Plus size={14} />
                      דייר
                    </button>
                    <button
                      onClick={() => setEditingBuilding(building)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('בטוח למחוק בניין זה?')) {
                          deleteBuilding(building.id);
                        }
                      }}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* רשימת דיירים */}
              <div className="p-6">
                {building.residents.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {building.residents.map(resident => (
                      <div key={resident.id} className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                              <User size={18} className="text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                {resident.fullName}
                                {resident.isPrimary && <Crown size={16} className="text-yellow-500" />}
                              </h4>
                              <p className="text-sm text-gray-600">דירה {resident.apartment}</p>
                              {resident.relationship && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                  {resident.relationship}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {resident.phone && (
                              <button
                                onClick={() => setShowWhatsApp({resident, building})}
                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => setEditingResident({building, resident})}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                              title="עריכה"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('בטוח למחוק דייר זה?')) {
                                  deleteResident(building.id, resident.id);
                                }
                              }}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                              title="מחיקה"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* פרטי קשר */}
                        {resident.phone && (
                          <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                            <Phone size={14} />
                            <span>{resident.phone}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              resident.contactPreference === 'whatsapp' ? 'bg-green-100 text-green-700' :
                              resident.contactPreference === 'call' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {resident.contactPreference === 'whatsapp' ? 'WhatsApp' :
                               resident.contactPreference === 'call' ? 'שיחה' :
                               resident.contactPreference === 'both' ? 'שניהם' : 'ללא העדפה'}
                            </span>
                          </div>
                        )}

                        {/* אנשי קשר נוספים */}
                        {resident.contacts && resident.contacts.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-xs font-medium text-gray-700 mb-1">אנשי קשר:</h5>
                            <div className="space-y-1">
                              {resident.contacts.map(contact => (
                                <div key={contact.id} className="text-xs text-gray-600 bg-white p-2 rounded border">
                                  <span className="font-medium">{contact.name}</span> - {contact.phone}
                                  {contact.relationship && (
                                    <span className="text-purple-600"> ({contact.relationship})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* הרשאות */}
                        <div className="flex gap-2">
                          {resident.allowMailbox && (
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs">
                              <Mail size={12} />
                              <span>תיבה</span>
                            </div>
                          )}
                          {resident.allowDoor && (
                            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs">
                              <DoorOpen size={12} />
                              <span>דלת</span>
                            </div>
                          )}
                        </div>

                        {resident.notes && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-600">
                            <strong>הערות:</strong> {resident.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User size={48} className="mx-auto mb-4 opacity-50" />
                    <h4 className="text-lg font-medium mb-2">אין דיירים רשומים</h4>
                    <p className="text-sm">הוסף דיירים לבניין זה</p>
                  </div>
                )}
              </div>

              {/* ניהול כניסות ותיבות */}
              <BuildingEntranceManager 
                building={building} 
                onUpdateBuilding={updateBuilding} 
              />
            </div>
          );
        })}
      </div>

      {filteredBuildings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Building2 size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">אין בניינים</h3>
          <p className="text-sm">
            {searchTerm ? 'לא נמצאו בניינים התואמים לחיפוש' : 'התחל בהוספת בניין חדש'}
          </p>
        </div>
      )}

      {/* טפסים */}
      {showAddForm && (
        <BuildingForm onClose={() => setShowAddForm(false)} />
      )}

      {editingBuilding && (
        <BuildingForm building={editingBuilding} onClose={() => setEditingBuilding(null)} />
      )}

      {editingResident && (
        <ResidentForm 
          building={editingResident.building} 
          resident={editingResident.resident}
          onClose={() => setEditingResident(null)} 
        />
      )}

      {/* WhatsApp מהיר */}
      {showWhatsApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">WhatsApp מהיר</h3>
                <button onClick={() => setShowWhatsApp(null)} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {showWhatsApp.resident.fullName} - {getStreetName(showWhatsApp.building.streetId)} {showWhatsApp.building.number}
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickWhatsApp
                  recipientName={showWhatsApp.resident.fullName}
                  phone={showWhatsApp.resident.phone || ''}
                  address={`${getStreetName(showWhatsApp.building.streetId)} ${showWhatsApp.building.number}`}
                  type="id"
                />
                <QuickWhatsApp
                  recipientName={showWhatsApp.resident.fullName}
                  phone={showWhatsApp.resident.phone || ''}
                  address={`${getStreetName(showWhatsApp.building.streetId)} ${showWhatsApp.building.number}`}
                  type="package"
                />
                <QuickWhatsApp
                  recipientName={showWhatsApp.resident.fullName}
                  phone={showWhatsApp.resident.phone || ''}
                  address={`${getStreetName(showWhatsApp.building.streetId)} ${showWhatsApp.building.number}`}
                  type="general"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}