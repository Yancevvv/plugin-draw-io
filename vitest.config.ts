import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'utils': path.resolve(__dirname, './src/utils'),
    },
  },
  
  test: {
    // Эмуляция браузера (нужен для document, window, Blockly)
    environment: 'jsdom',
    
    // Глобальные API тестов (describe, it, expect без импорта)
    globals: true,
    
    // Файл с моками и глобальной настройкой
    setupFiles: ['./src/test/setup.ts'],
    
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/main.js',              // Точка входа плагина
      '**/mainChromePlugin.js',  // Chrome extension entry
      '**/*.config.ts',          // Конфиги
    ],
    server: {
      deps: {
        inline: [/\.js$/],
      },
    },
    // Подавление ложных ошибок от Blockly CSS
    onConsoleLog(log: string) {
      if (log.includes('Could not parse CSS') || log.includes('BKY_')) {
        return false; // Игнорировать
      }
      return true;
    },
    // Включаем coverage если нужно
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/main.js',
        'src/**/*.test.ts',
      ],
    },
  },
});