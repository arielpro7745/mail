import { useState } from "react";
import { useReports } from "../hooks/useReports";
import { useSettings } from "../hooks/useSettings";
import { streets } from "../data/streets";
import { formatStreetName } from "../utils/addressFormatter";
import LoadingSpinner from "./LoadingSpinner";
import { 
  Phone, Search, Download, User, Home, 
  Mail, DoorOpen, Crown, MapPin, X, MessageCircle, Filter
} from "lucide-react";

export default function PhoneDirectory() {
  const { reportData } = useReports();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'mailbox' | 'door' | 'primary'>('all');
  const [selectedArea, setSelectedArea] = useState<'all' | '12' | '14' | '45'>('all');
  const [selectedStreet, setSelectedStreet] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'none' | 'area' | 'street'>('none');

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

  // קבלת רחובות לפי אזור נבחר
  const getStreetsForArea = (area: string) => {
    if (area === 'all') return streets;
    return streets.filter(s => s.area.toString() === area);
  };

  const availableStreets = getStreetsForArea(selectedArea);

  // סינון הספר טלפונים
  let filteredDirectory = phoneDirectory.filter(entry => {
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

    // סינון לפי אזור
    if (selectedArea !== 'all') {
      const street = streets.find(s => entry.address.includes(s.name));
      if (!street || street.area.toString() !== selectedArea) return false;
    }

    // סינון לפי רחוב
    if (selectedStreet !== 'all') {
      const street = streets.find(s => s.id === selectedStreet);
      if (!street || !entry.address.includes(street.name)) return false;
    }

    // סינון לפי סוג
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

  // קיבוץ לפי אזור או רחוב
  const groupedDirectory = () => {
    if (groupBy === 'area') {
      const groups: { [key: string]: typeof filteredDirectory } = {};
      
      filteredDirectory.forEach(entry => {
        const street = streets.find(s => entry.address.includes(s.name));
        const area = street ? street.area.toString() : 'לא ידוע';
        
        if (!groups[area]) groups[area] = [];
        groups[area].push(entry);
      });
      
      return Object.entries(groups).sort(([a], [b]) => {
        if (a === 'לא ידוע') return 1;
        if (b === 'לא ידוע') return -1;
        return parseInt(a) - parseInt(b);
      });
    }
    
    if (groupBy === 'street') {
      const groups: { [key: string]: typeof filteredDirectory } = {};
      
      filteredDirectory.forEach(entry => {
        const street = streets.find(s => entry.address.includes(s.name));
        const streetName = street ? street.name : 'לא ידוע';
        
        if (!groups[streetName]) groups[streetName] = [];
        groups[streetName].push(entry);
      });
      
      return Object.entries(groups).sort(([a], [b]) => {
        if (a === 'לא ידוע') return 1;
        if (b === 'לא ידוע') return -1;
        return a.localeCompare(b);
      });
    }
    
    return [['הכל', filteredDirectory]];
  };

  const grouped = groupedDirectory();

  // סטטיסטיקות לפי אזור
  const getAreaStats = () => {
    const stats = { '12': 0, '14': 0, '45': 0 };
    
    phoneDirectory.forEach(entry => {
      const street = streets.find(s => entry.address.includes(s.name));
      if (street) {
        const area = street.area.toString() as keyof typeof stats;
        if (stats[area] !== undefined) {
          stats[area]++;
        }
      }
    });
    
    return stats;
  };

  const areaStats = getAreaStats();

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
              {selectedArea !== 'all' && ` באזור ${selectedArea}`}
              {selectedStreet !== 'all' && ` ברחוב ${availableStreets.find(s => s.id === selectedStreet)?.name}`}
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

      {/* סטטיסטיקות לפי אזור */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-blue-600" />
          פילוח לפי אזורים
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">אזור 12</span>
              <span className="text-2xl font-bold text-purple-600">{areaStats['12']}</span>
            </div>
            <p className="text-xs text-purple-600">אנשי קשר</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">אזור 14</span>
              <span className="text-2xl font-bold text-blue-600">{areaStats['14']}</span>
            </div>
            <p className="text-xs text-blue-600">אנשי קשר</p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-700">אזור 45</span>
              <span className="text-2xl font-bold text-indigo-600">{areaStats['45']}</span>
            </div>
            <p className="text-xs text-indigo-600">אנשי קשר</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">סה״כ</span>
              <span className="text-2xl font-bold text-green-600">{phoneDirectory.length}</span>
            </div>
            <p className="text-xs text-green-600">כל האנשי קשר</p>
          </div>
        </div>
      </div>

      {/* חיפוש וסינון */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="space-y-4">
          {/* שורה ראשונה - חיפוש */}
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
          
          {/* שורה שנייה - סינון לפי סוג */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Filter size={14} />
              סוג:
            </span>
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
          
          {/* שורה שלישית - סינון לפי אזור */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <MapPin size={14} />
              אזור:
            </span>
            {[
              { key: 'all', label: 'כל האזורים', count: phoneDirectory.length },
              { key: '12', label: 'אזור 12', count: areaStats['12'] },
              { key: '14', label: 'אזור 14', count: areaStats['14'] },
              { key: '45', label: 'אזור 45', count: areaStats['45'] }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedArea(key as any);
                  setSelectedStreet('all'); // איפוס בחירת רחוב
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedArea === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
          
          {/* שורה רביעית - סינון לפי רחוב (רק אם נבחר אזור) */}
          {selectedArea !== 'all' && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">רחוב:</span>
              <button
                onClick={() => setSelectedStreet('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStreet === 'all'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                כל הרחובות
              </button>
              {availableStreets.map(street => (
                <button
                  key={street.id}
                  onClick={() => setSelectedStreet(street.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStreet === street.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {street.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
          
          {/* שורה חמישית - קיבוץ */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">קיבוץ:</span>
            {[
              { key: 'none', label: 'ללא קיבוץ' },
              { key: 'area', label: 'לפי אזור' },
              { key: 'street', label: 'לפי רחוב' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setGroupBy(key as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  groupBy === key
                    ? 'bg-purple-500 text-white'
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
      <div className="space-y-6">
        {grouped.map(([groupName, entries]) => (
          <div key={groupName}>
            {/* כותרת קבוצה */}
            {groupBy !== 'none' && (
              <div className="mb-4">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white shadow-lg ${
                  groupBy === 'area' 
                    ? groupName === '12' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                      groupName === '14' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      groupName === '45' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' :
                      'bg-gradient-to-r from-gray-500 to-gray-600'
                    : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}>
                  <MapPin size={18} />
                  {groupBy === 'area' ? `אזור ${groupName}` : groupName}
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                    {entries.length}
                  </span>
                </div>
              </div>
            )}

            {/* רשימת אנשי קשר בקבוצה */}
            <div className="space-y-4">
              {entries.map((entry, index) => {
                // קבלת מידע על הרחוב והאזור
                const street = streets.find(s => entry.address.includes(s.name));
                const areaColor = street?.area === 12 ? 'purple' : street?.area === 14 ? 'blue' : 'indigo';
                
                return (
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
                              {street && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  areaColor === 'purple' ? 'bg-purple-100 text-purple-700' :
                                  areaColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                                  'bg-indigo-100 text-indigo-700'
                                }`}>
                                  אזור {street.area}
                                </span>
                              )}
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