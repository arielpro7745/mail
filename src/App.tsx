import React, { useState } from 'react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import StreetTable from './components/StreetTable';
import CompletedToday from './components/CompletedToday';
import Reports from './components/Reports';
import Settings from './components/Settings';
import TaskManager from './components/TaskManager';
import WalkingOrder from './components/WalkingOrder';
import BuildingManager from './components/BuildingManager';
import PhoneDirectory from './components/PhoneDirectory';
import DataExport from './components/DataExport';
import WhatsAppManager from './components/WhatsAppManager';
import AdvancedStats from './components/AdvancedStats';
import LoadingSpinner from './components/LoadingSpinner';
import { AreaToggle } from './components/AreaToggle';
import QuickActions from './components/QuickActions';
import Notifications from './components/Notifications';
import DeliveryTimer from './components/DeliveryTimer';
import { useDistribution } from './hooks/useDistribution';
import { useSettings } from './hooks/useSettings';
import { useDeliveryTimer } from './hooks/useDeliveryTimer';
import { Street } from './types';

function App() {
  const { 
    loading, 
    firebaseError,
    todayArea,
    pendingToday,
    completedToday,
    recommended,
    markDelivered,
    undoDelivered,
    endDay,
    urgencyGroups,
    urgencyCounts,
    getStreetUrgencyLevel,
    getUrgencyColor,
    getUrgencyLabel
  } = useDistribution();
  
  const { settings } = useSettings();
  const [currentTab, setCurrentTab] = useState('regular');
  const [timerStreet, setTimerStreet] = useState<Street | null>(null);
  const { startTimer, stopTimer, formatTime, isRunning } = useDeliveryTimer();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (firebaseError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">שגיאת חיבור</h2>
          <p className="text-gray-700 mb-4">{firebaseError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  const handleStartTimer = (street: Street) => {
    setTimerStreet(street);
    startTimer();
  };

  const handleCompleteWithTimer = (timeInMinutes: number) => {
    if (timerStreet) {
      markDelivered(timerStreet.id, timeInMinutes);
      setTimerStreet(null);
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'regular':
        return (
          <div>
            <AreaToggle area={todayArea} onEnd={endDay} />
            
            {/* התראות על רחובות דחופים */}
            <Notifications count={urgencyCounts.critical + urgencyCounts.never} />
            
            {/* פעולות מהירות */}
            <QuickActions />
            
            {/* טיימר פעיל */}
            {timerStreet && (
              <div className="mb-6">
                <DeliveryTimer 
                  streetName={timerStreet.name}
                  onComplete={handleCompleteWithTimer}
                />
              </div>
            )}
            
            {/* רחובות ממתינים */}
            {pendingToday.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-800">רחובות לחלוקה היום</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {pendingToday.length} רחובות
                  </span>
                </div>
                <StreetTable 
                  list={pendingToday} 
                  onDone={markDelivered}
                  onStartTimer={handleStartTimer}
                  getStreetUrgencyLevel={getStreetUrgencyLevel}
                  getUrgencyColor={getUrgencyColor}
                  getUrgencyLabel={getUrgencyLabel}
                />
              </section>
            )}
            
            {/* רחובות שהושלמו היום */}
            <CompletedToday 
              list={completedToday} 
              onUndo={undoDelivered}
            />
            
            {/* סדר הליכה מומלץ */}
            <WalkingOrder area={todayArea} />
          </div>
        );
      
      case 'buildings':
        return <BuildingManager />;
      
      case 'tasks':
        return <TaskManager />;
      
      case 'reports':
        return <Reports />;
      
      case 'phones':
        return <PhoneDirectory />;
      
      case 'export':
        return <DataExport />;
      
      case 'whatsapp':
        return <WhatsAppManager />;
      
      case 'advanced':
        return <AdvancedStats />;
      
      default:
        return <div>טאב לא נמצא</div>;
    }
  };

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <TabBar current={currentTab} setTab={setCurrentTab} />
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}

export default App;