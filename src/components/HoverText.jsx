import React from 'react';

const STAGGER_MS = 20; // 逐字延迟间隔

export default function HoverText({ text, as: Tag = 'span', style, className = '', offset = 0, onHoverText }) {
  // onHoverText: 可选, 如果提供则在 hover 时显示不同文字(逐字配对)
  const chars = [...text];
  const altChars = onHoverText ? [...onHoverText] : null;

  return (
    <Tag
      className={`ht-container ${className}`}
      style={{ display: 'inline-flex', flexWrap: 'wrap', pointerEvents: 'auto', ...style }}
    >
      {chars.map((ch, i) => {
        const alt = altChars ? (altChars[i] || ch) : ch;
        if (ch === ' ') {
          return (
            <span key={i} className="ht-item" style={{ width: '0.35em' }} aria-hidden="true">
              <span className="ht-pri">&nbsp;</span>
              <span className="ht-sec">&nbsp;</span>
            </span>
          );
        }
        return (
          <span
            key={i}
            className="ht-item"
            style={{ '--i': i + offset }}
          >
            <span className="ht-pri">{ch}</span>
            <span className="ht-sec" aria-hidden="true">{alt}</span>
          </span>
        );
      })}
    </Tag>
  );
}

