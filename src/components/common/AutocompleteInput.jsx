import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ROLE_LABELS } from '../../constants';
import { Avatar } from './Avatar';

export function AutocompleteInput({
  id,
  name,
  value = '',
  onChange,
  placeholder = '',
  disabled = false,
  required = false,
  className = 'form-input-field',
  suggestions = [],
  quickPills = [],
  type = 'text' // 'platform' | 'assignee' | 'text'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Normalize suggestions into array of objects { name, meta, avatar, role, key }
  const normalizedSuggestions = useMemo(() => {
    return suggestions.map((item, idx) => {
      if (typeof item === 'string') {
        return {
          key: `${item}-${idx}`,
          name: item,
          meta: '',
          avatar: null,
          role: null
        };
      }
      return {
        key: item.id || item.email || `${item.name}-${idx}`,
        name: item.name || '',
        meta: item.email || '',
        avatar: item.avatar || null,
        role: item.role || null
      };
    });
  }, [suggestions]);

  // Filter based on input value
  const filteredSuggestions = useMemo(() => {
    const query = (value || '').toLowerCase().trim();
    if (!query) {
      return normalizedSuggestions.slice(0, 10);
    }
    return normalizedSuggestions
      .filter(item => item.name.toLowerCase().includes(query))
      .slice(0, 12);
  }, [normalizedSuggestions, value]);

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

  const handleSelect = (item) => {
    const selectedName = typeof item === 'string' ? item : item.name;
    if (onChange) {
      onChange({
        target: {
          name,
          value: selectedName
        }
      });
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
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
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const datalistId = `${id || name}-datalist`;

  return (
    <div className="autocomplete-container" ref={containerRef}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (!disabled) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        required={required}
        autoComplete="off"
        list={datalistId}
      />

      {/* Datalist native fallback */}
      <datalist id={datalistId}>
        {normalizedSuggestions.map((item) => (
          <option key={item.key} value={item.name} />
        ))}
      </datalist>

      {/* Floating suggestion dropdown */}
      {isOpen && !disabled && filteredSuggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          <div className="autocomplete-dropdown-header">
            {type === 'assignee' ? 'Suggested Team Members' : 'Suggested Platforms'}
          </div>

          <div className="autocomplete-items-list">
            {filteredSuggestions.map((item, index) => {
              const isSelected = (value || '').toLowerCase() === item.name.toLowerCase();
              const isHighlighted = highlightedIndex === index;

              return (
                <button
                  type="button"
                  key={item.key}
                  className={`autocomplete-item ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent input blur before click
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {type === 'assignee' ? (
                    <>
                      <Avatar name={item.name} size={24} />
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                          <line x1="8" y1="21" x2="16" y2="21"></line>
                          <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                      </div>
                      <span className="autocomplete-item-name">{item.name}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick suggestions pills below input */}
      {quickPills && quickPills.length > 0 && !disabled && (
        <div className="suggestion-pills-wrap">
          <span className="suggestion-pills-label">Suggestions:</span>
          <div className="suggestion-pills-list">
            {quickPills.map((pill) => {
              const isPillActive = (value || '').trim().toLowerCase() === pill.trim().toLowerCase();
              return (
                <button
                  key={pill}
                  type="button"
                  className={`suggestion-chip ${isPillActive ? 'active' : ''}`}
                  onClick={() => handleSelect(pill)}
                  title={`Select ${pill}`}
                >
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
