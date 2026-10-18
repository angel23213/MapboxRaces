import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'editor' | 'viewer'
  const [distance, setDistance] = useState(0);
  const [mode, setMode] = useState('auto');
  const [profile, setProfile] = useState('walking');
  const [isFinished, setIsFinished] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [savedRaces, setSavedRaces] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);

  const [waypoints, setWaypoints] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const handleStartNewRace = () => {
    setDistance(0);
    setWaypoints([]);
    setRedoStack([]);
    setIsFinished(false);
    setSelectedRace(null);
    setResetKey((prev) => prev + 1);
    setCurrentView('editor');
  };

  const handleClearRoute = () => {
    setDistance(0);
    setWaypoints([]);
    setRedoStack([]);
    setIsFinished(false);
    setResetKey((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (waypoints.length === 0 || isFinished) return;
    const lastPoint = waypoints[waypoints.length - 1];
    setRedoStack((prev) => [...prev, lastPoint]);
    setWaypoints((prev) => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || isFinished) return;
    const nextPoint = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setWaypoints((prev) => [...prev, nextPoint]);
  };

  const handleFinishRoute = () => {
    if (distance <= 0 || waypoints.length < 2) {
      alert('Debes trazar al menos dos puntos para finalizar la ruta.');
      return;
    }
    setIsFinished(true);
  };

  const handleSaveRace = () => {
    if (distance <= 0) return alert('Debes trazar una ruta válida primero.');
    const newRace = {
      id: Date.now(),
      name: `Carrera #${savedRaces.length + 1}`,
      distance,
      mode,
      profile,
      waypoints: [...waypoints],
      createdAt: new Date().toLocaleDateString(),
    };
    setSavedRaces([newRace, ...savedRaces]);
    setCurrentView('dashboard');
  };

  const handleViewRace = (race) => {
    setSelectedRace(race);
    setWaypoints(race.waypoints);
    setDistance(race.distance);
    setMode(race.mode);
    setProfile(race.profile || 'walking');
    setIsFinished(true);
    setCurrentView('viewer');
  };

  const handleDeleteRace = (raceId) => {
    setSavedRaces(savedRaces.filter((r) => r.id !== raceId));
  };

  return (
    <div className="app-container">
      {currentView === 'dashboard' ? (
        <Dashboard
          onCreateNew={handleStartNewRace}
          savedRaces={savedRaces}
          onViewRace={handleViewRace}
          onDeleteRace={handleDeleteRace}
        />
      ) : (
        <div className="editor-layout">
          <Sidebar
            distance={distance}
            mode={mode}
            setMode={setMode}
            profile={profile}
            setProfile={setProfile}
            isFinished={isFinished}
            isViewMode={currentView === 'viewer'}
            raceName={selectedRace?.name}
            canUndo={waypoints.length > 0 && !isFinished}
            canRedo={redoStack.length > 0 && !isFinished}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onFinish={handleFinishRoute}
            onClear={handleClearRoute}
            onResume={() => setIsFinished(false)}
            onSave={handleSaveRace}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
          <div className="map-wrapper">
            <Map
              mode={mode}
              profile={profile}
              isFinished={isFinished}
              isViewMode={currentView === 'viewer'}
              setIsFinished={setIsFinished}
              waypoints={waypoints}
              setWaypoints={setWaypoints}
              setRedoStack={setRedoStack}
              onDistanceChange={setDistance}
              resetKey={resetKey}
            />
          </div>
        </div>
      )}
    </div>
  );
}