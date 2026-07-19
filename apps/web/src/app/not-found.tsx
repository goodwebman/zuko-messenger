import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-center">
      <h1 className="font-satoshi text-4xl font-semibold text-bone-text">404</h1>
      <p className="text-fog-text">Страница не найдена</p>
      <Link href="/feed" className="text-signal-lime hover:underline">
        На главную
      </Link>
    </div>
  );
}
