/**
 * ── BRAES CREEK THEME COLORS ────────────────────────────────────────────────
 * Use these CSS variable references anywhere you need dynamic colors in JS.
 * They automatically switch between dark and light mode via [data-theme] attr.
 *
 * Usage:
 *   import { TC } from '@/lib/theme-colors'
 *   style={{ color: TC.textPrimary, background: TC.bgCard }}
 */

export const TC = {
  // Backgrounds
  bgBase:        'var(--bg-base)',
  bgPage:        'var(--bg-page)',
  bgBody:        'var(--bg-body)',
  bgSurface:     'var(--bg-surface)',
  bgCard:        'var(--bg-card)',
  bgCardElevated:'var(--bg-card-elevated)',
  bgElevated:    'var(--bg-elevated)',
  bgSidebar:     'var(--bg-sidebar)',

  // Text
  textPrimary:   'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted:     'var(--text-muted)',
  textInverse:   'var(--text-inverse)',
  textLabel:     'var(--text-label)',

  // Borders
  borderSoft:    'var(--border-soft)',
  borderStrong:  'var(--border-strong)',

  // Status
  success:       'var(--status-success)',
  warning:       'var(--status-warning)',
  danger:        'var(--status-critical)',
  info:          'var(--status-info)',
  ai:            'var(--status-ai)',

  // Status glows
  successGlow:   'var(--status-success-glow)',
  warningGlow:   'var(--status-warning-glow)',
  dangerGlow:    'var(--status-critical-glow)',
  infoGlow:      'var(--status-info-glow)',
  aiGlow:        'var(--status-ai-glow)',

  // Inputs
  inputBg:       'var(--input-bg)',
  inputBorder:   'var(--input-border)',
  inputText:     'var(--input-text)',

  // Shadows
  shadowSoft:    'var(--shadow-soft)',
  shadowMedium:  'var(--shadow-medium)',
  shadowStrong:  'var(--shadow-strong)',
} as const;

/**
 * Replaces the legacy hardcoded COLORS constant pattern used across pages.
 * Drop-in replacement — same shape, theme-aware values.
 */
export const THEME_COLORS = {
  success: 'var(--status-success)',
  warning: 'var(--status-warning)',
  danger:  'var(--status-critical)',
  info:    'var(--status-info)',
  muted:   'var(--text-muted)',
  border:  'var(--border-soft)',
  accent:  'var(--status-success)',
  bg:      'var(--bg-body)',
  primary: 'var(--status-success)',
  text:    'var(--text-primary)',
} as const;
