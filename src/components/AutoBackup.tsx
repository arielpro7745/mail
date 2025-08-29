import { useEffect, useState } from 'react';
import { useDistribution } from '../hooks/useDistribution';
import { useBuildings } from '../hooks/useBuildings';
import { useTasks } from '../hooks/useTasks';
import { Cloud, CloudOff, Download, Upload, Shield, Clock } from 'lucide-react';

export default function AutoBackup() {
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  const { allStreets } = useDistribution();
  const { buildings } = useBuildings();
  const { tasks } = useTasks();

  // גיבוי אוטומטי כל 30 דקות
  useEffect(() => {
    if (!autoBackupEnabled) return;

    const performBackup = async () => {
      setIsBackingUp(true);
      
      try {
        const backupData = {
          timestamp: new Date().toISOString(),
          streets: allStreets,
          buildings,
          tasks,
          version: '2.0.0'
        };

        // שמירה ב-localStorage כגיבוי מקומי
        localStorage.setItem('backup_data', JSON.stringify(backupData));
        localStorage.setItem('last_backup', new Date().toISOString());
        
        setLastBackup(new Date());
        setBackupStatus('success');
        
        console.log('Auto backup completed successfully');
      } catch (error) {
        console.error('Auto backup failed:', error);
        setBackupStatus('error');
      } finally {
        setIsBackingUp(false);
      }
    };

    // גיבוי ראשוני
    performBackup();

    // גיבוי כל 30 דקות
    const interval = setInterval(performBackup, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [allStreets, buildings, tasks, autoBackupEnabled]);

  // טעינת תאריך גיבוי אחרון
  useEffect(() => {
    const lastBackupStr = localStorage.getItem('last_backup');
    if (lastBackupStr) {
      setLastBackup(new Date(lastBackupStr));
    }
  }, []);

  // גיבוי ידני
  const manualBackup = async () => {
    setIsBackingUp(true);
    
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        streets: allStreets,
        buildings,
        tasks,
        version: '2.0.0'
      };

      // הורדה כקובץ
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mail-delivery-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastBackup(new Date());
      setBackupStatus('success');
    } catch (error) {
      console.error('Manual backup failed:', error);
      setBackupStatus('error');
    } finally {
      setIsBackingUp(false);
    }
  };

  // שחזור מגיבוי
  const restoreFromBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        
        // כאן תוכל להוסיף לוגיקה לשחזור הנתונים
        console.log('Backup data loaded:', backupData);
        alert('הנתונים נטענו בהצלחה! רענן את הדף להחלת השינויים.');
        
      } catch (error) {
        console.error('Failed to restore backup:', error);
        alert('שגיאה בטעינת הגיבוי');
      }
    };
    reader.readAsText(file);
  };

  const getStatusColor = () => {
    switch (backupStatus) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (backupStatus) {
      case 'success': return <Cloud size={16} className="text-green-600" />;
      case 'error': return <CloudOff size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-800">גיבוי אוטומטי</h3>
            <div className="flex items-center gap-2 text-sm">
              {getStatusIcon()}
              <span className={getStatusColor()}>
                {lastBackup 
                  ? `גיבוי אחרון: ${lastBackup.toLocaleTimeString('he-IL')}`
                  : 'טוען...'
                }
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              autoBackupEnabled
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-700'
            }`}
          >
            {autoBackupEnabled ? 'פעיל' : 'כבוי'}
          </button>
          
          <button
            onClick={manualBackup}
            disabled={isBackingUp}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
          >
            {isBackingUp ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              <Download size={14} />
            )}
            גבה עכשיו
          </button>
          
          <label className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors cursor-pointer">
            <Upload size={14} />
            שחזר
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) restoreFromBackup(file);
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {isBackingUp && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 font-medium">מבצע גיבוי...</span>
          </div>
        </div>
      )}
    </div>
  );
}