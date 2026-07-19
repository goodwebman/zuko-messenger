'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ru">
      <body
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#121317',
          color: '#e5e7eb',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 16 }}>Произошла критическая ошибка</p>
          <button
            onClick={reset}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              background: '#a8ff53',
              color: '#121317',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Перезагрузить
          </button>
        </div>
      </body>
    </html>
  );
}
