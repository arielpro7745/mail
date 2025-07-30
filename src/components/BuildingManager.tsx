import { useState } from "react";
import { useBuildings } from "../hooks/useBuildings";
import { Building, Resident, Contact } from "../types";
import { streets } from "../data/streets";
import { nanoid } from "nanoid";
import LoadingSpinner from "./LoadingSpinner";
import BuildingEntranceManager from "./BuildingEntranceManager";
import { 
  Plus, Edit, Trash2, Home, User, Phone, 
  Search, MapPin, Building2, Users, 
  Mail, DoorOpen, X, MessageCircle
} from "lucide-react";

export default function BuildingManager() {
  const { buildings, addBuilding, updateBuilding, deleteBuilding, addResident, updateResident, deleteResident, loading } = useBuildings();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [editingResident, setEditingResident] = useState<{building: Building, resident: Resident} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(new Set());

  if (loading) return <LoadingSpinner />;

  // פונקציה ליצירת קישור WhatsApp
  const createWhatsAppLink = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const message = encodeURIComponent(`שלום ${name}, זה דוור מדואר ישראל`);
    return `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${message}`;
  };

  // סינון בניינים לפי חיפוש
  const filteredBuildings = buildings.filter(building => {
    const streetName = streets.find(s => s.id === building.streetId)?.name || building.streetId;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      streetName.toLowerCase().includes(searchLower) ||
      building.number.toString().includes(searchTerm) ||
      building.residents.some(r => 
        r.fullName.toLowerCase().includes(searchLower) ||
        r.apartment.toLowerCase().includes(searchLower) ||
        r.phone?.includes(searchTerm) ||
        r.familyPhones?.some(p => p.includes(searchTerm))
      )
    );
  });

  // קיבוץ בניינים לפי רחוב
  const groupedBuildings = filteredBuildings.reduce((groups, building) => {
    const streetName = streets.find(s => s.id === building.streetId)?.name || building.streetId;
    if (!groups[streetName]) {
      groups[streetName] = [];
    }
    groups[streetName].push(building);
    return groups;
  }, {} as Record<string, Building[]>);

  const toggleBuildingExpansion = (buildingId: string) => {
    const newExpanded = new Set(expandedBuildings);
    if (newExpanded.has(buildingId)) {
      newExpanded.delete(buildingId);
    } else {
      newExpanded.add(buildingId);
    }
    setExpandedBuildings(newExpanded);
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
        residents: building?.residents || [],
      };

      if (isEdit && building) {
        updateBuilding(building.id, buildingData);
      } else {
        const newBuilding: Building = {
          id: nanoid(8),
          ...buildingData,
        };
        addBuilding(newBuilding);
      }
      
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {isEdit ? 'עריכת בניין' : 'בניין חדש'}
              </h3>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
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
                placeholder="א', ב', וכו'"
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
    const isEdit = Boolean(resident);
    const [contacts, setContacts] = useState<Contact[]>(resident?.contacts || []);

    const addContact = () => {
      const newContact: Contact = {
        id: nanoid(6),
        name: "",
        phone: "",
        relationship: ""
      };
      setContacts([...contacts, newContact]);
    };

    const updateContact = (index: number, field: keyof Contact, value: string) => {
      const updated = [...contacts];
      updated[index] = { ...updated[index], [field]: value };
      setContacts(updated);
    };

    const removeContact = (index: number) => {
      setContacts(contacts.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      
      // איסוף טלפונים נוספים
      const familyPhones: string[] = [];
      const phoneInputs = e.currentTarget.querySelectorAll('input[name^="familyPhone"]');
      phoneInputs.forEach((input: any) => {
        if (input.value.trim()) {
          familyPhones.push(input.value.trim());
        }
      });

      const residentData = {
        fullName: formData.get('fullName') as string,
        apartment: formData.get('apartment') as string,
        phone: (formData.get('phone') as string) || undefined,
        familyPhones: familyPhones.length > 0 ? familyPhones : undefined,
        contacts: contacts.filter(c => c.name.trim() && c.phone.trim()),
        allowMailbox: formData.get('allowMailbox') === 'true' ? true : formData.get('allowMailbox') === 'false' ? false : undefined,
        allowDoor: formData.get('allowDoor') === 'true' ? true : formData.get('allowDoor') === 'false' ? false : undefined,
        contactPreference: (formData.get('contactPreference') as any) || undefined,
        notes: (formData.get('notes') as string) || undefined,
        isPrimary: formData.get('isPrimary') === 'on',
        relationship: (formData.get('relationship') as string) || undefined,
      };

      if (isEdit && resident) {
        updateResident(building.id, resident.id, residentData);
      } else {
        const newResident: Resident = {
          id: nanoid(8),
          ...residentData,
        };
        addResident(building.id, newResident);
      }
      
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
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

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                <input
                  name="fullName"
                  defaultValue={resident?.fullName}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">דירה</label>
                <input
                  name="apartment"
                  defaultValue={resident?.apartment}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון ראשי</label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={resident?.phone}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קשר משפחתי</label>
                <input
                  name="relationship"
                  defaultValue={resident?.relationship}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="בן/בת, הורה, וכו'"
                />
              </div>
            </div>

            {/* טלפונים נוספים */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">טלפונים נוספים</label>
              <div className="space-y-2">
                {(resident?.familyPhones || ['']).map((phone, index) => (
                  <input
                    key={index}
                    name={`familyPhone${index}`}
                    type="tel"
                    defaultValue={phone}
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`טלפון נוסף ${index + 1}`}
                  />
                ))}
                <input
                  name={`familyPhone${(resident?.familyPhones || []).length}`}
                  type="tel"
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="טלפון נוסף"
                />
              </div>
            </div>

            {/* אנשי קשר */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">אנשי קשר</label>
                <button
                  type="button"
                  onClick={addContact}
                  className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                >
                  <Plus size={14} />
                  הוסף איש קשר
                </button>
              </div>
              
              <div className="space-y-3">
                {contacts.map((contact, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg border">
                    <input
                      type="text"
                      placeholder="שם"
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="טלפון"
                      value={contact.phone}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="קשר"
                      value={contact.relationship || ''}
                      onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                      className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* הרשאות */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">הרשאת תיבה</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="allowMailbox"
                      value="true"
                      defaultChecked={resident?.allowMailbox === true}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">מאשר תיבה</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="allowMailbox"
                      value="false"
                      defaultChecked={resident?.allowMailbox === false}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm">לא מאשר תיבה</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="allowMailbox"
                      value=""
                      defaultChecked={resident?.allowMailbox === undefined}
                      className="text-gray-600 focus:ring-gray-500"
                    />
                    <span className="text-sm">לא הוגדר</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">הרשאת דלת</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="allowDoor"
                      value="true"
                      defaultChecked={resident?.allowDoor === true}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">מאשר דלת</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="allowDoor"
                      value="false"
                      defaultChecked={resident?.allowDoor === false}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm">לא מאשר דלת</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="allowDoor"
                      value=""
                      defaultChecked={resident?.allowDoor === undefined}
                      className="text-gray-600 focus:ring-gray-500"
                    />
                    <span className="text-sm">לא הוגדר</span>
                  </label>
                </div>
              </div>
            </div>

            {/* העדפת קשר */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">העדפת קשר</label>
              <select
                name="contactPreference"
                defaultValue={resident?.contactPreference}
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">בחר העדפה</option>
                <option value="call">שיחה טלפונית</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="whatsapp_photo">WhatsApp עם צילום</option>
                <option value="both">שניהם</option>
                <option value="none">ללא קשר</option>
              </select>
            </div>

            {/* דייר ראשי */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPrimary"
                defaultChecked={resident?.isPrimary}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">דייר ראשי</label>
            </div>

            {/* הערות */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
              <textarea
                name="notes"
                defaultValue={resident?.notes}
                rows={3}
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="הערות נוספות..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg"
              >
                {isEdit ? 'עדכן' : 'הוסף'} דייר
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
              {buildings.length} בניינים, {buildings.reduce((sum, b) => sum + b.residents.length, 0)} דיירים
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

      {/* חיפוש */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="relative">
          <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="חפש בניין, דייר, טלפון..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* רשימת בניינים מקובצת לפי רחוב */}
      <div className="space-y-6">
        {Object.entries(groupedBuildings).map(([streetName, streetBuildings]) => {
          const isExpanded = expandedBuildings.has(streetName);
          
          return (
            <div key={streetName} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <div 
                className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200 cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition-all duration-200"
                onClick={() => {
                  const newExpanded = new Set(expandedBuildings);
                  if (newExpanded.has(streetName)) {
                    newExpanded.delete(streetName);
                  } else {
                    newExpanded.add(streetName);
                  }
                  setExpandedBuildings(newExpanded);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-indigo-600" />
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{streetName}</h3>
                      <p className="text-sm text-gray-600">
                        {streetBuildings.length} בניינים, {streetBuildings.reduce((sum, b) => sum + b.residents.length, 0)} דיירים
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {isExpanded ? 'סגור' : 'פתח'}
                    </span>
                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4">
                  <div className="space-y-4">
                    {streetBuildings.map(building => {
                      const isBuildingExpanded = expandedBuildings.has(building.id);
                      
                      return (
                        <div key={building.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
                          <div 
                            className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                            onClick={() => toggleBuildingExpansion(building.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                                  <Home size={20} className="text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-800">
                                    {streetName} {building.number}
                                    {building.entrance && <span className="text-blue-600"> כניסה {building.entrance}</span>}
                                  </h4>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Users size={14} />
                                      <span>{building.residents.length} דיירים</span>
                                    </div>
                                    {building.code && (
                                      <div className="flex items-center gap-1">
                                        <span>🔑</span>
                                        <span>קוד: {building.code}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingBuilding(building);
                                  }}
                                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                  title="עריכת בניין"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('בטוח למחוק בניין זה?')) {
                                      deleteBuilding(building.id);
                                    }
                                  }}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  title="מחיקת בניין"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <div className={`transform transition-transform duration-200 ${isBuildingExpanded ? 'rotate-180' : ''}`}>
                                  ▼
                                </div>
                              </div>
                            </div>
                          </div>

                          {isBuildingExpanded && (
                            <>
                              <div className="p-4 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                  <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <User size={18} className="text-green-600" />
                                    דיירים ({building.residents.length})
                                  </h5>
                                  <button
                                    onClick={() => setEditingResident({building, resident: undefined})}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-sm transition-all duration-200 shadow-md"
                                  >
                                    <Plus size={14} />
                                    הוסף דייר
                                  </button>
                                </div>

                                {building.residents.length > 0 ? (
                                  <div className="space-y-3">
                                    {building.residents.map(resident => (
                                      <div key={resident.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                              <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                                                <User size={16} className="text-green-600" />
                                              </div>
                                              <div>
                                                <h6 className="font-bold text-gray-800 flex items-center gap-2">
                                                  {resident.fullName}
                                                  {resident.isPrimary && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">ראשי</span>}
                                                </h6>
                                                <p className="text-sm text-gray-600">דירה {resident.apartment}</p>
                                                {resident.relationship && (
                                                  <p className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full inline-block mt-1">
                                                    {resident.relationship}
                                                  </p>
                                                )}
                                              </div>
                                            </div>

                                            {/* הרשאות */}
                                            <div className="flex gap-2 mb-3">
                                              {resident.allowMailbox === true && (
                                                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs">
                                                  <Mail size={12} />
                                                  <span>מאשר תיבה</span>
                                                </div>
                                              )}
                                              {resident.allowMailbox === false && (
                                                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs">
                                                  <Mail size={12} />
                                                  <span>לא מאשר תיבה</span>
                                                </div>
                                              )}
                                              {resident.allowDoor === true && (
                                                <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs">
                                                  <DoorOpen size={12} />
                                                  <span>מאשר דלת</span>
                                                </div>
                                              )}
                                              {resident.allowDoor === false && (
                                                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs">
                                                  <DoorOpen size={12} />
                                                  <span>לא מאשר דלת</span>
                                                </div>
                                              )}
                                            </div>

                                            {/* טלפונים */}
                                            <div className="space-y-2">
                                              {resident.phone && (
                                                <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-200">
                                                  <Phone size={14} className="text-green-600" />
                                                  <span className="font-medium text-gray-800">{resident.phone}</span>
                                                  <span className="text-xs text-gray-500">ראשי</span>
                                                  <div className="mr-auto flex gap-1">
                                                    <a
                                                      href={`tel:${resident.phone}`}
                                                      className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                                      title="התקשר"
                                                    >
                                                      <Phone size={12} />
                                                    </a>
                                                    <a
                                                      href={createWhatsAppLink(resident.phone, resident.fullName)}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                      title="שלח WhatsApp"
                                                    >
                                                      <MessageCircle size={12} />
                                                    </a>
                                                  </div>
                                                </div>
                                              )}

                                              {resident.familyPhones?.map((phone, phoneIndex) => (
                                                <div key={phoneIndex} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                                  <Phone size={14} className="text-blue-600" />
                                                  <span className="font-medium text-gray-800">{phone}</span>
                                                  <span className="text-xs text-gray-500">נוסף</span>
                                                  <div className="mr-auto flex gap-1">
                                                    <a
                                                      href={`tel:${phone}`}
                                                      className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                                      title="התקשר"
                                                    >
                                                      <Phone size={12} />
                                                    </a>
                                                    <a
                                                      href={createWhatsAppLink(phone, resident.fullName)}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                      title="שלח WhatsApp"
                                                    >
                                                      <MessageCircle size={12} />
                                                    </a>
                                                  </div>
                                                </div>
                                              ))}

                                              {resident.contacts?.map((contact, contactIndex) => (
                                                <div key={contactIndex} className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                                                  <User size={14} className="text-purple-600" />
                                                  <div className="flex-1">
                                                    <span className="font-medium text-gray-800">{contact.name}</span>
                                                    <span className="text-sm text-gray-600 mr-2">{contact.phone}</span>
                                                    {contact.relationship && (
                                                      <span className="text-xs text-purple-600">({contact.relationship})</span>
                                                    )}
                                                  </div>
                                                  <div className="flex gap-1">
                                                    <a
                                                      href={`tel:${contact.phone}`}
                                                      className="p-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                                                      title="התקשר"
                                                    >
                                                      <Phone size={12} />
                                                    </a>
                                                    <a
                                                      href={createWhatsAppLink(contact.phone, contact.name)}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                      title="שלח WhatsApp"
                                                    >
                                                      <MessageCircle size={12} />
                                                    </a>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>

                                            {resident.notes && (
                                              <div className="mt-3 p-3 bg-gray-100 rounded-lg border-r-4 border-blue-400">
                                                <p className="text-sm text-gray-700">{resident.notes}</p>
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex gap-2 mr-4">
                                            <button
                                              onClick={() => setEditingResident({building, resident})}
                                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                              title="עריכת דייר"
                                            >
                                              <Edit size={16} />
                                            </button>
                                            <button
                                              onClick={() => {
                                                if (window.confirm('בטוח למחוק דייר זה?')) {
                                                  deleteResident(building.id, resident.id);
                                                }
                                              }}
                                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                              title="מחיקת דייר"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-gray-500">
                                    <User size={48} className="mx-auto mb-4 opacity-50" />
                                    <h6 className="text-lg font-medium mb-2">אין דיירים</h6>
                                    <p className="text-sm">התחל בהוספת דייר ראשון</p>
                                  </div>
                                )}
                              </div>

                              {/* ניהול כניסות ותיבות */}
                              <BuildingEntranceManager 
                                building={building} 
                                onUpdateBuilding={updateBuilding} 
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* הודעה כשאין בניינים */}
      {filteredBuildings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Building2 size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? 'לא נמצאו תוצאות' : 'אין בניינים'}
          </h3>
          <p className="text-sm">
            {searchTerm ? 'נסה לחפש במילים אחרות' : 'התחל בהוספת בניין ראשון'}
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
    </section>
  );
}