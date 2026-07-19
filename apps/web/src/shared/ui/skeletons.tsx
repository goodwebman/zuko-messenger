import { UISkeleton } from '@zuko/ui';

function Row() {
  return (
    <div className="flex gap-3 border-b border-steel-border px-4 py-4">
      <UISkeleton className="size-9 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <UISkeleton className="h-3 w-32" />
        <UISkeleton className="h-3 w-full" />
        <UISkeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div aria-hidden data-testid="feed-skeleton">
      {Array.from({ length: 5 }).map((_, i) => (
        <Row key={i} />
      ))}
    </div>
  );
}

export function CommentsSkeleton() {
  return (
    <div aria-hidden>
      {Array.from({ length: 3 }).map((_, i) => (
        <Row key={i} />
      ))}
    </div>
  );
}

export function ConversationsSkeleton() {
  return (
    <div aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-steel-border px-4 py-3">
          <UISkeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <UISkeleton className="h-3 w-28" />
            <UISkeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsSkeleton() {
  return <ConversationsSkeleton />;
}

export function ChatSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-3 px-4 py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={i % 2 === 0 ? 'self-start' : 'self-end'}>
          <UISkeleton className="h-9 w-48 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div aria-hidden className="border-b border-steel-border p-4">
      <UISkeleton className="size-16 rounded-full" />
      <UISkeleton className="mt-3 h-4 w-40" />
      <UISkeleton className="mt-2 h-3 w-24" />
    </div>
  );
}
