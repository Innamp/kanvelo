import React from 'react';

export function PhilipMorrisLogo({ size = 26, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Coronet / Royal Crown */}
      <circle cx="17.5" cy="5" r="1.1" />
      <circle cx="20.5" cy="3.5" r="1.1" />
      <circle cx="24" cy="2.5" r="1.3" />
      <circle cx="27.5" cy="3.5" r="1.1" />
      <circle cx="30.5" cy="5" r="1.1" />
      <path d="M16.5 8.5l1.5-2.5 2.5 2 3.5-4.5 3.5 4.5 2.5-2 1.5 2.5z" />
      <rect x="16" y="8.5" width="16" height="2" rx="0.5" />

      {/* Central Heraldic Shield */}
      <path
        d="M18.5 12h11c.2 5 .5 10 0 13-1 6-5.5 8.5-5.5 8.5s-4.5-2.5-5.5-8.5c-.5-3-.2-8 0-13z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Inner Shield border */}
      <path
        d="M20 13.5h8c0 4.2.3 8.2-.2 10.8-.8 4.2-3.8 6.2-3.8 6.2s-3-2-3.8-6.2c-.5-2.6-.2-6.6-.2-10.8z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="0.8"
      />

      {/* Central "PM" Monogram inside shield */}
      <path
        d="M21.2 16.5h2.2c1.1 0 1.9.5 1.9 1.5 0 .9-.8 1.4-1.9 1.4h-1v2.8h-1.2v-5.7zm1.2 1.9h.8c.4 0 .8-.1.8-.5s-.4-.5-.8-.5h-.8v1z"
      />
      <path
        d="M25.4 16.5h1.2l1.1 3.2 1.1-3.2h1.2v5.7h-1.1v-3.6l-1 2.8h-.5l-1-2.8v3.6h-1v-5.7z"
      />

      {/* Left Supporter: Rampant Lion */}
      <path d="M15.5 14c-.6-.8-1.5-1.2-2.3-.8-.8.3-1.1 1.2-.7 2-.5.1-1 .5-1.3 1-.4.8-.3 1.8.2 2.5l-.8.6c-.4.3-.5.9-.2 1.3.3.4.9.5 1.3.2l1.2-.8c.3.9.7 1.6 1.3 2.1l-1.3 2c-.3.4-.2 1 .2 1.3.4.3 1 .2 1.3-.2l1.3-1.8c.7.4 1.4.6 2.2.6v-1.6c-.6-.1-1.1-.3-1.5-.6l.7-1.3c.3-.5.2-1.2-.3-1.6-.4-.4-.6-.9-.6-1.5 0-.8.4-1.5 1-1.9v-2c-.5.3-1.2.3-1.8.2-.5-.1-.8-.5-1-.9.3-.2.5-.5.5-.9 0-.4-.4-.8-.9-.8z" />
      <path d="M12 23c-.7-1-1.1-2.2-.9-3.5.1-.6.5-1 1-1.1.2 0 .3.1.4.2-.2.4-.2.8-.1 1.2.2.8.7 1.5 1.2 2l-1.6 1.2z" />

      {/* Right Supporter: Rampant Horse */}
      <path d="M32.5 14c.6-.8 1.5-1.2 2.3-.8.8.3 1.1 1.2.7 2 .5.1 1 .5 1.3 1 .4.8.3 1.8-.2 2.5l.8.6c.4.3.5.9.2 1.3-.3.4-.9.5-1.3.2l-1.2-.8c-.3.9-.7 1.6-1.3 2.1l1.3 2c.3.4.2 1-.2 1.3-.4.3-1 .2-1.3-.2l-1.3-1.8c-.7.4-1.4.6-2.2.6v-1.6c.6-.1 1.1-.3 1.5-.6l-.7-1.3c-.3-.5-.2-1.2.3-1.6.4-.4.6-.9.6-1.5 0-.8-.4-1.5-1-1.9v-2c.5.3 1.2.3 1.8.2.5-.1.8-.5 1-.9-.3-.2-.5-.5-.5-.9 0-.4-.4-.8-.9-.8z" />
      <path d="M36 23c.7-1 1.1-2.2-.9-3.5-.1-.6-.5-1-1-1.1-.2 0-.3.1-.4.2.2.4.2.8.1 1.2-.2.8-.7 1.5-1.2 2l1.6 1.2z" />

      {/* Bottom Heraldic Scroll / Ribbon */}
      <path d="M10.5 35c4 2 8.5 2.8 13.5 2.8s9.5-.8 13.5-2.8l1.5 3.2c-4.5 2.2-9.5 3-15 3s-10.5-.8-15-3l1.5-3.2z" />
      <path d="M10.5 35l-3.5-1.5v3.8l3.5 1-1.5-3.3zm27 0l3.5-1.5v3.8l-3.5 1 1.5-3.3z" />

      {/* Ribbon PMI Text */}
      <text
        x="24"
        y="38.2"
        fontSize="3.2"
        fontFamily="sans-serif"
        fontWeight="bold"
        textAnchor="middle"
        letterSpacing="0.8"
        fill="#111827"
      >
        PMI
      </text>
    </svg>
  );
}

export function StarIcon({ size = 26, ...props }) {
  return <PhilipMorrisLogo size={size} {...props} />;
}

export function HomeIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

export function BoardIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="3"/>
      <path d="M9 3v18"/>
      <path d="M15 3v18"/>
    </svg>
  );
}

export function CheckCircleIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

export function ListIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="8" x2="21" y1="6" y2="6"/>
      <line x1="8" x2="21" y1="12" y2="12"/>
      <line x1="8" x2="21" y1="18" y2="18"/>
      <line x1="3" x2="3.01" y1="6" y2="6"/>
      <line x1="3" x2="3.01" y1="12" y2="12"/>
      <line x1="3" x2="3.01" y1="18" y2="18"/>
    </svg>
  );
}

export function UsersIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

export function CalendarIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
      <text x="8" y="17.5" fill="currentColor" fontSize="7.5" fontWeight="800" stroke="none">07</text>
    </svg>
  );
}

export function SearchIcon({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  );
}

export function BellIcon({ size = 18, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  );
}

export function SettingsIcon({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

export function HeadsetIcon({ size = 18, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
  );
}

export function LogoutIcon({ size = 18, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

export function PlusIcon({ size = 16, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

export function DocumentIcon({ size = 13, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

export function CommentIcon({ size = 13, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  );
}

// Keep AttachmentIcon alias for compatibility
export const AttachmentIcon = DocumentIcon;
