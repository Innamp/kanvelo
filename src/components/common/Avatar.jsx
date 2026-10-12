import React from 'react';

export const AVATAR_PALETTES = [
  { bg: '#3b82f6', text: '#ffffff' }, // Royal Blue
  { bg: '#8b5cf6', text: '#ffffff' }, // Violet
  { bg: '#ec4899', text: '#ffffff' }, // Pink
  { bg: '#10b981', text: '#ffffff' }, // Emerald
  { bg: '#f59e0b', text: '#ffffff' }, // Amber
  { bg: '#06b6d4', text: '#ffffff' }, // Cyan
  { bg: '#6366f1', text: '#ffffff' }, // Indigo
  { bg: '#14b8a6', text: '#ffffff' }, // Teal
  { bg: '#f97316', text: '#ffffff' }, // Orange
  { bg: '#a855f7', text: '#ffffff' }, // Purple
  { bg: '#0284c7', text: '#ffffff' }, // Sky
  { bg: '#e11d48', text: '#ffffff' }, // Rose
];

export function getInitials(name = '') {
  if (!name || typeof name !== 'string') return '?';
  const clean = name.trim();
  if (!clean) return '?';
  const parts = clean.split(/[\s_.-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getAvatarColor(str = '') {
  const text = str || 'User';
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

export function Avatar({
  seed = '',
  name = '',
  size = 24,
  className = '',
  style = {},
  title
}) {
  const displayName = name || seed || '';
  const initials = getInitials(displayName);
  const palette = getAvatarColor(displayName || 'User');
  const isSingleChar = initials.length <= 1;
  const fontSize = Math.max(9, Math.round(isSingleChar ? size * 0.48 : size * 0.40));

  return (
    <div
      className={`avatar-badge-initials ${className}`.trim()}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        backgroundColor: palette.bg,
        color: palette.text,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: `${fontSize}px`,
        lineHeight: 1,
        letterSpacing: isSingleChar ? '0' : '-0.03em',
        userSelect: 'none',
        flexShrink: 0,
        boxSizing: 'border-box',
        ...style
      }}
      title={title || displayName || 'Assignee'}
      aria-label={displayName || 'User avatar'}
    >
      <span>{initials}</span>
    </div>
  );
}

export default Avatar;
