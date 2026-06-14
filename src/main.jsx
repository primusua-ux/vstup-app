import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Реєстрація або автоматичне видалення Service Worker для PWA
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    // У продакшені — реєструємо для роботи офлайн
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('Service Worker зареєстровано:', reg.scope))
        .catch((err) => console.error('Помилка реєстрації SW:', err));
    });
  } else {
    // У режимі розробки — автоматично видаляємо старі воркери для запобігання кешуванню
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('⚙️ Старий Service Worker успішно видалено автоматично.');
            window.location.reload(); // Перезавантажуємо сторінку для очищення
          }
        });
      }
    });
  }
}
