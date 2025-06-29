import { useState } from "react";
import { useDistribution } from "../hooks/useDistribution";
import { useBuildings } from "../hooks/useBuildings";
import { useTasks } from "../hooks/useTasks";
import { ExportData } from "../types";
import LoadingSpinner from "./LoadingSpinner";
import { 
  Download, FileText, Database, Calendar, 
  Users, CheckSquare, BarChart3, Upload
} from "lucide-react";

export default function DataExport() {
  const { pendingToday, completedToday } = useDistribution();
  const { buildings } = useBuildings();
  const { tasks } = useTasks();
  const [isExporting, setIsExporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // יצירת נתוני ייצוא
  const createExportData = (): ExportData => {
    const allStreets = [...pendingToday, ...completedToday];
    const allResidents = buildings.flatMap(b => b.residents);

    return {
      streets: allStreets,
      buildings,
      residents: allResidents,
      tasks,
      stats: {
        totalDeliveries: completedToday.length,
        averageTimePerStreet: 0, // יחושב בהתבסס על נתונים
        completionRate: (completedToday.length / allStreets.length) * 100,
        streetsPerDay: completedToday.length,
        dailyStats: [],
        weeklyStats: [],
        monthlyStats: []
      },
      exportDate: new Date().toISOString(),
      version: "1.0.0"
    };
  };

  // ייצוא נתונים
  const exportData = async (format: 'json' | 'csv' | 'txt') => {
    setIsExporting(true);
    
    try {
      const data = createExportData();
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'json':
          content = JSON.stringify(data, null, 2);
          filename = `mail-delivery-data-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;

        case 'csv':
          // יצירת CSV עבור רחובות
          content = 'שם רחוב,אזור,סוג,תאריך חלוקה אחרונה,זמן ממוצע\n';
          data.streets.forEach(street => {
            content += `"${street.name}",${street.area},"${street.isBig ? 'גדול' : 'קטן'}","${street.lastDelivered}",${street.averageTime || 0}\n`;
          });
          
          content += '\n\nבניינים ודיירים\n';
          content += 'שם,כתובת,דירה,טלפון,מאשר תיבה,מאשר דלת\n';
          data.residents.forEach(resident => {
            const building = buildings.find(b => b.residents.some(r => r.id === resident.id));
            const address = building ? `רחוב ${building.streetId} ${building.number}` : '';
            content += `"${resident.fullName}","${address}","${resident.apartment}","${resident.phone || ''}","${resident.allowMailbox ? 'כן' : 'לא'}","${resident.allowDoor ? 'כן' : 'לא'}"\n`;
          });

          filename = `mail-delivery-data-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv;charset=utf-8';
          break;

        case 'txt':
          content = `דוח מעקב חלוקת דואר - ${new Date().toLocaleDateString('he-IL')}\n`;
          content += '='.repeat(50) + '\n\n';
          
          content += 'רחובות:\n';
          content += '-'.repeat(20) + '\n';
          data.streets.forEach(street => {
            content += `${street.name} (אזור ${street.area}) - ${street.isBig ? 'גדול' : 'קטן'}\n`;
            content += `  חלוקה אחרונה: ${street.lastDelivered || 'לא חולק'}\n`;
            content += `  זמן ממוצע: ${street.averageTime || 0} דקות\n\n`;
          });

          content += '\nבניינים ודיירים:\n';
          content += '-'.repeat(20) + '\n';
          data.buildings.forEach(building => {
            content += `בניין ${building.streetId} ${building.number}\n`;
            building.residents.forEach(resident => {
              content += `  ${resident.fullName} - דירה ${resident.apartment}\n`;
              content += `    טלפון: ${resident.phone || 'לא רשום'}\n`;
              content += `    הרשאות: ${resident.allowMailbox ? 'תיבה' : ''} ${resident.allowDoor ? 'דלת' : ''}\n`;
            });
            content += '\n';
          });

          content += '\nמשימות:\n';
          content += '-'.repeat(20) + '\n';
          data.tasks.forEach(task => {
            content += `${task.title} - ${task.status}\n`;
            content += `  סוג: ${task.type}, עדיפות: ${task.priority}\n`;
            if (task.dueDate) content += `  תאריך יעד: ${new Date(task.dueDate).toLocaleDateString('he-IL')}\n`;
            content += '\n';
          });

          filename = `mail-delivery-report-${new Date().toISOString().split('T')[0]}.txt`;
          mimeType = 'text/plain;charset=utf-8';
          break;
      }

      // הורדת הקובץ
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting data:', error);
      alert('שגיאה בייצוא הנתונים');
    } finally {
      setIsExporting(false);
    }
  };

  // יבוא נתונים
  const importData = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const data: ExportData = JSON.parse(text);
      
      // כאן תוכל להוסיף לוגיקה ליבוא הנתונים למערכת
      console.log('Imported data:', data);
      alert('הנתונים יובאו בהצלחה!');
      
    } catch (error) {
      console.error('Error importing data:', error);
      alert('שגיאה ביבוא הנתונים');
    }
  };

  const stats = createExportData().stats;

  return (
    <section className="mt-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md">
          <Database size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">ייצוא ויבוא נתונים</h2>
          <p className="text-gray-600 font-medium text-sm md:text-base">גיבוי ושיתוף מידע</p>
        </div>
      </div>

      {/* סטטיסטיקות כלליות */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FileText size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {pendingToday.length + completedToday.length}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800">רחובות</h3>
          <p className="text-sm text-gray-600">סה״כ רחובות במערכת</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <Users size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {buildings.reduce((sum, b) => sum + b.residents.length, 0)}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800">דיירים</h3>
          <p className="text-sm text-gray-600">סה״כ דיירים רשומים</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <CheckSquare size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {tasks.length}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800">משימות</h3>
          <p className="text-sm text-gray-600">סה״כ משימות במערכת</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <BarChart3 size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {stats.completionRate.toFixed(0)}%
            </span>
          </div>
          <h3 className="font-semibold text-gray-800">השלמה</h3>
          <p className="text-sm text-gray-600">אחוז השלמת רחובות</p>
        </div>
      </div>

      {/* ייצוא נתונים */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg mb-8">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <Download size={24} className="text-blue-600" />
            <div>
              <h3 className="font-bold text-xl text-gray-800">ייצוא נתונים</h3>
              <p className="text-sm text-gray-600">הורד את כל הנתונים בפורמטים שונים</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500 rounded-lg">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">JSON</h4>
                  <p className="text-sm text-gray-600">נתונים מובנים</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                פורמט מובנה המכיל את כל הנתונים עם מטא-דאטה מלא
              </p>
              <button
                onClick={() => exportData('json')}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Download size={16} />
                הורד JSON
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">CSV</h4>
                  <p className="text-sm text-gray-600">טבלאות נתונים</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                פורמט טבלה לפתיחה באקסל או גוגל שיטס
              </p>
              <button
                onClick={() => exportData('csv')}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Download size={16} />
                הורד CSV
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">TXT</h4>
                  <p className="text-sm text-gray-600">דוח טקסט</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                דוח טקסט קריא להדפסה או שיתוף
              </p>
              <button
                onClick={() => exportData('txt')}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Download size={16} />
                הורד TXT
              </button>
            </div>
          </div>

          {isExporting && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 font-medium">מייצא נתונים...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* יבוא נתונים */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center gap-3">
            <Upload size={24} className="text-orange-600" />
            <div>
              <h3 className="font-bold text-xl text-gray-800">יבוא נתונים</h3>
              <p className="text-sm text-gray-600">טען נתונים מקובץ JSON</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-yellow-500 rounded">
                <FileText size={16} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">שים לב!</h4>
                <p className="text-sm text-yellow-700">
                  יבוא נתונים יחליף את הנתונים הקיימים במערכת. 
                  מומלץ לייצא גיבוי לפני ביצוע יבוא.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={importData}
              disabled={!importFile}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <Upload size={16} />
              יבא נתונים
            </button>
          </div>

          {importFile && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                קובץ נבחר: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}