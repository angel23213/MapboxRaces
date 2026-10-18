import React from 'react';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Zap,
  Edit3,
  Trash2,
  CheckCircle,
  Save,
  RotateCcw,
  Info,
  Eye,
} from 'lucide-react';

export default function Sidebar({
  distance,
  mode,
  setMode,
  profile,
  setProfile,
  isFinished,
  isViewMode,
  raceName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onFinish,
  onClear,
  onResume,
  onSave,
  onBackToDashboard,
}) {
  return (
    <aside className="sidebar">
      <button className="btn-back" onClick={onBackToDashboard}>
        <ArrowLeft size={16} /> Volver al Menú
      </button>

      <h2>{isViewMode ? raceName || 'Detalle de Carrera' : 'Diseñador de Ruta'}</h2>
      <p className="subtitle">
        {isViewMode
          ? 'Inspección de ruta guardada'
          : 'Configura y traza el recorrido de la carrera'}
      </p>
      <hr />

      {/* Indicador para Modo Vista */}
      {isViewMode ? (
        <div className="status-badge view-mode">
          <Eye size={16} /> Modo Lectura (Carrera Guardada)
        </div>
      ) : (
        <>
          {/* Selector de Modo */}
          <div className="control-group">
            <label className="group-label">Modo de Trazado</label>
            <div className="toggle-buttons">
              <button
                className={`toggle-btn ${mode === 'auto' ? 'active' : ''}`}
                onClick={() => setMode('auto')}
                disabled={isFinished}
              >
                <Zap size={15} /> Automático
              </button>
              <button
                className={`toggle-btn ${mode === 'manual' ? 'active' : ''}`}
                onClick={() => setMode('manual')}
                disabled={isFinished}
              >
                <Edit3 size={15} /> Manual
              </button>
            </div>
          </div>

          {/* Tarjeta de Instrucciones Dinámicas */}
          <div className="instruction-card">
            <div className="instruction-header">
              <Info size={16} className="info-icon" />
              <span>Instrucciones</span>
            </div>
            <p className="instruction-text">
              {mode === 'auto' ? (
                <>
                  Haz clic sobre el mapa para seleccionar los puntos que se unirán
                  automáticamente y al final presiona el botón de finalizar trazado.
                </>
              ) : (
                <>
                  Dirige cada punto a través de las calles. Al finalizar el trazado,
                  la ruta se ajustará automáticamente a las vías.
                </>
              )}
            </p>
          </div>

          {/* Barra Deshacer / Rehacer */}
          <div className="history-toolbar">
            <button
              className="btn-history"
              onClick={onUndo}
              disabled={!canUndo}
              title="Deshacer último punto"
            >
              <Undo2 size={16} /> Deshacer
            </button>
            <button
              className="btn-history"
              onClick={onRedo}
              disabled={!canRedo}
              title="Rehacer punto"
            >
              <Redo2 size={16} /> Rehacer
            </button>
          </div>

          {/* Selector de Perfil */}
          <div className="control-group">
            <label className="group-label">Perfil de Terreno</label>
            <select
              className="select-input"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              disabled={isFinished}
            >
              <option value="walking">🏃 Carrera / Caminata</option>
              <option value="cycling">🚴 Ciclismo</option>
            </select>
          </div>

          {/* Indicador de Estado */}
          <div className={`status-badge ${isFinished ? 'finished' : 'active'}`}>
            {isFinished ? '🔒 Ruta Finalizada' : '✏️ Trazando Ruta...'}
          </div>
        </>
      )}

      {/* Recuadro de Distancia */}
      <div className="distance-box">
        <span className="label">Distancia Total</span>
        <div className="distance-value">
          {distance.toFixed(2)} <small>km</small>
        </div>
      </div>

      {/* Acciones */}
      <div className="actions-group">
        {isViewMode ? (
          <button className="btn-action btn-save" onClick={onBackToDashboard}>
            <ArrowLeft size={16} /> Volver a Mis Carreras
          </button>
        ) : !isFinished ? (
          <>
            {distance > 0 && (
              <button className="btn-action btn-finish" onClick={onFinish}>
                <CheckCircle size={16} /> Finalizar Trazado
              </button>
            )}
            <button className="btn-action btn-clear" onClick={onClear}>
              <Trash2 size={16} /> Borrar Ruta
            </button>
          </>
        ) : (
          <>
            <button className="btn-action btn-edit" onClick={onResume}>
              <RotateCcw size={16} /> Editar / Reanudar Trazado
            </button>
            <button className="btn-action btn-clear" onClick={onClear}>
              <Trash2 size={16} /> Borrar Ruta
            </button>
            {distance > 0 && (
              <button className="btn-action btn-save" onClick={onSave}>
                <Save size={16} /> Guardar Carrera
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );
}