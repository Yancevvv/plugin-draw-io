import { vi } from 'vitest';

// Мок для глобальных объектов
(globalThis as any).window = globalThis.window || {} as any;

// Мок для draw.io API
(window as any).mxGraph = vi.fn();
(window as any).mxEvent = {
  CLICK: 'click',
  DOUBLE_CLICK: 'dblclick',
  addListener: vi.fn()
};

// Мок для localStorage
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn()
  },
  writable: true
});