import { useState } from "react";
import { useBuildings } from "../hooks/useBuildings";
import { Building, Resident } from "../types";
import { streets } from "../data/streets";
import { nanoid } from "nanoid";
import { Plus, Zap, Users, Building2, Phone, Mail, DoorOpen } from "lucide-react";

interface QuickResident {
  fullName: string;
  apartment: string;
  phone?: string;
  buildingId: string;
}

export default function QuickResidentAdd() {
  const { buildings, addResident } = useBuildings();
  const [quickResidents, setQuickResidents] = useState<QuickResident[]>([
    { fullName: "", apartment: "", phone: "", buildingId: "" }
  ]);
  const [isAdding, setIsAdding] = useState(false);

  // הוספת שורה חדשה
  const addRow = () => {
    setQuickResidents([...quickResidents, { fullName: "", apartment: "", phone: "", buildingId: "" }]);
  };

  // עדכון שורה
  const updateRow = (index: number, field: keyof QuickResident, value: string) => {
    const updated = [...quickResidents];
    updated[index] = { ...updated[index], [field]: value };
    setQuickResidents(updated);
  };

  // הסרת שורה
  const removeRow = (index: number) => {
    if (quickResidents.length > 1) {
      setQuickResidents(quickResidents.filter((_, i) => i !== index));
    }
  };

  // שמירת כל הדיירים
  const saveAllResidents = async () => {
    setIsAdding(true);
    
    try {
      for (const quickResident of quickResidents) {
        if (quickResident.fullName.trim() && quickResident.apartment.trim() && quickResident.buildingId) {
          const resident: Resident = {
            id: nanoid(),
            fullName: quickResident.fullName.trim(),
            apartment: quickResident.apartment.trim(),
            phone: quickResident.phone?.trim() || undefined,
            allowMailbox: true, // ברירת מחדל
            allowDoor: false,
            isPrimary: false,
            contacts: []
          };
          
          await addResident(quickResident.buildingId, resident);
        }
      }
      
      // איפוס הטופס
      setQuickResidents([{ fullName: "", apartment: "", phone: "", buildingId: "" }]);
      alert(`${quickResidents.filter(r => r.fullName.trim()).length} דיירים נוספו בהצלחה!`);
    } catch (error) {
      console.error("Error adding residents:", error);
      alert("שגיאה בהוספת דיירים");
    } finally {
      setIsAdding(false);
    }
  };

  // קבלת שם בניין
  const getBuildingName = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return "";
    
    const street = streets.find(s => s.id === building.streetId);
    return `${street?.name || building.streetId} ${building.number}${building.entrance ? ` כניסה ${building.entrance}` : ''}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg mb-6">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-3">
          <Zap size={24} className="text-green-600" />
          <div>
            <h3 className="font-bold text-xl text-gray-800">הוספה מהירה של דיירים</h3>
            <p className="text-sm text-gray-600">הוסף מספר דיירים בבת אחת</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {/* כותרות עמודות */}
          <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-700 pb-2 border-b border-gray-200">
            <div className="col-span-3">שם מלא</div>
            <div className="col-span-2">דירה</div>
            <div className="col-span-3">טלפון</div>
            <div className="col-span-3">בניין</div>
            <div className="col-span-1">פעולות</div>
          </div>

          {/* שורות הוספה */}
          {quickResidents.map((resident, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-3">
                <input
                  type="text"
                  placeholder="שם מלא"
                  value={resident.fullName}
                  onChange={(e) => updateRow(index, 'fullName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
              
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="דירה"
                  value={resident.apartment}
                  onChange={(e) => updateRow(index, 'apartment', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
              
              <div className="col-span-3">
                <input
                  type="tel"
                  placeholder="050-1234567"
                  value={resident.phone}
                  onChange={(e) => updateRow(index, 'phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
              
              <div className="col-span-3">
                <select
                  value={resident.buildingId}
                  onChange={(e) => updateRow(index, 'buildingId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">בחר בניין</option>
                  {buildings.map(building => (
                    <option key={building.id} value={building.id}>
                      {getBuildingName(building.id)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-1 flex gap-1">
                <button
                  onClick={addRow}
                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  title="הוסף שורה"
                >
                  <Plus size={14} />
                </button>
                {quickResidents.length > 1 && (
                  <button
                    onClick={() => removeRow(index)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="הסר שורה"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* כפתורי פעולה */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {quickResidents.filter(r => r.fullName.trim()).length} דיירים מוכנים להוספה
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setQuickResidents([{ fullName: "", apartment: "", phone: "", buildingId: "" }])}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              נקה הכל
            </button>
            <button
              onClick={saveAllResidents}
              disabled={isAdding || !quickResidents.some(r => r.fullName.trim() && r.apartment.trim() && r.buildingId)}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-all duration-200 shadow-lg"
            >
              {isAdding ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Users size={16} />
              )}
              {isAdding ? 'מוסיף...' : 'הוסף את כל הדיירים'}
            </button>
          </div>
        </div>

        {/* הנחיות */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 טיפים להוספה מהירה:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• מלא רק שם מלא ודירה (שדות חובה)</li>
            <li>• טלפון אופציונלי - ניתן להוסיף מאוחר יותר</li>
            <li>• לחץ על + להוספת שורות נוספות</li>
            <li>• כל הדיירים יקבלו הרשאת תיבה כברירת מחדל</li>
          </ul>
        </div>
      </div>
    </div>
  );
}