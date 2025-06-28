import { useState } from "react";
import { nanoid } from "nanoid";
import { useBuildings } from "../hooks/useBuildings";
import { streets } from "../data/streets";
import { Building, Resident, Contact } from "../types";
import LoadingSpinner from "./LoadingSpinner";
import BuildingEntranceManager from "./BuildingEntranceManager";
import { Home, Users, Plus, Edit, Trash2, Building2, UserPlus, Phone, Crown, MapPin, User, X, DoorOpen } from "lucide-react";

/* רכיב אינפוט ממותג */
function Field({label, ...rest}:{label:string;name:string;type?:string;defaultValue?:string;placeholder?:string}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...rest}/>
    </label>
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
          className="text-xs px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1"
        >
          <Plus size={12} />
          הוסף איש קשר
        </button>
      </div>

      {contacts.map(contact => (
        <div key={contact.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
          <User size={16} className="text-gray-500" />
          <div className="flex-1">
            <div className="font-medium text-sm">{contact.name}</div>
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <Phone size={12} />
              {contact.phone}
              {contact.relationship && (
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                  {contact.relationship}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setEditingContact(contact)}
              className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
            >
              <Edit size={12} />
            </button>
            <button
              type="button"
              onClick={() => deleteContact(contact.id)}
              className="p-1 text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}

      {editingContact && (
        <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
          <h5 className="font-medium text-gray-800 mb-3">עריכת איש קשר</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="שם מלא"
              value={editingContact.name}
              onChange={(e) => setEditingContact({...editingContact, name: e.target.value})}
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder="טלפון"
              value={editingContact.phone}
              onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})}
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="קשר משפחתי"
              value={editingContact.relationship || ""}
              onChange={(e) => setEditingContact({...editingContact, relationship: e.target.value})}
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => saveContact(editingContact)}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
            >
              שמור
            </button>
            <button
              type="button"
              onClick={() => setEditingContact(null)}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
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
  const [managingEntrances, setManagingEntrances] = useState<Building|null>(null);
  const [selectedApartment, setSelectedApartment] = useState<string>("");

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
    const [selectedEntrance, setSelectedEntrance] = useState<string>(res?.entranceId || "");
    
    // קבלת דירות קיימות בבניין
    const existingApartments = [...new Set(b.residents.map(r => r.apartment))].sort();
    
    // קבלת כניסות זמינות בבניין
    const availableEntrances = b.entrances || [];
    
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
        entranceId: selectedEntrance || null
      };
      
      // אם זה דייר ראשי חדש, צריך לעדכן את הדיירים הקיימים בדירה
      if (r.isPrimary && existingResidentsInApartment.length > 0) {
        existingResidentsInApartment.forEach(existingResident => {
          updateResident(b.id, existingResident.id, { isPrimary: false });
        });
      }
      
      if(isEdit) updateResident(b.id,res!.id,r); else addResident(b.id,r);
      setAddingRes(null); setEditingRes(null); setSelectedApartment(""); setContacts([]); setSelectedEntrance("");
    }
    
    return(
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mt-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h4 className="font-bold text-xl text-gray-800">
                {isEdit ? "עריכת דייר" : "דייר חדש"}
              </h4>
              <p className="text-sm text-gray-600 font-medium">
                {getFullAddress(b)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {setAddingRes(null); setEditingRes(null); setSelectedApartment(""); setContacts([]); setSelectedEntrance("");}}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="שם מלא" name="fullName" defaultValue={res?.fullName} placeholder="ישראל ישראלי"/>
            
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">דירה</span>
              <div className="flex gap-2">
                <input 
                  name="apartment" 
                  defaultValue={res?.apartment || selectedApartment}
                  className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="מספר דירה"
                  list="apartments"
                />
                <datalist id="apartments">
                  {existingApartments.map(apt => (
                    <option key={apt} value={apt} />
                  ))}
                </datalist>
                {existingApartments.length > 0 && (
                  <select 
                    onChange={(e) => setSelectedApartment(e.target.value)}
                    className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue=""
                  >
                    <option value="">בחר דירה קיימת</option>
                    {existingApartments.map(apt => (
                      <option key={apt} value={apt}>{apt}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* בחירת כניסה */}
            {availableEntrances.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">כניסה</span>
                <select 
                  value={selectedEntrance}
                  onChange={(e) => setSelectedEntrance(e.target.value)}
                  className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">בחר כניסה (אופציונלי)</option>
                  {availableEntrances.map(entrance => (
                    <option key={entrance.id} value={entrance.id}>
                      {entrance.name}
                      {entrance.code && ` (קוד: ${entrance.code})`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  אם לא תבחר כניסה, הדייר יהיה משויך לבניין הכללי
                </p>
              </div>
            )}
            
            <Field label="טלפון ראשי" name="phone" defaultValue={res?.phone} placeholder="050-1234567"/>
            <Field label="טלפונים נוספים (פסיקים)" name="familyPhones"
                   defaultValue={res?.familyPhones?.join(", ")} placeholder="052-1111111, 03-1234567"/>
            
            <Field label="קשר משפחתי" name="relationship" defaultValue={res?.relationship} placeholder="בעל הבית, בן, בת, וכו'"/>
          </div>
          
          <div className="mt-6">
            <ContactsManager contacts={contacts} onChange={setContacts} />
          </div>
          
          <div className="flex flex-wrap gap-4 mt-6 p-4 bg-white rounded-lg border">
            <label className="flex gap-2 items-center">
              <input type="checkbox" name="allowMailbox" defaultChecked={res?.allowMailbox} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
              <span className="text-sm font-medium text-gray-700">מאשר תיבה</span>
            </label>
            <label className="flex gap-2 items-center">
              <input type="checkbox" name="allowDoor" defaultChecked={res?.allowDoor} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
              <span className="text-sm font-medium text-gray-700">מאשר דלת</span>
            </label>
            <label className="flex gap-2 items-center">
              <input type="checkbox" name="isPrimary" defaultChecked={res?.isPrimary} className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"/>
              <Crown size={16} className="text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">דייר ראשי</span>
            </label>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg" type="submit">
              {isEdit?"עדכן דייר":"הוסף דייר"}
            </button>
            <button 
              type="button" 
              onClick={() => {setAddingRes(null); setEditingRes(null); setSelectedApartment(""); setContacts([]); setSelectedEntrance("");}}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
            >
              בטל
            </button>
          </div>
        </form>
      </div>
    );
  }

  /*‑‑‑ קיבוץ בניינים לפי רחוב ומיון ‑‑‑*/
  const grouped = streets.map(st=>({
    st, 
    houses: buildings
      .filter(b=>b.streetId===st.id)
      .sort((a,b)=>{
        // מיון לפי מספר בית
        if (a.number !== b.number) return a.number - b.number;
        // אם אותו מספר, מיון לפי כניסה
        if (!a.entrance && !b.entrance) return 0;
        if (!a.entrance) return -1;
        if (!b.entrance) return 1;
        return a.entrance.localeCompare(b.entrance);
      })
  })).filter(g=>g.houses.length);

  // קיבוץ דיירים לפי דירות וכניסות
  const groupResidentsByApartmentAndEntrance = (residents: Resident[], building: Building) => {
    const grouped = residents.reduce((acc, resident) => {
      const key = `${resident.apartment}`;
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

  // פונקציה לקבלת שם הכניסה
  const getEntranceName = (building: Building, entranceId?: string | null) => {
    if (!entranceId) return null;
    const entrance = building.entrances?.find(e => e.id === entranceId);
    return entrance ? entrance.name : null;
  };

  return(
    <section className="mt-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md">
          <Building2 size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">בניינים ודיירים</h2>
          <p className="text-gray-600 font-medium">ניהול מידע על בניינים, כניסות ותיבות דואר</p>
        </div>
      </div>

      {/* טופס בניין חדש */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-lg">
        <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={24} className="text-blue-500" />
          הוספת בניין חדש
        </h3>
        <form onSubmit={submitBuilding} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">רחוב / מקטע</span>
            <select name="streetId" className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <optgroup label="אזור 45">
                {streets.filter(s=>s.area===45).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </optgroup>
              <optgroup label="אזור 14">
                {streets.filter(s=>s.area===14).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </optgroup>
            </select>
          </label>
          <Field label="מס׳ בית" name="number" type="number"/>
          <Field label="כניסה"  name="entrance" placeholder="א, ב, ג..."/>
          <Field label="קוד‑דלת" name="code" placeholder="1234"/>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-lg" type="submit">
            <Plus size={18} />
            הוסף בניין
          </button>
        </form>
      </div>

      {/* הצגת רחובות ובניינים */}
      <div className="space-y-6">
        {grouped.map(g=>(
          <div key={g.st.id} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-3">
                <MapPin size={24} className="text-blue-600" />
                {g.st.name}
                <span className="text-sm font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {g.houses.length} בניינים
                </span>
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {g.houses.map(b=>{
                  const apartmentCount = new Set(b.residents.map(r => r.apartment)).size;
                  const apartmentGroups = groupResidentsByApartmentAndEntrance(b.residents, b);
                  
                  return (
                    <div key={b.id} className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300">
                      {/* כותרת הבניין */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">{b.number}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-800">
                              בית {b.number}
                              {b.entrance && <span className="text-blue-600"> כניסה {b.entrance}</span>}
                            </h4>
                            {b.code && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <span>קוד: </span>
                                <span className="font-mono bg-gray-200 px-2 py-0.5 rounded">{b.code}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* סטטיסטיקות */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-2 bg-white rounded-lg border">
                          <div className="text-lg font-bold text-blue-600">{b.residents.length}</div>
                          <div className="text-xs text-gray-600">דיירים</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg border">
                          <div className="text-lg font-bold text-green-600">{apartmentCount}</div>
                          <div className="text-xs text-gray-600">דירות</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded-lg border">
                          <div className="text-lg font-bold text-purple-600">{b.entrances?.length || 0}</div>
                          <div className="text-xs text-gray-600">כניסות</div>
                        </div>
                      </div>

                      {/* דירות ודיירים */}
                      {apartmentCount > 0 && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-700 mb-2 text-sm">דירות ודיירים:</h5>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {Object.entries(apartmentGroups)
                              .sort(([a], [b]) => a.localeCompare(b))
                              .map(([apartment, residents]) => (
                              <div key={apartment} className="bg-white p-2 rounded-lg border text-xs">
                                <div className="font-medium text-gray-800 flex items-center gap-1 mb-1">
                                  <Home size={12} className="text-gray-500" />
                                  דירה {apartment} ({residents.length} דיירים)
                                </div>
                                <div className="space-y-1">
                                  {residents.map(r => (
                                    <div key={r.id} className="flex items-center gap-2 text-xs">
                                      {r.isPrimary && <Crown size={10} className="text-yellow-500" />}
                                      <span className={r.isPrimary ? "font-medium" : ""}>{r.fullName}</span>
                                      {getEntranceName(b, r.entranceId) && (
                                        <span className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded text-xs">
                                          {getEntranceName(b, r.entranceId)}
                                        </span>
                                      )}
                                      {r.phone && (
                                        <span className="text-gray-500 flex items-center gap-1">
                                          <Phone size={8} />
                                          {r.phone}
                                        </span>
                                      )}
                                      {r.allowDoor && <DoorOpen size={10} className="text-blue-500" title="מאשר דלת" />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* כפתורי פעולה */}
                      <div className="flex gap-2">
                        <button 
                          className="flex-1 p-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-1 text-sm font-medium shadow-md" 
                          onClick={()=>setAddingRes(b)}
                          title="הוסף דייר"
                        >
                          <UserPlus size={14} />
                          דייר
                        </button>
                        <button 
                          className="flex-1 p-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-1 text-sm font-medium shadow-md" 
                          onClick={()=>setManagingEntrances(b)}
                          title="ניהול כניסות"
                        >
                          <Building2 size={14} />
                          כניסות
                        </button>
                        <button 
                          className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg transition-all duration-200 shadow-md" 
                          onClick={()=>setEditingB(b)}
                          title="עריכת בניין"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 shadow-md"
                          onClick={() => {
                            if (window.confirm("בטוח למחוק בניין זה?")) {
                              deleteBuilding(b.id);
                            }
                          }}
                          title="מחיקת בניין"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* עריכת בניין */}
      {editingB && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <h4 className="text-xl font-bold text-gray-800">עריכת בניין</h4>
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

      {/* ניהול כניסות */}
      {managingEntrances && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-gray-800">ניהול כניסות ותיבות</h3>
                <p className="text-sm text-gray-600 mt-1">{getFullAddress(managingEntrances)}</p>
              </div>
              <button
                onClick={() => setManagingEntrances(null)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                סגור
              </button>
            </div>
            <div className="p-6">
              <BuildingEntranceManager
                building={managingEntrances}
                onUpdateBuilding={updateBuilding}
              />
            </div>
          </div>
        </div>
      )}

      {/* רשימת דיירים מפורטת לכל בניין */}
      {buildings.filter(b => b.residents.length > 0).map(b => {
        const apartmentGroups = groupResidentsByApartmentAndEntrance(b.residents, b);
        const apartmentCount = Object.keys(apartmentGroups).length;
        
        return (
          <div key={b.id+"-detailed"} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden mt-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-3">
                <Users size={24} className="text-green-600" />
                {getFullAddress(b)} – {apartmentCount} דירות, {b.residents.length} דיירים
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {Object.entries(apartmentGroups).sort(([a], [b]) => a.localeCompare(b)).map(([apartment, residents]) => (
                <div key={apartment} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-b border-gray-200">
                    <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                      <Home size={20} className="text-blue-600" />
                      דירה {apartment} ({residents.length} דיירים)
                    </h4>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {residents.map(r => (
                      <div key={r.id} className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {r.isPrimary && (
                                <Crown size={20} className="text-yellow-500" title="דייר ראשי" />
                              )}
                              <span className="font-bold text-lg text-gray-800">{r.fullName}</span>
                              {getEntranceName(b, r.entranceId) && (
                                <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full font-medium">
                                  {getEntranceName(b, r.entranceId)}
                                </span>
                              )}
                              {r.relationship && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                  {r.relationship}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg transition-all duration-200 shadow-md" 
                              onClick={()=>setEditingRes({b,r})}
                              title="עריכת דייר"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 shadow-md"
                              onClick={() => {
                                if (window.confirm("בטוח למחוק דייר זה?")) {
                                  deleteResident(b.id, r.id);
                                }
                              }}
                              title="מחיקת דייר"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* טלפונים */}
                          <div className="space-y-3">
                            {r.phone && (
                              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <Phone size={16} className="text-green-600" />
                                <div>
                                  <span className="font-medium text-gray-700">טלפון ראשי:</span>
                                  <span className="text-gray-800 mr-2">{r.phone}</span>
                                </div>
                              </div>
                            )}
                            
                            {r.familyPhones && r.familyPhones.length > 0 && (
                              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <Phone size={16} className="text-blue-600 mt-0.5" />
                                <div>
                                  <span className="font-medium text-gray-700 block">טלפונים נוספים:</span>
                                  <div className="text-gray-800 space-y-1">
                                    {r.familyPhones.map((phone, idx) => (
                                      <div key={idx}>{phone}</div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* אנשי קשר */}
                          {r.contacts && r.contacts.length > 0 && (
                            <div>
                              <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <User size={16} className="text-purple-500" />
                                אנשי קשר:
                              </h5>
                              <div className="space-y-2">
                                {r.contacts.map(contact => (
                                  <div key={contact.id} className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                    <div className="font-medium text-gray-800">{contact.name}</div>
                                    <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                      <Phone size={12} />
                                      {contact.phone}
                                      {contact.relationship && (
                                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                                          {contact.relationship}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* הרשאות */}
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200">
                          {r.allowMailbox && (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                              <span className="text-sm font-medium">✓ מאשר תיבה</span>
                            </div>
                          )}
                          {r.allowDoor && (
                            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                              <DoorOpen size={14} />
                              <span className="text-sm font-medium">מאשר דלת</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}