import { useState } from "react";
import { nanoid } from "nanoid";
import { useBuildings } from "../hooks/useBuildings";
import { streets } from "../data/streets";
import { Building, Resident, Contact } from "../types";
import LoadingSpinner from "./LoadingSpinner";
import BuildingEntranceManager from "./BuildingEntranceManager";
import { Home, Users, Plus, Edit, Trash2, Building2, UserPlus, Phone, Crown, MapPin, User, X } from "lucide-react";

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

  /*‑‑‑ בניין חדש ‑‑‑*/
  function submitBuilding(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const f=e.currentTarget as any;
    const streetId=f.streetId.value;
    const number=+f.number.value;
    const entrance=f.entrance.value.trim();
    const code=f.code.value.trim();

    addBuilding({id:`${streetId}-${number}${entrance}`,streetId,number,
      entrance:entrance||undefined,code:code||undefined,residents:[], entrances: []});
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
        relationship: f.relationship.value.trim() || null
      };
      
      // אם זה דייר ראשי חדש, צריך לעדכן את הדיירים הקיימים בדירה
      if (r.isPrimary && existingResidentsInApartment.length > 0) {
        existingResidentsInApartment.forEach(existingResident => {
          updateResident(b.id, existingResident.id, { isPrimary: false });
        });
      }
      
      if(isEdit) updateResident(b.id,res!.id,r); else addResident(b.id,r);
      setAddingRes(null); setEditingRes(null); setSelectedApartment(""); setContacts([]);
    }
    
    return(
      <div className="bg-white border border-gray-200 rounded-xl p-6 mt-4 shadow-lg">
        <h4 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <Users size={20} className="text-blue-500" />
          {isEdit ? "עריכת דייר" : "דייר חדש"}
          <span className="text-sm font-normal text-gray-600">
            - {getStreetName(b.streetId)} {b.number}
          </span>
        </h4>
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
            
            <Field label="טלפון ראשי" name="phone" defaultValue={res?.phone} placeholder="050-1234567"/>
            <Field label="טלפונים נוספים (פסיקים)" name="familyPhones"
                   defaultValue={res?.familyPhones?.join(", ")} placeholder="052-1111111, 03-1234567"/>
            
            <Field label="קשר משפחתי" name="relationship" defaultValue={res?.relationship} placeholder="בעל הבית, בן, בת, וכו'"/>
          </div>
          
          <div className="mt-6">
            <ContactsManager contacts={contacts} onChange={setContacts} />
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
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
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors" type="submit">
              {isEdit?"עדכן":"הוסף"}
            </button>
            <button 
              type="button" 
              onClick={() => {setAddingRes(null); setEditingRes(null); setSelectedApartment(""); setContacts([]);}}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              בטל
            </button>
          </div>
        </form>
      </div>
    );
  }

  /*‑‑‑ קיבוץ בניינים לפי רחוב ומיון זוגי/אי‑זוגי ‑‑‑*/
  const grouped = streets.map(st=>({
    st, houses:buildings.filter(b=>b.streetId===st.id).sort((a,b)=>a.number-b.number)
  })).filter(g=>g.houses.length);

  // קיבוץ דיירים לפי דירות
  const groupResidentsByApartment = (residents: Resident[]) => {
    const grouped = residents.reduce((acc, resident) => {
      if (!acc[resident.apartment]) {
        acc[resident.apartment] = [];
      }
      acc[resident.apartment].push(resident);
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

  return(
    <section className="mt-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500 rounded-lg">
          <Building2 size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">בניינים ודיירים</h2>
          <p className="text-gray-600">ניהול מידע על בניינים, כניסות ותיבות דואר</p>
        </div>
      </div>

      {/* טופס בניין חדש */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-lg">
        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-blue-500" />
          הוספת בניין חדש
        </h3>
        <form onSubmit={submitBuilding} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">רחוב / מקטע</span>
            <select name="streetId" className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <optgroup label="אזור 45">
                {streets.filter(s=>s.area===45).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </optgroup>
              <optgroup label="אזור 14">
                {streets.filter(s=>s.area===14).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </optgroup>
            </select>
          </label>
          <Field label="מס׳ בית" name="number" type="number"/>
          <Field label="כניסה"  name="entrance"/>
          <Field label="קוד‑דלת" name="code"/>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2" type="submit">
            <Plus size={16} />
            הוסף בניין
          </button>
        </form>
      </div>

      {/* הצגת רחובות ↓ */}
      <div className="space-y-4">
        {grouped.map(g=>(
          <div key={g.st.id} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <MapPin size={20} className="text-gray-600" />
                {g.st.name} ({g.houses.length} בניינים)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right p-3 font-semibold text-gray-700">בית</th>
                    <th className="text-right p-3 font-semibold text-gray-700">כניסה</th>
                    <th className="text-right p-3 font-semibold text-gray-700">קוד</th>
                    <th className="text-right p-3 font-semibold text-gray-700">דיירים</th>
                    <th className="text-right p-3 font-semibold text-gray-700">דירות</th>
                    <th className="text-right p-3 font-semibold text-gray-700">כניסות</th>
                    <th className="text-right p-3 font-semibold text-gray-700">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {g.houses.map(b=>{
                    const apartmentCount = new Set(b.residents.map(r => r.apartment)).size;
                    return (
                      <tr key={b.id} className={`hover:bg-gray-50 transition-colors ${b.number%2===0?"bg-blue-25":""}`}>
                        <td className="p-3 text-center font-medium">{b.number}</td>
                        <td className="p-3 text-center">{b.entrance||"—"}</td>
                        <td className="p-3 text-center">{b.code||"—"}</td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {b.residents.length}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {apartmentCount}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {b.entrances?.length || 0}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 justify-center">
                            <button 
                              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors" 
                              onClick={()=>setAddingRes(b)}
                              title="הוסף דייר"
                            >
                              <UserPlus size={14} />
                            </button>
                            <button 
                              className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors" 
                              onClick={()=>setManagingEntrances(b)}
                              title="ניהול כניסות"
                            >
                              <Building2 size={14} />
                            </button>
                            <button 
                              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors" 
                              onClick={()=>setEditingB(b)}
                              title="עריכת בניין"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* עריכת בניין */}
      {editingB && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-lg font-bold text-gray-800">עריכת בניין</h4>
              <p className="text-sm text-gray-600">{getStreetName(editingB.streetId)} {editingB.number}</p>
            </div>
            <form onSubmit={e=>{e.preventDefault();
                const f=e.currentTarget as any;
                updateBuilding(editingB.id,{entrance:f.entrance.value.trim()||undefined,code:f.code.value.trim()||undefined});
                setEditingB(null);
              }}
              className="p-6">
              <div className="space-y-4">
                <Field label="כניסה" name="entrance" defaultValue={editingB.entrance}/>
                <Field label="קוד‑דלת" name="code" defaultValue={editingB.code}/>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors" type="submit">שמור</button>
                <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors" type="button" onClick={()=>setEditingB(null)}>בטל</button>
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
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">ניהול כניסות ותיבות</h3>
                <p className="text-sm text-gray-600">{getStreetName(managingEntrances.streetId)} {managingEntrances.number}</p>
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

      {/* דיירים לכל בניין - מקובצים לפי דירות */}
      {buildings.map(b => {
        const apartmentGroups = groupResidentsByApartment(b.residents);
        const apartmentCount = Object.keys(apartmentGroups).length;
        
        if (apartmentCount === 0) return null;
        
        return (
          <div key={b.id+"-res"} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden mt-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-gray-200">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Users size={20} className="text-green-600" />
                {getStreetName(b.streetId)} {b.number}{b.entrance&&` ${b.entrance}`} – {apartmentCount} דירות, {b.residents.length} דיירים
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              {Object.entries(apartmentGroups).sort(([a], [b]) => a.localeCompare(b)).map(([apartment, residents]) => (
                <div key={apartment} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Home size={16} className="text-gray-600" />
                      דירה {apartment} ({residents.length} דיירים)
                    </h4>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {residents.map(r => (
                      <div key={r.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {r.isPrimary && (
                                <Crown size={16} className="text-yellow-500" title="דייר ראשי" />
                              )}
                              <span className="font-medium text-gray-800">{r.fullName}</span>
                              {r.relationship && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {r.relationship}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <button 
                              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors" 
                              onClick={()=>setEditingRes({b,r})}
                              title="עריכת דייר"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
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
                        
                        <div className="mt-3 space-y-2">
                          {/* טלפון ראשי */}
                          {r.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone size={14} className="text-green-500" />
                              <span className="font-medium text-gray-700">טלפון ראשי:</span>
                              <span className="text-gray-600">{r.phone}</span>
                            </div>
                          )}
                          
                          {/* טלפונים נוספים */}
                          {r.familyPhones && r.familyPhones.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone size={14} className="text-blue-500" />
                              <span className="font-medium text-gray-700">טלפונים נוספים:</span>
                              <span className="text-gray-600">{r.familyPhones.join(", ")}</span>
                            </div>
                          )}
                          
                          {/* אנשי קשר */}
                          {r.contacts && r.contacts.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <User size={14} className="text-purple-500" />
                                אנשי קשר:
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {r.contacts.map(contact => (
                                  <div key={contact.id} className="bg-gray-50 p-2 rounded-lg border">
                                    <div className="font-medium text-sm text-gray-800">{contact.name}</div>
                                    <div className="text-xs text-gray-600 flex items-center gap-2">
                                      <Phone size={10} />
                                      {contact.phone}
                                      {contact.relationship && (
                                        <span className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded text-xs">
                                          {contact.relationship}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 mt-3">
                            {r.allowMailbox && (
                              <div className="flex items-center gap-1 text-green-600">
                                <span className="text-xs">✓ תיבה</span>
                              </div>
                            )}
                            {r.allowDoor && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <span className="text-xs">✓ דלת</span>
                              </div>
                            )}
                          </div>
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