import { useState } from "react";
import { Map, Navigation, TrendingUp, Clock, MapPin, AlertCircle, CheckCircle2, Info, UserCheck } from "lucide-react";
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
    // אזור 12 - לפי הידע המקומי המדויק!
    // קו רציף: פנקס זוגי → התשעים ושלוש אי-זוגי → הכרם → המשך → התשעים ושלוש זוגי → פנקס אי-זוגי
    // =====================================================
    const area12Routes: OptimizedRoute[] = [
      { order: 1, streetId: "david-zvi-pinkas-24-2", streetName: "דוד צבי פנקס 24‑2 (זוגי)", reasoning: "נקודת התחלה - צד זוגי של פנקס", estimatedTime: 12, cluster: "קו ראשי A" },
      { order: 2, streetId: "ninety-three-1-11", streetName: "התשעים ושלוש 1‑11 (אי‑זוגי)", reasoning: "מעבר לתשעים ושלוש אי-זוגי (קרוב לפנקס!)", estimatedTime: 12, cluster: "קו ראשי A" },
      { order: 3, streetId: "ninety-three-13-21", streetName: "התשעים ושלוש 13‑21 (אי‑זוגי)", reasoning: "המשך אותו צד - קטע עליון", estimatedTime: 12, cluster: "קו ראשי A" },
      { order: 4, streetId: "hakerem", streetName: "הכרם", reasoning: "כניסה להכרם (קרוב לפנקס ולתשעים ושלוש)", estimatedTime: 10, cluster: "קו ראשי A" },
      { order: 5, streetId: "harav-kook", streetName: "הרב קוק", reasoning: "המשך באזור - רב קוק", estimatedTime: 10, cluster: "אשכול B" },
      { order: 6, streetId: "zichron-moshe", streetName: "זכרון משה", reasoning: "זכרון משה - באותו אזור", estimatedTime: 10, cluster: "אשכול B" },
      { order: 7, streetId: "chafetz-mordechai", streetName: "חפץ מרדכי", reasoning: "חפץ מרדכי - רחוב קטן", estimatedTime: 8, cluster: "אשכול B" },
      { order: 8, streetId: "haachim-raab", streetName: "האחים ראב", reasoning: "האחים ראב - רחוב קטן", estimatedTime: 8, cluster: "אשכול B" },
      { order: 9, streetId: "anna-frank", streetName: "אנה פרנק", reasoning: "אנה פרנק - באזור", estimatedTime: 10, cluster: "אשכול B" },
      { order: 10, streetId: "mendelson", streetName: "מנדלסון", reasoning: "מנדלסון - רחוב סמוך", estimatedTime: 10, cluster: "אשכול B" },
      { order: 11, streetId: "chaim-cohen", streetName: "חיים כהן", reasoning: "חיים כהן (קרוב לשבדיה!)", estimatedTime: 10, cluster: "אשכול C" },
      { order: 12, streetId: "sweden", streetName: "שבדיה", reasoning: "שבדיה (קרוב לחיים כהן ולפנקס!)", estimatedTime: 10, cluster: "אשכול C" },
      { order: 13, streetId: "ninety-three-42-2", streetName: "התשעים ושלוש 42‑2 (זוגי)", reasoning: "חזרה לתשעים ושלוש - צד זוגי", estimatedTime: 12, cluster: "קו ראשי A חזרה" },
      { order: 14, streetId: "david-zvi-pinkas-1-21", streetName: "דוד צבי פנקס 1‑21 (אי‑זוגי)", reasoning: "סיום בפנקס אי-זוגי - קו רציף שלם!", estimatedTime: 12, cluster: "קו ראשי A חזרה" },
    ];

    plans.push({
      area: 12,
      location: "כפר גנים א' - קו התשעים ושלוש-פנקס",
      totalTime: area12Routes.reduce((sum, r) => sum + r.estimatedTime, 0),
      routes: area12Routes,
      insights: [
        "מסלול מבוסס על ידע מקומי מדויק מהשטח!",
        "קו רציף: פנקס זוגי → תשעים ושלוש (שני הצדדים) → הכרם → ... → חזרה דרך תשעים ושלוש זוגי → פנקס אי-זוגי",
        "שבדיה קרוב לחיים כהן ולפנקס",
        "הכרם, תשעים ושלוש ופנקס יחסית קרובים"
      ],
      improvements: [
        "✅ מסלול אופטימלי: קו אחד שלם ללא חזרות מיותרות",
        "✅ זמן: 2:26 שעות",
        "✅ מבוסס על הידע שלך מהשטח"
      ],
      geographicNotes: [
        "💡 הסדר נבנה לפי הקרבה האמיתית שאתה מכיר",
        "💡 פנקס, תשעים ושלוש והכרם הם הציר המרכזי",
        "💡 שבדיה וחיים כהן באשכול נפרד אבל קרוב"
      ]
    });

    // =====================================================
    // אזור 14 - לפי הידע המקומי המדויק!
    // הדף היומי = רוטשילד 110/112/114
    // קק"ל = פנייה מרוטשילד 143
    // גד מכנס = צד שני של רוטשילד 182
    // =====================================================
    const area14Routes: OptimizedRoute[] = [
      { order: 1, streetId: "d-hayomi", streetName: "הדף היומי", reasoning: "התחלה בהדף היומי (=רוטשילד 110/112/114!)", estimatedTime: 10, cluster: "התחלה" },
      { order: 2, streetId: "rot-110‑132", streetName: "רוטשילד 110‑132", reasoning: "המשך רוטשילד מ-110 עד 132", estimatedTime: 12, cluster: "רוטשילד עולה" },
      { order: 3, streetId: "rot-134‑150", streetName: "רוטשילד 134‑150", reasoning: "המשך רוטשילד - קטע אמצעי", estimatedTime: 12, cluster: "רוטשילד עולה" },
      { order: 4, streetId: "rot-152‑182", streetName: "רוטשילד 152‑182", reasoning: "המשך עד 182 (גדול!)", estimatedTime: 20, cluster: "רוטשילד עולה" },
      { order: 5, streetId: "gad-machnes-4", streetName: "גד מכנס 4", reasoning: "גד מכנס 4 = הצד השני של רוטשילד 182!", estimatedTime: 8, cluster: "סיום צד A" },
      { order: 6, streetId: "rot-179‑143", streetName: "רוטשילד 179‑143", reasoning: "חזרה ברוטשילד צד שני - 179 עד 143", estimatedTime: 15, cluster: "רוטשילד יורד" },
      { order: 7, streetId: "kkl-even", streetName: "קק\"ל 28‑34 (זוגי)", reasoning: "פנייה לקק\"ל (יוצא מרוטשילד 143!)", estimatedTime: 10, cluster: "פנייה לקק\"ל" },
      { order: 8, streetId: "kkl-odd", streetName: "קק\"ל 21‑25 (אי‑זוגי)", reasoning: "צד שני של קק\"ל", estimatedTime: 10, cluster: "פנייה לקק\"ל" },
      { order: 9, streetId: "rot-141‑109", streetName: "רוטשילד 141‑109", reasoning: "חזרה לרוטשילד - סיום מ-141 עד 109", estimatedTime: 12, cluster: "רוטשילד יורד" },
    ];

    plans.push({
      area: 14,
      location: "כפר גנים א' - ציר רוטשילד",
      totalTime: area14Routes.reduce((sum, r) => sum + r.estimatedTime, 0),
      routes: area14Routes,
      insights: [
        "מסלול מבוסס על ידע מקומי מדויק מהשטח!",
        "הדף היומי = רוטשילד 110, 112, 114 - התחלה ממנו",
        "גד מכנס 4 = הצד השני של רוטשילד 182",
        "קק\"ל = פנייה בין רוטשילד 143 ל-141"
      ],
      improvements: [
        "✅ מסלול לוגי: עולים ברוטשילד → גד מכנס → יורדים ברוטשילד → פנייה לקק\"ל → סיום רוטשילד",
        "✅ זמן: 1:49 שעות",
        "✅ ללא חזרות מיותרות - הכל בזרימה אחת"
      ],
      geographicNotes: [
        "💡 הדף היומי זה ממש ההתחלה של רוטשילד",
        "💡 קק\"ל זו פנייה באמצע הדרך (בין 143 ל-141)",
        "💡 גד מכנס 4 זה בדיוק בנקודת הסיבוב ב-182"
      ]
    });

    // =====================================================
    // אזור 45 - צריך לבדוק אם יש לך ידע נוסף כאן
    // =====================================================
    const area45Routes: OptimizedRoute[] = [
      { order: 1, streetId: "weiz-even", streetName: "ויצמן 2‑34 (זוגי)", reasoning: "התחלה בויצמן - רחוב מרכזי (גדול!)", estimatedTime: 20, cluster: "ויצמן" },
      { order: 2, streetId: "weiz-odd", streetName: "ויצמן 35‑1 (אי‑זוגי)", reasoning: "צד שני של ויצמן (גדול!)", estimatedTime: 20, cluster: "ויצמן" },
      { order: 3, streetId: "yatk-32‑42", streetName: "אח׳ יטקובסקי 32‑42 (זוגי)", reasoning: "מעבר ליטקובסקי - רחוב מקביל", estimatedTime: 12, cluster: "יטקובסקי" },
      { order: 4, streetId: "yatk-37‑25", streetName: "אח׳ יטקובסקי 37‑25 (אי‑זוגי)", reasoning: "צד שני של יטקובסקי", estimatedTime: 12, cluster: "יטקובסקי" },
      { order: 5, streetId: "dagel-even", streetName: "דגל ראובן 18‑54 (זוגי)", reasoning: "דגל ראובן - רחוב מקביל", estimatedTime: 12, cluster: "רחובות מקבילים" },
      { order: 6, streetId: "dagel-odd", streetName: "דגל ראובן 63‑23 (אי‑זוגי)", reasoning: "צד שני של דגל ראובן", estimatedTime: 12, cluster: "רחובות מקבילים" },
      { order: 7, streetId: "heib-even", streetName: "היבנר 12‑74 (זוגי)", reasoning: "היבנר - רחוב מקביל", estimatedTime: 12, cluster: "רחובות מקבילים" },
      { order: 8, streetId: "heib-odd", streetName: "היבנר 55‑7 (אי‑זוגי)", reasoning: "צד שני של היבנר", estimatedTime: 12, cluster: "רחובות מקבילים" },
      { order: 9, streetId: "bertonov", streetName: "ברטונוב (כל הרחוב)", reasoning: "ברטונוב - רחוב גדול! תכנן הפסקה", estimatedTime: 20, cluster: "ברטונוב" },
      { order: 10, streetId: "martin-buber", streetName: "מרטין בובר", reasoning: "מעבר לרחובות קטנים - מרטין בובר", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 11, streetId: "partisans", streetName: "הפרטיזנים", reasoning: "הפרטיזנים - רחוב קטן", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 12, streetId: "mirkin", streetName: "מירקין", reasoning: "מירקין - רחוב קטן", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 13, streetId: "lisin", streetName: "ליסין", reasoning: "ליסין - רחוב קטן", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 14, streetId: "senerov", streetName: "סנרוב", reasoning: "סנרוב - רחוב קטן", estimatedTime: 10, cluster: "רחובות קטנים" },
      { order: 15, streetId: "stern", streetName: "שטרן", reasoning: "סיום - שטרן", estimatedTime: 10, cluster: "רחובות קטנים" },
    ];

    plans.push({
      area: 45,
      location: "כפר גנים ב'+ג' - אזור ויצמן ויטקובסקי",
      totalTime: area45Routes.reduce((sum, r) => sum + r.estimatedTime, 0),
      routes: area45Routes,
      insights: [
        "אזור גדול עם רחובות מקבילים: ויצמן, יטקובסקי, דגל ראובן, היבנר",
        "3 רחובות גדולים: ויצמן, יטקובסקי (באמצע), ברטונוב",
        "6 רחובות קטנים בסוף: מרטין בובר עד שטרן",
        "אם יש לך ידע נוסף על הסדר - ספר לי!"
      ],
      improvements: [
        "⚠️ אזור כבד! 15 רחובות, 3:02 שעות",
        "💡 אפשר לפצל ל-2 ימים:",
        "  • יום א': ויצמן + יטקובסקי + דגל ראובן",
        "  • יום ב': היבנר + ברטונוב + 6 קטנים",
        "✅ הסדר הנוכחי לוגי אבל נשמח לידע שלך!"
      ],
      geographicNotes: [
        "💡 האם הרחובות הקטנים קרובים זה לזה?",
        "💡 האם יש סדר ספציפי שאתה עושה?",
        "💡 ספר לנו ונעדכן!"
      ]
    });

    setAnalysis(plans);
    setShowAnalysis(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <UserCheck size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold">ניתוח מבוסס על הידע המקומי שלך!</h2>
              <p className="text-green-100 mt-1">בנוי לפי המידע המדויק שסיפרת - מהשטח לשטח</p>
            </div>
          </div>

          <button
            onClick={analyzeGeographically}
            className="bg-white hover:bg-green-50 text-green-600 px-6 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2"
          >
            <TrendingUp size={20} />
            הצג ניתוח
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-bold mb-2">המידע שלך שולב:</div>
              <ul className="space-y-1">
                <li>✓ הדף היומי = רוטשילד 110/112/114</li>
                <li>✓ גד מכנס 4 = הצד השני של רוטשילד 182</li>
                <li>✓ קק"ל = פנייה מרוטשילד 143</li>
                <li>✓ שבדיה קרוב לחיים כהן</li>
                <li>✓ קו רציף: פנקס זוגי → תשעים ושלוש → הכרם → ... → תשעים ושלוש זוגי → פנקס אי-זוגי</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showAnalysis && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border-2 border-blue-300">
          <div className="flex items-start gap-4">
            <Info className="text-blue-600 flex-shrink-0" size={32} />
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">העדכונים שעשיתי:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 border-2 border-blue-200">
                  <strong className="text-blue-800">אזור 14 - עכשיו מדויק!</strong>
                  <p className="text-gray-700 mt-1">מתחילים בהדף היומי (110), עולים ברוטשילד, מגיעים לגד מכנס (182), יורדים, פונים לקק"ל (143), וחוזרים</p>
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-blue-200">
                  <strong className="text-blue-800">אזור 12 - קו רציף!</strong>
                  <p className="text-gray-700 mt-1">פנקס זוגי → תשעים ושלוש אי-זוגי → הכרם → שאר הרחובות → תשעים ושלוש זוגי → פנקס אי-זוגי</p>
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

              <div className="text-left bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl border-2 border-green-200">
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
                  תובנות מהשטח:
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
                  היתרונות:
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
                  הערות נוספות:
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
                המסלול המומלץ שלך:
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
                            <span className="text-green-500">→</span>
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
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl shadow-lg p-6 border-2 border-amber-300">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={32} />
            <div className="w-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">רוצה לשפר עוד יותר?</h3>
              <div className="bg-white rounded-lg p-4 border-2 border-amber-200">
                <p className="text-gray-700 mb-3">
                  <strong>אזור 45:</strong> אם יש לך ידע נוסף על הקרבה בין הרחובות באזור ויצמן-יטקובסקי (הרחובות הקטנים, ברטונוב וכו'),
                  שתף אותי ואעדכן את המסלול להיות עוד יותר מדויק!
                </p>
                <p className="text-sm text-gray-600">
                  למשל: איזה רחובות קרובים זה לזה? יש סדר ספציפי שאתה עושה? ספר לי ואני אבנה מסלול מושלם.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
