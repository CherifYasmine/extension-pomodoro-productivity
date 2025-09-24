import React from 'react';
import { QUOTES } from './quotes';

// Hook to rotate quotes. Default interval 10s; override if needed.
export function useRotatingQuoteIdx(intervalMs: number = 30000) {
  const [quoteIdx, setQuoteIdx] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => {
      setQuoteIdx(i => (i + 1) % QUOTES.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return quoteIdx;
}

// Presentational component for a quote index.
export const InspirationalQuote: React.FC<{ quoteIdx: number; style?: React.CSSProperties; className?: string }> = ({ quoteIdx, style, className }) => (
  <div className={className} style={{
    marginTop: '1em',
    textAlign: 'center',
    fontSize: '1.3vw',
    fontWeight: 600,
    fontStyle: 'italic',
    color: '#fff',
    minHeight: '3em',
    transition: 'opacity 0.5s',
    opacity: 0.95,
    ...style
  }}>
    {QUOTES[quoteIdx]}
  </div>
);
