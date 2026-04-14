import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'DecisionTreePlugin',
      fileName: () => 'plugin.js', 
      formats: ['umd'] 
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        sourcemap: true, // Для отладки
        name: 'DecisionTreePlugin',
        exports: 'default'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'esbuild' 
  },
  // Опции для оптимизации зависимостей
  optimizeDeps: {
    include: ['fast-xml-parser'],
    exclude: [] 
  }
});