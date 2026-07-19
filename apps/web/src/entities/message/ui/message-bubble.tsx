import type { Message } from '@zuko/contracts';
import { cn, Check } from '@zuko/ui';
import { timeAgo } from '@/shared/lib';

interface MessageBubbleProps {
  message: Message;
  mine: boolean;
}

/**
 * Статус исходящего сообщения: одна галочка (отправлено) → две lime-галочки
 * (прочитано). Смена состояния проигрывает pop-анимацию за счёт key.
 * NB: состояние «отправляется» (часики) требует optimistic-слоя отправки,
 * которого сейчас нет в модели, — добавится тривиально, когда появится.
 */
function MessageStatus({ read }: { read: boolean }) {
  return (
    <span
      key={read ? 'read' : 'sent'}
      className={cn(
        'relative inline-flex animate-pop items-center',
        read ? 'text-signal-lime' : 'text-fog-text',
      )}
      aria-label={read ? 'Прочитано' : 'Отправлено'}
    >
      <Check className="size-4" />
      {read && <Check className="-ml-2 size-4" />}
    </span>
  );
}

export function MessageBubble({ message, mine }: MessageBubbleProps) {
  return (
    <div className={cn('flex animate-message-in', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3 text-base leading-relaxed shadow-e1',
          mine
            ? 'rounded-br-md border border-primary/15 bg-(image:--surface-bubble-mine) text-bone-text'
            : 'rounded-bl-md border border-border/70 bg-(image:--surface-bubble-peer) text-cloud-text',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <span className="mt-1 flex items-center justify-end gap-1 text-xs text-fog-text">
          {timeAgo(message.createdAt)}
          {mine && <MessageStatus read={Boolean(message.readAt)} />}
        </span>
      </div>
    </div>
  );
}
