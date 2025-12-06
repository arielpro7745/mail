import { useState, useEffect } from 'react';
import { Package, CheckCircle2, Clock, Calendar, ArrowRight, RotateCcw } from 'lucide-react';
import { getTodayAreaSchedule, getTomorrowAreaSchedule } from '../utils/areaRotation';
import { getAreaColor, getAreaName } from '../utils/areaColors';
import { streets } from '../data/streets';

const PREP_STORAGE_KEY = 'area_preparation_tracking';

interface PrepData {
  date: string;
  area: number;
  completed: boolean;
  completedAt?: string;
  streetsOrganized: string[];
}

export default function NextDayAreaPrep() {
  const [prepData, setPrepData] = useState<PrepData | null>(null);
  const [showStreets, setShowStreets] = useState(false);
  const [organizedStreets, setOrganizedStreets] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const todaySchedule = getTodayAreaSchedule();
  const tomorrowSchedule = getTomorrowAreaSchedule();

  // האזור שצריך להכין היום = האזור שיחולק מחר
  const areaToPrep = tomorrowSchedule.delivery;
  const areaColor = getAreaColor(areaToPrep);

  // רחובות של האזור להכנה
  const areaStreets = streets.filter(s => s.area === areaToPrep);

  useEffect(() => {
    loadPrepData();
  }, []);

  const loadPrepData = () => {
    try {
      const saved = localStorage.getItem(PREP_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as PrepData[];
        const todayData = data.find(d => d.date === today && d.area === areaToPrep);
        if (todayData) {
          setPrepData(todayData);
          setOrganizedStreets(todayData.streetsOrganized || []);
        }
      }
    } catch (error) {
      console.error('Error loading prep data:', error);
    }
  };

  const savePrepData = (newData: PrepData) => {
    try {
      const saved = localStorage.getItem(PREP_STORAGE_KEY);
      let allData: PrepData[] = saved ? JSON.parse(saved) : [];

      // הסר נתונים ישנים (מעל שבוע)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      allData = allData.filter(d => new Date(d.date) >= weekAgo);

      // עדכן או הוסף את הנתונים החדשים
      const existingIndex = allData.findIndex(d => d.date === today && d.area === areaToPrep);
      if (existingIndex >= 0) {
        allData[existingIndex] = newData;
      } else {
        allData.push(newData);
      }

      localStorage.setItem(PREP_STORAGE_KEY, JSON.stringify(allData));
      setPrepData(newData);
    } catch (error) {
      console.error('Error saving prep data:', error);
    }
  };

  const toggleStreet = (streetId: string) => {
    const newOrganized = organizedStreets.includes(streetId)
      ? organizedStreets.filter(id => id !== streetId)
      : [...organizedStreets, streetId];

    setOrganizedStreets(newOrganized);

    const newData: PrepData = {
      date: today,
      area: areaToPrep,
      completed: newOrganized.length === areaStreets.length,
      completedAt: newOrganized.length === areaStreets.length ? new Date().toISOString() : undefined,
      streetsOrganized: newOrganized
    };

    savePrepData(newData);
  };

  const markAllComplete = () => {
    const allStreetIds = areaStreets.map(s => s.id);
    setOrganizedStreets(allStreetIds);

    const newData: PrepData = {
      date: today,
      area: areaToPrep,
      completed: true,
      completedAt: new Date().toISOString(),
      streetsOrganized: allStreetIds
    };

    savePrepData(newData);
  };

  const resetPrep = () => {
    setOrganizedStreets([]);
    const newData: PrepData = {
      date: today,
      area: areaToPrep,
      completed: false,
      streetsOrganized: []
    };
    savePrepData(newData);
  };

  const progress = areaStreets.length > 0
    ? Math.round((organizedStreets.length / areaStreets.length) * 100)
    : 0;

  const isComplete = organizedStreets.length === areaStreets.length && areaStreets.length > 0;

  return (
    <div className={`rounded-xl shadow-lg border-2 ${isComplete ? 'border-green-300 bg-green-50' : 'border-orange-200 bg-white'} mb-6`}>
      {/* כותרת */}
      <div className={`${isComplete ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-red-500'} rounded-t-xl px-4 py-3 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package size={24} />
            <div>
              <h3 className="font-bold text-lg">ארגון אזור למחר</h3>
              <p className="text-sm opacity-90">הכן את השקים לחלוקת מחר</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`${areaColor.bgSolid} px-3 py-1 rounded-full font-bold`}>
              אזור {areaToPrep}
            </div>
          </div>
        </div>
      </div>

      {/* מידע על המחזוריות */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-gray-600">היום: אזור {todaySchedule.delivery} לחלוקה</span>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-orange-500" />
              <span className="text-orange-600 font-bold">מחר: אזור {tomorrowSchedule.delivery} לחלוקה</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <RotateCcw size={14} />
            <span className="text-xs">מחזור: 12 → 14 → 45</span>
          </div>
        </div>
      </div>

      {/* תוכן */}
      <div className="p-4">
        {/* פס התקדמות */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              התקדמות הארגון
            </span>
            <span className={`text-sm font-bold ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>
              {organizedStreets.length}/{areaStreets.length} רחובות
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                isComplete ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {isComplete ? (
          <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 text-center">
            <CheckCircle2 className="mx-auto text-green-600 mb-2" size={48} />
            <h4 className="font-bold text-green-800 text-lg mb-1">הארגון הושלם!</h4>
            <p className="text-green-700 text-sm">
              כל הרחובות של אזור {areaToPrep} מוכנים לחלוקת מחר
            </p>
            {prepData?.completedAt && (
              <p className="text-green-600 text-xs mt-2">
                הושלם ב-{new Date(prepData.completedAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            <button
              onClick={resetPrep}
              className="mt-3 text-sm text-green-600 hover:text-green-800 underline"
            >
              אפס ותכנן מחדש
            </button>
          </div>
        ) : (
          <>
            {/* כפתורים */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setShowStreets(!showStreets)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {showStreets ? 'הסתר רחובות' : 'הצג רחובות'}
              </button>
              <button
                onClick={markAllComplete}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                סמן הכל כמוכן
              </button>
            </div>

            {/* רשימת רחובות */}
            {showStreets && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {areaStreets.map((street) => {
                  const isOrganized = organizedStreets.includes(street.id);
                  return (
                    <button
                      key={street.id}
                      onClick={() => toggleStreet(street.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        isOrganized
                          ? 'bg-green-50 border-green-300 text-green-800'
                          : 'bg-white border-gray-200 hover:border-orange-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isOrganized ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          {isOrganized ? <CheckCircle2 size={16} /> : <span className="text-xs">○</span>}
                        </div>
                        <span className="font-medium">{street.name}</span>
                        {street.isBig && (
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                            גדול
                          </span>
                        )}
                      </div>
                      <span className={`text-sm ${isOrganized ? 'text-green-600' : 'text-gray-400'}`}>
                        {isOrganized ? 'מוכן' : 'ממתין'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* הסבר */}
      <div className="px-4 pb-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
          <strong>טיפ:</strong> סדר את השקים של אזור {areaToPrep} לפי סדר ההליכה המומלץ.
          כך מחר תוכל לצאת מיד לחלוקה!
        </div>
      </div>
    </div>
  );
}
