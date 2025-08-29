import { useState } from 'react';
import { Building } from '../types';
import { streets } from '../data/streets';
import { Navigation, Download, MapPin, Route, Smartphone } from 'lucide-react';

interface Props {
  buildings: Building[];
  currentArea: 12 | 14 | 45;
  optimizedRoute?: Building[];
}

export default function GPSExporter({ buildings, currentArea, optimizedRoute }: Props) {
  const [exportFormat, setExportFormat] = useState<'gpx' | 'kml' | 'csv'>('gpx');
  const [includeNotes, setIncludeNotes] = useState(true);

  // מיקומים משוערים (בפועל יהיו מדויקים)
  const getCoordinates = (streetId: string, buildingNumber: number): [number, number] => {
    const baseCoords: Record<string, [number, number]> = {
      'david-zvi-pinkas-1-21': [32.0853, 34.7818],
      'david-zvi-pinkas-24-2': [32.0855, 34.7820],
      'ninety-three-42-2': [32.0850, 34.7815],
      'rot-110‑132': [32.0860, 34.7825],
      'weiz-even': [32.0870, 34.7835],
    };

    const base = baseCoords[streetId] || [32.0853, 34.7818];
    // הוספת וריאציה קטנה לפי מספר בניין
    const offset = buildingNumber * 0.0001;
    return [base[0] + offset, base[1] + offset];
  };

  // יצירת קובץ GPX
  const generateGPX = (buildingsToExport: Building[]) => {
    const waypoints = buildingsToExport.map((building, index) => {
      const coords = getCoordinates(building.streetId, building.number);
      const street = streets.find(s => s.id === building.streetId);
      const name = `${street?.name || building.streetId} ${building.number}`;
      const description = includeNotes ? 
        `בניין ${building.number}, ${building.residents.length} דיירים` : '';

      return `
    <wpt lat="${coords[0]}" lon="${coords[1]}">
      <name>${name}</name>
      <desc>${description}</desc>
      <sym>Building</sym>
    </wpt>`;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Mail Delivery Tracker">
  <metadata>
    <name>מסלול חלוקת דואר - אזור ${currentArea}</name>
    <desc>מסלול אופטימלי לחלוקת דואר</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
${waypoints}
</gpx>`;
  };

  // יצירת קובץ KML
  const generateKML = (buildingsToExport: Building[]) => {
    const placemarks = buildingsToExport.map((building, index) => {
      const coords = getCoordinates(building.streetId, building.number);
      const street = streets.find(s => s.id === building.streetId);
      const name = `${street?.name || building.streetId} ${building.number}`;

      return `
    <Placemark>
      <name>${name}</name>
      <description>בניין ${building.number} - ${building.residents.length} דיירים</description>
      <Point>
        <coordinates>${coords[1]},${coords[0]},0</coordinates>
      </Point>
    </Placemark>`;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>מסלול חלוקת דואר - אזור ${currentArea}</name>
    <description>מסלול אופטימלי לחלוקת דואר</description>
${placemarks}
  </Document>
</kml>`;
  };

  // יצירת קובץ CSV למיקומים
  const generateLocationCSV = (buildingsToExport: Building[]) => {
    let csv = 'שם,כתובת,קו רוחב,קו אורך,הערות\n';
    
    buildingsToExport.forEach(building => {
      const coords = getCoordinates(building.streetId, building.number);
      const street = streets.find(s => s.id === building.streetId);
      const name = `${street?.name || building.streetId} ${building.number}`;
      const address = `${street?.name || building.streetId} ${building.number}, פתח תקווה`;
      const notes = `${building.residents.length} דיירים`;
      
      csv += `"${name}","${address}",${coords[0]},${coords[1]},"${notes}"\n`;
    });
    
    return csv;
  };

  // ייצוא מסלול
  const exportRoute = () => {
    const buildingsToExport = optimizedRoute || buildings.filter(b => {
      const street = streets.find(s => s.id === b.streetId);
      return street?.area === currentArea;
    });

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (exportFormat) {
      case 'gpx':
        content = generateGPX(buildingsToExport);
        filename = `route-area-${currentArea}-${new Date().toISOString().split('T')[0]}.gpx`;
        mimeType = 'application/gpx+xml';
        break;
      case 'kml':
        content = generateKML(buildingsToExport);
        filename = `route-area-${currentArea}-${new Date().toISOString().split('T')[0]}.kml`;
        mimeType = 'application/vnd.google-earth.kml+xml';
        break;
      case 'csv':
        content = generateLocationCSV(buildingsToExport);
        filename = `locations-area-${currentArea}-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv;charset=utf-8';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-3">
          <Navigation size={24} className="text-green-600" />
          <div>
            <h3 className="font-bold text-xl text-gray-800">ייצוא ל-GPS</h3>
            <p className="text-sm text-gray-600">ייצא מסלולים לאפליקציות ניווט</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">פורמט ייצוא</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="gpx">GPX (Garmin, Waze)</option>
              <option value="kml">KML (Google Earth)</option>
              <option value="csv">CSV (Excel, Sheets)</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">כלול הערות</span>
            </label>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportRoute}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 shadow-lg"
            >
              <Download size={16} />
              ייצא מסלול
            </button>
          </div>
        </div>

        {/* מידע על פורמטים */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone size={16} className="text-blue-600" />
              <h4 className="font-semibold text-blue-800">GPX</h4>
            </div>
            <p className="text-sm text-blue-700">
              מתאים ל-Garmin, Waze, Google Maps
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-green-600" />
              <h4 className="font-semibold text-green-800">KML</h4>
            </div>
            <p className="text-sm text-green-700">
              מתאים ל-Google Earth, Google Maps
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Route size={16} className="text-purple-600" />
              <h4 className="font-semibold text-purple-800">CSV</h4>
            </div>
            <p className="text-sm text-purple-700">
              מתאים לאקסל וניתוח נתונים
            </p>
          </div>
        </div>

        {optimizedRoute && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Route size={16} className="text-green-600" />
              <span className="font-semibold text-green-800">מסלול מותאם</span>
            </div>
            <p className="text-sm text-green-700">
              המסלול כולל {optimizedRoute.length} בניינים באזור {currentArea} 
              בסדר אופטימלי לחלוקה יעילה
            </p>
          </div>
        )}
      </div>
    </div>
  );
}