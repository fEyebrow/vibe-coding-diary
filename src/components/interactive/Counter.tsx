import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
      <button
        onClick={() => setCount(c => c - 1)}
        style={{ background: 'none', border: '1px solid var(--text-sub)', color: 'var(--text-sub)', cursor: 'pointer', width: '2rem', height: '2rem', borderRadius: '2px', fontSize: '1rem', lineHeight: 1 }}
      >
        −
      </button>
      <span style={{ color: 'var(--accent-willow)', minWidth: '2rem', textAlign: 'center' }}>{count}</span>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{ background: 'none', border: '1px solid var(--text-sub)', color: 'var(--text-sub)', cursor: 'pointer', width: '2rem', height: '2rem', borderRadius: '2px', fontSize: '1rem', lineHeight: 1 }}
      >
        +
      </button>
      <span style={{ color: 'var(--text-sub)', fontSize: '0.75rem' }}>React Island</span>
    </div>
  );
}
