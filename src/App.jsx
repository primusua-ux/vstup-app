import React, { useState, useEffect } from 'react';
import { mockApplicants } from './utils/mockData';
import { parseCSV, mapCSVToApplicants, convertSheetsUrlToCsv } from './utils/csvParser';
import DashboardStats from './components/DashboardStats';
import FilterBar from './components/FilterBar';
import ApplicantCard from './components/ApplicantCard';
import ApplicantModal from './components/ApplicantModal';
import SettingsModal from './components/SettingsModal';

// Ваше посилання як початкове значення за замовчуванням
const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1urp82EV-m6zrBOzrlQwi35VPmp-irkdmG2rivNHL-J8/edit?usp=sharing';

export default function App() {
  // Зчитуємо налаштування з localStorage або використовуємо дефолтні
  const [sheetUrl, setSheetUrl] = useState(() => {
    const saved = localStorage.getItem('vstup_sheet_url');
    return saved !== null ? saved : DEFAULT_SHEET_URL;
  });
  
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('vstup_theme');
    return saved || 'dark';
  });

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // 'idle' | 'loading' | 'connected' | 'error'
  
  // Фільтри та пошук
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVos, setSelectedVos] = useState('all');
  const [selectedUni, setSelectedUni] = useState('all');
  const [sortBy, setSortBy] = useState('grade-desc');

  // Модальні вікна
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Для встановлення PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Застосування теми
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vstup_theme', theme);
  }, [theme]);

  // Слухач для встановлення PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Завантаження даних із таблиці або mockData
  const loadData = async (url) => {
    setLoading(true);
    
    if (!url) {
      // Якщо адреси немає, вантажимо демо-дані
      setApplicants(mockApplicants);
      setConnectionStatus('idle');
      setLoading(false);
      return;
    }

    setConnectionStatus('loading');
    try {
      let csvUrl = convertSheetsUrlToCsv(url);
      
      // Якщо посилання веде на Google Sheets і ми в режимі розробки, направляємо через проксі
      if (import.meta.env.DEV && csvUrl.startsWith('https://docs.google.com/spreadsheets')) {
        csvUrl = csvUrl.replace('https://docs.google.com/spreadsheets', '/api-sheets');
      }
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Не вдалося отримати файл таблиці');
      }
      
      const csvText = await response.text();
      const csvRows = parseCSV(csvText);
      const mapped = mapCSVToApplicants(csvRows);
      
      if (mapped.length === 0) {
        throw new Error('Таблиця порожня або має невідомий формат');
      }

      setApplicants(mapped);
      // Кешуємо успішно отримані дані
      localStorage.setItem('vstup_cached_data', JSON.stringify(mapped));
      setConnectionStatus('connected');
    } catch (err) {
      console.error('Помилка завантаження даних:', err);
      setConnectionStatus('error');
      
      // Намагаємось завантажити закешовані раніше дані
      const cached = localStorage.getItem('vstup_cached_data');
      if (cached) {
        try {
          setApplicants(JSON.parse(cached));
        } catch {
          setApplicants(mockApplicants);
        }
      } else {
        // Якщо кешу немає — показуємо демо дані
        setApplicants(mockApplicants);
      }
    } finally {
      setLoading(false);
    }
  };

  // Перше завантаження при старті
  useEffect(() => {
    loadData(sheetUrl);
  }, [sheetUrl]);

  // Збереження нового посилання
  const handleSaveSettings = (newUrl) => {
    setSheetUrl(newUrl);
    localStorage.setItem('vstup_sheet_url', newUrl);
    setSettingsOpen(false);
  };

  // Скидання на демо-режим
  const handleResetSettings = () => {
    setSheetUrl('');
    localStorage.removeItem('vstup_sheet_url');
    localStorage.removeItem('vstup_cached_data');
    setApplicants(mockApplicants);
    setConnectionStatus('idle');
    setSettingsOpen(false);
  };

  // Перемикач теми
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Запуск встановлення PWA
  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('Користувач встановив PWA');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  // Парсер дат для сортування (Формат: DD.MM.YYYY HH:MM:SS)
  const parseDateToMs = (dateStr) => {
    if (!dateStr) return 0;
    try {
      const [datePart, timePart] = dateStr.split(' ');
      const [d, m, y] = datePart.split('.').map(Number);
      const [h, min, s] = (timePart || '00:00:00').split(':').map(Number);
      return new Date(y, m - 1, d, h, min, s).getTime();
    } catch {
      return 0;
    }
  };

  // Фільтрація та сортування даних
  const filteredApplicants = applicants
    .filter(applicant => {
      // Пошук за ПІБ або ВНЗ
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        applicant.fullName.toLowerCase().includes(s) ||
        applicant.university.toLowerCase().includes(s);

      // Фільтр за спеціальністю (ВОС)
      let matchesVos = true;
      const v = applicant.vosDesired.toLowerCase();
      if (selectedVos === 'bpak') {
        matchesVos = v.includes('бпак');
      } else if (selectedVos === 'reb') {
        matchesVos = v.includes('реб');
      } else if (selectedVos === 'srz') {
        matchesVos = v.includes('срз');
      } else if (selectedVos === 'other') {
        // Усі інші, хто не входить у БпАК, РЕБ чи СРЗ
        matchesVos = !v.includes('бпак') && !v.includes('реб') && !v.includes('срз');
      }

      // Фільтр за ЗВО
      const matchesUni = selectedUni === 'all' || applicant.university === selectedUni;

      return matchesSearch && matchesVos && matchesUni;
    })
    .sort((a, b) => {
      // Сортування
      if (sortBy === 'grade-desc') {
        // Бали від більшого до меншого (ті, у кого бал 0 - в кінці)
        if (a.grade === 0) return 1;
        if (b.grade === 0) return -1;
        return b.grade - a.grade;
      }
      if (sortBy === 'grade-asc') {
        // Бали від меншого до більшого (0 - також в кінці)
        if (a.grade === 0) return 1;
        if (b.grade === 0) return -1;
        return a.grade - b.grade;
      }
      if (sortBy === 'name') {
        // Алфавітний порядок
        return a.fullName.localeCompare(b.fullName, 'uk');
      }
      if (sortBy === 'date') {
        // Дата подачі (новіші зверху)
        return parseDateToMs(b.timestamp) - parseDateToMs(a.timestamp);
      }
      return 0;
    });

  return (
    <div className="app-container">
      {/* Шапка */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">🎓</div>
          <div className="brand-info">
            <h1>Вступ Асистент</h1>
            <span>Військова підготовка</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Перемикач теми */}
          <button className="icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Світла тема' : 'Темна тема'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          {/* Налаштування */}
          <button className="icon-btn" onClick={() => setSettingsOpen(true)} title="Налаштування джерела">
            ⚙️
          </button>
        </div>
      </header>

      {/* PWA Інсталяційний банер */}
      {showInstallBanner && deferredPrompt && (
        <div className="install-banner">
          <div className="install-text">
            <h3>Встановити додаток на телефон?</h3>
            <p>Працюйте зі списками абітурієнтів швидко та зручно безпосередньо з екрана смартфона.</p>
          </div>
          <button className="btn-install" onClick={handleInstallPWA}>
            Встановити
          </button>
        </div>
      )}

      {/* Головна статистика */}
      {!loading && <DashboardStats applicants={applicants} />}

      {/* Панель пошуку та фільтрації */}
      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedVos={selectedVos}
        setSelectedVos={setSelectedVos}
        selectedUni={selectedUni}
        setSelectedUni={setSelectedUni}
        sortBy={sortBy}
        setSortBy={setSortBy}
        applicants={applicants}
      />

      {/* Контент */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontSize: '18px', color: 'var(--text-secondary)' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'fadeIn 1s infinite linear', margin: '0 auto 16px auto' }}></div>
          Завантаження даних із Google Таблиць...
        </div>
      ) : (
        <main className="cards-grid">
          {filteredApplicants.length > 0 ? (
            filteredApplicants.map(applicant => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                onClick={() => setSelectedApplicant(applicant)}
              />
            ))
          ) : (
            <div className="no-results">
              🔍 Нікого не знайдено за вказаними критеріями пошуку або фільтрами.
            </div>
          )}
        </main>
      )}

      {/* Модальне вікно деталей */}
      {selectedApplicant && (
        <ApplicantModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
        />
      )}

      {/* Модальне вікно налаштувань */}
      {settingsOpen && (
        <SettingsModal
          currentUrl={sheetUrl}
          onSave={handleSaveSettings}
          onReset={handleResetSettings}
          onClose={() => setSettingsOpen(false)}
          connectionStatus={connectionStatus}
        />
      )}
    </div>
  );
}
