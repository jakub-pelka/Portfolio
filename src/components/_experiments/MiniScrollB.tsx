'use client';

import { useState, useRef } from 'react';

export function MiniScrollB() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalScreens = 3;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) return;
    setScrollProgress(scrollTop / maxScroll);
  };

  const trackHeight = 120;
  const markerSize = 14;
  const markerOffset = scrollProgress * (trackHeight - markerSize);

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

      {/* Vertical track + slider */}
      <div
        style={{
          position: 'absolute',
          right: 'var(--space-2)',
          top: '50%',
          transform: 'translateY(-50%)',
          height: trackHeight,
          width: '1px',
          background: 'var(--color-text)',
          opacity: 0.3,
          cursor: 'pointer'
        }}
        onClick={(e) => {
          if (!scrollRef.current) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickY = (e.clientY - rect.top) / rect.height;
          const clamped = Math.max(0, Math.min(1, clickY));
          const targetIndex = Math.round(clamped * (totalScreens - 1));
          scrollRef.current.scrollTo({
            top: targetIndex * scrollRef.current.clientHeight,
            behavior: 'smooth'
          });
        }}
      >
        {/* Marker */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: markerOffset,
          transform: 'translateX(-50%)',
          width: markerSize,
          height: markerSize,
          border: '1px solid var(--color-text)',
          background: 'var(--color-bg)',
          opacity: 1,
          transition: 'top 0.3s ease',
          pointerEvents: 'none'
        }} />
      </div>
    </div>
  );
}
