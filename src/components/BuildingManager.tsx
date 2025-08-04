import { useState } from "react";
import { nanoid } from "nanoid";
import { useBuildings } from "../hooks/useBuildings";
import { useDistribution } from "../hooks/useDistribution";
import { streets } from "../data/streets";
import { Building, Resident, Contact } from "../types";
import LoadingSpinner from "./LoadingSpinner";
import { Home, Users, Plus, Edit, Trash2, Building2, UserPlus, Phone, Crown, MapPin, User, X, DoorOpen, Mail, Key, ChevronDown, ChevronUp, Search, Filter } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { CheckCircle, XCircle } from "lucide-react";

/* רכיב אינפוט ממותג */
function Field({label, ...rest}:{label:string;name:string;type?:string;defaultValue?:string;placeholder?:string;required?:boolean}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" {...rest}/>
    </div>
  );
}

/* רכיב ניהול אנשי קשר */
function ContactsManager({ contacts, onChange }: { contacts: Contact[], onChange: (contacts: Contact[]) => void }) {
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const addContact = () => {
    const newContact: Contact = {
      id: nanoid(6),
      name: "",
      phone: "",
      relationship: ""
    };
    setEditingContact(newContact);
  };

  const saveContact = (contact: Contact) => {
    if (contact.name.trim() && contact.phone.trim()) {
      const existingIndex = contacts.findIndex(c => c.id === contact.id);
      if (existingIndex >= 0) {
        const updated = [...contacts];
        updated[existingIndex] = contact;
        onChange(updated);
      } else {
        onChange([...contacts, contact]);
      }
    }
    setEditingContact(null);
  };

  const deleteContact = (id: string) => {
    onChange(contacts.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">אנשי קשר</label>
        <button
          type="button"
          onClick={addContact}
          className="text-xs px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1"
        >
          <Plus size={12} />
          הוסף
        </button>
      </div>

      {contacts.map(contact => (
        <div key={contact.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
          <User size={16} className="text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{contact.name}</div>
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <Phone size={10} />
              <span className="truncate">{contact.phone}</span>
              {contact.relationship && (
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs whitespace-nowrap">
                  {contact.relationship}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setEditingContact(contact)}
              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            >
              <Edit size={12} />
            </button>
            <button
              type="button"
              onClick={() => deleteContact(contact.id)}
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}

      {editingContact && (
        <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
          <h5 className="font-medium text-gray-800 mb-3">עריכת איש קשר</h5>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="שם מלא"
              value={editingContact.name}
              onChange={(e) => setEditingContact({...editingContact, name: e.target.value})}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder="טלפון"
              value={editingContact.phone}
              onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="קשר משפחתי"
              value={editingContact.relationship || ""}
              onChange={(e) => setEditingContact({...editingContact, relationship: e.target.value})}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => saveContact(editingContact)}
              className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
            >
              שמור
            </button>
            <button
              type="button"
              onClick={() => setEditingContact(null)}
              className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              בטל
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuildingManager(){
  const {buildings,addBuilding,updateBuilding,deleteBuilding,
         addResident,updateResident,deleteResident,loading}=useBuildings();
  const { allStreets } = useDistribution();

  /*‑‑‑ מצבי טפסים ‑‑‑*/
  const [editingB,setEditingB]=useState<Building|null>(null);
  const [addingRes,setAddingRes]=useState<Building|null>(null);
  const [editingRes,setEditingRes]=useState<{b:Building;r:Resident}|null>(null);
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState<'all' | '12' | '14' | '45'>('all');
  const [selectedStreet, setSelectedStreet] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'none' | 'area' | 'street'>('none');

  if (loading) {
    return <LoadingSpinner />;
  }

  // קבלת רחובות לפי אזור נבחר
  const getStreetsForArea = (area: string) => {
    if (area === 'all') return streets;
    return streets.filter(s => s.area.toString() === area);
  };

  const availableStreets = getStreetsForArea(selectedArea);

  // סינון בניינים
  let filteredBuildings = buildings.filter(building => {
    const street = streets.find(s => s.id === building.streetId);
    const streetName = street ? street.name : building.streetId;
    
    const matchesSearch = !searchTerm || 
      streetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.number.toString().includes(searchTerm) ||
      building.residents.some(resident => 
        resident.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.apartment.includes(searchTerm) ||
        resident.phone?.includes(searchTerm)
      );

    if (!matchesSearch) return false;

    // סינון לפי אזור
    if (selectedArea !== 'all') {
      if (!street || street.area.toString() !== selectedArea) return false;
    }

    // סינון לפי רחוב
    if (selectedStreet !== 'all') {
      if (building.streetId !== selectedStreet) return false;
    }

    return true;
  });

  // קיבוץ בניינים
  const groupedBuildings = () => {
    if (groupBy === 'area') {
      const groups: { [key: string]: typeof filteredBuildings } = {};
      
      filteredBuildings.forEach(building => {
        const street = streets.find(s => s.id === building.streetId);
        const area = street ? street.area.toString() : 'לא ידוע';
        
        if (!groups[area]) groups[area] = [];
        groups[area].push(building);
      });
      
      return Object.entries(groups).sort(([a], [b]) => {
        if (a === 'לא ידוע') return 1;
        if (b === 'לא ידוע') return -1;
        return parseInt(a) - parseInt(b);
      });
    }
    
    if (groupBy === 'street') {
      const groups: { [key: string]: typeof filteredBuildings } = {};
      
      filteredBuildings.forEach(building => {
        const street = streets.find(s => s.id === building.streetId);
        const streetName = street ? street.name : 'לא ידוע';
        
        if (!groups[streetName]) groups[streetName] = [];
        groups[streetName].push(building);
      });
      
      return Object.entries(groups).sort(([a], [b]) => {
        if (a === 'לא ידוע') return 1;
        if (b === 'לא ידוע') return -1;
        return a.localeCompare(b);
      });
    }
    
    return [['הכל', filteredBuildings]];
  };

  const grouped = groupedBuildings();

  // סטטיסטיקות לפי אזור
  const getAreaStats = () => {
    const stats = { '12': 0, '14': 0, '45': 0 };
    
    buildings.forEach(building => {
      const street = streets.find(s => s.id === building.streetId);
      if (street) {
        const area = street.area.toString() as keyof typeof stats;
        if (stats[area] !== undefined) {
          stats[area]++;
        }
      }
    });
    
    return stats;
  };

  const areaStats = getAreaStats();

  // פונקציה לקבלת שם הרחוב
  const getStreetName = (streetId: string) => {
    const street = streets.find(s => s.id === streetId);
    return street ? street.name : streetId;
  };

  // פונקציה ליצירת כתובת מלאה
  const getFullAddress = (building: Building) => {
    const streetName = getStreetName(building.streetId);
    return `${streetName} ${building.number}${building.entrance ? ` כניסה ${building.entrance}` : ''}`;
  };

  // פונקציה להרחבת/כיווץ בניין
  const toggleBuilding = (buildingId: string) => {
    const newExpanded = new Set(expandedBuildings);
    if (newExpanded.has(buildingId)) {
      newExpanded.delete(buildingId);
    } else {
      newExpanded.add(buildingId);
    }
    setExpandedBuildings(newExpanded);
  };

  // פונקציה ליצירת קישור WhatsApp
  const createWhatsAppLink = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const message = encodeURIComponent(`שלום ${name}, זה דוור מדואר ישראל`);
    return `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${message}`;
  };

  // פונקציה ליצירת קישור WhatsApp עם בקשה לצילום
  const createWhatsAppPhotoLink = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const message = encodeURIComponent(`שלום ${name}, זה דוור מדואר ישראל. אנא צלם/י תמונה של הדואר שלך ושלח/י לי בווצאפ. תודה!`);
    return `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${message}`;
  };

  // פונקציה ליצירת קישור התקשרות
  const createCallLink = (phone: string) => {
    return `tel:${phone}`;
  };

  /*‑‑‑ בניין חדש ‑‑‑*/
  function submitBuilding(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const f=e.currentTarget as any;
    const streetId=f.streetId.value;
    const number=+f.number.value;
    const entrance=f.entrance.value.trim();
    const code=f.code.value.trim();

    addBuilding({id:`${streetId}-${number}${entrance}`,streetId,number,
      entrance:entrance||null,code:code||null,residents:[], entrances: []});
    f.reset();
  }

  /*‑‑‑ טופס דייר (חדש/עריכה) ‑‑‑*/
  function ResidentForm({b,res}:{b:Building;res?:Resident}){
    const isEdit=Boolean(res);
    const [contacts, setContacts] = useState<Contact[]>(res?.contacts || []);
    
    // קבלת דירות קיימות בבניין
    const existingApartments = [...new Set(b.residents.map(r => r.apartment))].sort();
    
    function submit(e:React.FormEvent<HTMLFormElement>){
      e.preventDefault();
      const f=e.currentTarget as any;
      
      const apartment = f.apartment.value.trim();
      const existingResidentsInApartment = b.residents.filter(r => r.apartment === apartment && r.id !== res?.id);
      
      const r:Resident={
        id:res?.id||nanoid(6),
        fullName:f.fullName.value.trim(),
        apartment,
        phone:f.phone.value.trim()||null,
        familyPhones:f.familyPhones.value.split(",").map((s:string)=>s.trim()).filter(Boolean),
        contacts: contacts.filter(c => c.name.trim() && c.phone.trim()),
        allowMailbox: f.allowMailbox.checked,
        allowDoor: f.allowDoor.checked,
        contactPreference: f.contactPreference.value || null,
        notes: f.notes.value.trim() || null,
        isPrimary: existingResidentsInApartment.length === 0 || f.isPrimary?.checked || false,
        relationship: f.relationship.value.trim() || null,
      };
      
      // אם זה דייר ראשי חדש, צריך לעדכן את הדיירים הקיימים בדירה
      if (r.isPrimary && existingResidentsInApartment.length > 0) {
        existingResidentsInApartment.forEach(existingResident => {
          updateResident(b.id, existingResident.id, { isPrimary: false });
        });
      }
      
      if(isEdit) updateResident(b.id,res!.id,r); else addResident(b.id,r);
      setAddingRes(null); setEditingRes(null); setContacts([]);
    }
    
    return(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xl text-gray-800">
                  {isEdit ? "עריכת דייר" : "דייר חדש"}
                </h4>
                <p className="text-sm text-gray-600 font-medium mt-1">
                  {getFullAddress(b)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {setAddingRes(null); setEditingRes(null); setContacts([]);}}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={submit} className="p-6">
            <div className="space-y-4">
              <Field label="שם מלא" name="fullName" defaultValue={res?.fullName} placeholder="ישראל ישראלי" required/>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">דירה</label>
                <div className="flex gap-2">
                  <input 
                    name="apartment" 
                    defaultValue={res?.apartment}
                    className="flex-1 border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="מספר דירה"
                    list="apartments"
                    required
                  />
                  <datalist id="apartments">
                    {existingApartments.map(apt => (
                      <option key={apt} value={apt} />
                    ))}
                  </datalist>
                </div>
              </div>
              
              <Field label="טלפון ראשי" name="phone" type="tel" defaultValue={res?.phone} placeholder="050-1234567"/>
              <Field label="טלפונים נוספים (פסיקים)" name="familyPhones"
                     defaultValue={res?.familyPhones?.join(", ")} placeholder="052-1111111, 03-1234567"/>
              
              <Field label="קשר משפחתי" name="relationship" defaultValue={res?.relationship} placeholder="בעל הבית, בן, בת, וכו'"/>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">העדפת קשר</label>
                <select 
                  name="contactPreference" 
                  defaultValue={res?.contactPreference || ''}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">לא הוגדר</option>
                  <option value="call">מאשר - צריך להתקשר</option>
                  <option value="whatsapp">מאשר - צריך WhatsApp</option>
                  <option value="whatsapp_photo">מאשר - צילום בווצאפ</option>
                  <option value="both">מאשר - טלפון או WhatsApp</option>
                  <option value="none">לא מאשר</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">הערות נוספות</label>
                <textarea
                  name="notes"
                  defaultValue={res?.notes}
                  rows={3}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="הערות על הדייר, זמני קבלה, הנחיות מיוחדות..."
                />
              </div>
            </div>
            
            <div className="mt-6">
              <ContactsManager contacts={contacts} onChange={setContacts} />
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h5 className="font-medium text-gray-700 mb-3">הרשאות</h5>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" name="allowMailbox" defaultChecked={res?.allowMailbox === true} className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4"/>
                  <Mail size={16} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700">מאשר תיבה</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" name="allowDoor" defaultChecked={res?.allowDoor === true} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"/>
                  <DoorOpen size={16} className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">מאשר דלת</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" name="isPrimary" defaultChecked={res?.isPrimary === true} className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 w-4 h-4"/>
                  <Crown size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">דייר ראשי</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg" type="submit">
                {isEdit?"עדכן דייר":"הוסף דייר"}
              </button>
              <button 
                type="button" 
                onClick={() => {setAddingRes(null); setEditingRes(null); setContacts([]);}}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium"
              >
                בטל
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // קיבוץ דיירים לפי דירות
  const groupResidentsByApartment = (residents: Resident[]) => {
    const grouped = residents.reduce((acc, resident) => {
      const key = resident.apartment;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(resident);
      return acc;
    }, {} as Record<string, Resident[]>);
    
    // מיון הדיירים בכל דירה - דייר ראשי קודם
    Object.keys(grouped).forEach(apartment => {
      grouped[apartment].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0;
      });
    });
    
    return grouped;
  };

  // פונקציית חיפוש מדויקת יותר
  const filterBuildings = (buildings: Building[], searchTerm: string) => {
    if (!searchTerm.trim()) return buildings;
    
    const term = searchTerm.toLowerCase().trim();
    
    return buildings.filter(building => {
      const streetName = getStreetName(building.streetId).toLowerCase();
      const buildingNumber = building.number.toString();
      const entrance = building.entrance?.toLowerCase() || "";
      const code = building.code?.toLowerCase() || "";
      
      // חיפוש מדויק יותר בכתובת
      const streetWords = streetName.split(' ');
      const searchWords = term.split(' ');
      
      // בדיקה אם החיפוש מכיל מספר בית
      const searchNumber = term.match(/\d+/)?.[0];
      
      // אם יש מספר בחיפוש, בדוק התאמה מדויקת למספר הבית
      if (searchNumber) {
        const exactNumberMatch = buildingNumber === searchNumber;
        const streetMatch = searchWords.some(word => 
          streetWords.some(streetWord => streetWord.includes(word))
        );
        
        // רק אם יש התאמה מדויקת למספר הבית ולרחוב
        if (exactNumberMatch && streetMatch) {
          return true;
        }
        
        // אם רק מספר הבית תואם בלי שם רחוב
        if (searchWords.length === 1 && exactNumberMatch) {
          return true;
        }
      } else {
        // חיפוש רגיל ללא מספרים
        if (streetName.includes(term) || 
            entrance.includes(term) ||
            code.includes(term)) {
          return true;
        }
      }
      
      // חיפוש בדיירים
      return building.residents.some(resident => {
        const residentName = resident.fullName.toLowerCase();
        const apartment = resident.apartment.toLowerCase();
        const phone = resident.phone?.toLowerCase() || "";
        const relationship = resident.relationship?.toLowerCase() || "";
        
        // חיפוש בפרטי הדייר
        if (residentName.includes(term) ||
            apartment.includes(term) ||
            phone.includes(term) ||
            relationship.includes(term)) {
          return true;
        }
        
        // חיפוש בטלפונים נוספים
        if (resident.familyPhones?.some(phone => phone.toLowerCase().includes(term))) {
          return true;
        }
        
        // חיפוש באנשי קשר
        if (resident.contacts?.some(contact => 
          contact.name.toLowerCase().includes(term) ||
          contact.phone.toLowerCase().includes(term) ||
          contact.relationship?.toLowerCase().includes(term)
        )) {
          return true;
        }
        
        return false;
      });
    });
  };

  // סינון הבניינים לפי החיפוש
  const filteredBuildingsFromSearch = filterBuildings(buildings, searchTerm);

  // קיבוץ בניינים לפי אזור, רחוב ומספר
  const groupedBuildingsByArea = filteredBuildingsFromSearch.reduce((acc, building) => {
    const streetName = getStreetName(building.streetId);
    const street = streets.find(s => s.id === building.streetId);
    const area = street?.area || 14;
    const areaKey = `area-${area}`;
    const buildingKey = `${streetName}-${building.number}`;
    
    if (!acc[areaKey]) {
      acc[areaKey] = {
        area,
        buildings: {}
      };
    }
    
    if (!acc[areaKey].buildings[buildingKey]) {
      acc[areaKey].buildings[buildingKey] = {
        streetName,
        number: building.number,
        buildings: []
      };
    }
    
    acc[areaKey].buildings[buildingKey].buildings.push(building);
    return acc;
  }, {} as Record<string, { area: number; buildings: Record<string, { streetName: string; number: number; buildings: Building[] }> }>);

  // מיון הבניינים לפי אזורים
  const sortedAreaGroups = Object.values(groupedBuildingsByArea)
    .sort((a, b) => a.area - b.area)
    .map(areaGroup => ({
      ...areaGroup,
      sortedBuildings: Object.values(areaGroup.buildings).sort((a, b) => {
        if (a.streetName !== b.streetName) {
          return a.streetName.localeCompare(b.streetName);
        }
        return a.number - b.number;
      })
    }));

  // פתיחה אוטומטית של תוצאות חיפוש
  const shouldAutoExpand = searchTerm.trim().length > 0;

  return(
    <section className="mt-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md">
          <Building2 size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">בניינים ודיירים</h2>
          <p className="text-gray-600 font-medium text-sm md:text-base">
            {filteredBuildings.length} בניינים
            {selectedArea !== 'all' && ` באזור ${selectedArea}`}
            {selectedStreet !== 'all' && ` ברחוב ${availableStreets.find(s => s.id === selectedStreet)?.name}`}
          </p>
        </div>
      </div>

      {/* סטטיסטיקות לפי אזור */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-blue-600" />
          פילוח לפי אזורים
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">אזור 12</span>
              <span className="text-2xl font-bold text-purple-600">{areaStats['12']}</span>
            </div>
            <p className="text-xs text-purple-600">בניינים</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">אזור 14</span>
              <span className="text-2xl font-bold text-blue-600">{areaStats['14']}</span>
            </div>
            <p className="text-xs text-blue-600">בניינים</p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-700">אזור 45</span>
              <span className="text-2xl font-bold text-indigo-600">{areaStats['45']}</span>
            </div>
            <p className="text-xs text-indigo-600">בניינים</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">סה״כ</span>
              <span className="text-2xl font-bold text-green-600">{buildings.length}</span>
            </div>
            <p className="text-xs text-green-600">כל הבניינים</p>
          </div>
        </div>
      </div>

      {/* חיפוש וסינון */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="space-y-4">
          {/* שורה ראשונה - חיפוש */}
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="חפש רחוב, מספר בניין, שם דייר..."
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
          
          {/* שורה שנייה - סינון לפי אזור */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <MapPin size={14} />
              אזור:
            </span>
            {[
              { key: 'all', label: 'כל האזורים', count: buildings.length },
              { key: '12', label: 'אזור 12', count: areaStats['12'] },
              { key: '14', label: 'אזור 14', count: areaStats['14'] },
              { key: '45', label: 'אזור 45', count: areaStats['45'] }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedArea(key as any);
                  setSelectedStreet('all'); // איפוס בחירת רחוב
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedArea === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
          
          {/* שורה שלישית - סינון לפי רחוב (רק אם נבחר אזור) */}
          {selectedArea !== 'all' && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">רחוב:</span>
              <button
                onClick={() => setSelectedStreet('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStreet === 'all'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                כל הרחובות
              </button>
              {availableStreets.map(street => (
                <button
                  key={street.id}
                  onClick={() => setSelectedStreet(street.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStreet === street.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {street.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
          
          {/* שורה רביעית - קיבוץ */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">קיבוץ:</span>
            {[
              { key: 'none', label: 'ללא קיבוץ' },
              { key: 'area', label: 'לפי אזור' },
              { key: 'street', label: 'לפי רחוב' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setGroupBy(key as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  groupBy === key
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* טופס בניין חדש */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 md:p-6 mb-6 shadow-lg">
        <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-blue-500" />
          הוספת בניין חדש
        </h3>
        <form onSubmit={submitBuilding} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">רחוב / מקטע</label>
              <select name="streetId" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <optgroup label="אזור 12">
                  {streets.filter(s=>s.area===12).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </optgroup>
                <optgroup label="אזור 14">
                  {streets.filter(s=>s.area===14).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </optgroup>
                <optgroup label="אזור 45">
                  {streets.filter(s=>s.area===45).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </optgroup>
              </select>
            </div>
            <Field label="מס׳ בית" name="number" type="number" required/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="כניסה"  name="entrance" placeholder="א, ב, ג..."/>
            <Field label="קוד‑דלת" name="code" placeholder="1234"/>
          </div>
          <button className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg" type="submit">
            <Plus size={18} />
            הוסף בניין
          </button>
        </form>
      </div>

      {/* רשימת בניינים */}
      <div className="space-y-6">
        {grouped.map(([groupName, groupBuildings]) => (
          <div key={groupName}>
            {/* כותרת קבוצה */}
            {groupBy !== 'none' && (
              <div className="mb-4">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white shadow-lg ${
                  groupBy === 'area' 
                    ? groupName === '12' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                      groupName === '14' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      groupName === '45' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
                      'bg-gradient-to-r from-gray-500 to-gray-600'
                    : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}>
                  <MapPin size={18} />
                  {groupBy === 'area' ? `אזור ${groupName}` : groupName}
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                    {groupBuildings.length}
                  </span>
                </div>
              </div>
            )}

            {/* רשימת בניינים בקבוצה */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {groupBuildings.map(building => {
                const street = streets.find(s => s.id === building.streetId);
                const areaColor = street?.area === 12 ? 'purple' : street?.area === 14 ? 'blue' : 'indigo';
                
                return (
                  <div key={building.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Home size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            {getStreetName(building.streetId)} {building.number}
                            {street && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                areaColor === 'purple' ? 'bg-purple-100 text-purple-700' :
                                areaColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                                'bg-indigo-100 text-indigo-700'
                              }`}>
                                אזור {street.area}
                              </span>
                            )}
                          </h4>
                          {building.code && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Key size={12} />
                              קוד: {building.code}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingB(building)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                          title="עריכה"
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
                          title="מחיקה"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* דיירים */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                          <Users size={16} />
                          דיירים ({building.residents.length})
                        </h5>
                        <button
                          onClick={() => setAddingRes(building)}
                          className="text-sm px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Plus size={12} />
                          הוסף דייר
                        </button>
                      </div>

                      {building.residents.length > 0 ? (
                        building.residents.map(resident => (
                          <div key={resident.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-800">{resident.fullName}</span>
                                  {resident.isPrimary && <Crown size={14} className="text-yellow-500" />}
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div>דירה: {resident.apartment}</div>
                                  {resident.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone size={12} />
                                      {resident.phone}
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    {resident.allowMailbox && (
                                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                                        <Mail size={10} />
                                        תיבה
                                      </span>
                                    )}
                                    {resident.allowDoor && (
                                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                                        <DoorOpen size={10} />
                                        דלת
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingRes({b: building, r: resident})}
                                  className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                                  title="עריכה"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('בטוח למחוק דייר זה?')) {
                                      deleteResident(building.id, resident.id);
                                    }
                                  }}
                                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                  title="מחיקה"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          אין דיירים רשומים
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* הודעה כשאין תוצאות */}
      {filteredBuildings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Building2 size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">אין בניינים</h3>
          <p className="text-sm">
            {searchTerm ? 'לא נמצאו בניינים התואמים לחיפוש' : 'התחל בהוספת בניין חדש'}
          </p>
        </div>
      )}

      {/* הודעה כשאין תוצאות חיפוש */}
      {searchTerm && sortedAreaGroups.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">לא נמצאו תוצאות</h3>
          <p className="text-sm">נסה לחפש במילים אחרות או בדוק את האיות</p>
        </div>
      )}

      {/* הודעה כשאין בניינים כלל */}
      {!searchTerm && buildings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Building2 size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">אין בניינים רשומים</h3>
          <p className="text-sm">התחל בהוספת בניין חדש</p>
        </div>
      )}

      {/* עריכת בניין */}
      {editingB && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <h4 className="text-xl font-bold text-gray-800">עריכת כניסה</h4>
              <p className="text-sm text-gray-600 mt-1">{getFullAddress(editingB)}</p>
            </div>
            <form onSubmit={e=>{e.preventDefault();
                const f=e.currentTarget as any;
                updateBuilding(editingB.id,{entrance:f.entrance.value.trim()||null,code:f.code.value.trim()||null});
                setEditingB(null);
              }}
              className="p-6">
              <div className="space-y-4">
                <Field label="כניסה" name="entrance" defaultValue={editingB.entrance} placeholder="א, ב, ג..."/>
                <Field label="קוד‑דלת" name="code" defaultValue={editingB.code} placeholder="1234"/>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg" type="submit">שמור</button>
                <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-colors font-medium" type="button" onClick={()=>setEditingB(null)}>בטל</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* דייר חדש */}
      {addingRes && (
        <ResidentForm b={addingRes}/>
      )}

      {/* עריכת דייר */}
      {editingRes && (
        <ResidentForm b={editingRes.b} res={editingRes.r}/>
      )}
    </section>
  );
}