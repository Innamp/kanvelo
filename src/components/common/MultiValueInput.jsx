import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ROLE_LABELS } from '../../constants';
import { splitMultiValue } from '../../utils/taskHelpers';

export function MultiValueInput({
  id,
  name,
  values = [],
  onChange,
  placeholder = 'Type and press Enter to add...',
  disabled = false,
  required = false,
  suggestions = [],
  quickPills = [],
  type = 'platform' // 'platform' | 'assignee'
}) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Normalize incoming values to an array of trimmed strings
  const currentValues = useMemo(() => {
    return splitMultiValue(values);
  }, [values]);

  // Normalize suggestions into array of objects { key, name, meta, avatar, role }
  const normalizedSuggestions = useMemo(() => {
    return suggestions.map((item, idx) => {
      if (typeof item === 'string') {
        return {
          key: `${item}-${idx}`,
          name: item.trim(),
          meta: '',
          avatar: null,
          role: null
        };
      }
      return {
        key: item.id || item.email || `${item.name}-${idx}`,
        name: (item.name || '').trim(),
        meta: item.email || '',
        avatar: item.avatar || null,
        role: item.role || null
      };
    }).filter(s => Boolean(s.name));
  }, [suggestions]);

  // Map to quickly look up avatar/role for selected assignee names
  const suggestionMap = useMemo(() => {
    const map = new Map();
    normalizedSuggestions.forEach(s => {
      map.set(s.name.toLowerCase(), s);
    });
    return map;
  }, [normalizedSuggestions]);

  // Filter dropdown suggestions based on input query AND exclude already selected items
  const filteredSuggestions = useMemo(() => {
    const query = inputValue.toLowerCase().trim();
    const selectedSet = new Set(currentValues.map(v => v.toLowerCase()));

    const available = normalizedSuggestions.filter(item => !selectedSet.has(item.name.toLowerCase()));

    if (!query) {
      return available.slice(0, 10);
    }

    return available
      .filter(item => item.name.toLowerCase().includes(query))
      .slice(0, 12);
  }, [normalizedSuggestions, currentValues, inputValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add one or multiple values (handles comma/slash separated strings too)
  const addValue = (textToAdd) => {
    if (disabled || !textToAdd) return;
    const items = splitMultiValue(textToAdd);
    if (items.length === 0) return;

    const existingLower = new Set(currentValues.map(v => v.toLowerCase()));
    const newItems = items.filter(item => !existingLower.has(item.toLowerCase()));

    if (newItems.length > 0 && onChange) {
      onChange([...currentValues, ...newItems]);
    }

    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Remove a specific value by index or name
  const removeValue = (indexToRemove) => {
    if (disabled || !onChange) return;
    const updated = currentValues.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  // Toggle a suggestion pill
  const togglePill = (pillName) => {
    if (disabled) return;
    const trimmed = pillName.trim();
    const exists = currentValues.some(v => v.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      const updated = currentValues.filter(v => v.toLowerCase() !== trimmed.toLowerCase());
      onChange && onChange(updated);
    } else {
      addValue(trimmed);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        addValue(filteredSuggestions[highlightedIndex].name);
      } else if (inputValue.trim()) {
        addValue(inputValue);
      }
    } else if (e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addValue(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && currentValues.length > 0) {
      // Remove last tag if backspacing in empty input
      removeValue(currentValues.length - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(filteredSuggestions.length - 1);
      } else {
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="multi-value-wrapper" ref={containerRef}>
      {/* 1. Chips container showing individual selected items */}
      <div className={`multi-value-box ${disabled ? 'disabled' : ''}`}>
        <div className="multi-chips-list">
          {currentValues.map((val, idx) => {
            const metaObj = suggestionMap.get(val.toLowerCase());
            return (
              <span key={`${val}-${idx}`} className={`multi-value-chip chip-${type}`}>
                <div className="chip-left-meta">
                  {type === 'platform' ? (
                    <span className="chip-icon platform-icon-badge">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </span>
                  ) : (
                    <span className="chip-avatar">
                      {metaObj?.avatar ? (
                        <img src={metaObj.avatar} alt={val} className="chip-avatar-img" />
                      ) : (
                        <span className="chip-avatar-initials">
                          {val ? val.substring(0, 2).toUpperCase() : 'U'}
                        </span>
                      )}
                    </span>
                  )}
                  
                  <span className="chip-text">{val}</span>
                </div>

                {!disabled && (
                  <button
                    type="button"
                    className="chip-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeValue(idx);
                    }}
                    title={`Remove ${val}`}
                    aria-label={`Remove ${val}`}
                  >
                    ✕
                  </button>
                )}
              </span>
            );
          })}

          {currentValues.length === 0 && (
            <span className="multi-empty-placeholder">
              {type === 'platform' ? 'No platforms added yet' : 'No assignees added yet'}
            </span>
          )}
        </div>

        {/* 2. Input line with Add button */}
        {!disabled && (
          <div className="multi-input-line">
            <input
              ref={inputRef}
              id={id}
              name={name}
              type="text"
              className="multi-text-field"
              placeholder={currentValues.length === 0 ? placeholder : 'Add another...'}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <button
              type="button"
              className="multi-add-btn"
              onClick={() => {
                if (inputValue.trim()) {
                  addValue(inputValue);
                } else {
                  setIsOpen(prev => !prev);
                }
              }}
              title="Add item"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Dropdown autocomplete list */}
      {isOpen && !disabled && filteredSuggestions.length > 0 && (
        <div className="autocomplete-dropdown multi-autocomplete-dropdown">
          <div className="autocomplete-dropdown-header">
            {type === 'assignee' ? 'Available Team Members' : 'Available Platforms'}
          </div>

          <div className="autocomplete-items-list">
            {filteredSuggestions.map((item, index) => {
              const isHighlighted = highlightedIndex === index;

              return (
                <button
                  type="button"
                  key={item.key}
                  className={`autocomplete-item ${isHighlighted ? 'highlighted' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addValue(item.name);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {type === 'assignee' ? (
                    <>
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.name} className="autocomplete-user-avatar" />
                      ) : (
                        <div className="autocomplete-user-initials">
                          {item.name ? item.name.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="autocomplete-item-details">
                        <span className="autocomplete-item-name">{item.name}</span>
                        {item.role && (
                          <span className={`role-pill-badge role-${item.role}`}>
                            {ROLE_LABELS[item.role] || item.role}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="autocomplete-platform-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      </div>
                      <span className="autocomplete-item-name">{item.name}</span>
                    </>
                  )}
                  <span className="autocomplete-item-add-tag">+ Add</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Quick suggestions pills */}
      {quickPills && quickPills.length > 0 && !disabled && (
        <div className="suggestion-pills-wrap">
          <span className="suggestion-pills-label">Suggestions:</span>
          <div className="suggestion-pills-list">
            {quickPills.map((pill) => {
              const isSelected = currentValues.some(v => v.toLowerCase() === pill.trim().toLowerCase());
              return (
                <button
                  key={pill}
                  type="button"
                  className={`suggestion-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => togglePill(pill)}
                  title={isSelected ? `Remove ${pill}` : `Add ${pill}`}
                >
                  {isSelected && <span className="pill-check-mark">✓ </span>}
                  {pill}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
