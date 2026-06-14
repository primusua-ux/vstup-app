import React, { useState } from 'react';

export default function SettingsModal({
  currentUrl,
  onSave,
  onReset,
  onClose,
  connectionStatus // 'connected' | 'error' | 'idle' | 'loading'
}) {
  const [url, setUrl] = useState(currentUrl || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(url.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header-gradient" style={{ height: '60px' }}>
          <button className="modal-close-btn" onClick={onClose} title="Закрити" style={{ top: '12px', right: '12px' }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 className="modal-name" style={{ fontSize: '22px' }}>⚙️ Налаштування джерела</h2>
            <p className="input-desc" style={{ fontSize: '13px' }}>
              Підключіть вашу Google Таблицю для синхронізації списку абітурієнтів у реальному часі.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="settings-form">
            <div className="settings-input-group">
              <label className="filter-label" style={{ color: 'var(--text-primary)' }}>Посилання на Google Таблицю</label>
              <input
                type="text"
                className="text-input"
                placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            {/* Статус підключення */}
            <div className="status-indicator">
              <span>Статус:</span>
              {connectionStatus === 'connected' && (
                <>
                  <span className="status-dot active"></span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Підключено успішно</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <span className="status-dot error"></span>
                  <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>Помилка завантаження</span>
                </>
              )}
              {connectionStatus === 'loading' && (
                <>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>З'єднання...</span>
                </>
              )}
              {connectionStatus === 'idle' && (
                <>
                  <span className="status-dot"></span>
                  <span>Демо-режим (вбудовані дані)</span>
                </>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '4px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>📋 Інструкція для синхронізації:</h4>
              <p className="input-desc" style={{ marginBottom: '6px', fontWeight: 500 }}>
                Для автономної роботи на смартфоні таблицю потрібно опублікувати:
              </p>
              <ol className="input-desc" style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>У лівому кутку таблиці натисніть <b>Файл</b> → <b>Поділитися</b> → <b>Опублікувати в інтернеті</b>.</li>
                <li>Оберіть формат: <b>Значення, розділені комами (.csv)</b>.</li>
                <li>Натисніть кнопку <b>Опублікувати</b>.</li>
                <li>Скопіюйте створене посилання (воно починається з <i>https://docs.google.com/spreadsheets/d/e/...</i>) та вставте сюди.</li>
              </ol>
            </div>

            <div className="button-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setUrl('');
                  onReset();
                }}
                style={{ flex: '1', fontSize: '13px' }}
              >
                Скинути (Демо)
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: '1.2', fontSize: '13px' }}
                disabled={connectionStatus === 'loading'}
              >
                {connectionStatus === 'loading' ? 'Завантаження...' : 'Зберегти'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
