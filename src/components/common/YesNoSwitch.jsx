import React from 'react';

/**
 * Modern Segmented Switch / Radio Pill Component for Yes/No fields.
 * Supports clicking to toggle Yes/No, clearing selection, and custom values.
 */
export function YesNoSwitch({
  id,
  name,
  value = '',
  onChange,
  disabled = false,
  className = ''
}) {
  const strVal = String(value || '').trim();
  const lowerVal = strVal.toLowerCase();

  const isYes = lowerVal === 'yes' || lowerVal === 'true';
  const isNo = lowerVal === 'no' || lowerVal === 'false';
  const isCustom = Boolean(strVal) && !isYes && !isNo;

  const handleSelect = (choice) => {
    if (disabled) return;
    // Clicking the already active choice unselects it (sets to empty)
    const nextVal = (choice === 'Yes' && isYes) || (choice === 'No' && isNo) ? '' : choice;
    onChange({
      target: {
        name,
        value: nextVal
      }
    });
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
  };

  return (
    <div
      className={`yes-no-switch-wrapper ${disabled ? 'disabled' : ''} ${className}`}
      role="radiogroup"
      aria-label={name}
    >
      <div className="yes-no-pill-group">
        <button
          type="button"
          id={id ? `${id}-yes` : undefined}
          className={`yes-no-pill-btn btn-yes ${isYes ? 'active' : ''}`}
          onClick={() => handleSelect('Yes')}
          disabled={disabled}
          role="radio"
          aria-checked={isYes}
          title="Select Yes"
        >
          <span className={`yes-no-dot ${isYes ? 'dot-active-yes' : ''}`} />
          Yes
        </button>

        <button
          type="button"
          id={id ? `${id}-no` : undefined}
          className={`yes-no-pill-btn btn-no ${isNo ? 'active' : ''}`}
          onClick={() => handleSelect('No')}
          disabled={disabled}
          role="radio"
          aria-checked={isNo}
          title="Select No"
        >
          <span className={`yes-no-dot ${isNo ? 'dot-active-no' : ''}`} />
          No
        </button>

        {isCustom && (
          <span className="yes-no-custom-badge" title={`Custom: ${strVal}`}>
            {strVal}
          </span>
        )}

        {strVal && !disabled && (
          <button
            type="button"
            className="yes-no-clear-icon"
            onClick={handleClear}
            title="Clear selection"
            aria-label="Clear selection"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
