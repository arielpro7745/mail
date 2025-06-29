import { BarChart3, Building2, CheckSquare, FileText, Phone, Settings } from "lucide-react";

interface Props{current:string;setTab:(t:string)=>void;}

export default function TabBar({current,setTab}:Props){
  const tabs=[
    {id:"regular",label:"חלוקה רגילה", icon: CheckSquare},
    {id:"buildings",label:"בניינים ודיירים", icon: Building2},
    {id:"tasks",label:"משימות", icon: CheckSquare},
    {id:"reports",label:"דוחות", icon: BarChart3},
    {id:"phones",label:"טלפונים", icon: Phone},
    {id:"export",label:"ייצוא נתונים", icon: FileText}
  ];
  
  return(
    <nav className="flex gap-1 border-b mb-4 overflow-x-auto">
      {tabs.map(t=>{
        const Icon = t.icon;
        return (
          <button key={t.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-t whitespace-nowrap transition-colors ${
              current===t.id
                ? "bg-indigo-600 text-white shadow-md" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            onClick={()=>setTab(t.id)}>
            <Icon size={16} />
            <span className="text-sm font-medium">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}