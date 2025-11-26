import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle2, Clock, TrendingUp, Target } from "lucide-react";

type AreaTask = {
  area: string;
  type: "preparation" | "delivery";
  completed: boolean;
  streets: string[];
  bagsCount?: number;
  startTime?: string;
  endTime?: string;
};

export default function DualAreaWorkflow() {
  const [preparationArea, setPreparationArea] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("");

  const [preparationBags, setPreparationBags] = useState(0);
  const [preparationCompleted, setPreparationCompleted] = useState(false);

  const [deliveryBags, setDeliveryBags] = useState(0);
  const [deliveryStarted, setDeliveryStarted] = useState(false);
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const [deliveryStartTime, setDeliveryStartTime] = useState<string>("");
  const [deliveryEndTime, setDeliveryEndTime] = useState<string>("");

  const today = new Date().toDateString();

  // טען נתונים מ-localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dualAreaWorkflow");
    if (saved) {
      try {
        const data = JSON.parse(saved);

        if (data.date === today) {
          setPreparationArea(data.preparationArea || "");
          setDeliveryArea(data.deliveryArea || "");
          setPreparationBags(data.preparationBags || 0);
          setPreparationCompleted(data.preparationCompleted || false);
          setDeliveryBags(data.deliveryBags || 0);
          setDeliveryStarted(data.deliveryStarted || false);
          setDeliveryCompleted(data.deliveryCompleted || false);
          setDeliveryStartTime(data.deliveryStartTime || "");
          setDeliveryEndTime(data.deliveryEndTime || "");
        }
      } catch (e) {
        console.error("Error loading workflow:", e);
      }
    }
  }, [today]);

  // שמור נתונים ב-localStorage
  useEffect(() => {
    const data = {
      date: today,
      preparationArea,
      deliveryArea,
      preparationBags,
      preparationCompleted,
      deliveryBags,
      deliveryStarted,
      deliveryCompleted,
      deliveryStartTime,
      deliveryEndTime,
    };
    localStorage.setItem("dualAreaWorkflow", JSON.stringify(data));
  }, [today, preparationArea, deliveryArea, preparationBags, preparationCompleted, deliveryBags, deliveryStarted, deliveryCompleted, deliveryStartTime, deliveryEndTime]);

  const incrementPreparationBags = () => {
    setPreparationBags(prev => prev + 1);
  };

  const decrementPreparationBags = () => {
    if (preparationBags > 0) {
      setPreparationBags(prev => prev - 1);
    }
  };

  const completePreparation = () => {
    setPreparationCompleted(true);
  };

  const startDelivery = () => {
    setDeliveryStarted(true);
    setDeliveryStartTime(new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }));
  };

  const incrementDeliveryBags = () => {
    setDeliveryBags(prev => prev + 1);
  };

  const decrementDeliveryBags = () => {
    if (deliveryBags > 0) {
      setDeliveryBags(prev => prev - 1);
    }
  };

  const completeDelivery = () => {
    setDeliveryCompleted(true);
    setDeliveryEndTime(new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }));
  };

  const bothCompleted = preparationCompleted && deliveryCompleted;

  return (
    <div className="space-y-6">
      {/* כותרת ראשית */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Package size={32} />
          <Truck size={32} />
        </div>
        <h2 className="text-3xl font-bold mb-1">תהליך עבודה יומי</h2>
        <p className="text-blue-100">הכנת שקים לאזור מחר + חלוקת אזור היום</p>
      </div>

      {bothCompleted && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 text-center">
          <CheckCircle2 size={56} className="mx-auto text-green-600 mb-3" />
          <h3 className="text-2xl font-bold text-green-800 mb-2">יום עבודה מושלם!</h3>
          <p className="text-green-700">סיימת הכנה וחלוקה - עבודה מצוינת!</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* הכנת שקים - אזור למחר */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-3">
              <Package className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">📦 הכנת שקים</h3>
              <p className="text-sm text-gray-600">אזור שיצא מחר</p>
            </div>
          </div>

          {/* בחירת אזור להכנה */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">איזה אזור מכינים היום?</label>
            <input
              type="text"
              value={preparationArea}
              onChange={(e) => setPreparationArea(e.target.value)}
              placeholder="לדוגמה: 12, 45, 3"
              disabled={preparationCompleted}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-bold text-xl text-center disabled:bg-gray-100"
            />
          </div>

          {/* ספירת שקים */}
          {preparationArea && !preparationCompleted && (
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">כמה שקים הכנת?</label>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 mb-4 text-center border-2 border-orange-200">
                <div className="text-6xl font-bold text-orange-600 mb-2">{preparationBags}</div>
                <div className="text-sm text-orange-700">שקים מוכנים</div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={incrementPreparationBags}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold shadow-lg transition-all"
                >
                  + סיימתי שק
                </button>
                <button
                  onClick={decrementPreparationBags}
                  disabled={preparationBags === 0}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-6 py-4 rounded-lg font-bold shadow-lg transition-all"
                >
                  -
                </button>
              </div>

              {preparationBags > 0 && (
                <button
                  onClick={completePreparation}
                  className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={24} />
                  סיימתי הכנה לאזור {preparationArea}
                </button>
              )}
            </div>
          )}

          {preparationCompleted && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-600" size={32} />
                <div>
                  <h4 className="font-bold text-green-800">הכנה הושלמה!</h4>
                  <p className="text-sm text-green-700">
                    אזור {preparationArea}: {preparationBags} שקים מוכנים
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 bg-orange-50 border-2 border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-800 font-bold">
              💡 הכן את כל השקים לאזור {preparationArea} שיצא לחלוקה מחר
            </p>
          </div>
        </div>

        {/* חלוקת אזור - אזור היום */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3">
              <Truck className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">🚚 חלוקת אזור</h3>
              <p className="text-sm text-gray-600">אזור שהוכן אתמול</p>
            </div>
          </div>

          {/* בחירת אזור לחלוקה */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">איזה אזור מחלקים היום?</label>
            <input
              type="text"
              value={deliveryArea}
              onChange={(e) => setDeliveryArea(e.target.value)}
              placeholder="לדוגמה: 14, 12, 8"
              disabled={deliveryStarted}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-bold text-xl text-center disabled:bg-gray-100"
            />
          </div>

          {/* התחלת חלוקה */}
          {deliveryArea && !deliveryStarted && (
            <button
              onClick={startDelivery}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 mb-4"
            >
              <Truck size={24} />
              התחל חלוקת אזור {deliveryArea}
            </button>
          )}

          {/* מעקב חלוקה */}
          {deliveryStarted && !deliveryCompleted && (
            <div className="mb-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-blue-600" />
                <span className="text-sm text-blue-800 font-bold">
                  התחלה: {deliveryStartTime}
                </span>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2">כמה שקים חילקת?</label>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 mb-4 text-center border-2 border-blue-200">
                <div className="text-6xl font-bold text-blue-600 mb-2">{deliveryBags}</div>
                <div className="text-sm text-blue-700">שקים חולקו</div>
              </div>

              <div className="flex gap-3 mb-3">
                <button
                  onClick={incrementDeliveryBags}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold shadow-lg transition-all"
                >
                  + חילקתי שק
                </button>
                <button
                  onClick={decrementDeliveryBags}
                  disabled={deliveryBags === 0}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-6 py-4 rounded-lg font-bold shadow-lg transition-all"
                >
                  -
                </button>
              </div>

              <button
                onClick={completeDelivery}
                disabled={deliveryBags === 0}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-4 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={24} />
                סיימתי חלוקת אזור {deliveryArea}
              </button>
            </div>
          )}

          {deliveryCompleted && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="text-green-600" size={32} />
                <div>
                  <h4 className="font-bold text-green-800">חלוקה הושלמה!</h4>
                  <p className="text-sm text-green-700">
                    אזור {deliveryArea}: {deliveryBags} שקים חולקו
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Clock size={16} />
                <span>{deliveryStartTime} - {deliveryEndTime}</span>
              </div>
            </div>
          )}

          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 font-bold">
              💡 חלק את כל השקים של אזור {deliveryArea} שהוכנו אתמול
            </p>
          </div>
        </div>
      </div>

      {/* סיכום היום */}
      <div className="bg-gray-50 rounded-xl border-2 border-gray-300 p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Target size={24} />
          סיכום יום עבודה
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Package size={20} className="text-orange-600" />
              <span className="font-bold text-gray-700">הכנה</span>
            </div>
            <p className="text-sm text-gray-600">
              {preparationArea ? `אזור ${preparationArea}` : "טרם נבחר"}
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {preparationBags} שקים
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {preparationCompleted ? "✓ הושלם" : "בתהליך"}
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={20} className="text-blue-600" />
              <span className="font-bold text-gray-700">חלוקה</span>
            </div>
            <p className="text-sm text-gray-600">
              {deliveryArea ? `אזור ${deliveryArea}` : "טרם נבחר"}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {deliveryBags} שקים
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {deliveryCompleted ? "✓ הושלם" : deliveryStarted ? "בתהליך" : "טרם התחיל"}
            </p>
          </div>
        </div>
      </div>

      {/* הסבר */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
        <h4 className="font-bold text-yellow-800 mb-2 text-sm">📋 איך זה עובד:</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• <strong>הכנת שקים:</strong> מסדרים את האזור שיצא לחלוקה <strong>מחר</strong></li>
          <li>• <strong>חלוקת אזור:</strong> מחלקים את האזור שהוכן <strong>אתמול</strong></li>
          <li>• <strong>דוגמה:</strong> יום א' - מכינים אזור 12, מחלקים אזור 14</li>
          <li>• <strong>דוגמה:</strong> יום ב' - מכינים אזור 45, מחלקים אזור 12</li>
          <li>• כל יום עושים 2 דברים במקביל: הכנה + חלוקה</li>
        </ul>
      </div>
    </div>
  );
}
