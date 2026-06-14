import React from 'react';

export default function DashboardStats({ applicants }) {
  // Розрахунок загальних показників
  const total = applicants.length;
  
  const applicantsWithGrade = applicants.filter(a => a.grade > 0);
  const avgGrade = applicantsWithGrade.length > 0
    ? (applicantsWithGrade.reduce((sum, a) => sum + a.grade, 0) / applicantsWithGrade.length).toFixed(1)
    : "0.0";

  // Розподіл за статтю
  const maleCount = applicants.filter(a => a.gender.toLowerCase().includes("чоловіча") || a.gender.toLowerCase() === "ч").length;
  const femaleCount = applicants.filter(a => a.gender.toLowerCase().includes("жіноча") || a.gender.toLowerCase() === "ж").length;

  // Розподіл за бажаною ВОС (спрощений для графіки)
  const vosCounts = applicants.reduce((acc, a) => {
    let vos = a.vosDesired;
    if (vos.toLowerCase().includes("бпак")) {
      acc.bpak = (acc.bpak || 0) + 1;
    } else if (vos.toLowerCase().includes("реб")) {
      acc.reb = (acc.reb || 0) + 1;
    } else if (vos.toLowerCase().includes("срз")) {
      acc.srz = (acc.srz || 0) + 1;
    } else {
      acc.other = (acc.other || 0) + 1;
    }
    return acc;
  }, { bpak: 0, reb: 0, srz: 0, other: 0 });

  return (
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-title">Всього абітурієнтів</div>
        <div className="stat-value">{total}</div>
        <div className="stat-desc">Подано анкет через форму</div>
      </div>
      
      <div className="stat-card green">
        <div className="stat-title">Середній бал</div>
        <div className="stat-value">{avgGrade}</div>
        <div className="stat-desc">За 100-бальною шкалою</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-title">Спеціальності (ВОС)</div>
        <div className="stat-value" style={{ fontSize: '20px', margin: '4px 0' }}>
          🚁 БпАК: {vosCounts.bpak} | 📡 РЕБ: {vosCounts.reb} | 📻 СРЗ: {vosCounts.srz}
        </div>
        <div className="stat-desc">Попит на напрямки підготовки</div>
      </div>

      <div className="stat-card">
        <div className="stat-title">Гендерний склад</div>
        <div className="stat-value" style={{ fontSize: '24px' }}>
          👨 {maleCount} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/</span> 👩 {femaleCount}
        </div>
        <div className="stat-desc">Чоловіки / Жінки</div>
      </div>
    </div>
  );
}
