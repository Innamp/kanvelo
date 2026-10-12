import React, { useRef } from 'react';

/**
 * Normalizes any date value (ISO string, datetime string, etc.) into YYYY-MM-DD
 * required by HTML5 input type="date".
 */
export function normalizeDateValue(val) {
  if (!val) return '';
  const str = String(val).trim();
  // If starts with YYYY-MM-DD
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  // Try Date parsing
  const timestamp = Date.parse(str);
  if (!isNaN(timestamp)) {
    const d = new Date(timestamp);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return '';
}

/**
 * Aesthetic DatePicker component supporting native calendar picker popover,
 * manual keyboard input, quick clear, and clean Kanvelo styling.
 */
export function DatePicker({
  id,
  name,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select date...',
  className = '',
  required = false
}) {
  const inputRef = useRef(null);
  const formattedVal = normalizeDateValue(value);

  const handleWrapperClick = () => {
    if (disabled || !inputRef.current) return;
    try {
      // Open native calendar picker if supported
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
      }
    } catch (err) {
      inputRef.current.focus();
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    onChange({
      target: {
        name,
        value: ''
      }
    });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleNativeChange = (e) => {
    onChange({
      target: {
        name,
        value: e.target.value
      }
    });
  };

  return (
    <div
      className={`datepicker-wrapper ${disabled ? 'disabled' : ''} ${className}`}
      onClick={handleWrapperClick}
    >
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="date"
        className="datepicker-native-input"
        value={formattedVal}
        onChange={handleNativeChange}
        disabled={disabled}
        required={required}
        aria-label={name}
      />

      <div className="datepicker-controls">
        {formattedVal && !disabled && (
          <button
            type="button"
            className="datepicker-clear-btn"
            onClick={handleClear}
            title="Clear date"
            aria-label="Clear date"
          >
            ✕
          </button>
        )}
        <span
          className="datepicker-calendar-icon"
          title="Open calendar picker"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>
      </div>
    </div>
  );
}
