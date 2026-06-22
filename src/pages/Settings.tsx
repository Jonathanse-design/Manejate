import { Upload, Download, FileJson, ShieldCheck, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { useFinance } from '../store/financeStore';
import { buildAlerts } from '../utils/alerts';
import { humanDate } from '../utils/dates';
import {
  exportCardConsumptionsCsv,
  exportFullBackup,
  exportProductsCsv,
  exportTransactionsCsv,
  validateImportData
} from '../utils/exportImport';

export const Settings = () => {
  const {
    data,
    switchMode,
    updateSettings,
    markBackupCreated,
    importData,
    resetDemo,
    resetReal
  } = useFinance();
  const [confirmText, setConfirmText] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [displayName, setDisplayName] = useState(data?.settings.userName || '');
  const [greeting, setGreeting] = useState(data?.settings.dashboardGreeting || 'Tu dinero, bajo control.');
  const [country, setCountry] = useState(data?.settings.country || 'República Dominicana');
  const [currency, setCurrency] = useState(data?.settings.currency || 'RD$');
  const inputRef = useRef<HTMLInputElement>(null);
  if (!data) return null;

  const exportBackup = () => {
    exportFullBackup(data);
    markBackupCreated();
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as unknown;
      if (!validateImportData(parsed)) {
        setImportMessage('El archivo no tiene una estructura válida de Manéjate.');
        return;
      }
      await importData(parsed);
      setImportMessage('Datos importados correctamente.');
    } catch {
      setImportMessage('No se pudo leer el archivo. Revisa que sea JSON válido.');
    }
  };

  const resetRealData = () => {
    if (confirmText !== 'BORRAR') return;
    resetReal();
    setConfirmText('');
  };

  const saveProfile = () => {
    updateSettings({
      userName: displayName.trim() || undefined,
      dashboardGreeting: greeting.trim() || 'Tu dinero, bajo control.',
      country: country.trim() || undefined,
      currency
    });
    setProfileMessage('Perfil actualizado.');
  };

  const backupAlerts = buildAlerts(data).filter((alert) => alert.title.toLowerCase().includes('respaldo'));

  return (
    <div className="settings-grid">
      <section className="panel wide profile-settings-panel">
        <div className="section-title">
          <div>
            <p className="eyebrow">Personalización</p>
            <h2>Perfil visible</h2>
          </div>
          <span className="status-pill info">Editable</span>
        </div>
        <p className="muted">Estos datos controlan el saludo del dashboard y la moneda que ves en tus módulos.</p>
        <div className="settings-form-grid">
          <label>
            Nombre visible
            <input
              onChange={(event) => {
                setDisplayName(event.target.value);
                setProfileMessage('');
              }}
              placeholder="Ej. María"
              value={displayName}
            />
          </label>
          <label>
            Saludo del dashboard
            <input
              onChange={(event) => {
                setGreeting(event.target.value);
                setProfileMessage('');
              }}
              placeholder="Tu dinero, bajo control."
              value={greeting}
            />
          </label>
          <label>
            País
            <input
              onChange={(event) => {
                setCountry(event.target.value);
                setProfileMessage('');
              }}
              value={country}
            />
          </label>
          <label>
            Moneda
            <select
              onChange={(event) => {
                setCurrency(event.target.value);
                setProfileMessage('');
              }}
              value={currency}
            >
              <option>RD$</option>
              <option>US$</option>
              <option>€</option>
              <option>$</option>
            </select>
          </label>
        </div>
        <div className="card-actions">
          <button className="primary-btn" onClick={saveProfile} type="button">Guardar perfil</button>
          {profileMessage && <span className="status-pill success">{profileMessage}</span>}
        </div>
      </section>

      <section className="panel wide">
        <div className="section-title">
          <h2>Respaldo y seguridad de datos</h2>
          <ShieldCheck />
        </div>
        <p className="muted">
          Esta app guarda los datos en IndexedDB dentro de este navegador. GitHub Pages no guarda una copia en la nube.
        </p>
        <div className="backup-status">
          <strong>
            Último respaldo:{' '}
            {data.settings.lastBackupAt ? humanDate(data.settings.lastBackupAt.slice(0, 10)) : 'Nunca'}
          </strong>
          {backupAlerts.map((alert) => (
            <span className={`status-chip ${alert.level}`} key={alert.id}>{alert.message}</span>
          ))}
        </div>
        <div className="button-grid">
          <button className="primary-btn" onClick={exportBackup} type="button"><Download size={18} /> Exportar backup JSON</button>
          <button className="secondary-btn" onClick={() => inputRef.current?.click()} type="button"><Upload size={18} /> Importar JSON</button>
          <button className="secondary-btn" onClick={() => exportTransactionsCsv(data)} type="button"><FileJson size={18} /> Movimientos CSV</button>
          <button className="secondary-btn" onClick={() => exportCardConsumptionsCsv(data)} type="button">Consumos CSV</button>
          <button className="secondary-btn" onClick={() => exportProductsCsv(data)} type="button">Productos CSV</button>
        </div>
        <input
          accept="application/json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleImport(file);
          }}
          ref={inputRef}
          type="file"
        />
        {importMessage && <p className="status-message">{importMessage}</p>}
      </section>

      <section className="panel">
        <h3>Modo de datos</h3>
        <p className="muted">Demo y Real están separados. Cambiar de modo no mezcla registros.</p>
        <div className="segmented">
          <button className={data.settings.selectedMode === 'demo' ? 'active' : ''} onClick={() => switchMode('demo')} type="button">Modo Demo</button>
          <button className={data.settings.selectedMode === 'real' ? 'active' : ''} onClick={() => switchMode('real')} type="button">Modo Real</button>
        </div>
        <button className="secondary-btn" onClick={resetDemo} type="button">Resetear datos demo</button>
      </section>

      <section className="panel danger-panel">
        <h3>Reset fuerte de datos reales</h3>
        <p>Antes de borrar datos reales, exporta un backup. Para confirmar escribe BORRAR.</p>
        <input onChange={(event) => setConfirmText(event.target.value)} placeholder="BORRAR" value={confirmText} />
        <button className="danger-btn" disabled={confirmText !== 'BORRAR'} onClick={resetRealData} type="button">
          <Trash2 size={18} /> Borrar datos reales
        </button>
      </section>

      <section className="panel wide">
        <h3>Instalación como PWA en iPhone</h3>
        <ol className="steps-list">
          <li>Abrir el enlace publicado en Safari.</li>
          <li>Tocar el botón de compartir.</li>
          <li>Elegir “Agregar a pantalla de inicio”.</li>
          <li>Abrir Manéjate como app instalada.</li>
        </ol>
      </section>
    </div>
  );
};
