import { useState } from "react";
import { MapPin, Save, ArrowUp, ArrowDown, GripVertical, CheckCircle, XCircle } from "lucide-react";
import { streets as allStreets } from "../data/streets";
import { getAreaColor } from "../utils/areaColors";
import { Area } from "../types";

interface StreetOrder {
  id: string;
  name: string;
  order: number;
  notes: string;
}

export default function ManualAreaOrganizer() {
  const [selectedArea, setSelectedArea] = useState<Area>(12);
  const [streetOrders, setStreetOrders] = useState<StreetOrder[]>([]);
  const [editMode, setEditMode] = useState(false);

  const initializeArea = (area: Area) => {
    const areaStreets = allStreets.filter(s => s.area === area);
    const orders: StreetOrder[] = areaStreets.map((street, idx) => ({
      id: street.id,
      name: street.name,
      order: idx + 1,
      notes: ""
    }));
    setStreetOrders(orders);
    setSelectedArea(area);
    setEditMode(true);
  };

  const moveStreet = (index: number, direction: 'up' | 'down') => {
    const newOrders = [...streetOrders];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOrders.length) return;

    [newOrders[index], newOrders[targetIndex]] = [newOrders[targetIndex], newOrders[index]];

    newOrders.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setStreetOrders(newOrders);
  };

  const updateNotes = (id: string, notes: string) => {
    setStreetOrders(prev => prev.map(s =>
      s.id === id ? { ...s, notes } : s
    ));
  };

  const saveOrder = () => {
    const data = {
      area: selectedArea,
      order: streetOrders,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(`area_${selectedArea}_order`, JSON.stringify(data));
    alert(`הסדר של אזור ${selectedArea} נשמר בהצלחה!`);
  };

  const loadSavedOrder = (area: Area) => {
    const saved = localStorage.getItem(`area_${area}_order`);
    if (saved) {
      const data = JSON.parse(saved);
      setStreetOrders(data.order);
      setSelectedArea(area);
      setEditMode(true);
      return true;
    }
    return false;
  };

  const color = getAreaColor(selectedArea);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className={`${color.bgSolid} rounded-lg p-3`}>
          <MapPin className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ארגון ידני של סדר החלוקה</h2>
          <p className="text-sm text-gray-600">אתה מכיר את השטח הכי טוב - ארגן את הרחובות לפי הידע שלך!</p>
        </div>
      </div>

      {!editMode && (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-blue-800 mb-2">איך זה עובד?</h3>
            <ol className="text-sm text-blue-700 space-y-2">
              <li><strong>1.</strong> בחר אזור</li>
              <li><strong>2.</strong> סדר את הרחובות לפי הסדר האמיתי שאתה עושה בשטח</li>
              <li><strong>3.</strong> הוסף הערות (למשל: "מכאן קרוב ל..." או "עושה ביחד עם...")</li>
              <li><strong>4.</strong> שמור את הסדר - המערכת תשתמש בזה בעתיד</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[12, 14, 45].map(area => {
              const areaColor = getAreaColor(area as Area);
              const saved = localStorage.getItem(`area_${area}_order`);
              const streetCount = allStreets.filter(s => s.area === area).length;

              return (
                <div key={area} className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`${areaColor.bgSolid} text-white rounded-lg px-3 py-2 font-bold text-lg`}>
                      אזור {area}
                    </div>
                    {saved && (
                      <CheckCircle className="text-green-500" size={20} />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{streetCount} רחובות</p>

                  <div className="space-y-2">
                    <button
                      onClick={() => initializeArea(area as Area)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition-all"
                    >
                      {saved ? 'ערוך סדר' : 'צור סדר חדש'}
                    </button>

                    {saved && (
                      <button
                        onClick={() => loadSavedOrder(area as Area)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition-all"
                      >
                        טען סדר שמור
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editMode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`${color.bgSolid} text-white rounded-lg px-4 py-2 font-bold text-xl`}>
                אזור {selectedArea}
              </div>
              <span className="text-gray-700 font-semibold">{streetOrders.length} רחובות</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveOrder}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
              >
                <Save size={18} />
                שמור סדר
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
              >
                <XCircle size={18} />
                סגור
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              💡 <strong>טיפ:</strong> סדר את הרחובות לפי הסדר שאתה הולך בפועל בשטח.
              השתמש בחצים למעלה/למטה כדי להזיז רחובות.
            </p>
          </div>

          <div className="space-y-2">
            {streetOrders.map((street, index) => (
              <div
                key={street.id}
                className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`${color.bgSolid} text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0`}>
                    {street.order}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-lg mb-2">{street.name}</h4>
                    <input
                      type="text"
                      placeholder="הערות: למשל 'מכאן קרוב לרוטשילד' או 'עושה ביחד עם ויצמן'"
                      value={street.notes}
                      onChange={(e) => updateNotes(street.id, e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => moveStreet(index, 'up')}
                      disabled={index === 0}
                      className={`p-2 rounded-lg ${
                        index === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      } transition-all`}
                    >
                      <ArrowUp size={20} />
                    </button>
                    <button
                      onClick={() => moveStreet(index, 'down')}
                      disabled={index === streetOrders.length - 1}
                      className={`p-2 rounded-lg ${
                        index === streetOrders.length - 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      } transition-all`}
                    >
                      <ArrowDown size={20} />
                    </button>
                  </div>

                  <GripVertical className="text-gray-400 flex-shrink-0" size={24} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <CheckCircle size={18} />
              <span>לאחר שתסיים, לחץ על <strong>"שמור סדר"</strong> למעלה</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
