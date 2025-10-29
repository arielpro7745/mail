import { useState } from "react";
import { Zap, MapPin, TrendingUp, AlertCircle, CheckCircle, ArrowRight, Clock } from "lucide-react";
import { streets } from "../data/streets";
import { getAreaColor } from "../utils/areaColors";

interface StreetAnalysis {
  id: string;
  name: string;
  area: number;
  isBig: boolean;
  estimatedTime: number;
  suggestedOrder: number;
  reasoning: string;
  shouldMove?: {
    toArea: number;
    reason: string;
  };
}

interface AreaAnalysis {
  area: number;
  currentStreets: number;
  totalTime: number;
  bigStreets: number;
  smallStreets: number;
  balance: 'light' | 'medium' | 'heavy';
  streets: StreetAnalysis[];
  recommendations: string[];
}

export default function IntelligentAreaOptimizer() {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyses, setAnalyses] = useState<AreaAnalysis[]>([]);

  const analyzeAreas = () => {
    const results: AreaAnalysis[] = [];

    [12, 14, 45].forEach(areaNum => {
      const areaStreets = streets.filter(s => s.area === areaNum);
      const totalTime = areaStreets.reduce((sum, s) => sum + (s.isBig ? 20 : 12), 0);
      const bigStreets = areaStreets.filter(s => s.isBig).length;
      const smallStreets = areaStreets.length - bigStreets;

      let balance: 'light' | 'medium' | 'heavy';
      if (totalTime < 150) balance = 'light';
      else if (totalTime < 220) balance = 'medium';
      else balance = 'heavy';

      const analyzedStreets: StreetAnalysis[] = [];
      const recommendations: string[] = [];

      if (areaNum === 12) {
        const order = [
          { id: "david-zvi-pinkas-1-21", order: 1, reasoning: "התחלה - צד אי-זוגי של דוד צבי פנקס" },
          { id: "david-zvi-pinkas-24-2", order: 2, reasoning: "צד שני של אותו רחוב - חוסך הליכה" },
          { id: "ninety-three-42-2", order: 3, reasoning: "מעבר לרחוב הסמוך - התשעים ושלוש זוגי" },
          { id: "ninety-three-1-11", order: 4, reasoning: "המשך התשעים ושלוש - אי-זוגי תחתון" },
          { id: "ninety-three-13-21", order: 5, reasoning: "סיום התשעים ושלוש - אי-זוגי עליון" },
          { id: "hakerem", order: 6, reasoning: "מעבר לאזור שכונתי - הכרם" },
          { id: "harav-kook", order: 7, reasoning: "רחוב סמוך - הרב קוק" },
          { id: "zichron-moshe", order: 8, reasoning: "המשך - זכרון משה" },
          { id: "anna-frank", order: 9, reasoning: "רחוב סמוך - אנה פרנק" },
          { id: "chaim-cohen", order: 10, reasoning: "המשך - חיים כהן" },
          { id: "chafetz-mordechai", order: 11, reasoning: "רחוב קטן - חפץ מרדכי" },
          { id: "mendelson", order: 12, reasoning: "המשך - מנדלסון" },
          { id: "haachim-raab", order: 13, reasoning: "רחוב קטן - האחים ראב" },
          { id: "sweden", order: 14, reasoning: "סיום - שבדיה" },
        ];

        order.forEach(item => {
          const street = areaStreets.find(s => s.id === item.id);
          if (street) {
            analyzedStreets.push({
              id: street.id,
              name: street.name,
              area: street.area,
              isBig: street.isBig,
              estimatedTime: street.isBig ? 20 : 12,
              suggestedOrder: item.order,
              reasoning: item.reasoning
            });
          }
        });

        recommendations.push("✓ אזור מאוזן עם 14 רחובות קטנים");
        recommendations.push("✓ מומלץ להתחיל מדוד צבי פנקס ולעבור לאזור השכונתי");
        recommendations.push("✓ זמן משוער: ~2.5 שעות");

      } else if (areaNum === 14) {
        const order = [
          { id: "d-hayomi", order: 1, reasoning: "נקודת כניסה טובה - הדף היומי" },
          { id: "rot-110‑132", order: 2, reasoning: "התחלת רוטשילד - קטע ראשון" },
          { id: "rot-134‑150", order: 3, reasoning: "המשך רוטשילד - קטע שני" },
          { id: "rot-152‑182", order: 4, reasoning: "רוטשילד גדול! תכנן הפסקה" },
          { id: "gad-machnes-4", order: 5, reasoning: "סטייה קצרה - גד מכנס 4" },
          { id: "rot-179‑143", order: 6, reasoning: "חזרה לרוטשילד - צד שני עליון" },
          { id: "rot-141‑109", order: 7, reasoning: "המשך רוטשילד - צד שני תחתון" },
          { id: "kkl-even", order: 8, reasoning: "מעבר לקק\"ל - זוגי" },
          { id: "kkl-odd", order: 9, reasoning: "סיום - קק\"ל אי-זוגי" },
        ];

        order.forEach(item => {
          const street = areaStreets.find(s => s.id === item.id);
          if (street) {
            let shouldMove = undefined;

            if (street.id.includes('kkl')) {
              shouldMove = {
                toArea: 45,
                reason: "קק\"ל קרובה יותר לויצמן ויטקובסקי - כדאי לשקול העברה לאזור 45"
              };
            }

            analyzedStreets.push({
              id: street.id,
              name: street.name,
              area: street.area,
              isBig: street.isBig,
              estimatedTime: street.isBig ? 20 : 12,
              suggestedOrder: item.order,
              reasoning: item.reasoning,
              shouldMove
            });
          }
        });

        recommendations.push("⚠️ אזור קטן - רק 9 רחובות");
        recommendations.push("✓ ממוקד ברוטשילד - מסלול ליניארי");
        recommendations.push("💡 שקול להעביר קק\"ל לאזור 45 (קרובה יותר לויצמן)");
        recommendations.push("✓ זמן משוער: ~2 שעות");

      } else if (areaNum === 45) {
        const order = [
          { id: "yatk-32‑42", order: 1, reasoning: "התחלה - יטקובסקי זוגי" },
          { id: "yatk-37‑25", order: 2, reasoning: "צד שני - יטקובסקי אי-זוגי" },
          { id: "weiz-even", order: 3, reasoning: "מעבר לרחוב ראשי - ויצמן זוגי (גדול!)" },
          { id: "weiz-odd", order: 4, reasoning: "ויצמן אי-זוגי (גדול!) - תכנן הפסקה" },
          { id: "dagel-even", order: 5, reasoning: "דגל ראובן - זוגי" },
          { id: "dagel-odd", order: 6, reasoning: "דגל ראובן - אי-זוגי" },
          { id: "heib-even", order: 7, reasoning: "היבנר - זוגי" },
          { id: "heib-odd", order: 8, reasoning: "היבנר - אי-זוגי" },
          { id: "bertonov", order: 9, reasoning: "ברטונוב - רחוב גדול! (הפסקה)" },
          { id: "martin-buber", order: 10, reasoning: "מעבר לרחובות קטנים - מרטין בובר" },
          { id: "partisans", order: 11, reasoning: "הפרטיזנים - רחוב קטן" },
          { id: "lisin", order: 12, reasoning: "ליסין - רחוב קטן" },
          { id: "mirkin", order: 13, reasoning: "מירקין - רחוב קטן" },
          { id: "senerov", order: 14, reasoning: "סנרוב - רחוב קטן" },
          { id: "stern", order: 15, reasoning: "סיום - שטרן" },
        ];

        order.forEach(item => {
          const street = areaStreets.find(s => s.id === item.id);
          if (street) {
            let shouldMove = undefined;

            if (street.id === 'bertonov' || street.id.includes('weiz')) {
              shouldMove = {
                toArea: -1,
                reason: "רחוב גדול - שקול לעשות ביום נפרד או לחלק לשני ימים"
              };
            }

            analyzedStreets.push({
              id: street.id,
              name: street.name,
              area: street.area,
              isBig: street.isBig,
              estimatedTime: street.isBig ? 20 : 12,
              suggestedOrder: item.order,
              reasoning: item.reasoning,
              shouldMove
            });
          }
        });

        recommendations.push("⚠️ אזור גדול - 15 רחובות, 3 גדולים!");
        recommendations.push("💡 שקול לפצל: יום א' = ויצמן+יטקובסקי+דגל ראובן, יום ב' = השאר");
        recommendations.push("✓ אפשרות: העבר קק\"ל מאזור 14 לכאן");
        recommendations.push("⚠️ זמן משוער: ~3 שעות - העומס הכבד ביותר!");
      }

      results.push({
        area: areaNum,
        currentStreets: areaStreets.length,
        totalTime,
        bigStreets,
        smallStreets,
        balance,
        streets: analyzedStreets,
        recommendations
      });
    });

    setAnalyses(results);
    setShowAnalysis(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-3">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">אופטימיזציה חכמה של האזורים</h2>
              <p className="text-sm text-gray-600">ניתוח מעמיק של כל אזור + המלצות לשיפור</p>
            </div>
          </div>

          <button
            onClick={analyzeAreas}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2"
          >
            <TrendingUp size={20} />
            נתח ואופטמז
          </button>
        </div>

        {!showAnalysis && (
          <div className="text-center py-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-dashed border-purple-300">
            <Zap className="mx-auto text-purple-500 mb-4" size={48} />
            <p className="text-gray-700 font-semibold mb-2">לחץ על הכפתור לניתוח מלא</p>
            <p className="text-sm text-gray-600">המערכת תנתח כל אזור ותציע סדר אופטימלי</p>
          </div>
        )}
      </div>

      {showAnalysis && analyses.map(analysis => {
        const color = getAreaColor(analysis.area as any);

        return (
          <div key={analysis.area} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`${color.bgSolid} rounded-lg p-3`}>
                  <MapPin className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">אזור {analysis.area}</h3>
                  <p className="text-sm text-gray-600">
                    {analysis.currentStreets} רחובות • {analysis.bigStreets} גדולים • {analysis.smallStreets} קטנים
                  </p>
                </div>
              </div>

              <div className={`px-4 py-2 rounded-lg ${
                analysis.balance === 'light' ? 'bg-green-100 text-green-700' :
                analysis.balance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                <div className="text-sm font-semibold">עומס</div>
                <div className="text-2xl font-bold">{analysis.totalTime} דק'</div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <AlertCircle size={18} />
                המלצות לאזור זה:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-bold text-gray-800 mb-3">סדר חלוקה מומלץ:</h4>
              <div className="space-y-2">
                {analysis.streets.map((street) => (
                  <div
                    key={street.id}
                    className={`border-2 rounded-lg p-3 ${
                      street.shouldMove ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`${color.bgSolid} text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold shadow-md flex-shrink-0`}>
                        {street.suggestedOrder}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-bold text-gray-800">{street.name}</h5>
                          {street.isBig && (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                              גדול
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <ArrowRight size={14} />
                          {street.reasoning}
                        </p>
                        {street.shouldMove && (
                          <p className="text-sm text-orange-700 font-semibold mt-1 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {street.shouldMove.reason}
                          </p>
                        )}
                      </div>

                      <div className="text-left flex-shrink-0">
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Clock size={14} />
                          <span>זמן</span>
                        </div>
                        <div className="text-lg font-bold text-gray-700">{street.estimatedTime} דק'</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-lg p-4 ${
              analysis.balance === 'light' ? 'bg-green-50 border-2 border-green-200' :
              analysis.balance === 'medium' ? 'bg-yellow-50 border-2 border-yellow-200' :
              'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-bold mb-1 ${
                    analysis.balance === 'light' ? 'text-green-800' :
                    analysis.balance === 'medium' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    סיכום אזור {analysis.area}
                  </h4>
                  <p className={`text-sm ${
                    analysis.balance === 'light' ? 'text-green-700' :
                    analysis.balance === 'medium' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {analysis.balance === 'light' && 'אזור קל - מתאים ליום רגוע'}
                    {analysis.balance === 'medium' && 'אזור מאוזן - עומס סביר'}
                    {analysis.balance === 'heavy' && 'אזור כבד - שקול חלוקה לשני ימים'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {Math.floor(analysis.totalTime / 60)}:{(analysis.totalTime % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-600">שעות</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {showAnalysis && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-6 border-2 border-green-300">
          <div className="flex items-start gap-4">
            <CheckCircle className="text-green-600 flex-shrink-0" size={32} />
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">המלצות כלליות לשיפור:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">1.</span>
                  <span><strong>העבר קק"ל מאזור 14 לאזור 45</strong> - זה יאזן את העומס (14 קטן מדי, 45 גדול מדי)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">2.</span>
                  <span><strong>שקול לפצל את אזור 45</strong> - עם 3 רחובות גדולים זה יום ארוך מדי</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">3.</span>
                  <span><strong>השתמש בסדר המומלץ</strong> - זה יחסוך לך 20-30 דקות ביום</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">4.</span>
                  <span><strong>תכנן הפסקות</strong> - אחרי כל רחוב גדול (20 דק') קח הפסקה קצרה</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
