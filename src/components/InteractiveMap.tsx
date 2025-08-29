import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Building, Street } from '../types';
import { streets } from '../data/streets';
import { Map, Navigation, Router as Route, MapPin, Clock, CheckCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Props {
  buildings: Building[];
  currentArea: 12 | 14 | 45;
  completedToday: Street[];
  onBuildingClick?: (building: Building) => void;
}

export default function InteractiveMap({ buildings, currentArea, completedToday, onBuildingClick }: Props) {
  const [mapCenter] = useState<[number, number]>([32.0853, 34.7818]); // פתח תקווה
  const [selectedRoute, setSelectedRoute] = useState<Building[]>([]);
  const [showRoute, setShowRoute] = useState(false);

  // מיקומים משוערים לרחובות (לדוגמה)
  const streetCoordinates: Record<string, [number, number]> = {
    'david-zvi-pinkas-1-21': [32.0853, 34.7818],
    'david-zvi-pinkas-24-2': [32.0855, 34.7820],
    'ninety-three-42-2': [32.0850, 34.7815],
    'ninety-three-1-11': [32.0852, 34.7817],
    'ninety-three-13-21': [32.0854, 34.7819],
    'rot-110‑132': [32.0860, 34.7825],
    'rot-134‑150': [32.0862, 34.7827],
    'rot-152‑182': [32.0864, 34.7829],
    'weiz-even': [32.0870, 34.7835],
    'weiz-odd': [32.0872, 34.7837],
  };

  // יצירת מסלול אופטימלי
  const generateOptimalRoute = () => {
    const areaBuildings = buildings.filter(b => {
      const street = streets.find(s => s.id === b.streetId);
      return street?.area === currentArea;
    });

    // מיון לפי קרבה גיאוגרפית (פשוט)
    const route = areaBuildings.sort((a, b) => {
      const aCoords = streetCoordinates[a.streetId];
      const bCoords = streetCoordinates[b.streetId];
      if (!aCoords || !bCoords) return 0;
      
      // מיון לפי קו רוחב (צפון לדרום)
      return aCoords[0] - bCoords[0];
    });

    setSelectedRoute(route);
    setShowRoute(true);
  };

  // יצירת קו מסלול
  const routeCoordinates = selectedRoute
    .map(b => streetCoordinates[b.streetId])
    .filter(Boolean);

  // אייקונים מותאמים אישית
  const createCustomIcon = (color: string, completed: boolean = false) => {
    return L.divIcon({
      html: `<div style="
        width: 20px; 
        height: 20px; 
        background-color: ${color}; 
        border: 2px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
      ">${completed ? '✓' : '!'}</div>`,
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Map size={24} className="text-blue-600" />
            <div>
              <h3 className="font-bold text-xl text-gray-800">מפה אינטראקטיבית</h3>
              <p className="text-sm text-gray-600">מסלולי חלוקה ומיקום בניינים - אזור {currentArea}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateOptimalRoute}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Route size={16} />
              צור מסלול
            </button>
            <button
              onClick={() => setShowRoute(!showRoute)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showRoute 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Navigation size={16} />
              {showRoute ? 'הסתר מסלול' : 'הצג מסלול'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
          <MapContainer
            center={mapCenter}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            {/* סמנים לבניינים */}
            {buildings
              .filter(b => {
                const street = streets.find(s => s.id === b.streetId);
                return street?.area === currentArea;
              })
              .map(building => {
                const coords = streetCoordinates[building.streetId];
                if (!coords) return null;

                const street = streets.find(s => s.id === building.streetId);
                const isCompleted = street && completedToday.some(s => s.id === street.id);
                const color = isCompleted ? '#10b981' : '#ef4444';

                return (
                  <Marker
                    key={building.id}
                    position={coords}
                    icon={createCustomIcon(color, isCompleted)}
                    eventHandlers={{
                      click: () => onBuildingClick?.(building)
                    }}
                  >
                    <Popup>
                      <div className="text-center">
                        <h4 className="font-semibold">{street?.name}</h4>
                        <p className="text-sm text-gray-600">בניין {building.number}</p>
                        <p className="text-xs text-gray-500">
                          {building.residents.length} דיירים
                        </p>
                        {isCompleted && (
                          <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                            <CheckCircle size={12} />
                            חולק היום
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

            {/* קו מסלול */}
            {showRoute && routeCoordinates.length > 1 && (
              <Polyline
                positions={routeCoordinates}
                color="#3b82f6"
                weight={4}
                opacity={0.7}
                dashArray="10, 10"
              />
            )}
          </MapContainer>
        </div>

        {/* מקרא */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
            <span>לא חולק</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
            <span>חולק היום</span>
          </div>
          {showRoute && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-500 opacity-70" style={{borderStyle: 'dashed'}}></div>
              <span>מסלול מומלץ</span>
            </div>
          )}
        </div>

        {selectedRoute.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">מסלול אופטימלי ({selectedRoute.length} בניינים)</h4>
            <div className="text-sm text-blue-700">
              זמן משוער: {Math.round(selectedRoute.length * 8)} דקות
            </div>
          </div>
        )}
      </div>
    </div>
  );
}