/**
 * Функція для парсингу сирого CSV тексту, який враховує коми, лапки та нові рядки всередині лапок.
 */
export function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++; // Пропустити подвійну лапку
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push("");
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row.map(cell => cell.trim()));
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  
  if (row.length > 1 || row[0] !== "") {
    lines.push(row.map(cell => cell.trim()));
  }
  
  return lines;
}

/**
 * Очищує та конвертує рядок балу у число
 */
export function cleanGrade(val) {
  if (!val) return null;
  // Заміна коми на крапку та пошук першого числа (цілого або десяткового)
  const cleaned = val.replace(',', '.');
  const match = cleaned.match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

/**
 * Конвертує посилання на Google Drive у пряме посилання на зображення
 */
export function getGoogleDriveDirectLink(url) {
  if (!url) return "";
  const regId = /id=([a-zA-Z0-9_-]+)/;
  const regPath = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regId) || url.match(regPath);
  
  if (match && match[1]) {
    // lh3.googleusercontent.com/d/ID - пряме посилання для відображення
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return url;
}

/**
 * Відображає заголовки таблиці на стандартні ключі об'єкта абітурієнта
 */
export function mapCSVToApplicants(csvRows) {
  if (csvRows.length < 2) return [];
  
  const headers = csvRows[0];
  const dataRows = csvRows.slice(1);
  
  // Індекси стовпчиків за замовчуванням
  const mapping = {
    timestamp: -1,
    lastName: -1,
    firstName: -1,
    middleName: -1,
    gender: -1,
    phone: -1,
    birthDate: -1,
    university: -1,
    tccOption: -1,
    tccName: -1,
    vosDesired: -1,
    vosAlternative: -1,
    gradeRaw: -1,
    militaryService: -1,
    photoUrl: -1
  };
  
  // Шукаємо відповідності за ключовими словами в заголовках
  headers.forEach((header, index) => {
    const h = header.toLowerCase();
    
    if (h.includes("позначка") || h.includes("время") || h.includes("timestamp")) {
      mapping.timestamp = index;
    } else if (h.includes("прізвище") || h.includes("фамилия")) {
      mapping.lastName = index;
    } else if (h.includes("ім'я") || h.includes("ім`я") || h.includes("имя") || (h.startsWith("ім") && !h.includes("по батькові"))) {
      mapping.firstName = index;
    } else if (h.includes("по батькові") || h.includes("отчество")) {
      mapping.middleName = index;
    } else if (h.includes("стать") || h.includes("пол")) {
      mapping.gender = index;
    } else if (h.includes("телефон") || h.includes("мобільного")) {
      mapping.phone = index;
    } else if (h.includes("народження") || h.includes("рождения") || h.includes("дата")) {
      mapping.birthDate = index;
    } else if (h.includes("заклад вищої") || h.includes("зво") || h.includes("вуз") || h.includes("навчаєтесь")) {
      mapping.university = index;
    } else if (h.includes("у якому тцк та сп") || h.includes("обліку?")) {
      mapping.tccOption = index;
    } else if (h.includes("вкажіть повну назву тцк") || h.includes("назва тцк")) {
      mapping.tccName = index;
    } else if (h.includes("бажана військово-облікова") || (h.includes("вос") && !h.includes("альтернативна"))) {
      mapping.vosDesired = index;
    } else if (h.includes("альтернативна бажана") || h.includes("альтернативна вос")) {
      mapping.vosAlternative = index;
    } else if (h.includes("середній бал") || h.includes("бал навчання") || h.includes("шкалою") || h.includes("бал")) {
      mapping.gradeRaw = index;
    } else if (h.includes("військову службу") || h.includes("службу?")) {
      mapping.militaryService = index;
    } else if (h.includes("фото") || h.includes("селфі") || h.includes("селфи")) {
      mapping.photoUrl = index;
    }
  });

  // Обробка кожного рядка даних
  return dataRows
    .filter(row => row.length > 0 && row.some(cell => cell !== "")) // Ігноруємо пусті рядки
    .map((row, idx) => {
      const getVal = (index) => (index !== -1 && index < row.length) ? row[index] : "";
      
      const lastName = getVal(mapping.lastName);
      const firstName = getVal(mapping.firstName);
      const middleName = getVal(mapping.middleName);
      
      // Збираємо ПІБ
      const fullName = [lastName, firstName, middleName]
        .filter(n => n.trim() !== "")
        .join(" ");

      const rawGrade = getVal(mapping.gradeRaw);
      const cleanG = cleanGrade(rawGrade);

      // Визначаємо назву ТЦК (об'єднуємо опцію та вписане поле)
      const tccOpt = getVal(mapping.tccOption);
      const tccSpec = getVal(mapping.tccName);
      let tcc = tccSpec || tccOpt || "Не вказано";
      if (tcc.toLowerCase().includes("надам назву")) {
        tcc = tccSpec || "Житомирський ТЦК та СП";
      }

      return {
        id: `applicant-${idx}-${Date.now()}`,
        fullName: fullName || `Абітурієнт #${idx + 1}`,
        lastName: lastName,
        firstName: firstName,
        middleName: middleName,
        gender: getVal(mapping.gender) || "Не вказано",
        phone: getVal(mapping.phone) || "Не вказано",
        birthDate: getVal(mapping.birthDate) || "Не вказано",
        university: getVal(mapping.university) || "Не вказано",
        tcc: tcc,
        vosDesired: getVal(mapping.vosDesired) || "Не визначено",
        vosAlternative: getVal(mapping.vosAlternative) || "Не визначено",
        gradeRaw: rawGrade || "0",
        grade: cleanG !== null ? cleanG : 0,
        militaryService: getVal(mapping.militaryService) || "Ні",
        photoUrl: getGoogleDriveDirectLink(getVal(mapping.photoUrl)),
        rawPhotoUrl: getVal(mapping.photoUrl),
        timestamp: getVal(mapping.timestamp)
      };
    });
}

/**
 * Перетворює звичайне посилання спільного доступу Google Sheets на пряме посилання для завантаження CSV
 */
export function convertSheetsUrlToCsv(url) {
  if (!url) return "";
  
  // Якщо це посилання типу "Опублікувати в інтернеті" (Publish to the web)
  if (url.includes('/pub')) {
    if (url.includes('output=csv')) {
      return url;
    }
    // Замінюємо формат на CSV
    const baseUrl = url.split('?')[0];
    const regGid = /gid=([0-9]+)/;
    const gidMatch = url.match(regGid);
    const gid = gidMatch ? gidMatch[1] : null;
    
    // Перетворюємо /pubhtml на /pub
    const cleanBaseUrl = baseUrl.endsWith('/pubhtml') 
      ? baseUrl.slice(0, -4) 
      : baseUrl.endsWith('/pub') ? baseUrl : `${baseUrl}/pub`;
      
    return `${cleanBaseUrl}?output=csv${gid ? `&gid=${gid}` : ''}`;
  }
  
  // Звичайне посилання спільного доступу
  const regId = /\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regId);
  if (match && match[1]) {
    const sheetId = match[1];
    const regGid = /gid=([0-9]+)/;
    const gidMatch = url.match(regGid);
    const gid = gidMatch ? gidMatch[1] : null;
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid ? `&gid=${gid}` : ''}`;
  }
  return url;
}
