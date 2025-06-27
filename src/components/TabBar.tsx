interface Props{current:string;setTab:(t:string)=>void;}

export default function TabBar({current,setTab}:Props){
  const tabs=[{id:"regular",label:"חלוקה רגילה"},
              {id:"buildings",label:"בניינים ודיירים"}];
  return(
    <nav className="flex gap-2 border-b mb-4">
      {tabs.map(t=>(
        <button key={t.id}
          className={`px-3 py-2 rounded-t ${current===t.id?"bg-indigo-600 text-white":"bg-gray-100"}`}
          onClick={()=>setTab(t.id)}>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
