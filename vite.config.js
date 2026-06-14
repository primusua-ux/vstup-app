import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'

export default defineConfig(({ command }) => {
  return {
    // Для GitHub Pages потрібен шлях /vstup-app/ у продакшені, а локально /
    base: command === 'build' ? '/vstup-app/' : '/',
    plugins: [
      react(),
      {
        name: 'google-sheets-proxy',
        configureServer(server) {
          server.middlewares.use('/api-sheets', async (req, res) => {
            const targetUrl = 'https://docs.google.com/spreadsheets' + req.url;
            
            try {
              const response = await fetch(targetUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
              });
              
              const csvText = await response.text();
              
              res.writeHead(response.status || 200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(csvText);
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
              res.end('Помилка проксі: ' + err.message);
            }
          });
        }
      }
    ]
  }
})
