import { useState } from "react";
import {
  BarChart3, Building2, CheckSquare, FileText, Phone, Settings, Brain,
  Trophy, BookOpen, MessageSquare, HelpCircle, Package, MessageCircle,
  Calendar, ChevronDown, ChevronUp, Users
} from "lucide-react";

interface Props {
  current: string;
  setTab: (t: string) => void;
}

export default function TabBar({ current, setTab }: Props) {
  const [showMore, setShowMore] = useState(false);

  const mainTabs = [
    { id: "regular", label: "חלוקה", icon: CheckSquare, color: "indigo" },
    { id: "sorting", label: "מיון", icon: Package, color: "violet" },
    { id: "buildings", label: "בניינים", icon: Building2, color: "blue" },
    { id: "unknowns", label: "לא יודעים", icon: HelpCircle, color: "purple" },
    { id: "tasks", label: "משימות", icon: CheckSquare, color: "emerald" },
    { id: "reports", label: "דוחות", icon: BarChart3, color: "cyan" },
  ];

  const moreTabs = [
    { id: "holidays", label: "חגים", icon: Calendar, color: "orange" },
    { id: "phones", label: "טלפונים", icon: Phone, color: "green" },
    { id: "ai", label: "AI", icon: Brain, color: "pink" },
    { id: "gamification", label: "תחרות", icon: Trophy, color: "yellow" },
    { id: "journal", label: "יומן", icon: BookOpen, color: "slate" },
    { id: "complaints", label: "תלונות", icon: MessageSquare, color: "red" },
    { id: "export", label: "ייצוא", icon: FileText, color: "gray" },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "green" },
    { id: "advanced", label: "מתקדם", icon: Settings, color: "zinc" },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      const colors: Record<string, string> = {
        indigo: "bg-indigo-500 text-white shadow-indigo-500/30",
        violet: "bg-violet-500 text-white shadow-violet-500/30",
        blue: "bg-blue-500 text-white shadow-blue-500/30",
        purple: "bg-purple-500 text-white shadow-purple-500/30",
        emerald: "bg-emerald-500 text-white shadow-emerald-500/30",
        cyan: "bg-cyan-500 text-white shadow-cyan-500/30",
        orange: "bg-orange-500 text-white shadow-orange-500/30",
        green: "bg-green-500 text-white shadow-green-500/30",
        pink: "bg-pink-500 text-white shadow-pink-500/30",
        yellow: "bg-yellow-500 text-white shadow-yellow-500/30",
        slate: "bg-slate-500 text-white shadow-slate-500/30",
        red: "bg-red-500 text-white shadow-red-500/30",
        gray: "bg-gray-500 text-white shadow-gray-500/30",
        zinc: "bg-zinc-500 text-white shadow-zinc-500/30",
        teal: "bg-teal-500 text-white shadow-teal-500/30",
      };
      return colors[color] || colors.indigo;
    }
    return "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200";
  };

  const renderTab = (t: { id: string; label: string; icon: any; color: string }) => {
    const Icon = t.icon;
    const isActive = current === t.id;

    return (
      <button
        key={t.id}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap
          transition-all duration-300 ease-out font-medium text-sm
          ${isActive ? 'shadow-lg scale-[1.02]' : 'hover:scale-[1.01]'}
          ${getColorClasses(t.color, isActive)}
        `}
        onClick={() => setTab(t.id)}
      >
        <Icon size={18} className={isActive ? "animate-pulse" : ""} />
        <span>{t.label}</span>
      </button>
    );
  };

  const isMoreTabActive = moreTabs.some(t => t.id === current);

  return (
    <nav className="mb-6">
      {/* טאבים ראשיים */}
      <div className="flex flex-wrap gap-2 mb-3">
        {mainTabs.map(renderTab)}

        {/* כפתור עוד */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap
            transition-all duration-300 ease-out font-medium text-sm
            ${isMoreTabActive && !showMore
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }
          `}
        >
          <span>עוד</span>
          {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* טאבים נוספים */}
      {showMore && (
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-300">
          {moreTabs.map(renderTab)}
        </div>
      )}

      {/* אינדיקטור טאב נוכחי */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <span>
          עמוד נוכחי:{" "}
          <span className="font-semibold text-gray-700">
            {[...mainTabs, ...moreTabs].find(t => t.id === current)?.label || "חלוקה"}
          </span>
        </span>
      </div>
    </nav>
  );
}