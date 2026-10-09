import React from 'react';
import { DEMO_AVATARS } from '../../constants';

export function Avatar({ seed = '', name = '', size = 24, className = 'card-assignee-avatar' }) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const avatarUrl = DEMO_AVATARS[Math.abs(hash) % DEMO_AVATARS.length];

  return (
    <img
      src={avatarUrl}
      alt={name || 'User avatar'}
      title={name || 'Assignee'}
      className={className}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
}
