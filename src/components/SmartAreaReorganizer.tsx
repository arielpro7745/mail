import { useState } from "react";
import { MapPin, Zap, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { streets } from "../data/streets";
import { getAreaColor } from "../utils/areaColors";

interface ReorganizationPlan {
  title: string;
  description: string;
  newAreas: {
    name: string;
    color: string;
    streets: string[];
    reasoning: string;
  }[];
  benefits: string[];
  warnings?: string[];
}

export default function SmartAreaReorganizer() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const plans: ReorganizationPlan[] = [
    {
      title: "חלוקה לפי רחובות ראשיים (מומלץ ביותר)",
      description: "חלוקה חכמה שמבוססת על רחובות מרכזיים והסתעפויות",
      newAreas: [
        {
          name: "אזור רוטשילד המרכזי",
          color: "bg-red-500",
          streets: [
            "רוטשילד 110-132",
            "רוטשילד 134-150",
            "רוטשילד 152-182",
            "רוטשילד 179-143",
            "רוטשילד 141-109",
            "הדף היומי",
            "גד מכנס 4",
          ],
          reasoning: "כל רוטשילד והרחובות הסמוכים ישירות - מסלול רציף אחד"
        },
        {
          name: "אזור ויצמן והסביבה",
          color: "bg-blue-500",
          streets: [
            "ויצמן 2-34 (זוגי)",
            "ויצמן 35-1 (אי-זוגי)",
            "קק\"ל 28-34 (זוגי)",
            "קק\"ל 21-25 (אי-זוגי)",
            "יטקובסקי 32-42 (זוגי)",
            "יטקובסקי 37-25 (אי-זוגי)",
          ],
          reasoning: "רחובות מקבילים וסמוכים - אזור גיאוגרפי אחד"
        },
        {
          name: "אזור דרום - רחובות קטנים",
          color: "bg-green-500",
          streets: [
            "דגל ראובן (זוגי + אי-זוגי)",
            "היבנר (זוגי + אי-זוגי)",
            "ברטונוב",
            "מרטין בובר",
            "הפרטיזנים",
            "ליסין",
            "מירקין",
            "סנרוב",
            "שטרן",
          ],
          reasoning: "קבוצת רחובות משניים - כנראה באותה שכונה"
        },
        {
          name: "אזור צפון - התשעים ושלוש והסביבה",
          color: "bg-purple-500",
          streets: [
            "התשעים ושלוש (כל הקטעים)",
            "דוד צבי פנקס (זוגי + אי-זוגי)",
            "הכרם",
            "הרב קוק",
            "זכרון משה",
            "אנה פרנק",
            "חיים כהן",
            "חפץ מרדכי",
            "מנדלסון",
            "האחים ראב",
            "שבדיה",
          ],
          reasoning: "קבוצת רחובות שכונתיים - נראה כמו אזור קהילתי אחד"
        }
      ],
      benefits: [
        "מחלק לפי גיאוגרפיה אמיתית ולא מספרים שרירותיים",
        "כל רחוב ראשי מקבל את כל ההסתעפויות שלו",
        "פחות חזרות למקומות",
        "4 אזורים במקום 3 - יותר איזון בעומס",
      ],
      warnings: [
        "דורש שינוי במחזור: 4 ימים במקום 3",
        "צריך לבדוק בשטח את הקרבה האמיתית"
      ]
    },
    {
      title: "חלוקה לפי גודל (מאוזן)",
      description: "חלוקה שמאזנת את כמות העבודה בכל אזור",
      newAreas: [
        {
          name: "אזור A - מעורב",
          color: "bg-blue-500",
          streets: [
            "ויצמן (זוגי + אי-זוגי) - גדול",
            "ברטונוב - גדול",
            "התשעים ושלוש (כל הקטעים)",
            "דוד צבי פנקס (זוגי + אי-זוגי)",
          ],
          reasoning: "2 רחובות גדולים + כמה קטנים = עומס מאוזן"
        },
        {
          name: "אזור B - רוטשילד מרכזי",
          color: "bg-red-500",
          streets: [
            "רוטשילד 152-182 - גדול",
            "רוטשילד 110-132",
            "רוטשילד 134-150",
            "הדף היומי",
            "גד מכנס 4",
          ],
          reasoning: "רוטשילד כולל הסתעפויות קרובות"
        },
        {
          name: "אזור C - רחובות משניים",
          color: "bg-green-500",
          streets: [
            "רוטשילד 179-143",
            "רוטשילד 141-109",
            "קק\"ל (זוגי + אי-זוגי)",
            "יטקובסקי (זוגי + אי-זוגי)",
            "דגל ראובן (זוגי + אי-זוגי)",
            "היבנר (זוגי + אי-זוגי)",
            "הכרם",
            "הרב קוק",
            "זכרון משה",
          ],
          reasoning: "רחובות בינוניים - עומס נוח"
        },
        {
          name: "אזור D - רחובות קטנים",
          color: "bg-yellow-500",
          streets: [
            "מרטין בובר",
            "הפרטיזנים",
            "ליסין",
            "מירקין",
            "סנרוב",
            "שטרן",
            "אנה פרנק",
            "חיים כהן",
            "חפץ מרדכי",
            "מנדלסון",
            "האחים ראב",
            "שבדיה",
          ],
          reasoning: "הרבה רחובות קטנים = יום מלא"
        }
      ],
      benefits: [
        "איזון מושלם בזמן העבודה",
        "כל יום עומס דומה",
        "4 ימים = פחות עייפות ביום",
      ]
    },
    {
      title: "שמירה על החלוקה הנוכחית + אופטימיזציה",
      description: "שיפור החלוקה הקיימת בלי שינויים גדולים",
      newAreas: [
        {
          name: "אזור 12 מורחב (ירוק)",
          color: "bg-green-500",
          streets: [
            "דוד צבי פנקס (זוגי + אי-זוגי)",
            "התשעים ושלוש (כל הקטעים)",
            "קק\"ל (זוגי + אי-זוגי)", // ← מעבר מאזור 14!
            "הכרם",
            "הרב קוק",
            "זכרון משה",
            "אנה פרנק",
            "חיים כהן",
            "חפץ מרדכי",
            "מנדלסון",
            "האחים ראב",
            "שבדיה",
          ],
          reasoning: "הוספת קק\"ל שכנראה קרובה לאזור זה"
        },
        {
          name: "אזור 14 ממוקד (אדום)",
          color: "bg-red-500",
          streets: [
            "רוטשילד (כל הקטעים ביחד)",
            "הדף היומי",
            "גד מכנס 4",
          ],
          reasoning: "רק רוטשילד וסביבתה הקרובה - מסלול ממוקד"
        },
        {
          name: "אזור 45 מחולק (כחול)",
          color: "bg-blue-500",
          streets: [
            "יטקובסקי (זוגי + אי-זוגי)",
            "דגל ראובן (זוגי + אי-זוגי)",
            "ויצמן (זוגי + אי-זוגי)",
            "היבנר (זוגי + אי-זוגי)",
            "ברטונוב",
            "מרטין בובר",
            "הפרטיזנים",
            "ליסין",
            "מירקין",
            "סנרוב",
            "שטרן",
          ],
          reasoning: "נשאר כמו שהוא - רק שיפור הסדר הפנימי"
        }
      ],
      benefits: [
        "שינוי מינימלי - קל ליישום",
        "שומר על 3 אזורים = אותו מחזור",
        "רק העברת קק\"ל לאזור 12",
        "אזור 14 נהיה ממוקד יותר",
      ]
    }
  ];

  const currentDistribution = [
    { area: 12, count: streets.filter(s => s.area === 12).length },
    { area: 14, count: streets.filter(s => s.area === 14).length },
    { area: 45, count: streets.filter(s => s.area === 45).length },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-500 rounded-lg p-3">
          <Zap className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ארגון מחדש חכם של האזורים</h2>
          <p className="text-sm text-gray-600">3 תוכניות אופטימיזציה מבוססות ניתוח גיאוגרפי</p>
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-yellow-800 mb-2">החלוקה הנוכחית:</h3>
            <div className="flex gap-4 text-sm">
              {currentDistribution.map(d => {
                const color = getAreaColor(d.area as any);
                return (
                  <div key={d.area} className="flex items-center gap-2">
                    <span className={`${color.bgSolid} text-white px-3 py-1 rounded-full font-bold`}>
                      אזור {d.area}
                    </span>
                    <span className="text-gray-700 font-semibold">{d.count} רחובות</span>
                  </div>
                );
              })}
            </div>
            <p className="text-yellow-700 mt-2 text-sm">
              ⚠️ החלוקה לפי מספרים (12, 14, 45) לא בהכרח משקפת קרבה גיאוגרפית!
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`border-2 rounded-lg p-5 cursor-pointer transition-all ${
              selectedPlan === idx
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
            onClick={() => setSelectedPlan(selectedPlan === idx ? null : idx)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  {plan.title}
                  {idx === 0 && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      מומלץ
                    </span>
                  )}
                </h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              <ArrowRight
                className={`text-gray-400 transition-transform ${selectedPlan === idx ? 'rotate-90' : ''}`}
                size={24}
              />
            </div>

            {selectedPlan === idx && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.newAreas.map((area, aIdx) => (
                    <div key={aIdx} className="bg-white rounded-lg p-4 border-2 border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`${area.color} w-4 h-4 rounded-full`}></div>
                        <h4 className="font-bold text-gray-800">{area.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{area.reasoning}</p>
                      <div className="text-xs text-gray-500">
                        <strong>{area.streets.length} רחובות</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle size={20} />
                    יתרונות:
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    {plan.benefits.map((benefit, bIdx) => (
                      <li key={bIdx}>✓ {benefit}</li>
                    ))}
                  </ul>
                </div>

                {plan.warnings && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                    <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                      <AlertTriangle size={20} />
                      שים לב:
                    </h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {plan.warnings.map((warning, wIdx) => (
                        <li key={wIdx}>⚠️ {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="text-blue-600 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-bold text-blue-800 mb-2">ההמלצה שלי:</h4>
            <p className="text-sm text-blue-700">
              התחל עם <strong>תוכנית 3</strong> (שמירה + אופטימיזציה) - השינוי הכי קטן והבטוח.
              אחרי שתראה שזה עובד, אפשר לעבור ל<strong>תוכנית 1</strong> (רחובות ראשיים)
              שהיא היעילה ביותר אבל דורשת התאמה למחזור של 4 ימים.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
