'use client';

import { useState, useRef } from 'react';

export function MiniScrollC() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, clientHeight } = scrollRef.current;
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <div style={{ position: 'relative', width: '320px', height: '480px' }}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="hide-scrollbar"
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid var(--color-text)',
          overflowY: 'scroll',
          display: 'flex',
          flexDirection: 'column',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth'
        }}
      >
        {[1, 2, 3].map((num, idx) => (
          <div key={idx} style={{
            flex: '0 0 100%',
            height: '100%',
            scrollSnapAlign: 'start',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: idx < 2 ? '1px dashed var(--color-text)' : 'none'
          }}>
            <h2 className="font-ibm">[ EKRAN 0{num} ]</h2>
          </div>
        ))}
      </div>

      {/* Nested square indicators */}
      <div style={{
        position: 'absolute',
        right: 'var(--space-2)',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)'
      }}>
        {[0, 1, 2].map(idx => (
          <button
            key={idx}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  top: idx * scrollRef.current.clientHeight,
                  behavior: 'smooth'
                });
              }
            }}
            style={{
              width: '18px',
              height: '18px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label={`Przejdź do ekranu ${idx + 1}`}
          >
            {/* Outer frame - scales up from behind the inner square */}
            <div style={{
              position: 'absolute',
              inset: 0,
              border: '2px solid var(--color-text)',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: activeIndex === idx ? 'scale(1)' : 'scale(0.55)'
            }} />
            {/* Inner filled square - always visible */}
            <div style={{
              width: '10px',
              height: '10px',
              background: 'var(--color-text)',
              position: 'relative'
            }} />
          </button>
        ))}
      </div>
    </div>
  );
}
