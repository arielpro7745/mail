import { useState } from "react";
import { nanoid } from "nanoid";
import { useBuildings } from "../hooks/useBuildings";
import { streets } from "../data/streets";
import { Building, Resident } from "../types";

/* רכיב אינפוט ממותג */
function Field({label, ...rest}:{label:string;name:string;type?:string;defaultValue?:string}) {
  return (
    <label className="flex flex-col gap-1">
      {label}
      <input className="border p-1 rounded" {...rest}/>
    </label>
  );
}

export default function BuildingManager(){
  const {buildings,addBuilding,updateBuilding,deleteBuilding,
         addResident,updateResident,deleteResident}=useBuildings();

  /*‑‑‑ מצבי טפסים ‑‑‑*/
  const [editingB,setEditingB]=useState<Building|null>(null);
  const [addingRes,setAddingRes]=useState<Building|null>(null);
  const [editingRes,setEditingRes]=useState<{b:Building;r:Resident}|null>(null);

  /*‑‑‑ בניין חדש ‑‑‑*/
  function submitBuilding(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const f=e.currentTarget as any;
    const streetId=f.streetId.value;
    const number=+f.number.value;
    const entrance=f.entrance.value.trim();
    const code=f.code.value.trim();

    addBuilding({id:`${streetId}-${number}${entrance}`,streetId,number,
      entrance:entrance||undefined,code:code||undefined,residents:[]});
    f.reset();
  }

  /*‑‑‑ טופס דייר (חדש/עריכה) ‑‑‑*/
  function ResidentForm({b,res}:{b:Building;res?:Resident}){
    const isEdit=Boolean(res);
    function submit(e:React.FormEvent<HTMLFormElement>){
      e.preventDefault();
      const f=e.currentTarget as any;
      const r:Resident={
        id:res?.id||nanoid(6),
        fullName:f.fullName.value.trim(),
        apartment:f.apartment.value.trim(),
        phone:f.phone.value.trim()||undefined,
        familyPhones:f.familyPhones.value.split(",").map((s:string)=>s.trim()).filter(Boolean),
        allowMailbox:f.allowMailbox.checked,
        allowDoor:f.allowDoor.checked
      };
      if(isEdit) updateResident(b.id,res!.id,r); else addResident(b.id,r);
      setAddingRes(null); setEditingRes(null);
    }
    return(
      <form onSubmit={submit} className="border p-3 rounded mt-2">
        <div className="flex flex-wrap gap-3">
          <Field label="שם מלא" name="fullName" defaultValue={res?.fullName}/>
          <Field label="דירה" name="apartment" defaultValue={res?.apartment}/>
          <Field label="טלפון" name="phone" defaultValue={res?.phone}/>
          <Field label="טלפונים נוספים (פסיקים)" name="familyPhones"
                 defaultValue={res?.familyPhones?.join(", ")}/>
          <label className="flex gap-1 items-center">
            <input type="checkbox" name="allowMailbox" defaultChecked={res?.allowMailbox}/> מאשר תיבה
          </label>
          <label className="flex gap-1 items-center">
            <input type="checkbox" name="allowDoor" defaultChecked={res?.allowDoor}/> מאשר דלת
          </label>
          <button className="btn-sm" type="submit">{isEdit?"עדכן":"הוסף"}</button>
        </div>
      </form>
    );
  }

  /*‑‑‑ קיבוץ בניינים לפי רחוב ומיון זוגי/אי‑זוגי ‑‑‑*/
  const grouped = streets.map(st=>({
    st, houses:buildings.filter(b=>b.streetId===st.id).sort((a,b)=>a.number-b.number)
  })).filter(g=>g.houses.length);

  return(
    <section className="mt-4">
      <h2 className="text-lg font-semibold mb-4">בניינים ↠ דיירים</h2>

      {/* טופס בניין חדש */}
      <form onSubmit={submitBuilding} className="flex flex-wrap gap-2 items-end border p-3 rounded mb-6">
        <label className="flex flex-col gap-1">
          רחוב / מקטע
          <select name="streetId" className="border p-1 rounded">
            <optgroup label="אזור 45">
              {streets.filter(s=>s.area===45).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </optgroup>
            <optgroup label="אזור 14">
              {streets.filter(s=>s.area===14).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </optgroup>
          </select>
        </label>
        <Field label="מס׳ בית" name="number" type="number"/>
        <Field label="כניסה"  name="entrance"/>
        <Field label="קוד‑דלת" name="code"/>
        <button className="btn-sm" type="submit">הוסף בניין</button>
      </form>

      {/* הצגת רחובות ↓ */}
      {grouped.map(g=>(
        <details key={g.st.id} className="border rounded mb-4">
          <summary className="cursor-pointer p-2 bg-gray-100 select-none">
            {g.st.name} ({g.houses.length})
          </summary>
          <table className="w-full">
            <thead>
              <tr><th>בית</th><th>כניסה</th><th>קוד</th><th>דיירים (#)</th><th></th></tr>
            </thead>
            <tbody>
              {g.houses.map(b=>(
                <tr key={b.id} className={b.number%2===0?"bg-sky-50":undefined}>
                  <td className="text-center">{b.number}</td>
                  <td className="text-center">{b.entrance||"—"}</td>
                  <td className="text-center">{b.code||"—"}</td>
                  <td className="text-center">{b.residents.length}</td>
                  <td className="flex gap-1">
                    <button className="btn-sm" onClick={()=>setAddingRes(b)}>➕</button>
                    <button className="btn-sm" onClick={()=>setEditingB(b)}>✏️</button>
                    <button
                      className="btn-sm"
                      onClick={() => {
                        if (window.confirm("בטוח למחוק בניין זה?")) {
                          deleteBuilding(b.id);
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      ))}

      {/* עריכת בניין */}
      {editingB && (
        <form onSubmit={e=>{e.preventDefault();
            const f=e.currentTarget as any;
            updateBuilding(editingB.id,{entrance:f.entrance.value.trim()||undefined,code:f.code.value.trim()||undefined});
            setEditingB(null);
          }}
          className="border p-3 rounded mt-4 flex gap-2 items-end">
          <Field label="כניסה" name="entrance" defaultValue={editingB.entrance}/>
          <Field label="קוד‑דלת" name="code" defaultValue={editingB.code}/>
          <button className="btn-sm" type="submit">שמור</button>
          <button className="btn-sm" type="button" onClick={()=>setEditingB(null)}>בטל</button>
        </form>
      )}

      {/* דייר חדש */}
      {addingRes && (
        <ResidentForm b={addingRes}/>
      )}

      {/* עריכת דייר */}
      {editingRes && (
        <ResidentForm b={editingRes.b} res={editingRes.r}/>
      )}

      {/* דיירים לכל בניין */}
      {buildings.map(b=>b.residents.length && (
        <details key={b.id+"-res"} className="border rounded mt-4">
          <summary className="cursor-pointer p-2 bg-gray-50 select-none">
            {b.streetId} {b.number}{b.entrance&&` ${b.entrance}`} – דיירים ({b.residents.length})
          </summary>
          <table className="w-full">
            <thead>
              <tr><th>שם</th><th>דירה</th><th>טלפונים</th><th>תיבה</th><th>דלת</th><th></th></tr>
            </thead>
            <tbody>
              {b.residents.map(r=>(
                <tr key={r.id}>
                  <td>{r.fullName}</td>
                  <td className="text-center">{r.apartment}</td>
                  <td className="text-center">
                    {[r.phone,...(r.familyPhones||[])].filter(Boolean).join(", ")||"—"}
                  </td>
                  <td className="text-center">{r.allowMailbox?"✓":"—"}</td>
                  <td className="text-center">{r.allowDoor?"✓":"—"}</td>
                  <td className="flex gap-1">
                    <button className="btn-sm" onClick={()=>setEditingRes({b,r})}>✏️</button>
                    <button
                      className="btn-sm"
                      onClick={() => {
                        if (window.confirm("בטוח למחוק דייר זה?")) {
                          deleteResident(b.id, r.id);
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      ))}
    </section>
  );
}
