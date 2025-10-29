import { useState } from "react";
import { Map, Navigation, TrendingUp, Clock, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { streets } from "../data/streets";
import { getAreaColor } from "../utils/areaColors";

interface OptimizedRoute {
  order: number;
  streetId: string;
  streetName: string;
  reasoning: string;
  estimatedTime: number;
  cluster: string;
}

interface AreaPlan {
  area: number;
  totalTime: number;
  routes: OptimizedRoute[];
  insights: string[];
  improvements: string[];
}

export default function GeographicAreaAnalysis() {
  const [analysis, setAnalysis] = useState<AreaPlan[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analyzeGeographically = () => {
    const plans: AreaPlan[] = [];

    // אזור 12 - אזור התשעים ושלוש ודוד צבי פנקס (צפון מזרח פתח תקווה)
    const area12Routes: OptimizedRoute[] = [
      { order: 1, streetId: "ninety-three-42-2", streetName: "התשעים ושלוש 42‑2 (זוגי)", reasoning: "נקודת פתיחה - צד זוגי של הרחוב הראשי", estimatedTime: 12, cluster: "רחוב ראשי" },
      { order: 2, streetId: "ninety-three-1-11", streetName: "התשעים ושלוש 1‑11 (אי‑זוגי)", reasoning: "המשך התשעים ושלוש - קטע תחתון צד שני", estimatedTime: 12, cluster: "רחוב ראשי" },
      { order: 3, streetId: "ninety-three-13-21", streetName: "התשעים ושלוש 13‑21 (אי‑זוגי)", reasoning: "סיום התשעים ושלוש - קטע עליון", estimatedTime: 12, cluster: "רחוב ראשי" },
      { order: 4, streetId: "david-zvi-pinkas-24-2", streetName: "דוד צבי פנקס 24‑2 (זוגי)", reasoning: "מעבר לרחוב מקביל - דוד צבי פנקס צד זוגי", estimatedTime: 12, cluster: "רחוב ראשי" },
      { order: 5, streetId: "david-zvi-pinkas-1-21", streetName: "דוד צבי פנקס 1‑21 (אי‑זוגי)", reasoning: "צד שני של פנקס - חזרה לכיוון ההתחלה", estimatedTime: 12, cluster: "רחוב ראשי" },
      { order: 6, streetId: "hakerem", streetName: "הכרם", reasoning: "כניסה לאשכול רחובות סמוכים מזרחה", estimatedTime: 10, cluster: "רחובות שכונתיים" },
      { order: 7, streetId: "harav-kook", streetName: "הרב קוק", reasoning: "רחוב סמוך - ממשיכים באזור השכונתי", estimatedTime: 10, cluster: "רחובות שכונתיים" },
      { order: 8, streetId: "chafetz-mordechai", streetName: "חפץ מרדכי", reasoning: "רחוב קטן סמוך (לפי מחקר - קרוב להתשעים ושלוש)", estimatedTime: 8, cluster: "רחובות שכונתיים" },
      { order: 9, streetId: "zichron-moshe", streetName: "זכרון משה", reasoning: "המשך באזור - זכרון משה", estimatedTime: 10, cluster: "רחובות שכונתיים" },
      { order: 10, streetId: "mendelson", streetName: "מנדלסון", reasoning: "רחוב סמוך - מנדלסון", estimatedTime: 10, cluster: "רחובות שכונתיים" },
      { order: 11, streetId: "anna-frank", streetName: "אנה פרנק", reasoning: "רחוב בינוני - אנה פרנק", estimatedTime: 10, cluster: "רחובות שכונתיים" },
      { order: 12, streetId: "chaim-cohen", streetName: "חיים כהן", reasoning: "רחוב סמוך - חיים כהן", estimatedTime: 10, cluster: "רחובות שכונתיים" },
      { order: 13, streetId: "haachim-raab", streetName: "האחים ראב", reasoning: "רחוב קטן - האחים ראב", estimatedTime: 8, cluster: "רחובות שכונתיים" },
      { order: 14, streetId: "sweden", streetName: "שבדיה", reasoning: "סיום אזור - שבדיה (לפי מחקר - באזור התשעים ושלוש)", estimatedTime: 10, cluster: "רחובות שכונתיים" },
    ];

    plans.push({
      area: 12,
      totalTime: area12Routes.reduce((sum, r) => sum + r.estimatedTime, 0),
      routes: area12Routes,
      insights: [
        "אזור מרוכז גיאוגרפית סביב התשעים ושלוש ודוד צבי פנקס",
        "2 רחובות ראשיים מקבילים + אשכול רחובות שכונתיים סמוכים",
        "מסלול לוגי: מתחילים ברחובות הראשיים, ממשיכים לאזור השכונתי",
      ],
      improvements: [
        "✓ חלוקה לגושים: רחובות ראשיים (1-5) → רחובות שכונתיים (6-14)",
        "✓ מינימום חזרות - כל רחוב במעבר אחד",
        "✓ זמן משוער: 2 שעות 26 דקות",
      ]
    });

    // אזור 14 - אזור רוטשילד (מרכז פתח תקווה)
    const area14Routes: OptimizedRoute[] = [
      { order: 1, streetId: "rot-110‑132", streetName: "רוטשילד 110‑132", reasoning: "פתיחה ברוטשילד - קטע תחתון", estimatedTime: 12, cluster: "רוטשילד מרכזי" },
      { order: 2, streetId: "rot-134‑150", streetName: "רוטשילד 134‑150", reasoning: "המשך רוטשילד - קטע אמצעי", estimatedTime: 12, cluster: "רוטשילד מרכזי" },
      { order: 3, streetId: "rot-152‑182", streetName: "רוטשילד 152‑182", reasoning: "רוטשילד עליון - קטע גדול! תכנן הפסקה", estimatedTime: 20, cluster: "רוטשילד מרכזי" },
      { order: 4, streetId: "d-hayomi", streetName: "הדף היומי", reasoning: "סטייה קצרה לרחוב סמוך", estimatedTime: 10, cluster: "סביבת רוטשילד" },
      { order: 5, streetId: "gad-machnes-4", streetName: "גד מכנס 4", reasoning: "רחוב קטן סמוך לרוטשילד", estimatedTime: 8, cluster: "סביבת רוטשילד" },
      { order: 6, streetId: "rot-179‑143", streetName: "רוטשילד 179‑143", reasoning: "חזרה לרוטשילד - צד שני עליון", estimatedTime: 15, cluster: "רוטשילד מרכזי" },
      { order: 7, streetId: "rot-141‑109", streetName: "רוטשילד 141‑109", reasoning: "המשך רוטשילד צד שני - תחתון", estimatedTime: 12, cluster: "רוטשילד מרכזי" },
      { order: 8, streetId: "kkl-even", streetName: "קק\"ל 28‑34 (זוגי)", reasoning: "מעבר לקק\"ל (רחוב מקביל למזרח)", estimatedTime: 10, cluster: "קק\"ל" },
      { order: 9, streetId: "kkl-odd", streetName: "קק\"ל 21‑25 (אי‑זוגי)", reasoning: "סיום בקק\"ל - צד שני", estimatedTime: 10, cluster: "קק\"ל" },
    ];

    plans.push({
      area: 14,
      totalTime: area14Routes.reduce((sum, r) => sum + r.estimatedTime, 0),
      routes: area14Routes,
      insights: [
        "אזור ממוקד ברוטשילד - רחוב מרכזי ארוך בפתח תקווה",
        "רוטשילד הוא עורק מרכזי - מחולק ל-5 קטעים",
        "קק\"ל רחוב מקביל ממזרח",
      ],
      improvements: [
        "⚠️ אזור קטן יחסית - 9 רחובות בלבד",
        "💡 אופציה: העבר קק\"ל לאזור 45 (קרובה לויצמן ויטקובסקי)",
        "✓ זמן משוער: 1 שעה 49 דקות",
      ]
    });

    // אזור 45 - אזור ויצמן ויטקובסקי (דרום מזרח פתח תקווה)
    const area45Routes: OptimizedRoute[] = [
      { order: 1, streetId: "weiz-even", streetName: "ויצמן 2‑34 (זוגי)", reasoning: "פתיחה ברחוב הראשי - ויצמן זוגי (גדול!)", estimatedTime: 20, cluster: "ויצמן ראשי" },
      { order: 2, streetId: "weiz-odd", streetName: "ויצמן 35‑1 (אי‑זוגי)", reasoning: "ויצמן צד שני - אי-זוגי (גדול!)", estimatedTime: 20, cluster: "ויצמן ראשי" },
      { order: 3, streetId: "yatk-32‑42", streetName: "אח׳ יטקובסקי 32‑42 (זוגי)", reasoning: "מעבר לרחוב מקביל - יטקובסקי זוגי", estimatedTime: 12, cluster: "יטקובסקי" },
      { order: 4, streetId: "yatk-37‑25", streetName: "אח׳ יטקובסקי 37‑25 (אי‑זוגי)", reasoning: "יטקובסקי צד שני", estimatedTime: 12, cluster: "יטקובסקי" },
      { order: 5, streetId: "dagel-even", streetName: "דגל ראובן 18‑54 (זוגי)", reasoning: "דגל ראובן - רחוב מקביל", estimatedTime: 12, cluster: "רחובות מקבילים" },
      { order: 6, streetId: "dagel-odd", streetName: "דגל ראובן 63‑23 (אי‑זוגי)", reasoning: "דגל ראובן צד שני", estimatedTime: 12, cluster: "רחובות מקבילים" },
      { order: 7, streetId: "heib-even", streetName: "היבנר 12‑74 (זוגי)", reasoning: "היבנר - רחוב נוסף באזור", estimatedTime: 12, cluster: "רחובות מקבילים" },
      { order: 8, streetId: "heib-odd", streetName: "היבנר 55‑7 (אי‑זוגי)", reasoning: "היבנר צד שני", estimatedTime: 12, cluster: "רחובות מקבילים" },
      { order: 9, streetId: "bertonov", streetName: "ברטונוב (כל הרחוב)", reasoning: "ברטונוב - רחוב גדול! הפסקה מומלצת", estimatedTime: 20, cluster: "ברטונוב וסביבה" },
      { order: 10, streetId: "martin-buber", streetName: "מרטין בובר", reasoning: "מעבר לרחובות קטנים - מרטין בובר", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 11, streetId: "partisans", streetName: "הפרטיזנים", reasoning: "הפרטיזנים - רחוב קטן", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 12, streetId: "lisin", streetName: "ליסין", reasoning: "ליסין - רחוב קטן", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 13, streetId: "mirkin", streetName: "מירקין", reasoning: "מירקין - רחוב קטן", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 14, streetId: "senerov", streetName: "סנרוב", reasoning: "סנרוב - רחוב קטן", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 15, streetId: "stern", streetName: "שטרן", reasoning: "סיום - שטרן", estimatedTime: 10, cluster: "רחובות קטנים" },
    ];

    plans.push({
      area: 45,
      totalTime: area45Routes.reduce((sum, r) => sum + r.estimatedTime, 0),
      routes: area45Routes,
      insights: [
        "אזור גדול עם 3 רחובות ראשיים גדולים: ויצמן, יטקובסקי, ברטונוב",
        "רחובות מקבילים: ויצמן ↔ יטקובסקי ↔ דגל ראובן ↔ היבנר",
        "אשכול רחובות קטנים בסוף המסלול",
      ],
      improvements: [
        "⚠️ אזור כבד - 15 רחובות, זמן ארוך!",
        "💡 שקול לפצל ל-2 ימים: יום א' = ויצמן+יטקובסקי+דגל ראובן, יום ב' = היבנר+ברטונוב+קטנים",
        "💡 אופציה: קבל את קק\"ל מאזור 14 (רחובות מקבילים באזור)",
        "⚠️ זמן משוער: 3 שעות 2 דקות - העומס הכבד ביותר!",
      ]
    });

    setAnalysis(plans);
    setShowAnalysis(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Map size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold">ניתוח גיאוגרפי מבוסס מחקר</h2>
              <p className="text-blue-100 mt-1">מיפוי רחובות פתח תקווה + סדר אופטימלי לכל אזור</p>
            </div>
          </div>

          <button
            onClick={analyzeGeographically}
            className="bg-white hover:bg-blue-50 text-blue-600 px-6 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2"
          >
            <TrendingUp size={20} />
            הצג ניתוח
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4">
          <p className="text-sm flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>הניתוח מבוסס על מיקומים אמיתיים ברחובות פתח תקווה</span>
          </p>
        </div>
      </div>

      {showAnalysis && analysis.map(plan => {
        const color = getAreaColor(plan.area as any);
        const hours = Math.floor(plan.totalTime / 60);
        const minutes = plan.totalTime % 60;

        return (
          <div key={plan.area} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`${color.bgSolid} rounded-xl p-4`}>
                  <MapPin className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">אזור {plan.area}</h3>
                  <p className="text-gray-600 mt-1">{plan.routes.length} רחובות במסלול</p>
                </div>
              </div>

              <div className="text-left bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
                <div className="text-sm text-gray-600 mb-1">זמן משוער</div>
                <div className="text-3xl font-bold text-gray-800">
                  {hours}:{minutes.toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <Navigation size={18} />
                  תובנות גיאוגרפיות:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {plan.insights.map((insight, idx) => (
                    <li key={idx}>• {insight}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 lg:col-span-2">
                <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  <TrendingUp size={18} />
                  שיפורים והמלצות:
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {plan.improvements.map((improvement, idx) => (
                    <li key={idx}>{improvement}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Navigation size={22} />
                מסלול אופטימלי מומלץ:
              </h4>

              <div className="space-y-3">
                {plan.routes.map(route => {
                  const street = streets.find(s => s.id === route.streetId);
                  const isLarge = street?.isBig;

                  return (
                    <div
                      key={route.order}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        isLarge
                          ? 'bg-red-50 border-red-300 shadow-md'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`${color.bgSolid} text-white rounded-xl w-14 h-14 flex items-center justify-center font-bold text-xl shadow-lg flex-shrink-0`}>
                          {route.order}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="text-lg font-bold text-gray-800">{route.streetName}</h5>
                            {isLarge && (
                              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                                רחוב גדול!
                              </span>
                            )}
                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                              {route.cluster}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="text-blue-500">→</span>
                            {route.reasoning}
                          </p>
                        </div>

                        <div className="text-left flex-shrink-0">
                          <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                            <Clock size={14} />
                            <span>זמן</span>
                          </div>
                          <div className="text-xl font-bold text-gray-700">{route.estimatedTime} דק'</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {showAnalysis && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-orange-300">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-orange-600 flex-shrink-0" size={32} />
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">המלצות מרכזיות לאופטימיזציה:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                  <h4 className="font-bold text-orange-800 mb-2">1. איזון עומס בין אזורים</h4>
                  <p className="text-sm text-gray-700">
                    אזור 14 (1:49) קטן מדי, אזור 45 (3:02) גדול מדי. שקול להעביר קק"ל מ-14 ל-45 לאיזון טוב יותר.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                  <h4 className="font-bold text-orange-800 mb-2">2. פיצול אזור 45</h4>
                  <p className="text-sm text-gray-700">
                    עם 3 רחובות גדולים ו-15 רחובות סה"כ, שקול לחלק ל-2 ימי עבודה נפרדים.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                  <h4 className="font-bold text-orange-800 mb-2">3. מסלול גיאוגרפי</h4>
                  <p className="text-sm text-gray-700">
                    השתמש בסדר המוצע - הוא מבוסס על קרבה אמיתית של רחובות ויחסוך זמן הליכה.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                  <h4 className="font-bold text-orange-800 mb-2">4. הפסקות מתוכננות</h4>
                  <p className="text-sm text-gray-700">
                    תכנן הפסקות אחרי רחובות גדולים: רוטשילד 152-182, ויצמן (שני הצדדים), ברטונוב.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
