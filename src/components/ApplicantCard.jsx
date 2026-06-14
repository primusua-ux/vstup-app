import React from 'react';

export default function ApplicantCard({ applicant, onClick }) {
  const {
    fullName,
    lastName,
    firstName,
    university,
    vosDesired,
    grade,
    gradeRaw,
    militaryService,
    photoUrl
  } = applicant;

  // Отримання ініціалів для аватара-заглушки
  const initials = `${lastName?.[0] || ''}${firstName?.[0] || ''}`.toUpperCase() || '?';

  // Скорочена назва ВОС для тегу
  const getShortVos = (vos) => {
    const v = vos.toLowerCase();
    if (v.includes("бпак")) return "🚁 БпАК";
    if (v.includes("реб")) return "📡 РЕБ";
    if (v.includes("срз")) return "📻 СРЗ";
    if (v.includes("не визначився") || v.includes("консультації")) return "❓ Не визн.";
    return vos.length > 15 ? `${vos.slice(0, 15)}...` : vos;
  };

  // Визначення кольорового стилю для балу
  const getGradeColor = (g) => {
    if (g >= 90) return 'var(--accent-green)';
    if (g >= 75) return 'var(--accent-yellow)';
    if (g > 0) return 'var(--text-muted)';
    return 'var(--text-muted)';
  };

  const hasServed = militaryService.toLowerCase() === "так";

  return (
    <div className="applicant-card" onClick={onClick}>
      <div className="card-top">
        <div className="avatar-wrapper">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={fullName}
              className="avatar-img"
              loading="lazy"
              onError={(e) => {
                // Якщо посилання на фото пошкоджене або недоступне, показати заглушку
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = `<span class="avatar-placeholder">${initials}</span>`;
              }}
            />
          ) : (
            <span className="avatar-placeholder">{initials}</span>
          )}
        </div>

        <div className="card-title-info">
          <div className="card-name" title={fullName}>{fullName}</div>
          <div className="card-uni" title={university}>{university}</div>
        </div>
      </div>

      <div className="tag-list">
        <span className="tag tag-vos">{getShortVos(vosDesired)}</span>
        {hasServed && <span className="tag tag-service">🎖️ Служба</span>}
      </div>

      <div className="card-details">
        <div className="score-section">
          <span className="score-label">Середній бал</span>
          <span className="score-value" style={{ color: getGradeColor(grade) }}>
            {grade > 0 ? grade : '—'}
            {grade > 0 && <span className="score-max">/100</span>}
          </span>
        </div>
        
        <div className="card-meta">
          <div>{applicant.gender}</div>
          <div style={{ fontSize: '9px', marginTop: '2px', opacity: 0.6 }}>
            {applicant.timestamp?.split(' ')?.[0] || ''}
          </div>
        </div>
      </div>
    </div>
  );
}
