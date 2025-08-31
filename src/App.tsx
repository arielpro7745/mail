import React from 'react';
import Header from './components/Header';
import { TabBar } from './components/TabBar';
import { StreetTable } from './components/StreetTable';
import CompletedToday from './components/CompletedToday';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { TaskManager } from './components/TaskManager';
import { WalkingOrder } from './components/WalkingOrder';
import BuildingManager from './components/BuildingManager';
import { PhoneDirectory } from './components/PhoneDirectory';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useDistribution } from './hooks/useDistribution';
import { useSettings } from './hooks/useSettings';

function App() {
  const { loading, firebaseError } = useDistribution();
  const { settings } = useSettings();

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

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <TabBar />
        <div className="mt-6">
          <StreetTable />
          <CompletedToday />
          <Reports />
          <Settings />
          <TaskManager />
          <WalkingOrder />
          <BuildingManager />
          <PhoneDirectory />
        </div>
      </main>
    </div>
  );
}

export default App;