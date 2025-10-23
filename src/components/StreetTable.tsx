import { Street } from "../types";
import StreetRow from "./StreetRow";
import { useState } from "react";
import { Filter, SortAsc, SortDesc, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function StreetTable({
  list,
  onDone,
  onStartTimer,
  getStreetUrgencyLevel,
  getUrgencyColor,
  getUrgencyLabel,
}: {
  list: Street[];
  onDone: (id: string) => void;
  onStartTimer?: (street: Street) => void;
  getStreetUrgencyLevel?: (street: Street) => string;
  getUrgencyColor?: (urgencyLevel: string) => string;
  getUrgencyLabel?: (urgencyLevel: string) => string;
}) {
  const [sortBy, setSortBy] = useState<'name' | 'days' | 'type' | 'time'>('days');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);
  
  // מיון הרשימה
  const sortedList = [...list].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'days':
        const aDays = a.lastDelivered ? 
          Math.floor((Date.now() - new Date(a.lastDelivered).getTime()) / (1000 * 60 * 60 * 24)) : 999;
        const bDays = b.lastDelivered ? 
          Math.floor((Date.now() - new Date(b.lastDelivered).getTime()) / (1000 * 60 * 60 * 24)) : 999;
        comparison = bDays - aDays;
        break;
      case 'type':
        comparison = a.isBig === b.isBig ? 0 : (a.isBig ? -1 : 1);
        break;
      case 'time':
        const aTime = a.averageTime || 0;
        const bTime = b.averageTime || 0;
        comparison = bTime - aTime;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // סינון רק רחובות דחופים
  const filteredList = showOnlyUrgent ? 
    sortedList.filter(s => {
      if (!s.lastDelivered) return true;
      const days = Math.floor((Date.now() - new Date(s.lastDelivered).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 10;
    }) : sortedList;
  
  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };

  return (
    <div className="street-table-container">
      {/* כלי מיון וסינון */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">מיון לפי:</span>
            <div className="flex gap-2">
              {[
                { key: 'days', label: 'ימים' },
                { key: 'name', label: 'שם' },
                { key: 'type', label: 'סוג' },
                { key: 'time', label: 'זמן' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleSort(key as typeof sortBy)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                  {getSortIcon(key as typeof sortBy)}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => setShowOnlyUrgent(!showOnlyUrgent)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showOnlyUrgent
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showOnlyUrgent ? <Eye size={14} /> : <EyeOff size={14} />}
            {showOnlyUrgent ? 'הצג הכל' : 'רק דחופים'}
            {showOnlyUrgent && (
              <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                {filteredList.length}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* תצוגת טבלה למסכים גדולים */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
        <thead>
          <tr>
            <th 
              className="text-right py-2 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSort('name')}
            >
              <div className="flex items-center gap-1">
                רחוב
                {getSortIcon('name')}
              </div>
            </th>
            <th 
              className="text-center py-2 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSort('type')}
            >
              <div className="flex items-center justify-center gap-1">
                סוג
                {getSortIcon('type')}
              </div>
            </th>
            <th 
              className="text-center py-2 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSort('days')}
            >
              <div className="flex items-center justify-center gap-1">
                ימים מאז
                {getSortIcon('days')}
              </div>
            </th>
            <th 
              className="text-center py-2 px-3 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSort('time')}
            >
              <div className="flex items-center justify-center gap-1">
                זמן ממוצע
                {getSortIcon('time')}
              </div>
            </th>
            <th className="text-center py-2 px-3 font-semibold text-gray-700">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.map((s) => (
            <StreetRow 
              key={s.id} 
              s={s} 
              onDone={onDone} 
              onStartTimer={onStartTimer}
              getStreetUrgencyLevel={getStreetUrgencyLevel}
              getUrgencyColor={getUrgencyColor}
              getUrgencyLabel={getUrgencyLabel}
            />
          ))}
        </tbody>
        </table>
      </div>

      {/* תצוגת כרטיסים למובייל */}
      <div className="md:hidden space-y-3">
        {filteredList.map((s) => {
          const urgencyLevel = getStreetUrgencyLevel ? getStreetUrgencyLevel(s) : 'normal';
          const urgencyColor = getUrgencyColor ? getUrgencyColor(urgencyLevel) : 'bg-white border-gray-200';
          const urgencyLabel = getUrgencyLabel ? getUrgencyLabel(s) : '';
          const daysSince = s.lastDelivered ?
            Math.floor((Date.now() - new Date(s.lastDelivered).getTime()) / (1000 * 60 * 60 * 24)) : 999;

          return (
            <div key={s.id} className={`mobile-street-card ${urgencyColor} transition-all duration-300`}>
              <div className="mobile-street-header">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{s.name}</h3>
                  {urgencyLabel && (
                    <span className="text-xs font-medium text-gray-600">{urgencyLabel}</span>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  s.isBig ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {s.isBig ? 'גדול' : 'קטן'}
                </span>
              </div>

              <div className="mobile-street-info">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ימים מאז:</span>
                  <span className="font-semibold">
                    {s.lastDelivered ? `${daysSince} ימים` : 'לא חולק מעולם'}
                  </span>
                </div>
                {s.averageTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">זמן ממוצע:</span>
                    <span className="font-semibold">{s.averageTime} דקות</span>
                  </div>
                )}
                {s.lastDelivered && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">חולק לאחרונה:</span>
                    <span className="font-medium text-xs">
                      {new Date(s.lastDelivered).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                )}
              </div>

              <div className="mobile-street-actions">
                <button
                  onClick={() => onDone(s.id)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors touch-target"
                >
                  סמן כחולק
                </button>
                {onStartTimer && (
                  <button
                    onClick={() => onStartTimer(s)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors touch-target"
                  >
                    ⏱️
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredList.length === 0 && showOnlyUrgent && (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-medium mb-2">אין רחובות דחופים!</h4>
          <p className="text-sm">כל הרחובות חולקו לאחרונה</p>
        </div>
      )}
    </div>
  );
}