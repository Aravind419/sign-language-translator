import {Injectable, inject, signal, effect} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';

export type AppTheme = 'system' | 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private mediaMatcher = inject(MediaMatcher);
  private colorSchemeMedia: MediaQueryList;

  currentTheme = signal<AppTheme>('system');

  constructor() {
    this.colorSchemeMedia = this.mediaMatcher.matchMedia('(prefers-color-scheme: dark)');

    // Load saved preferences if available
    if ('localStorage' in globalThis) {
      const savedTheme = localStorage.getItem('app-theme') as AppTheme;
      if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
        this.currentTheme.set(savedTheme);
      }
    }

    // Effect to update localStorage and apply the class
    effect(() => {
      const theme = this.currentTheme();
      if ('localStorage' in globalThis) {
        localStorage.setItem('app-theme', theme);
      }
      this.applyTheme(theme);
    });

    // Listen for system changes when in system mode
    if (this.colorSchemeMedia && typeof this.colorSchemeMedia.addEventListener === 'function') {
      this.colorSchemeMedia.addEventListener('change', () => {
        if (this.currentTheme() === 'system') {
          this.applyTheme('system');
          // Let window know there's a theme change
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app-theme-changed'));
          }
        }
      });
    }
  }

  setTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
  }

  isDark(): boolean {
    const theme = this.currentTheme();
    if (theme === 'system') {
      return this.colorSchemeMedia.matches;
    }
    return theme === 'dark';
  }

  private applyTheme(theme: AppTheme) {
    if (!('document' in globalThis)) {
      return;
    }

    const prefersDark = this.colorSchemeMedia.matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

    // Toggle the .dark class on body
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    // Let window know there's a theme change for toolbar etc
    if ('window' in globalThis) {
      window.dispatchEvent(new CustomEvent('app-theme-changed'));
    }
  }
}
