import { useEffect, useState } from "react";
import { Building, Resident } from "../types";
import { buildings as seed } from "../data/buildings";

const LS_KEY="post-buildings";

export function useBuildings(){
  const [data,setData]=useState<Building[]>(()=>{
    const raw=localStorage.getItem(LS_KEY);
    try{return raw?JSON.parse(raw):seed;}catch{return seed;}
  });

  useEffect(()=>localStorage.setItem(LS_KEY,JSON.stringify(data)),[data]);

  const addBuilding=(b:Building)=>setData(p=>[...p,b]);
  const updateBuilding=(id:string,patch:Partial<Building>)=>setData(p=>p.map(b=>b.id===id?{...b,...patch}:b));
  const deleteBuilding=(id:string)=>setData(p=>p.filter(b=>b.id!==id));

  const addResident=(bid:string,r:Resident)=>setData(p=>p.map(b=>b.id===bid?{...b,residents:[...b.residents,r]}:b));
  const updateResident=(bid:string,rid:string,patch:Partial<Resident>)=>setData(p=>p.map(b=>b.id===bid?{...b,residents:b.residents.map(r=>r.id===rid?{...r,...patch}:r)}:b));
  const deleteResident=(bid:string,rid:string)=>setData(p=>p.map(b=>b.id===bid?{...b,residents:b.residents.filter(r=>r.id!==rid)}:b));

  return {buildings:data,addBuilding,updateBuilding,deleteBuilding,addResident,updateResident,deleteResident};
}
