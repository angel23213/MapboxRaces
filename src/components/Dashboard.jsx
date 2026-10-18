import React from 'react';
import { Plus, Activity, Route, Eye, Trash2, Calendar } from 'lucide-react';

export default function Dashboard({
  onCreateNew,
  savedRaces,
  onViewRace,
  onDeleteRace,
}) {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-section">
          <h1>
            <Activity className="icon-blue" size={28} /> RaceBuilder Studio
          </h1>
          <p>Plataforma de gestión y diseño de rutas para carreras</p>
        </div>
        <button className="btn-primary-lg" onClick={onCreateNew}>
          <Plus size={18} /> Crear Nueva Carrera
        </button>
      </header>

      <main className="dashboard-content">
        <section className="stats-row">
          <div className="stat-card">
            <span className="stat-number">{savedRaces.length}</span>
            <span className="stat-label">Carreras Creadas</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {savedRaces.reduce((acc, r) => acc + r.distance, 0).toFixed(1)} km
            </span>
            <span className="stat-label">Distancia Acumulada</span>
          </div>
        </section>

        <section className="races-section">
          <h2>Tus Carreras Guardadas</h2>
          {savedRaces.length === 0 ? (
            <div className="empty-state">
              <p>No tienes carreras creadas aún.</p>
              <button className="btn-primary-lg mt-12" onClick={onCreateNew}>
                <Plus size={16} /> Trazar mi primera ruta
              </button>
            </div>
          ) : (
            <div className="races-grid">
              {savedRaces.map((race) => (
                <div key={race.id} className="race-card">
                  <div className="race-card-header">
                    <h3>{race.name}</h3>
                    <span className="badge-mode">
                      {race.mode === 'auto' ? '⚡ Auto' : '✏️ Manual'}
                    </span>
                  </div>

                  <div className="race-info">
                    <span>
                      <Route size={14} /> {race.distance.toFixed(2)} km
                    </span>
                    <span>
                      <Calendar size={14} /> {race.createdAt}
                    </span>
                  </div>

                  <div className="race-card-actions">
                    <button
                      className="btn-card btn-view"
                      onClick={() => onViewRace(race)}
                    >
                      <Eye size={14} /> Ver Ruta
                    </button>
                    <button
                      className="btn-card btn-delete"
                      onClick={() => onDeleteRace(race.id)}
                      title="Eliminar carrera"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}