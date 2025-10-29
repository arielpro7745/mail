import { useState } from "react";
import { Map, Navigation, TrendingUp, Clock, MapPin, AlertCircle, CheckCircle2, Info } from "lucide-react";
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
  location: string;
  totalTime: number;
  routes: OptimizedRoute[];
  insights: string[];
  improvements: string[];
  geographicNotes: string[];
}

export default function GeographicAreaAnalysis() {
  const [analysis, setAnalysis] = useState<AreaPlan[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analyzeGeographically = () => {
    const plans: AreaPlan[] = [];

    // =====================================================
    // אזור 12 - ליבת כפר גנים א' (רחוב התשעים ושלוש ובסביבתו)
    // =====================================================
    const area12Routes: OptimizedRoute[] = [
      { order: 1, streetId: "ninety-three-42-2", streetName: "התשעים ושלוש 42‑2 (זוגי)", reasoning: "התחלה ברחוב הראשי - צד זוגי (בתים גבוהים)", estimatedTime: 12, cluster: "התשעים ושלוש" },
      { order: 2, streetId: "ninety-three-1-11", streetName: "התשעים ושלוש 1‑11 (אי‑זוגי)", reasoning: "חציה לצד השני - קטע תחתון", estimatedTime: 12, cluster: "התשעים ושלוש" },
      { order: 3, streetId: "ninety-three-13-21", streetName: "התשעים ושלוש 13‑21 (אי‑זוגי)", reasoning: "המשך אותו צד - קטע עליון", estimatedTime: 12, cluster: "התשעים ושלוש" },
      { order: 4, streetId: "chafetz-mordechai", streetName: "חפץ מרדכי", reasoning: "רחוב מקביל קרוב (מחקר: באזור התשעים ושלוש)", estimatedTime: 8, cluster: "רחובות מקבילים" },
      { order: 5, streetId: "haachim-raab", streetName: "האחים ראב", reasoning: "רחוב קטן סמוך (משפחת היסטורית מפתח תקווה)", estimatedTime: 8, cluster: "רחובות מקבילים" },
      { order: 6, streetId: "david-zvi-pinkas-24-2", streetName: "דוד צבי פנקס 24‑2 (זוגי)", reasoning: "מעבר לרחוב מרכזי נוסף - צד זוגי", estimatedTime: 12, cluster: "דוד צבי פנקס" },
      { order: 7, streetId: "david-zvi-pinkas-1-21", streetName: "דוד צבי פנקס 1‑21 (אי‑זוגי)", reasoning: "צד שני של דוד צבי פנקס", estimatedTime: 12, cluster: "דוד צבי פנקס" },
      { order: 8, streetId: "hakerem", streetName: "הכרם", reasoning: "כניסה לאשכול הרחובות הקטנים", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 9, streetId: "harav-kook", streetName: "הרב קוק", reasoning: "רחוב סמוך באזור (170מ' מזכרון משה)", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 10, streetId: "zichron-moshe", streetName: "זכרון משה", reasoning: "רחוב סמוך (170מ' מהרב קוק)", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 11, streetId: "anna-frank", streetName: "אנה פרנק", reasoning: "רחוב בינוני באזור", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 12, streetId: "mendelson", streetName: "מנדלסון", reasoning: "רחוב סמוך (מוזכר ליד הרב קוק וזכרון משה)", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 13, streetId: "chaim-cohen", streetName: "חיים כהן", reasoning: "רחוב בינוני באזור", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 14, streetId: "sweden", streetName: "שבדיה", reasoning: "סיום - רחוב באזור כפר גנים", estimatedTime: 10, cluster: "רחובות קטנים" },
    ];

    plans.push({
      area: 12,
      location: "כפר גנים א' - אזור התשעים ושלוש",
      totalTime: area12Routes.reduce((sum, r) => sum + r.estimatedTime, 0),
      routes: area12Routes,
      insights: [
        "מיקום: ליבת שכונת כפר גנים א' (הפסטורלית) בדרום-מערב פתח תקווה",
        "רחוב התשעים ושלוש = רחוב ראשי עם 34 בתים",
        "דוד צבי פנקס = רחוב מרכזי נוסף באזור",
        "12 רחובות קטנים נוספים סביב 2 הרחובות הראשיים"
      ],
      improvements: [
        "✅ מסלול מאורגן: רחובות ראשיים (1-7) ← רחובות קטנים (8-14)",
        "✅ זמן סביר: 2:26 שעות",
        "✅ אזור מרוכז גיאוגרפית - מינימום הליכה"
      ],
      geographicNotes: [
        "💡 התשעים ושלוש ודוד צבי פנקס הם 2 הצירים המרכזיים",
        "💡 כל הרחובות הקטנים קרובים זה לזה (מחקר: 170 מטר ביניהם)",
        "💡 זהו אזור מגורים ותיק ושקט"
      ]
    });

    // =====================================================
    // אזור 14 - גבול כפר גנים א' (רוטשילד + קק"ל + הדף היומי)
    // =====================================================
    const area14Routes: OptimizedRoute[] = [
      { order: 1, streetId: "rot-110‑132", streetName: "רוטשילד 110‑132", reasoning: "פתיחה ברוטשילד (גבול צפוני של כפר גנים א')", estimatedTime: 12, cluster: "רוטשילד" },
      { order: 2, streetId: "rot-134‑150", streetName: "רוטשילד 134‑150", reasoning: "המשך רוטשילד - קטע אמצעי", estimatedTime: 12, cluster: "רוטשילד" },
      { order: 3, streetId: "rot-152‑182", streetName: "רוטשילד 152‑182", reasoning: "רוטשילד עליון עד מרכז אורון (צומת גד מכנס) - גדול!", estimatedTime: 20, cluster: "רוטשילד" },
      { order: 4, streetId: "gad-machnes-4", streetName: "גד מכנס 4", reasoning: "סטייה קצרה לצומת - גד מכנס/רוטשילד (מרכז אורון)", estimatedTime: 8, cluster: "רוטשילד" },
      { order: 5, streetId: "rot-179‑143", streetName: "רוטשילד 179‑143", reasoning: "חזרה לרוטשילד - צד שני למטה", estimatedTime: 15, cluster: "רוטשילד" },
      { order: 6, streetId: "rot-141‑109", streetName: "רוטשילד 141‑109", reasoning: "המשך רוטשילד צד שני - חזרה להתחלה", estimatedTime: 12, cluster: "רוטשילד" },
      { order: 7, streetId: "kkl-even", streetName: "קק\"ל 28‑34 (זוגי)", reasoning: "מעבר לקק\"ל (יש תחנה 'רוטשילד/קק\"ל' - קרובים!)", estimatedTime: 10, cluster: "קק\"ל" },
      { order: 8, streetId: "kkl-odd", streetName: "קק\"ל 21‑25 (אי‑זוגי)", reasoning: "צד שני של קק\"ל", estimatedTime: 10, cluster: "קק\"ל" },
      { order: 9, streetId: "d-hayomi", streetName: "הדף היומי", reasoning: "סיום - רחוב קטן באזור רוטשילד", estimatedTime: 10, cluster: "רחובות צדדיים" },
    ];

    plans.push({
      area: 14,
      location: "גבול כפר גנים א' - רחוב רוטשילד",
      totalTime: area14Routes.reduce((sum, r) => sum + r.estimatedTime, 0),
      routes: area14Routes,
      insights: [
        "מיקום: רוטשילד = גבול צפוני של כפר גנים א', עורק מרכזי",
        "מרכז אורון = ציון דרך (צומת רוטשילד/גד מכנס)",
        "קק\"ל = רחוב קרוב לרוטשילד (תחנת אוטובוס משותפת)",
        "רוטשילד הוא רחוב היסטורי - על שם הברון רוטשילד"
      ],
      improvements: [
        "⚠️ אזור קטן: 9 רחובות בלבד, 1:49 שעות",
        "💡 אופציה: העבר קק\"ל לאזור 45 (קרובה יותר לויצמן)",
        "✅ מסלול יעיל: רוטשילד מלא ← קק\"ל ← הדף היומי"
      ],
      geographicNotes: [
        "💡 רוטשילד = עורק ראשי מערב-מזרח",
        "💡 מרכז אורון = נקודת ציון מרכזית בצומת",
        "💡 אזור זה שונה מאזור 12 - זה הגבול הצפוני של כפר גנים"
      ]
    });

    // =====================================================
    // אזור 45 - מרכז כפר גנים (ויצמן, יטקובסקי, ועוד)
    // =====================================================
    const area45Routes: OptimizedRoute[] = [
      { order: 1, streetId: "weiz-even", streetName: "ויצמן 2‑34 (זוגי)", reasoning: "התחלה ברחוב ויצמן - עורק מרכזי בכפר גנים (גדול!)", estimatedTime: 20, cluster: "ויצמן" },
      { order: 2, streetId: "weiz-odd", streetName: "ויצמן 35‑1 (אי‑זוגי)", reasoning: "צד שני של ויצמן (גדול!)", estimatedTime: 20, cluster: "ויצמן" },
      { order: 3, streetId: "yatk-32‑42", streetName: "אח׳ יטקובסקי 32‑42 (זוגי)", reasoning: "מעבר ליטקובסקי - רחוב מקביל לויצמן", estimatedTime: 12, cluster: "יטקובסקי" },
      { order: 4, streetId: "yatk-37‑25", streetName: "אח׳ יטקובסקי 37‑25 (אי‑זוגי)", reasoning: "צד שני של יטקובסקי", estimatedTime: 12, cluster: "יטקובסקי" },
      { order: 5, streetId: "dagel-even", streetName: "דגל ראובן 18‑54 (זוגי)", reasoning: "דגל ראובן - רחוב מקביל נוסף", estimatedTime: 12, cluster: "רחובות מקבילים" },
      { order: 6, streetId: "dagel-odd", streetName: "דגל ראובן 63‑23 (אי‑זוגי)", reasoning: "צד שני של דגל ראובן", estimatedTime: 12, cluster: "רחובות מקבילים" },
      { order: 7, streetId: "heib-even", streetName: "היבנר 12‑74 (זוגי)", reasoning: "היבנר - רחוב מקביל נוסף", estimatedTime: 12, cluster: "רחובות מקבילים" },
      { order: 8, streetId: "heib-odd", streetName: "היבנר 55‑7 (אי‑זוגי)", reasoning: "צד שני של היבנר", estimatedTime: 12, cluster: "רחובות מקבילים" },
      { order: 9, streetId: "bertonov", streetName: "ברטונוב (כל הרחוב)", reasoning: "ברטונוב - רחוב גדול! תכנן הפסקה", estimatedTime: 20, cluster: "ברטונוב" },
      { order: 10, streetId: "martin-buber", streetName: "מרטין בובר", reasoning: "מעבר לרחובות הקטנים - מרטין בובר", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 11, streetId: "partisans", streetName: "הפרטיזנים", reasoning: "רחוב קטן באזור", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 12, streetId: "mirkin", streetName: "מירקין", reasoning: "מירקין (ליד ויצמן לפי המחקר)", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 13, streetId: "lisin", streetName: "ליסין", reasoning: "רחוב קטן באזור", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 14, streetId: "senerov", streetName: "סנרוב", reasoning: "רחוב קטן באזור", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 15, streetId: "stern", streetName: "שטרן", reasoning: "סיום - רחוב קטן", estimatedTime: 10, cluster: "רחובות קטנים" },
    ];

    plans.push({
      area: 45,
      location: "מרכז כפר גנים - אזור ויצמן ויטקובסקי",
      totalTime: area45Routes.reduce((sum, r) => sum + r.estimatedTime, 0),
      routes: area45Routes,
      insights: [
        "מיקום: מרכז שכונת כפר גנים (כפר גנים ב' וג')",
        "3 עורקים מרכזיים: ויצמן (38 בניינים!), יטקובסקי (34 בניינים!), ברטונוב",
        "רחובות מקבילים: דגל ראובן, היבנר",
        "אשכול של 6 רחובות קטנים: מרטין בובר, הפרטיזנים, מירקין, ליסין, סנרוב, שטרן"
      ],
      improvements: [
        "⚠️ אזור כבד מאוד! 15 רחובות, 3:02 שעות",
        "💡 אופציה 1: קבל את קק\"ל מאזור 14 (רחובות קרובים)",
        "💡 אופציה 2: פצל ל-2 ימים:",
        "  • יום א': ויצמן + יטקובסקי + דגל ראובן (1:36 שעות)",
        "  • יום ב': היבנר + ברטונוב + 6 הקטנים (1:26 שעות)",
        "✅ מסלול לוגי: עורקים ראשיים ← מקבילים ← קטנים"
      ],
      geographicNotes: [
        "💡 כפר גנים ב' נבנתה בשנות ה-80",
        "💡 כפר גנים ג' נבנתה בסוף שנות ה-2000",
        "💡 ויצמן ויטקובסקי הם עורקים מרכזיים צפון-דרום",
        "💡 זהו האזור העמוס ביותר - שקול פיצול!"
      ]
    });

    setAnalysis(plans);
    setShowAnalysis(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Map size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold">ניתוח גיאוגרפי מבוסס מחקר מעמיק</h2>
              <p className="text-blue-100 mt-1">מיפוי מלא של שכונת כפר גנים, פתח תקווה</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold mb-1">כפר גנים א'</div>
            <div className="text-sm text-blue-100">אזור 12: התשעים ושלוש</div>
            <div className="text-sm text-blue-100">אזור 14: רוטשילד (גבול)</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold mb-1">כפר גנים ב'+ג'</div>
            <div className="text-sm text-blue-100">אזור 45: ויצמן ויטקובסקי</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold mb-1">38 רחובות</div>
            <div className="text-sm text-blue-100">סה"כ 7:17 שעות</div>
          </div>
        </div>
      </div>

      {showAnalysis && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-orange-300">
          <div className="flex items-start gap-4">
            <Info className="text-orange-600 flex-shrink-0" size={32} />
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">תובנות מהמחקר:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
                  <strong className="text-orange-800">📍 כל 3 האזורים הם באותה שכונה!</strong>
                  <p className="text-gray-700 mt-1">כפר גנים = שכונה גדולה בדרום-מערב פתח תקווה</p>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
                  <strong className="text-orange-800">🏛️ התשעים ושלוש = רחוב פסטורלי</strong>
                  <p className="text-gray-700 mt-1">34 בתים בליבת כפר גנים א' (השכונה הוותיקה)</p>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
                  <strong className="text-orange-800">🛣️ רוטשילד = גבול צפוני</strong>
                  <p className="text-gray-700 mt-1">עורק מרכזי על שם הברון, מרכז אורון בצומת</p>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-orange-200">
                  <strong className="text-orange-800">🏙️ ויצמן = מרכז השכונה</strong>
                  <p className="text-gray-700 mt-1">38 בניינים! עורק ראשי בכפר גנים ב'+ג'</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <p className="text-lg text-gray-600 mt-1 font-semibold">{plan.location}</p>
                  <p className="text-sm text-gray-500">{plan.routes.length} רחובות במסלול</p>
                </div>
              </div>

              <div className="text-left bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                <div className="text-sm text-gray-600 mb-1">זמן משוער</div>
                <div className="text-3xl font-bold text-gray-800">
                  {hours}:{minutes.toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
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

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
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

              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                  <Info size={18} />
                  הערות גיאוגרפיות:
                </h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  {plan.geographicNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
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
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
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
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl shadow-lg p-6 border-2 border-red-300">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0" size={32} />
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">המלצות אסטרטגיות לאופטימיזציה:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                  <h4 className="font-bold text-red-800 mb-2">1. פיצול אזור 45 (הכבד ביותר)</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    3:02 שעות זה יותר מדי! פצל ל-2 ימים:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• יום א': ויצמן + יטקובסקי + דגל ראובן</li>
                    <li>• יום ב': היבנר + ברטונוב + 6 קטנים</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                  <h4 className="font-bold text-red-800 mb-2">2. העבר קק"ל לאזור 45</h4>
                  <p className="text-sm text-gray-700">
                    קק"ל קרובה יותר לויצמן מאשר לרוטשילד. זה יאזן את העומס: אזור 14 יקטן ל-1:39, אזור 45 יגדל רק מעט.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                  <h4 className="font-bold text-red-800 mb-2">3. התחל תמיד מהרחובות הגדולים</h4>
                  <p className="text-sm text-gray-700">
                    ויצמן, ברטונוב, רוטשילד - עשה אותם כשאתה טרי ובכוחות. הרחובות הקטנים יותר קלים.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                  <h4 className="font-bold text-red-800 mb-2">4. תכנן הפסקות</h4>
                  <p className="text-sm text-gray-700">
                    אחרי ויצמן (2 צדדים = 40 דק'), אחרי רוטשילד 152-182 (20 דק'), אחרי ברטונוב (20 דק').
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
