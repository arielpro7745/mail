import { BarChart3, Building2, CheckSquare, FileText, Phone, Settings, Brain, Trophy, BookOpen, MessageSquare, HelpCircle, Package } from "lucide-react";
import { MessageCircle, Calendar } from "lucide-react";

interface Props{current:string;setTab:(t:string)=>void;}

export default function TabBar({current,setTab}:Props){
  const tabs=[
    {id:"regular",label:"חלוקה רגילה", icon: CheckSquare},
    {id:"sorting",label:"מיון וחלוקה", icon: Package},
    {id:"buildings",label:"בניינים", icon: Building2},
    {id:"holidays",label:"חגים", icon: Calendar},
    {id:"tasks",label:"משימות", icon: CheckSquare},
    {id:"reports",label:"דוחות", icon: BarChart3},
    {id:"phones",label:"טלפונים", icon: Phone},
    {id:"ai",label:"AI וחיזוי", icon: Brain},
    {id:"gamification",label:"תחרות", icon: Trophy},
    {id:"journal",label:"יומן", icon: BookOpen},
    {id:"complaints",label:"תלונות", icon: MessageSquare},
    {id:"unknowns",label:"לא יודעים", icon: HelpCircle},
    {id:"export",label:"ייצוא", icon: FileText},
    {id:"whatsapp",label:"WhatsApp", icon: MessageCircle},
    {id:"advanced",label:"מתקדם", icon: Settings}
  ];
  
  return(
    <nav className="flex gap-1 border-b mb-4 overflow-x-auto">
      {tabs.map(t=>{
        const Icon = t.icon;
        return (
          <button key={t.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-t whitespace-nowrap transition-all duration-300 ease-in-out transform ${
              current===t.id
                ? "bg-indigo-600 text-white shadow-md scale-105"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-102"
            }`}
            onClick={()=>setTab(t.id)}>
            <Icon size={16} className={`transition-transform duration-300 ${current===t.id ? 'rotate-0' : ''}`} />
            <span className="text-sm font-medium">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}