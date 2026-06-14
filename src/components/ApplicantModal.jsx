import React from 'react';

export default function ApplicantModal({ applicant, onClose }) {
  if (!applicant) return null;

  const {
    fullName,
    lastName,
    firstName,
    gender,
    phone,
    birthDate,
    university,
    tcc,
    vosDesired,
    vosAlternative,
    grade,
    gradeRaw,
    militaryService,
    photoUrl,
    rawPhotoUrl,
    timestamp
  } = applicant;

  const initials = `${lastName?.[0] || ''}${firstName?.[0] || ''}`.toUpperCase() || '?';

  // Очищення номера телефону для посилання tel:
  const cleanPhone = phone.replace(/[^+\d]/g, '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-gradient">
          <button className="modal-close-btn" onClick={onClose} title="Закрити">
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

        <div className="modal-body">
          <div className="modal-profile">
            <div className="modal-avatar">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName}
                  className="avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `<span class="avatar-placeholder" style="font-size:32px;">${initials}</span>`;
                  }}
                />
              ) : (
                <span className="avatar-placeholder" style={{ fontSize: '32px' }}>{initials}</span>
              )}
            </div>
            
            <div className="modal-name-block">
              <div className="modal-name">{fullName}</div>
              <div className="modal-gender">Стать: {gender}</div>
            </div>
          </div>

          <div className="modal-info-grid">
            <div className="info-item">
              <span className="info-label">📞 Телефон</span>
              <a href={`tel:${cleanPhone}`} className="info-value accent" style={{ textDecoration: 'none', display: 'block' }}>
                {phone}
              </a>
            </div>

            <div className="info-item">
              <span className="info-label">📅 Дата народження</span>
              <span className="info-value">{birthDate}</span>
            </div>

            <div className="info-item full-width">
              <span className="info-label">🏫 Заклад вищої освіти</span>
              <span className="info-value">{university}</span>
            </div>

            <div className="info-item full-width">
              <span className="info-label">🪖 Облік у ТЦК та СП</span>
              <span className="info-value">{tcc}</span>
            </div>

            <div className="info-item full-width">
              <span className="info-label">🛸 Бажана ВОС (Основна)</span>
              <span className="info-value accent">{vosDesired}</span>
            </div>

            <div className="info-item full-width">
              <span className="info-label">🛰️ Альтернативна ВОС</span>
              <span className="info-value">{vosAlternative}</span>
            </div>

            <div className="info-item">
              <span className="info-label">📝 Середній бал</span>
              <span className="info-value green">
                {gradeRaw} {grade > 0 && gradeRaw !== String(grade) ? `(число: ${grade})` : ''}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">🎖️ Військова служба</span>
              <span className="info-value">{militaryService}</span>
            </div>

            <div className="info-item full-width" style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                {rawPhotoUrl && (
                  <a
                    href={rawPhotoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ textDecoration: 'none', flex: '1', textAlign: 'center', fontSize: '13px', padding: '10px' }}
                  >
                    📂 Фото на Google Drive
                  </a>
                )}
                <button
                  className="btn-primary"
                  onClick={onClose}
                  style={{ flex: '1', fontSize: '13px', padding: '10px' }}
                >
                  Зрозуміло
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '8px 24px', borderTop: '1px solid var(--border)', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>
          Додано: {timestamp}
        </div>
      </div>
    </div>
  );
}
