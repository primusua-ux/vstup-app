import React from 'react';

export default function FilterBar({
  searchTerm,
  setSearchTerm,
  selectedVos,
  setSelectedVos,
  selectedUni,
  setSelectedUni,
  sortBy,
  setSortBy,
  applicants
}) {
  // Збір унікальних університетів для випадаючого списку
  const universities = Array.from(
    new Set(applicants.map(a => a.university).filter(u => u && u !== "Не вказано"))
  ).sort();

  return (
    <div className="filter-bar">
      <div className="search-wrapper">
        <svg
          className="search-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Пошук за ПІБ або навчальним закладом..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filters-row">
        <div className="filter-group">
          <label className="filter-label">Спеціальність (ВОС)</label>
          <select
            className="select-input"
            value={selectedVos}
            onChange={(e) => setSelectedVos(e.target.value)}
          >
            <option value="all">Всі ВОС</option>
            <option value="bpak">🚁 БпАК</option>
            <option value="reb">📡 РЕБ</option>
            <option value="srz">📻 СРЗ</option>
            <option value="other">❓ Інше / Не визначився</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Заклад вищої освіти (ЗВО)</label>
          <select
            className="select-input"
            value={selectedUni}
            onChange={(e) => setSelectedUni(e.target.value)}
          >
            <option value="all">Усі ЗВО</option>
            {universities.map((uni, idx) => (
              <option key={idx} value={uni}>
                {uni}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Сортування</label>
          <select
            className="select-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="grade-desc">🏆 За балом (від більшого)</option>
            <option value="grade-asc">📈 За балом (від меншого)</option>
            <option value="name">🔤 За алфавітом (А-Я)</option>
            <option value="date">📅 За датою подачі</option>
          </select>
        </div>
      </div>
    </div>
  );
}
