import { Street } from "../types";
import { useHolidayMode } from "../hooks/useHolidayMode";
import StreetRow from "./StreetRow";
import { Calendar, Clock, Zap, AlertTriangle } from "lucide-react";

interface Props {
  list: Street[];
  onDone: (id: string) => void;
  onStartTimer?: (street: Street) => void;
  getStreetUrgencyLevel?: (street: Street) => string;
  getUrgencyColor?: (urgencyLevel: string) => string;
  getUrgencyLabel?: (urgencyLevel: string) => string;
}

export default function HolidayAdjustedStreetTable(props: Props) {
  const { currentHoliday, isPreHoliday, daysUntilHoliday } = useHolidayMode();

  // אם לא בתקופת חג, הצג טבלה רגילה
  if (!currentHoliday) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">רחוב</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">סוג</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">ימים מאז</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">זמן ממוצע</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {props.list.map((s) => (
              <StreetRow 
                key={s.id} 
                s={s} 
                onDone={props.onDone} 
                onStartTimer={props.onStartTimer}
                getStreetUrgencyLevel={props.getStreetUrgencyLevel}
                getUrgencyColor={props.getUrgencyColor}
                getUrgencyLabel={props.getUrgencyLabel}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // חישוב זמן משוער מותאם לחג
  const getHolidayAdjustedTime = (street: Street) => {
    const baseTime = street.averageTime || (street.isBig ? 45 : 25);
    
    // הכפלת זמן לפי עומס החג
    const multiplier = currentHoliday.estimatedVolume === 'extreme' ? 2.5 :
                     currentHoliday.estimatedVolume === 'high' ? 2.0 :
                     currentHoliday.estimatedVolume === 'medium' ? 1.5 : 1.0;
    
    return Math.round(baseTime * multiplier);
  };

  // קבלת עדיפות מותאמת לחג
  const getHolidayPriority = (street: Street) => {
    const normalUrgency = props.getStreetUrgencyLevel ? props.getStreetUrgencyLevel(street) : 'normal';
    
    // אם אנחנו קרוב לחג (3 ימים או פחות), הכל נהיה דחוף יותר
    if (isPreHoliday && daysUntilHoliday && daysUntilHoliday <= 3) {
      if (normalUrgency === 'normal') return 'warning';
      if (normalUrgency === 'warning') return 'urgent';
      if (normalUrgency === 'urgent') return 'critical';
    }
    
    return normalUrgency;
  };

  return (
    <div>
      {/* הודעת מצב חג */}
      <div className={`p-4 rounded-xl mb-4 ${
        isPreHoliday 
          ? daysUntilHoliday && daysUntilHoliday <= 3
            ? 'bg-red-50 border border-red-300'
            : 'bg-orange-50 border border-orange-300'
          : 'bg-blue-50 border border-blue-300'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isPreHoliday 
              ? daysUntilHoliday && daysUntilHoliday <= 3
                ? 'bg-red-500'
                : 'bg-orange-500'
              : 'bg-blue-500'
          }`}>
            {isPreHoliday ? (
              daysUntilHoliday && daysUntilHoliday <= 3 ? 
                <AlertTriangle size={20} className="text-white animate-pulse" /> :
                <Clock size={20} className="text-white" />
            ) : (
              <Calendar size={20} className="text-white" />
            )}
          </div>
          <div className="flex-1">
            <h4 className={`font-bold ${
              isPreHoliday 
                ? daysUntilHoliday && daysUntilHoliday <= 3
                  ? 'text-red-800'
                  : 'text-orange-800'
                : 'text-blue-800'
            }`}>
              {isPreHoliday 
                ? `הכנה ל${currentHoliday.name} - עוד ${daysUntilHoliday} ימים`
                : `תקופת ${currentHoliday.name} פעילה`
              }
            </h4>
            <p className={`text-sm ${
              isPreHoliday 
                ? daysUntilHoliday && daysUntilHoliday <= 3
                  ? 'text-red-700'
                  : 'text-orange-700'
                : 'text-blue-700'
            }`}>
              זמני חלוקה מותאמים לעומס החג (x{
                currentHoliday.estimatedVolume === 'extreme' ? '2.5' :
                currentHoliday.estimatedVolume === 'high' ? '2.0' :
                currentHoliday.estimatedVolume === 'medium' ? '1.5' : '1.0'
              })
            </p>
          </div>
          <div className="text-center">
            <div className="text-lg">
              {currentHoliday.estimatedVolume === 'extreme' ? '🔥' :
               currentHoliday.estimatedVolume === 'high' ? '⚡' :
               currentHoliday.estimatedVolume === 'medium' ? '📊' : '✅'}
            </div>
            <div className="text-xs text-gray-600">
              עומס {currentHoliday.estimatedVolume === 'extreme' ? 'קיצוני' :
                     currentHoliday.estimatedVolume === 'high' ? 'גבוה' :
                     currentHoliday.estimatedVolume === 'medium' ? 'בינוני' : 'נמוך'}
            </div>
          </div>
        </div>
      </div>

      {/* טבלה מותאמת */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={isPreHoliday ? 'bg-orange-50' : 'bg-blue-50'}>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">רחוב</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">סוג</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">ימים מאז</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">
                <div className="flex items-center justify-center gap-1">
                  זמן מותאם לחג
                  <Zap size={14} className="text-yellow-500" />
                </div>
              </th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {props.list.map((s) => {
              const adjustedTime = getHolidayAdjustedTime(s);
              const holidayPriority = getHolidayPriority(s);
              
              return (
                <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${
                  holidayPriority === 'critical' ? 'bg-red-50' :
                  holidayPriority === 'urgent' ? 'bg-orange-50' :
                  holidayPriority === 'warning' ? 'bg-yellow-50' : ''
                }`}>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      {holidayPriority === 'critical' && (
                        <AlertTriangle size={16} className="text-red-600 animate-pulse" />
                      )}
                      {holidayPriority === 'urgent' && (
                        <AlertTriangle size={14} className="text-orange-500" />
                      )}
                      <span>{s.name}</span>
                      {isPreHoliday && daysUntilHoliday && daysUntilHoliday <= 3 && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                          דחוף לחג!
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="text-center py-2 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.isBig 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {s.isBig ? "גדול" : "קטן"}
                    </span>
                  </td>
                  
                  <td className="text-center py-2 px-3">
                    <div className="flex flex-col items-center">
                      <span className={`font-medium ${
                        holidayPriority === 'critical' ? "text-red-600 font-bold" : 
                        holidayPriority === 'urgent' ? "text-orange-600 font-bold" : 
                        holidayPriority === 'warning' ? "text-yellow-600 font-bold" : 
                        "text-gray-700"
                      }`}>
                        {s.lastDelivered ? (
                          `${Math.floor((Date.now() - new Date(s.lastDelivered).getTime()) / (1000 * 60 * 60 * 24))} ימים`
                        ) : (
                          "לא חולק מעולם"
                        )}
                      </span>
                      {s.lastDelivered && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(s.lastDelivered).toLocaleDateString('he-IL')}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="text-center py-2 px-3">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-purple-600">
                        {adjustedTime} דק'
                      </span>
                      {s.averageTime && adjustedTime !== s.averageTime && (
                        <div className="text-xs text-gray-500">
                          (רגיל: {s.averageTime} דק')
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="text-center py-2 px-3">
                    <div className="flex gap-1 justify-center">
                      {props.onStartTimer && (
                        <button 
                          className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors" 
                          onClick={() => props.onStartTimer!(s)}
                          title="התחל מדידת זמן (מותאם לחג)"
                        >
                          <Clock size={14} />
                        </button>
                      )}
                      <button 
                        className={`p-1.5 text-white rounded-lg transition-colors ${
                          holidayPriority === 'critical' ? 'bg-red-500 hover:bg-red-600 animate-pulse' :
                          holidayPriority === 'urgent' ? 'bg-orange-500 hover:bg-orange-600' :
                          'bg-green-500 hover:bg-green-600'
                        }`}
                        onClick={() => props.onDone(s.id)}
                        title="סמן כחולק"
                      >
                        ✓
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* הסבר על השינויים */}
      {currentHoliday && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-purple-600" />
            <span className="font-semibold text-purple-800">התאמות לתקופת החג:</span>
          </div>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• זמני חלוקה הוכפלו לפי עומס החג</li>
            <li>• רחובות קרובים לחג מקבלים עדיפות גבוהה יותר</li>
            <li>• מומלץ להתחיל מוקדם יותר ולעבוד שעות נוספות</li>
            {isPreHoliday && daysUntilHoliday && daysUntilHoliday <= 7 && (
              <li className="font-semibold">• דחוף! עבור לטאב "חגים" לתכנון מפורט</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}