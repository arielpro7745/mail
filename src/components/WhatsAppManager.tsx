import { useState } from "react";
import { MessageCircle, Send, Copy, Check, Phone, Package, CreditCard, MapPin, Key, Home, Clock, User } from "lucide-react";

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'id_delivery' | 'package_delivery' | 'general';
  template: string;
  variables: string[];
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface DeliveryInfo {
  recipientName: string;
  phone: string;
  address: string;
  apartment?: string;
  floor?: string;
  buildingCode?: string;
  deliveryCode?: string;
  allowDoorDelivery?: boolean;
  notes?: string;
}

export default function WhatsAppManager() {
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    recipientName: "",
    phone: "",
    address: "",
  });
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const templates: WhatsAppTemplate[] = [
    // טמפלטים לת.ז.
    {
      id: 'id_delivery_code_request',
      name: 'בקשת קוד מסירה לת.ז.',
      category: 'id_delivery',
      template: `שלום {name},

זה דוור מדואר ישראל 📮

יש לי תעודת זהות למסירה עבורך.

כדי למסור לך אני צריך שתמצא קוד מסירה בן 4 ספרות שקיבלת.
ב-2 דרכים הודעת SMS רגילה מרשות האוכלוסין
או דף שקיבלת מהם כאשר היית אצלם.

תודה!
דוור מדואר ישראל`,
      variables: ['name'],
      description: 'בקשת קוד מסירה לתעודת זהות',
      icon: CreditCard
    },
    {
      id: 'id_delivery_confirmation',
      name: 'אישור מסירת ת.ז.',
      category: 'id_delivery',
      template: `שלום {name},

תעודת הזהות נמסרה בהצלחה! ✅

פרטי המסירה:
📅 תאריך: {date}
🕐 שעה: {time}
📍 כתובת: {address}
🔢 קוד מסירה: {code}

שמור הודעה זו לתיעוד.

בברכה,
דוור מדואר ישראל`,
      variables: ['name', 'date', 'time', 'address', 'code'],
      description: 'אישור מסירת תעודת זהות',
      icon: Check
    },

    // טמפלטים לחבילות
    {
      id: 'package_delivery_details',
      name: 'בקשת פרטי מסירה לחבילה',
      category: 'package_delivery',
      template: `שלום {name},

יש לי חבילה למסירה עבורך 📦

אשמח לדעת מספר פרטים
מה הקומה, הדירה וקוד לבניין אם יש
והאם אתה מעוניין שאניח את החבילה ליד הדלת?

תודה!
דוור מדואר ישראל`,
      variables: ['name', 'address'],
      description: 'בקשת פרטי מסירה לחבילה',
      icon: Package
    },
    {
      id: 'package_delivery_arrival',
      name: 'הודעת הגעה לחבילה',
      category: 'package_delivery',
      template: `שלום {name},

אני בדרך אליך עם החבילה 🚚

זמן הגעה משוער: {eta} דקות
📍 כתובת: {address}
🏢 קומה {floor}, דירה {apartment}

{buildingCode ? 'אשתמש בקוד הכניסה שנתת' : 'אחכה ליד הכניסה'}

אם יש שינוי, אנא עדכן אותי.

דוור מדואר ישראל`,
      variables: ['name', 'eta', 'address', 'floor', 'apartment', 'buildingCode'],
      description: 'הודעת הגעה למסירת חבילה',
      icon: Clock
    },
    {
      id: 'package_door_delivery',
      name: 'מסירה ליד הדלת',
      category: 'package_delivery',
      template: `שלום {name},

החבילה הונחה ליד הדלת שלך בבטחה 📦✅

פרטי המסירה:
📅 תאריך: {date}
🕐 שעה: {time}
🏢 קומה {floor}, דירה {apartment}
📍 מיקום: ליד הדלת

החבילה מוגנת ובמקום בטוח.

בברכה,
דוור מדואר ישראל`,
      variables: ['name', 'date', 'time', 'floor', 'apartment'],
      description: 'אישור מסירה ליד הדלת',
      icon: Home
    },

    // טמפלטים כלליים
    {
      id: 'general_not_home',
      name: 'לא נמצא בבית',
      category: 'general',
      template: `שלום {name},

הגעתי למסירת {itemType} אך לא מצאתי אותך בבית.

אפשרויות:
1️⃣ קבע זמן חדש למסירה
2️⃣ איסוף מסניף הדואר הקרוב
3️⃣ מסירה לשכן (עם אישור)

אנא עדכן אותי איך תרצה להמשיך.

כתובת: {address}

דוור מדואר ישראל`,
      variables: ['name', 'itemType', 'address'],
      description: 'הודעה כשלא נמצא בבית',
      icon: Phone
    },
    {
      id: 'general_reschedule',
      name: 'תיאום מועד חדש',
      category: 'general',
      template: `שלום {name},

יש לי דואר רשום למסירה עבורך.
אני אגיע אליך במהלך היום.
האם תרצה שאניח את הרשום בתיבה?

דוור מדואר ישראל`,
      variables: ['name', 'timeSlot1', 'timeSlot2', 'itemType', 'address'],
      description: 'תיאום מועד מסירה חדש',
      icon: Clock
    }
  ];

  // יצירת הודעה מטמפלט
  const generateMessage = (template: WhatsAppTemplate, info: DeliveryInfo) => {
    let message = template.template;
    
    // החלפת משתנים בסיסיים
    message = message.replace(/{name}/g, info.recipientName);
    message = message.replace(/{address}/g, info.address);
    message = message.replace(/{phone}/g, info.phone);
    message = message.replace(/{apartment}/g, info.apartment || '');
    message = message.replace(/{floor}/g, info.floor || '');
    message = message.replace(/{buildingCode}/g, info.buildingCode || '');
    message = message.replace(/{code}/g, info.deliveryCode || '');
    
    // משתנים דינמיים
    const now = new Date();
    message = message.replace(/{date}/g, now.toLocaleDateString('he-IL'));
    message = message.replace(/{time}/g, now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }));
    message = message.replace(/{eta}/g, '15-20');
    message = message.replace(/{timeSlot1}/g, '14:00-16:00');
    message = message.replace(/{timeSlot2}/g, '09:00-12:00');
    message = message.replace(/{itemType}/g, template.category === 'id_delivery' ? 'תעודת זהות' : 'חבילה');
    
    return message;
  };

  // יצירת קישור WhatsApp
  const createWhatsAppLink = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : '972' + cleanPhone;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  };

  // העתקה ללוח
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // בחירת טמפלט
  const selectTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    const message = generateMessage(template, deliveryInfo);
    setGeneratedMessage(message);
  };

  // עדכון מידע ויצירה מחדש של ההודעה
  const updateDeliveryInfo = (field: keyof DeliveryInfo, value: string | boolean) => {
    const newInfo = { ...deliveryInfo, [field]: value };
    setDeliveryInfo(newInfo);
    
    if (selectedTemplate) {
      const message = generateMessage(selectedTemplate, newInfo);
      setGeneratedMessage(message);
    }
  };

  const categories = [
    { key: 'id_delivery', label: 'תעודות זהות', color: 'blue', count: templates.filter(t => t.category === 'id_delivery').length },
    { key: 'package_delivery', label: 'חבילות', color: 'green', count: templates.filter(t => t.category === 'package_delivery').length },
    { key: 'general', label: 'כללי', color: 'purple', count: templates.filter(t => t.category === 'general').length }
  ];

  return (
    <section className="mt-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md">
          <MessageCircle size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">WhatsApp Business</h2>
          <p className="text-gray-600 font-medium text-sm md:text-base">טמפלטים מוכנים למסירות</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* בחירת טמפלט */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="font-bold text-xl text-gray-800">בחירת טמפלט</h3>
            <p className="text-sm text-gray-600">בחר טמפלט מתאים לסוג המסירה</p>
          </div>

          <div className="p-6">
            {/* קטגוריות */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => (
                <div key={category.key} className="text-center">
                  <div className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    category.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    category.color === 'green' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {category.label} ({category.count})
                  </div>
                </div>
              ))}
            </div>

            {/* רשימת טמפלטים */}
            <div className="space-y-3">
              {templates.map(template => {
                const Icon = template.icon;
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <div
                    key={template.id}
                    onClick={() => selectTemplate(template)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        template.category === 'id_delivery' ? 'bg-blue-100' :
                        template.category === 'package_delivery' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        <Icon size={20} className={
                          template.category === 'id_delivery' ? 'text-blue-600' :
                          template.category === 'package_delivery' ? 'text-green-600' :
                          'text-purple-600'
                        } />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.category === 'id_delivery' ? 'bg-blue-100 text-blue-700' :
                            template.category === 'package_delivery' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {template.category === 'id_delivery' ? 'ת.ז.' :
                             template.category === 'package_delivery' ? 'חבילה' : 'כללי'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {template.variables.length} משתנים
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* מילוי פרטים ויצירת הודעה */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <h3 className="font-bold text-xl text-gray-800">פרטי המסירה</h3>
            <p className="text-sm text-gray-600">מלא את הפרטים ליצירת הודעה</p>
          </div>

          <div className="p-6">
            <div className="space-y-4 mb-6">
              {/* פרטים בסיסיים */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם המקבל
                  </label>
                  <input
                    type="text"
                    value={deliveryInfo.recipientName}
                    onChange={(e) => updateDeliveryInfo('recipientName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="שם מלא"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    טלפון
                  </label>
                  <input
                    type="tel"
                    value={deliveryInfo.phone}
                    onChange={(e) => updateDeliveryInfo('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="050-1234567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  כתובת
                </label>
                <input
                  type="text"
                  value={deliveryInfo.address}
                  onChange={(e) => updateDeliveryInfo('address', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="רחוב הרצל 12, פתח תקווה"
                />
              </div>

              {/* פרטים לחבילות */}
              {selectedTemplate?.category === 'package_delivery' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Package size={18} />
                    פרטי חבילה
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        קומה
                      </label>
                      <input
                        type="text"
                        value={deliveryInfo.floor || ''}
                        onChange={(e) => updateDeliveryInfo('floor', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        דירה
                      </label>
                      <input
                        type="text"
                        value={deliveryInfo.apartment || ''}
                        onChange={(e) => updateDeliveryInfo('apartment', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        קוד בניין
                      </label>
                      <input
                        type="text"
                        value={deliveryInfo.buildingCode || ''}
                        onChange={(e) => updateDeliveryInfo('buildingCode', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="1234"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deliveryInfo.allowDoorDelivery || false}
                        onChange={(e) => updateDeliveryInfo('allowDoorDelivery', e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        מאשר מסירה ליד הדלת
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* פרטים לת.ז. */}
              {selectedTemplate?.category === 'id_delivery' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <CreditCard size={18} />
                    פרטי תעודת זהות
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      קוד מסירה (4 ספרות)
                    </label>
                    <input
                      type="text"
                      value={deliveryInfo.deliveryCode || ''}
                      onChange={(e) => updateDeliveryInfo('deliveryCode', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234"
                      maxLength={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      הקוד שהמקבל קיבל מרשות האוכלוסין
                    </p>
                  </div>
                </div>
              )}

              {/* הערות נוספות */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  הערות נוספות
                </label>
                <textarea
                  value={deliveryInfo.notes || ''}
                  onChange={(e) => updateDeliveryInfo('notes', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="הערות נוספות למסירה..."
                />
              </div>
            </div>

            {/* הודעה שנוצרה */}
            {generatedMessage && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">הודעה שנוצרה</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedMessage)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'הועתק!' : 'העתק'}
                    </button>
                    {deliveryInfo.phone && (
                      <a
                        href={createWhatsAppLink(deliveryInfo.phone, generatedMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                      >
                        <Send size={14} />
                        שלח ב-WhatsApp
                      </a>
                    )}
                  </div>
                </div>
                <div className="bg-white border border-gray-300 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                  {generatedMessage}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* מדריך שימוש */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg mt-6">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <h3 className="font-bold text-xl text-gray-800">מדריך שימוש</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <CreditCard size={18} />
                מסירת תעודות זהות
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>בחר טמפלט "בקשת קוד מסירה לת.ז."</li>
                <li>מלא שם ופרטי קשר</li>
                <li>שלח הודעה ובקש קוד 4 ספרות</li>
                <li>לאחר קבלת הקוד - בצע מסירה</li>
                <li>שלח אישור מסירה עם הטמפלט המתאים</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Package size={18} />
                מסירת חבילות
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>בחר טמפלט "בקשת פרטי מסירה לחבילה"</li>
                <li>מלא כתובת ופרטי קשר</li>
                <li>קבל פרטים: קומה, דירה, קוד בניין</li>
                <li>שלח הודעת הגעה לפני המסירה</li>
                <li>אשר מסירה עם הטמפלט המתאים</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">💡 טיפים לשימוש יעיל</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
              <li>שמור טמפלטים נפוצים כמועדפים בטלפון</li>
              <li>השתמש בהעתקה מהירה לשליחה מהירה</li>
              <li>תעדכן את הפרטים לפני שליחת הודעה חדשה</li>
              <li>שמור תמונות של מסירות לתיעוד</li>
            </ul>
          </div>
        </div>
      </div>

      {/* סטטיסטיקות שימוש */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg mt-6">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="font-bold text-xl text-gray-800">סטטיסטיקות WhatsApp</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
              <div className="text-sm text-blue-700">הודעות ת.ז. היום</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">8</div>
              <div className="text-sm text-green-700">הודעות חבילות היום</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">95%</div>
              <div className="text-sm text-purple-700">שיעור מענה</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">3.2</div>
              <div className="text-sm text-yellow-700">דק׳ זמן מענה ממוצע</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}