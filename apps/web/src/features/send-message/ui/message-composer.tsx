'use client';

import { useRef, useState } from 'react';
import { UIButton, UITextarea } from '@zuko/ui';
import { sendMessageSchema } from '@zuko/contracts';
import { SendIcon } from '@zuko/ui/app';
import type { ConversationSocketApi } from '../model/use-conversation-socket';

export function MessageComposer({ socket }: { socket: ConversationSocketApi }) {
  const [body, setBody] = useState('');
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onType = (value: string) => {
    setBody(value);
    socket.startTyping();
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(socket.stopTyping, 1500);
  };

  const submit = () => {
    const parsed = sendMessageSchema.safeParse({ body });
    if (!parsed.success) return;
    socket.send(parsed.data.body);
    setBody('');
    socket.stopTyping();
  };

  return (
    <div className="glass flex items-end gap-2 border-t border-steel-border p-3">
      <UITextarea
        value={body}
        onChange={(e) => onType(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Сообщение…"
        rows={1}
        className="max-h-32 min-h-11 resize-none rounded-2xl focus-visible:shadow-(--glow-accent)"
        maxLength={4000}
        aria-label="Текст сообщения"
      />
      <UIButton
        onClick={submit}
        disabled={body.trim().length === 0}
        size="icon"
        className="press shrink-0 rounded-full"
        aria-label="Отправить"
      >
        <SendIcon className="size-5.5" />
      </UIButton>
    </div>
  );
}
