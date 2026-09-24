import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Switch from '../components/Switch';

export default function Settings() {
  const { settings, updateSettings, showToast, resolvedTheme, clearAllData } = useApp();
  const [exporting, setExporting] = useState(false);

  function handleClearData() {
    const confirmed = window.confirm(
      'Барлық операциялар, тапсырмалар, еске салғыштар және мақсаттар өшіріледі. ' +
        'Бұл әрекетті қайтару мүмкін емес. Жалғастыру керек пе?'
    );
    if (confirmed) clearAllData();
  }

  function handleExport() {
    setExporting(true);
    // TODO: GET /api/export — бэкенд дайын болғанда CSV/JSON экспорт
    setTimeout(() => {
      setExporting(false);
      showToast('Деректер экспортталды');
    }, 900);
  }

  return (
    <div className="content content--fade">
      <div className="panel">
        <h2 className="section-title">Профиль</h2>
        <div className="field" style={{ maxWidth: 320 }}>
          <label htmlFor="settings-name">Аты</label>
          <input
            id="settings-name"
            type="text"
            value={settings.name}
            onChange={(e) => updateSettings({ name: e.target.value })}
          />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h2 className="section-title">Жалпы баптаулар</h2>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Валюта</div>
            <div className="hint">Барлық сомалар теңгемен көрсетіледі</div>
          </div>
          <select value="KZT" disabled style={{ padding: '8px 10px', background: 'var(--surface-muted)', border: 'none', borderRadius: 'var(--radius-sm)' }}>
            <option value="KZT">₸ Теңге (KZT)</option>
          </select>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Интерфейс тілі</div>
            <div className="hint">Аударма кейінірек қосылады</div>
          </div>
          <div className="segmented">
            <button
              className={settings.language === 'kk' ? 'active' : ''}
              onClick={() => updateSettings({ language: 'kk' })}
            >
              Қазақша
            </button>
            <button
              className={settings.language === 'ru' ? 'active' : ''}
              onClick={() => updateSettings({ language: 'ru' })}
            >
              Русский
            </button>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Тема</div>
            <div className="hint">
              {settings.theme === 'system' ? 'Құрылғы теңшеуіне сай (автоматты)' : 'Қолмен таңдалды'}
            </div>
          </div>
          <div className="segmented">
            <button
              className={resolvedTheme === 'light' ? 'active' : ''}
              onClick={() => updateSettings({ theme: 'light' })}
            >
              Жарық
            </button>
            <button
              className={resolvedTheme === 'dark' ? 'active' : ''}
              onClick={() => updateSettings({ theme: 'dark' })}
            >
              Қараңғы
            </button>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row__label">Хабарландырулар</div>
            <div className="hint">Еске салғыштар туралы хабарлау</div>
          </div>
          <Switch
            on={settings.notificationsEnabled}
            label="Хабарландыруларды қосу/өшіру"
            onToggle={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
          />
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h2 className="section-title">Деректер</h2>
        <button
          className={`btn btn--secondary${exporting ? ' btn--loading' : ''}`}
          onClick={handleExport}
          disabled={exporting}
        >
          <Download size={16} />
          Деректерді экспорттау
        </button>
        <p className="hint" style={{ marginTop: 8 }}>
          Демо режимде экспорт файл жасамайды
        </p>

        <hr className="divider" />

        <button className="btn btn--danger-text" onClick={handleClearData}>
          <Trash2 size={16} />
          Деректерді тазалау
        </button>
        <p className="hint" style={{ marginTop: 8 }}>
          Барлық демо/енгізілген деректерді өшіріп, таза беттен бастайды — нақты
          деректеріңізді енгізуге дайын күй.
        </p>
      </div>
    </div>
  );
}
