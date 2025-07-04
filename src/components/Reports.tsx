import { useState } from "react";
import { useReports } from "../hooks/useReports";
import { useDistribution } from "../hooks/useDistribution";
import { totalDaysBetween } from "../utils/dates";
import LoadingSpinner from "./LoadingSpinner";
import { 
  BarChart3, TrendingUp, AlertTriangle, Clock, 
  Calendar, Download, FileText, Users, MapPin,
  CheckCircle, XCircle, Target, History, Filter
} from "lucide-react";

export default function Reports() {
  const { reportData } = useReports();
  const { loading, allStreets } = useDistribution();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'recent' | 'old'>('all');
  const [areaFilter, setAreaFilter] = useState<'all' | '14' | '45'>('all');

  if (loading) return <LoadingSpinner />;

  const { undeliveredStreets, overdueStreets, performanceMetrics } = reportData;
  const today = new Date();

  // סינון רחובות שחולקו לפי תקופות ואזורים
  const getDeliveredStreets = () => {
    const deliveredStreets = allStreets
      .filter(s => s.lastDelivered)
      .filter(s => areaFilter === 'all' || s.area.toString() === areaFilter)
      .map(street => {
        const deliveryDate = new Date(street.lastDelivered!);
        const daysAgo = totalDaysBetween(deliveryDate, today);
        return {
          ...street,
          daysAgo,
          deliveryDate
        };
      })
      .sort((a, b) => b.deliveryDate.getTime() - a.deliveryDate.getTime());

    switch (deliveryFilter) {
      case 'recent':
        return deliveredStreets.filter(s => s.daysAgo <= 7);
      case 'old':
        return deliveredStreets.filter(s => s.daysAgo > 7);
      default:
        return deliveredStreets;
    }
  };

  const deliveredStreets = getDeliveredStreets();

  // פונקציה להורדת דוח
  const downloadReport = (type: 'undelivered' | 'performance' | 'overdue' | 'delivered') => {
    let content = '';
    let filename = '';

    switch (type) {
      case 'delivered':
        content = `דוח רחובות שחולקו - ${new Date().toLocaleDateString('he-IL')}\n\n`;
        content += 'רחוב\tאזור\tתאריך חלוקה\tימים מאז\tזמן ממוצע\tסוג\n';
        deliveredStreets.forEach(street => {
          content += `${street.name}\t${street.area}\t${street.deliveryDate.toLocaleDateString('he-IL')}\t${street.daysAgo}\t${street.averageTime || 0} דק׳\t${street.isBig ? 'גדול' : 'קטן'}\n`;
        });
        filename = `delivered-streets-${areaFilter !== 'all' ? `area-${areaFilter}-` : ''}${new Date().toISOString().split('T')[0]}.txt`;
        break;

      case 'undelivered':
        content = `דוח רחובות שלא חולקו - ${new Date().toLocaleDateString('he-IL')}\n\n`;
        content += 'רחוב\tימים מאז חלוקה\tרמת דחיפות\tזמן משוער\n';
        undeliveredStreets.forEach(item => {
          content += `${item.street.name}\t${item.daysSinceLastDelivery}\t${item.urgencyLevel}\t${item.estimatedTime} דק׳\n`;
        });
        filename = `undelivered-streets-${new Date().toISOString().split('T')[0]}.txt`;
        break;

      case 'overdue':
        content = `דוח רחובות באיחור - ${new Date().toLocaleDateString('he-IL')}\n\n`;
        content += 'רחוב\tימים מאז חלוקה\tסוג\n';
        overdueStreets.forEach(street => {
          const days = street.lastDelivered ? 
            Math.floor((Date.now() - new Date(street.lastDelivered).getTime()) / 86400000) : 999;
          content += `${street.name}\t${days}\t${street.isBig ? 'גדול' : 'קטן'}\n`;
        });
        filename = `overdue-streets-${new Date().toISOString().split('T')[0]}.txt`;
        break;

      case 'performance':
        content = `דוח ביצועים - ${new Date().toLocaleDateString('he-IL')}\n\n`;
        content += `ממוצע יומי: ${performanceMetrics.dailyAverage} רחובות\n`;
        content += `ממוצע שבועי: ${performanceMetrics.weeklyAverage} רחובות\n`;
        content += `ממוצע חודשי: ${performanceMetrics.monthlyAverage} רחובות\n`;
        content += `יעילות: ${performanceMetrics.efficiency.toFixed(1)}%\n`;
        content += `אחוז השלמה: ${performanceMetrics.completionRate.toFixed(1)}%\n`;
        content += `זמן ממוצע לרחוב: ${performanceMetrics.timePerStreet.toFixed(1)} דקות\n`;
        filename = `performance-report-${new Date().toISOString().split('T')[0]}.txt`;
        break;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // פונקציה לקבלת צבע לפי ימים
  const getDaysColor = (days: number) => {
    if (days === 0) return 'text-green-600 bg-green-100';
    if (days <= 3) return 'text-blue-600 bg-blue-100';
    if (days <= 7) return 'text-yellow-600 bg-yellow-100';
    if (days <= 14) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // סטטיסטיקות לפי אזור
  const getAreaStats = () => {
    const area14Streets = allStreets.filter(s => s.area === 14 && s.lastDelivered);
    const area45Streets = allStreets.filter(s => s.area === 45 && s.lastDelivered);
    
    return {
      area14: area14Streets.length,
      area45: area45Streets.length,
      total: area14Streets.length + area45Streets.length
    };
  };

  const areaStats = getAreaStats();

  return (
    <section className="mt-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-md">
          <BarChart3 size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">דוחות וסטטיסטיקות</h2>
          <p className="text-gray-600 font-medium text-sm md:text-base">מעקב ביצועים וניתוח נתונים</p>
        </div>
      </div>

      {/* מדדי ביצועים עיקריים */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Target size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {performanceMetrics.dailyAverage}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800">רחובות יומי</h3>
          <p className="text-sm text-gray-600">ממוצע רחובות ביום</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {deliveredStreets.length}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800">רחובות שחולקו</h3>
          <p className="text-sm text-gray-600">סה״כ רחובות עם חלוקה</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Clock size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-yellow-600">
              {performanceMetrics.timePerStreet.toFixed(0)}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800">דקות לרחוב</h3>
          <p className="text-sm text-gray-600">זמן ממוצע</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-red-600">
              {overdueStreets.length}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800">רחובות באיחור</h3>
          <p className="text-sm text-gray-600">מעל 10 ימים</p>
        </div>
      </div>

      {/* היסטוריית חלוקות */}
      <div className="bg-white border border-green-200 rounded-xl shadow-lg mb-8">
        <div className="p-6 border-b border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History size={24} className="text-green-600" />
              <div>
                <h3 className="font-bold text-xl text-gray-800">היסטוריית חלוקות</h3>
                <p className="text-sm text-gray-600">
                  {deliveredStreets.length} רחובות שחולקו
                  {areaFilter !== 'all' && ` באזור ${areaFilter}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadReport('delivered')}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Download size={16} />
                הורד דוח
              </button>
            </div>
          </div>
        </div>

        {/* סטטיסטיקות לפי אזור */}
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <h4 className="font-semibold text-gray-800 mb-3">פילוח לפי אזורים</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">אזור 14</span>
                <span className="font-bold text-lg text-blue-600">{areaStats.area14}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {areaStats.total > 0 ? Math.round((areaStats.area14 / areaStats.total) * 100) : 0}% מסך הכל
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">אזור 45</span>
                <span className="font-bold text-lg text-indigo-600">{areaStats.area45}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {areaStats.total > 0 ? Math.round((areaStats.area45 / areaStats.total) * 100) : 0}% מסך הכל
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">סה״כ</span>
                <span className="font-bold text-lg text-green-600">{areaStats.total}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                כל הרחובות שחולקו
              </div>
            </div>
          </div>
        </div>

        {/* סינון */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* סינון לפי תקופה */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">תקופה:</span>
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'הכל' },
                  { key: 'recent', label: 'שבוע אחרון' },
                  { key: 'old', label: 'יותר משבוע' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setDeliveryFilter(key as any)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      deliveryFilter === key
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* סינון לפי אזור */}
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">אזור:</span>
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'כל האזורים', count: areaStats.total },
                  { key: '14', label: 'אזור 14', count: areaStats.area14 },
                  { key: '45', label: 'אזור 45', count: areaStats.area45 }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setAreaFilter(key as any)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      areaFilter === key
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border'
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {deliveredStreets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">רחוב</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">אזור</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">סוג</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">תאריך חלוקה</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">ימים מאז</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">זמן ממוצע</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredStreets.map(street => (
                    <tr key={street.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="font-medium">{street.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          street.area === 14 ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {street.area}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          street.isBig ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {street.isBig ? 'גדול' : 'קטן'}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-gray-800">
                            {street.deliveryDate.toLocaleDateString('he-IL')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {street.deliveryDate.toLocaleTimeString('he-IL', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDaysColor(street.daysAgo)}`}>
                          {street.daysAgo === 0 ? 'היום' : 
                           street.daysAgo === 1 ? 'אתמול' : 
                           `לפני ${street.daysAgo} ימים`}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 text-gray-600">
                        {street.averageTime ? (
                          <div className="flex items-center justify-center gap-1">
                            <Clock size={14} />
                            <span>{street.averageTime} דק׳</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <History size={48} className="mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">אין חלוקות להצגה</h4>
              <p className="text-sm">
                {areaFilter !== 'all' ? `אין חלוקות באזור ${areaFilter}` :
                 deliveryFilter === 'recent' ? 'אין חלוקות בשבוע האחרון' :
                 deliveryFilter === 'old' ? 'אין חלוקות ישנות יותר משבוע' :
                 'עדיין לא בוצעו חלוקות'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* רחובות שלא חולקו */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg mb-8">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-orange-600" />
              <div>
                <h3 className="font-bold text-xl text-gray-800">רחובות שלא חולקו</h3>
                <p className="text-sm text-gray-600">{undeliveredStreets.length} רחובות ממתינים לחלוקה</p>
              </div>
            </div>
            <button
              onClick={() => downloadReport('undelivered')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              <Download size={16} />
              הורד דוח
            </button>
          </div>
        </div>

        <div className="p-6">
          {undeliveredStreets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">רחוב</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">ימים מאז</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">דחיפות</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">זמן משוער</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">סוג</th>
                  </tr>
                </thead>
                <tbody>
                  {undeliveredStreets
                    .sort((a, b) => b.daysSinceLastDelivery - a.daysSinceLastDelivery)
                    .map(item => (
                    <tr key={item.street.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          {item.street.name}
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`font-semibold ${
                          item.daysSinceLastDelivery >= 14 ? 'text-red-600' :
                          item.daysSinceLastDelivery >= 10 ? 'text-orange-600' :
                          'text-gray-600'
                        }`}>
                          {item.daysSinceLastDelivery === 999 ? 'לא חולק' : `${item.daysSinceLastDelivery} ימים`}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                          item.urgencyLevel === 'urgent' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.urgencyLevel === 'critical' ? 'קריטי' :
                           item.urgencyLevel === 'urgent' ? 'דחוף' : 'רגיל'}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 text-gray-600">
                        {item.estimatedTime} דק׳
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.street.isBig ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.street.isBig ? 'גדול' : 'קטן'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">כל הרחובות חולקו!</h4>
              <p className="text-sm">אין רחובות ממתינים לחלוקה</p>
            </div>
          )}
        </div>
      </div>

      {/* רחובות באיחור קריטי */}
      {overdueStreets.length > 0 && (
        <div className="bg-white border border-red-200 rounded-xl shadow-lg mb-8">
          <div className="p-6 border-b border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle size={24} className="text-red-600" />
                <div>
                  <h3 className="font-bold text-xl text-gray-800">רחובות באיחור קריטי</h3>
                  <p className="text-sm text-gray-600">{overdueStreets.length} רחובות מעל 10 ימים</p>
                </div>
              </div>
              <button
                onClick={() => downloadReport('overdue')}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Download size={16} />
                הורד דוח
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overdueStreets.map(street => {
                const days = street.lastDelivered ? 
                  Math.floor((Date.now() - new Date(street.lastDelivered).getTime()) / 86400000) : 999;
                
                return (
                  <div key={street.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{street.name}</h4>
                      <span className="text-red-600 font-bold">
                        {days === 999 ? 'לא חולק' : `${days} ימים`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        street.isBig ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {street.isBig ? 'רחוב גדול' : 'רחוב קטן'}
                      </span>
                      <span className="text-gray-600">
                        אזור {street.area}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* דוח ביצועים מפורט */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 size={24} className="text-blue-600" />
              <div>
                <h3 className="font-bold text-xl text-gray-800">דוח ביצועים מפורט</h3>
                <p className="text-sm text-gray-600">ניתוח ביצועים ומגמות</p>
              </div>
            </div>
            <button
              onClick={() => downloadReport('performance')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Download size={16} />
              הורד דוח
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">ביצועים יומיים</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ממוצע רחובות:</span>
                  <span className="font-semibold">{performanceMetrics.dailyAverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">יעילות:</span>
                  <span className="font-semibold text-green-600">{performanceMetrics.efficiency.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">ביצועים שבועיים</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ממוצע רחובות:</span>
                  <span className="font-semibold">{performanceMetrics.weeklyAverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">השלמה:</span>
                  <span className="font-semibold text-blue-600">{performanceMetrics.completionRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">ביצועים חודשיים</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ממוצע רחובות:</span>
                  <span className="font-semibold">{performanceMetrics.monthlyAverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">זמן לרחוב:</span>
                  <span className="font-semibold text-purple-600">{performanceMetrics.timePerStreet.toFixed(1)} דק׳</span>
                </div>
              </div>
            </div>
          </div>

          {/* גרף ביצועים פשוט */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-4">מגמת ביצועים</h4>
            <div className="flex items-end justify-between h-32 gap-2">
              {[65, 78, 82, 75, 88, 92, 85].map((value, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t w-8 transition-all duration-500"
                    style={{ height: `${value}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">
                    {['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'][index]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}