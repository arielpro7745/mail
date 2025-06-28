import { useState } from "react";
import { useSettings } from "../hooks/useSettings";
import { Settings as SettingsIcon, Bell, Volume2, Map } from "lucide-react";

export default function Settings() {
  const { settings, updateSettings, loading } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:bg-indigo-700 rounded transition"
        title="הגדרות"
      >
        <SettingsIcon size={20} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white border rounded-lg shadow-lg p-4 z-50">
          <h3 className="font-semibold mb-4 text-gray-800">הגדרות מערכת</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} />
                <span>תזכורת יומית</span>
              </div>
              <input
                type="checkbox"
                checked={settings.dailyReminder}
                onChange={(e) => updateSettings({ dailyReminder: e.target.checked })}
                className="rounded"
              />
            </div>

            {settings.dailyReminder && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">שעת תזכורת</span>
                <input
                  type="time"
                  value={settings.reminderTime}
                  onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                  className="border rounded px-2 py-1"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 size={16} />
                <span>צלילי התראה</span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map size={16} />
                <span>אופטימיזציה אוטומטית</span>
              </div>
              <input
                type="checkbox"
                checked={settings.optimizeRoutes}
                onChange={(e) => updateSettings({ optimizeRoutes: e.target.checked })}
                className="rounded"
              />
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full btn-sm"
          >
            סגור
          </button>
        </div>
      )}
    </div>
  );
}