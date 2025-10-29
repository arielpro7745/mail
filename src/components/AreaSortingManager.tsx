import { useState } from "react";
import { Package, MapPin, ArrowRight, Clock, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { streets } from "../data/streets";
import { useDistribution } from "../hooks/useDistribution";
import { getAreaColor } from "../utils/areaColors";

interface SortedStreet {
  id: string;
  name: string;
  sortOrder: number;
  estimatedTime: number;
  reasoning: string;
}

export default function AreaSortingManager() {
  const { todayArea } = useDistribution();
  const [sortedStreets, setSortedStreets] = useState<SortedStreet[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const areaColor = getAreaColor(todayArea);
  const currentAreaStreets = streets.filter(s => s.area === todayArea);

  const generateOptimalSorting = () => {
    const sorted: SortedStreet[] = [];

    if (todayArea === 12) {
      const order = [
        { id: "david-zvi-pinkas-1-21", reasoning: "התחלה - רחוב ראשי, צד אי-זוגי" },
        { id: "david-zvi-pinkas-24-2", reasoning: "המשך - אותו רחוב, צד זוגי" },
        { id: "ninety-three-42-2", reasoning: "קרוב גיאוגרפית - התשעים ושלוש זוגי" },
        { id: "ninety-three-1-11", reasoning: "המשך - אותו רחוב, אי-זוגי 1-11" },
        { id: "ninety-three-13-21", reasoning: "המשך - אותו רחוב, אי-זוגי 13-21" },
        { id: "hakerem", reasoning: "קרוב - הכרם" },
        { id: "harav-kook", reasoning: "המשך - הרב קוק (באזור)" },
        { id: "zichron-moshe", reasoning: "המשך - זכרון משה" },
        { id: "anna-frank", reasoning: "קרוב - אנה פרנק" },
        { id: "chaim-cohen", reasoning: "המשך - חיים כהן" },
        { id: "chafetz-mordechai", reasoning: "המשך - חפץ מרדכי" },
        { id: "mendelson", reasoning: "המשך - מנדלסון" },
        { id: "haachim-raab", reasoning: "המשך - האחים ראב" },
        { id: "sweden", reasoning: "סיום - שבדיה" },
      ];

      order.forEach((item, idx) => {
        const street = currentAreaStreets.find(s => s.id === item.id);
        if (street) {
          sorted.push({
            id: street.id,
            name: street.name,
            sortOrder: idx + 1,
            estimatedTime: street.isBig ? 20 : 12,
            reasoning: item.reasoning
          });
        }
      });
    } else if (todayArea === 14) {
      const order = [
        { id: "d-hayomi", reasoning: "התחלה - הדף היומי (נקודת כניסה)" },
        { id: "rot-110‑132", reasoning: "כניסה לרוטשילד - 110-132" },
        { id: "rot-134‑150", reasoning: "המשך רוטשילד - 134-150" },
        { id: "rot-152‑182", reasoning: "המשך רוטשילד - 152-182 (גדול!)" },
        { id: "gad-machnes-4", reasoning: "סטייה קצרה - גד מכנס 4" },
        { id: "rot-179‑143", reasoning: "חזרה לרוטשילד - 179-143" },
        { id: "rot-141‑109", reasoning: "המשך רוטשילד - 141-109" },
        { id: "kkl-even", reasoning: "מעבר לקק\"ל - זוגי 28-34" },
        { id: "kkl-odd", reasoning: "סיום - קק\"ל אי-זוגי 21-25" },
      ];

      order.forEach((item, idx) => {
        const street = currentAreaStreets.find(s => s.id === item.id);
        if (street) {
          sorted.push({
            id: street.id,
            name: street.name,
            sortOrder: idx + 1,
            estimatedTime: street.isBig ? 20 : 12,
            reasoning: item.reasoning
          });
        }
      });
    } else if (todayArea === 45) {
      const order = [
        { id: "yatk-32‑42", reasoning: "התחלה - יטקובסקי זוגי 32-42" },
        { id: "yatk-37‑25", reasoning: "המשך - יטקובסקי אי-זוגי 37-25" },
        { id: "weiz-even", reasoning: "מעבר לויצמן - זוגי 2-34 (גדול!)" },
        { id: "weiz-odd", reasoning: "המשך - ויצמן אי-זוגי 35-1 (גדול!)" },
        { id: "dagel-even", reasoning: "מעבר לדגל ראובן - זוגי 18-54" },
        { id: "dagel-odd", reasoning: "המשך - דגל ראובן אי-זוגי 63-23" },
        { id: "heib-even", reasoning: "מעבר להיבנר - זוגי 12-74" },
        { id: "heib-odd", reasoning: "המשך - היבנר אי-זוגי 55-7" },
        { id: "bertonov", reasoning: "ברטונוב כל הרחוב (גדול!)" },
        { id: "martin-buber", reasoning: "מרטין בובר" },
        { id: "partisans", reasoning: "הפרטיזנים" },
        { id: "lisin", reasoning: "ליסין" },
        { id: "mirkin", reasoning: "מירקין" },
        { id: "senerov", reasoning: "סנרוב" },
        { id: "stern", reasoning: "סיום - שטרן" },
      ];

      order.forEach((item, idx) => {
        const street = currentAreaStreets.find(s => s.id === item.id);
        if (street) {
          sorted.push({
            id: street.id,
            name: street.name,
            sortOrder: idx + 1,
            estimatedTime: street.isBig ? 20 : 12,
            reasoning: item.reasoning
          });
        }
      });
    }

    setSortedStreets(sorted);
  };

  const totalTime = sortedStreets.reduce((sum, s) => sum + s.estimatedTime, 0);
  const bigStreets = sortedStreets.filter(s => s.estimatedTime >= 20).length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`${areaColor.bgSolid} rounded-lg p-3`}>
            <Package className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">מיון וחלוקה אופטימלית</h2>
            <p className="text-sm text-gray-600">אזור {todayArea} - {currentAreaStreets.length} רחובות</p>
          </div>
        </div>

        <button
          onClick={generateOptimalSorting}
          className={`${areaColor.bgSolid} ${areaColor.bgHover} text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all flex items-center gap-2`}
        >
          <TrendingUp size={20} />
          צור סדר מיון מומלץ
        </button>
      </div>

      {sortedStreets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 font-semibold mb-2">לחץ על הכפתור ליצירת סדר מיון אופטימלי</p>
          <p className="text-sm text-gray-500">המערכת תיצור מסלול חלוקה יעיל לפי קרבה גיאוגרפית</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="text-blue-600" size={20} />
                <span className="text-sm font-semibold text-blue-800">סה"כ רחובות</span>
              </div>
              <div className="text-3xl font-bold text-blue-700">{sortedStreets.length}</div>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-purple-600" size={20} />
                <span className="text-sm font-semibold text-purple-800">זמן משוער</span>
              </div>
              <div className="text-3xl font-bold text-purple-700">{totalTime} דק'</div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-orange-600" size={20} />
                <span className="text-sm font-semibold text-orange-800">רחובות גדולים</span>
              </div>
              <div className="text-3xl font-bold text-orange-700">{bigStreets}</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">סדר החלוקה המומלץ</h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
            >
              {showDetails ? 'הסתר פרטים' : 'הצג פרטים'}
            </button>
          </div>

          <div className="space-y-3">
            {sortedStreets.map((street, idx) => (
              <div
                key={street.id}
                className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`${areaColor.bgSolid} text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-xl shadow-md`}>
                      {street.sortOrder}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-800 text-lg">{street.name}</h4>
                        {street.estimatedTime >= 20 && (
                          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                            רחוב גדול
                          </span>
                        )}
                      </div>
                      {showDetails && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <ArrowRight size={14} />
                          {street.reasoning}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <div className="text-sm text-gray-500">זמן משוער</div>
                      <div className="text-lg font-bold text-gray-700">{street.estimatedTime} דק'</div>
                    </div>
                    {idx < sortedStreets.length - 1 && (
                      <ArrowRight className="text-gray-400" size={24} />
                    )}
                    {idx === sortedStreets.length - 1 && (
                      <CheckCircle className="text-green-500" size={24} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-green-800 mb-2">יעילות המסלול</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• מינימום חזרות - כל רחוב בצד אחד ואז הצד השני</li>
                  <li>• מסלול רציף - מעבר לרחוב הקרוב ביותר</li>
                  <li>• רחובות גדולים מסומנים - תוכל להתכונן מראש</li>
                  <li>• זמן כולל: {Math.floor(totalTime / 60)} שעות ו-{totalTime % 60} דקות</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
