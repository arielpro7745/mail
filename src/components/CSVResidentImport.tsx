import { useState } from "react";
import { useBuildings } from "../hooks/useBuildings";
import { parseResidentsCsv } from "../csv";
import { Upload, Download, FileText, CheckCircle, AlertTriangle, X } from "lucide-react";

export default function CSVResidentImport() {
  const { buildings, addResident } = useBuildings();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // דוגמת CSV להורדה
  const downloadSampleCSV = () => {
    const sampleData = `שם מלא,רחוב,מספר בניין,דירה,טלפון,מאשר תיבה,מאשר דלת,דייר ראשי,קשר משפחתי
"דוד כהן","הרצל","12","1","0501234567","כן","לא","כן","אב"
"שרה לוי","ביאליק","3","2","0529876543","לא","כן","לא","אם"
"משה ישראלי","רוטשילד","134","5","0521111111","כן","כן","כן",""
"רחל גולדברג","ויצמן","25","3","0502222222","כן","לא","לא","בת"`;

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'דוגמת-דיירים.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ייבוא דיירים מ-CSV
  const importResidents = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportResults(null);

    try {
      const csvText = await importFile.text();
      const parsedResidents = parseResidentsCsv(csvText, buildings);
      
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const { resident, buildingId } of parsedResidents) {
        try {
          await addResident(buildingId, resident);
          successCount++;
        } catch (error) {
          failedCount++;
          errors.push(`שגיאה בהוספת ${resident.fullName}: ${error.message}`);
        }
      }

      setImportResults({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 5) // הצג רק 5 שגיאות ראשונות
      });

    } catch (error) {
      console.error('Error importing CSV:', error);
      setImportResults({
        success: 0,
        failed: 0,
        errors: ['שגיאה בקריאת קובץ ה-CSV']
      });
    } finally {
      setIsImporting(false);
      setImportFile(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg mb-6">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <Upload size={24} className="text-blue-600" />
          <div>
            <h3 className="font-bold text-xl text-gray-800">ייבוא דיירים מ-CSV</h3>
            <p className="text-sm text-gray-600">הוסף מספר רב של דיירים בבת אחת</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* הורדת דוגמה */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FileText size={20} className="text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 mb-2">פורמט קובץ CSV</h4>
              <p className="text-sm text-yellow-700 mb-3">
                הקובץ צריך לכלול את העמודות הבאות: שם מלא, רחוב, מספר בניין, דירה, טלפון, מאשר תיבה, מאשר דלת, דייר ראשי, קשר משפחתי
              </p>
              <button
                onClick={downloadSampleCSV}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm transition-colors"
              >
                <Download size={14} />
                הורד דוגמת CSV
              </button>
            </div>
          </div>
        </div>

        {/* העלאת קובץ */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              בחר קובץ CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {importFile && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-green-600" />
                <span className="text-green-700 font-medium">
                  {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={importResidents}
              disabled={!importFile || isImporting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:bg-gray-400 text-white rounded-xl transition-all duration-200 shadow-lg"
            >
              {isImporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Upload size={16} />
              )}
              {isImporting ? 'מייבא...' : 'יבא דיירים'}
            </button>
            
            {importFile && (
              <button
                onClick={() => {
                  setImportFile(null);
                  setImportResults(null);
                }}
                className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                בטל
              </button>
            )}
          </div>
        </div>

        {/* תוצאות ייבוא */}
        {importResults && (
          <div className="mt-6 p-4 border rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              {importResults.success > 0 ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <AlertTriangle size={20} className="text-red-600" />
              )}
              <h4 className="font-semibold text-gray-800">תוצאות ייבוא</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                <div className="text-sm text-green-700">דיירים נוספו בהצלחה</div>
              </div>
              
              {importResults.failed > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                  <div className="text-sm text-red-700">דיירים נכשלו</div>
                </div>
              )}
            </div>

            {importResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h5 className="font-medium text-red-800 mb-2">שגיאות:</h5>
                <ul className="text-sm text-red-700 space-y-1">
                  {importResults.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}