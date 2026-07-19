/** Пузырь «печатает…» со стороны собеседника: три точки в противофазе. */
export function TypingIndicator() {
  return (
    <div
      className="flex animate-message-in justify-start"
      role="status"
      aria-label="Собеседник печатает"
    >
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border/70 bg-(image:--surface-bubble-peer) px-3.5 py-3 shadow-e1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-typing rounded-full bg-fog-text"
            style={{ animationDelay: `${String(i * 0.16)}s` }}
          />
        ))}
      </div>
    </div>
  );
}
