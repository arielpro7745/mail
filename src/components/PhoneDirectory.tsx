import { useState } from "react";
import { useReports } from "../hooks/useReports";
import LoadingSpinner from "./LoadingSpinner";
import { 
  Phone, Search, Download, User, Home, 
  Mail, DoorOpen, Crown, MapPin, X, MessageCircle
} from "lucide-react";

export default function PhoneDirectory() {
  const { reportData } = useReports();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'mailbox' | 'door' | 'primary'>('all');

  // פונקציה ליצירת קישור WhatsApp
  const createWhatsAppLink = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const message = encodeURIComponent(`שלום ${name}, זה דוור מדואר ישראל`);
    return `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${message}`;
  };

  // פונקציה ליצירת קישור WhatsApp עם בקשה לצילום
  const createWhatsAppPhotoLink = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const message = encodeURIComponent(`שלום ${name}, זה דוור מדואר ישראל. אנא צלם/י תמונה של הדואר שלך ושלח/י לי בווצאפ. תודה!`);
    return `https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${message}`;
  };

  if (!reportData) return <LoadingSpinner />;

  const { phoneDirectory } = reportData;

  // סינון הספר טלפונים
  const filteredDirectory = phoneDirectory.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.phone.includes(searchTerm) ||
      entry.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.apartment?.includes(searchTerm) ||
      entry.additionalPhones.some(phone => phone.includes(searchTerm)) ||
      entry.contacts.some(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm)
      );

    if (!matchesSearch) return false;

    switch (filterType) {
      case 'mailbox':
        return entry.allowsMailbox;
      case 'door':
        return entry.allowsDoor;
      case 'primary':
        return entry.isPrimary;
      default:
        return true;
    }
  });

  // הורדת ספר הטלפונים
  const downloadPhoneDirectory = () => {
    let content = `ספר טלפונים - ${new Date().toLocaleDateString('he-IL')}\n\n`;
    content += 'שם\tטלפון\tכתובת\tדירה\tקשר\tמאשר תיבה\tמאשר דלת\tדייר ראשי\tטלפונים נוספים\n';
    
    filteredDirectory.forEach(entry => {
      content += `${entry.name}\t${entry.phone}\t${entry.address}\t${entry.apartment || ''}\t${entry.relationship || ''}\t${entry.allowsMailbox ? 'כן' : 'לא'}\t${entry.allowsDoor ? 'כן' : 'לא'}\t${entry.isPrimary ? 'כן' : 'לא'}\t${entry.additionalPhones.join(', ')}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phone-directory-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md">
            <Phone size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">ספר טלפונים</h2>
            <p className="text-gray-600 font-medium text-sm md:text-base">
              {filteredDirectory.length} אנשי קשר
            </p>
          </div>
        </div>
        <button
          onClick={downloadPhoneDirectory}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 shadow-lg"
        >
          <Download size={18} />
          <span className="hidden sm:inline">הורד רשימה</span>
        </button>
      </div>

      {/* חיפוש וסינון */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="חפש שם, טלפון, כתובת..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'הכל' },
              { key: 'primary', label: 'דיירים ראשיים' },
              { key: 'mailbox', label: 'מאשרי תיבה' },
              { key: 'door', label: 'מאשרי דלת' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterType(key as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filterType === key
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* רשימת אנשי קשר */}
      <div className="space-y-4">
        {filteredDirectory.map((entry, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* פרטים אישיים */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                      {entry.name}
                      {entry.isPrimary && <Crown size={16} className="text-yellow-500" title="דייר ראשי" />}
                    </h3>
                    {entry.relationship && (
                      <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        {entry.relationship}
                      </span>
                    )}
                  </div>
                </div>

                {/* כתובת */}
                <div className="flex items-center gap-2 mb-2 text-gray-600">
                  <MapPin size={16} />
                  <span>{entry.address}</span>
                  {entry.apartment && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                      דירה {entry.apartment}
                    </span>
                  )}
                </div>

                {/* הרשאות */}
                <div className="flex gap-2 mb-3">
                  {entry.allowsMailbox && (
                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg text-sm">
                      <Mail size={14} />
                      <span>מאשר תיבה</span>
                    </div>
                  )}
                  {entry.allowsDoor && (
                    <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-sm">
                      <DoorOpen size={14} />
                      <span>מאשר דלת</span>
                    </div>
                  )}
                </div>
              </div>

              {/* טלפונים */}
              <div className="lg:w-80">
                <div className="space-y-2">
                  {/* טלפון ראשי */}
                  {entry.phone && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Phone size={16} className="text-green-600" />
                      <div>
                        <div className="font-medium text-gray-800">{entry.phone}</div>
                        <div className="text-xs text-gray-500">טלפון ראשי</div>
                      </div>
                      <a
                        href={`tel:${entry.phone}`}
                        className="mr-auto p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        title="התקשר"
                      >
                        <Phone size={14} />
                      </a>
                      <a
                        href={createWhatsAppLink(entry.phone, entry.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        title="שלח WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </a>
                    </div>
                  )}

                  {/* טלפונים נוספים */}
                  {entry.additionalPhones.map((phone, phoneIndex) => (
                    <div key={phoneIndex} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Phone size={16} className="text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-800">{phone}</div>
                        <div className="text-xs text-gray-500">טלפון נוסף</div>
                      </div>
                      <a
                        href={`tel:${phone}`}
                        className="mr-auto p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        title="התקשר"
                      >
                        <Phone size={14} />
                      </a>
                      <a
                        href={createWhatsAppLink(phone, entry.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        title="שלח WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </a>
                    </div>
                  ))}

                  {/* אנשי קשר */}
                  {entry.contacts.map((contact, contactIndex) => (
                    <div key={contactIndex} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <User size={16} className="text-purple-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{contact.name}</div>
                        <div className="text-sm text-gray-600">{contact.phone}</div>
                        {contact.relationship && (
                          <div className="text-xs text-purple-600">{contact.relationship}</div>
                        )}
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                        title="התקשר"
                      >
                        <Phone size={14} />
                      </a>
                      <a
                        href={createWhatsAppLink(contact.phone, contact.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        title="שלח WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* הודעה כשאין תוצאות */}
      {filteredDirectory.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Phone size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">אין תוצאות</h3>
          <p className="text-sm">
            {searchTerm ? 'לא נמצאו אנשי קשר התואמים לחיפוש' : 'אין אנשי קשר רשומים'}
          </p>
        </div>
      )}
    </section>
  );
}