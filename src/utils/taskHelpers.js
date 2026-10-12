/**
 * Helper utilities for parsing, normalizing, and formatting multi-value
 * fields such as platform and assignee.
 */

/**
 * Splits a string, array, or comma/slash/ampersand separated value into a clean array of strings.
 * E.g. "AYO Toko SFP, KASIR, Qoncierge, P" -> ["AYO Toko SFP", "KASIR", "Qoncierge", "P"]
 * E.g. "Junaidi/Gerry/Kelvin/Felicia" -> ["Junaidi", "Gerry", "Kelvin", "Felicia"]
 * E.g. "Indah & Dody" -> ["Indah", "Dody"]
 */
export function splitMultiValue(val) {
  if (!val) return [];
  
  if (Array.isArray(val)) {
    return val
      .map(item => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') return (item.name || item.id || '').trim();
        return String(item).trim();
      })
      .filter(Boolean);
  }

  if (typeof val === 'string') {
    // Split on commas, forward slashes, ampersands, or newlines
    // Preserves single values without delimiters
    return val
      .split(/[,/&\n\r]+/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [String(val).trim()].filter(Boolean);
}

/**
 * Formats an array of values into a clean comma-separated string for DB / API storage.
 */
export function joinMultiValue(val, separator = ', ') {
  const arr = splitMultiValue(val);
  return arr.join(separator);
}

/**
 * Extracts all unique platforms from a list of tasks.
 */
export function extractUniquePlatforms(tasks = [], defaultPlatforms = []) {
  const set = new Set();
  defaultPlatforms.forEach(p => p && set.add(p.trim()));
  
  tasks.forEach(t => {
    const list = splitMultiValue(t.platforms || t.platform);
    list.forEach(p => p && set.add(p));
  });

  return Array.from(set).filter(Boolean);
}

/**
 * Extracts all unique assignees from tasks and registered users.
 */
export function extractUniqueAssignees(tasks = [], users = []) {
  const map = new Map();

  // First seed from registered users
  users.forEach(u => {
    if (u && u.name) {
      map.set(u.name.toLowerCase(), {
        id: u.id || u.name,
        name: u.name,
        email: u.email || '',
        avatar: u.avatar || null,
        role: u.role || null
      });
    }
  });

  // Then add assignees found in tasks
  tasks.forEach(t => {
    const list = splitMultiValue(t.assignees || t.assignee);
    list.forEach(name => {
      const key = name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: name,
          name: name,
          email: '',
          avatar: null,
          role: null
        });
      }
    });
  });

  return Array.from(map.values());
}
