import { useState } from "react";
import { nanoid } from "nanoid";
import { useBuildings } from "../hooks/useBuildings";
import { streets } from "../data/streets";
import { Building, Resident, Contact } from "../types";
import LoadingSpinner from "./LoadingSpinner";
import { Home, Users, Plus, Edit, Trash2, Building2, UserPlus, Phone, Crown, MapPin, User, X, DoorOpen, Mail, Key, ChevronDown, ChevronUp, Search } from "lucide-react";

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
          className="text-xs px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1 shadow-sm"
        >
          <Plus size={12} />
          הוסף
        </button>
      </div>

      {contacts.map(contact => (
        <div key={contact.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
        <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-md">
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
              className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors shadow-sm"
            >
              שמור
            </button>
            <button
              type="button"
              onClick={() => setEditingContact(null)}
              className="flex-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors shadow-sm"
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

  /*‑‑‑ מצבי טפסים ‑‑‑*/
  const [editingB,setEditingB]=useState<Building|null>(null);
  const [addingRes,setAddingRes]=useState<Building|null>(null);
  const [editingRes,setEditingRes]=useState<{b:Building;r:Resident}|null>(null);
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) {
    return <LoadingSpinner />;
  }

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
        allowMailbox:f.allowMailbox.checked,
        allowDoor:f.allowDoor.checked,
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

          <form onSubmit={submit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            
            <ContactsManager contacts={contacts} onChange={setContacts} />
            
            <div className="p-4 bg-gray-50 rounded-xl shadow-inner">
              <h5 className="font-medium text-gray-700 mb-3">הרשאות</h5>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                  <input type="checkbox" name="allowMailbox" defaultChecked={res?.allowMailbox} className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4"/>
                  <Mail size={16} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700">מאשר תיבה</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                  <input type="checkbox" name="allowDoor" defaultChecked={res?.allowDoor} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"/>
                  <DoorOpen size={16} className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">מאשר דלת</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                  <input type="checkbox" name="isPrimary" defaultChecked={res?.isPrimary} className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 w-4 h-4"/>
                  <Crown size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">דייר ראשי</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg" type="submit">
                {isEdit?"עדכן דייר":"הוסף דייר"}
              </button>
              <button 
                type="button" 
                onClick={() => {setAddingRes(null); setEditingRes(null); setContacts([]);}}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium shadow-md hover:shadow-lg"
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
  const filteredBuildings = filterBuildings(buildings, searchTerm);

  // קיבוץ בניינים לפי אזור, רחוב ומספר
  const groupedBuildingsByArea = filteredBuildings.reduce((acc, building) => {
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
    <section className="mt-4 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md">
          <Building2 size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">בניינים ודיירים</h2>
          <p className="text-gray-600 font-medium text-sm md:text-base">ניהול מידע על בניינים ודיירים</p>
        </div>
      </div>

      {/* שורת חיפוש */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="relative">
          <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="חפש בניין, דייר, טלפון, דירה..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            נמצאו {filteredBuildings.length} תוצאות עבור "{searchTerm}"
          </div>
        )}
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
              <select name="streetId" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm">
                <optgroup label="אזור 45">
                  {streets.filter(s=>s.area===45).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </optgroup>
                <optgroup label="אזור 14">
                  {streets.filter(s=>s.area===14).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </optgroup>
              </select>
            </div>
            <Field label="מס׳ בית" name="number" type="number" required/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="כניסה"  name="entrance" placeholder="א, ב, ג..."/>
            <Field label="קוד‑דלת" name="code" placeholder="1234"/>
          </div>
          <button className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg" type="submit">
            <Plus size={18} />
            הוסף בניין
          </button>
        </form>
      </div>

      {/* הצגת בניינים */}
      <div className="space-y-6">
        {sortedAreaGroups.map(areaGroup => (
          <div key={`area-${areaGroup.area}`} className="space-y-4">
            {/* כותרת אזור */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl font-bold">{areaGroup.area}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">אזור {areaGroup.area}</h2>
                  <p className="text-indigo-100">{areaGroup.sortedBuildings.length} בניינים</p>
                </div>
              </div>
            </div>

            {/* בניינים באזור - השתמש ב-grid למסכים גדולים */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {areaGroup.sortedBuildings.map(group => {
                const groupKey = `${group.streetName}-${group.number}`;
                const isExpanded = shouldAutoExpand || expandedBuildings.has(groupKey);
                
                return (
                  <div key={groupKey} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin size={20} className="text-blue-600" />
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{group.streetName} {group.number}</h3>
                            <p className="text-sm text-gray-600">{group.buildings.length} כניסות</p>
                          </div>
                        </div>
                        {!shouldAutoExpand && (
                          <button
                            onClick={() => toggleBuilding(groupKey)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-4 space-y-4">
                        {group.buildings.map(b => {
                          const apartmentGroups = groupResidentsByApartment(b.residents);
                          const apartmentCount = Object.keys(apartmentGroups).length;
                          
                          return (
                            <div key={b.id} className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                              {/* כותרת הכניסה */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                    <span className="text-white font-bold text-sm">
                                      {b.entrance || 'א'}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-base text-gray-800">
                                      כניסה {b.entrance || 'ראשית'}
                                    </h4>
                                    {b.code && (
                                      <p className="text-xs text-gray-600 flex items-center gap-1">
                                        <Key size={12} className="text-yellow-500" />
                                        קוד: <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded">{b.code}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button 
                                    className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg" 
                                    onClick={()=>setAddingRes(b)}
                                    title="הוסף דייר"
                                  >
                                    <UserPlus size={14} />
                                  </button>
                                  <button 
                                    className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg" 
                                    onClick={()=>setEditingB(b)}
                                    title="עריכת בניין"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    className="p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                    onClick={() => {
                                      if (window.confirm("בטוח למחוק כניסה זו?")) {
                                        deleteBuilding(b.id);
                                      }
                                    }}
                                    title="מחיקת כניסה"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* סטטיסטיקות */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="text-center p-2 bg-white rounded-lg border shadow-sm">
                                  <div className="text-base font-bold text-blue-600">{b.residents.length}</div>
                                  <div className="text-xs text-gray-600">דיירים</div>
                                </div>
                                <div className="text-center p-2 bg-white rounded-lg border shadow-sm">
                                  <div className="text-base font-bold text-green-600">{apartmentCount}</div>
                                  <div className="text-xs text-gray-600">דירות</div>
                                </div>
                              </div>

                              {/* דירות ודיירים */}
                              {apartmentCount > 0 && (
                                <div className="space-y-3">
                                  {Object.entries(apartmentGroups)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([apartment, residents]) => (
                                    <div key={apartment} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="font-bold text-gray-800 flex items-center gap-2">
                                          <Home size={16} className="text-gray-500" />
                                          דירה {apartment}
                                        </div>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                          {residents.length} דיירים
                                        </span>
                                      </div>
                                      <div className="space-y-3">
                                        {residents.map(r => (
                                          <div key={r.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                  {r.isPrimary && <Crown size={14} className="text-yellow-500 flex-shrink-0" />}
                                                  <div className={`font-medium text-base ${r.isPrimary ? "text-gray-900" : "text-gray-700"}`}>
                                                    {r.fullName}
                                                  </div>
                                                </div>
                                                
                                                {r.phone && (
                                                  <div className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                                                    <Phone size={12} />
                                                    <span>{r.phone}</span>
                                                  </div>
                                                )}
                                                
                                                {r.relationship && (
                                                  <div className="mb-2">
                                                    <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                                                      {r.relationship}
                                                    </span>
                                                  </div>
                                                )}
                                                
                                                {/* הרשאות בולטות */}
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                  {r.allowMailbox ? (
                                                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-lg border border-green-300 shadow-sm">
                                                      <Mail size={14} />
                                                      <span className="font-medium text-sm">מאשר תיבה</span>
                                                    </div>
                                                  ) : (
                                                    <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1.5 rounded-lg border border-red-300 shadow-sm">
                                                      <X size={14} />
                                                      <span className="font-medium text-sm">לא מאשר תיבה</span>
                                                    </div>
                                                  )}
                                                  
                                                  {r.allowDoor ? (
                                                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-300 shadow-sm">
                                                      <DoorOpen size={14} />
                                                      <span className="font-medium text-sm">מאשר דלת</span>
                                                    </div>
                                                  ) : (
                                                    <div className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg border border-gray-300 shadow-sm">
                                                      <X size={14} />
                                                      <span className="font-medium text-sm">לא מאשר דלת</span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              <div className="flex gap-1 flex-shrink-0 ml-3">
                                                <button 
                                                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" 
                                                  onClick={()=>setEditingRes({b,r})}
                                                  title="עריכת דייר"
                                                >
                                                  <Edit size={14} />
                                                </button>
                                                <button
                                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                  onClick={() => {
                                                    if (window.confirm("בטוח למחוק דייר זה?")) {
                                                      deleteResident(b.id, r.id);
                                                    }
                                                  }}
                                                  title="מחיקת דייר"
                                                >
                                                  <Trash2 size={14} />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {apartmentCount === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                  <Users size={24} className="mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">אין דיירים רשומים</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

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
              className="p-6 space-y-4">
              <Field label="כניסה" name="entrance" defaultValue={editingB.entrance} placeholder="א, ב, ג..."/>
              <Field label="קוד‑דלת" name="code" defaultValue={editingB.code} placeholder="1234"/>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg" type="submit">שמור</button>
                <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-colors font-medium shadow-md hover:shadow-lg" type="button" onClick={()=>setEditingB(null)}>בטל</button>
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