/**
 * Прикладной слой ui-kit: компоненты, собранные из примитивов `../components`
 * под конкретный продукт (шапки страниц, скелетоны, модалки-обёртки, иконки).
 *
 * Живёт отдельной папкой и отдельным входом (`@zuko/ui/app`), чтобы граница
 * «универсальные примитивы ↔ продуктовые сборки» была видна прямо в импорте:
 * `@zuko/ui` — то, что не знает про zuko и могло бы уехать в любой проект;
 * `@zuko/ui/app` — то, что собрано под этот продукт.
 *
 * Зависимостей от фреймворка (next/*) здесь быть не должно — всё, что знает про
 * роутинг или серверные компоненты, остаётся в приложении.
 *
 * ImageLightbox намеренно НЕ реэкспортится: его CSS — side-effect import, через
 * баррель библиотека уехала бы в бандл каждой страницы. Импортируйте напрямую
 * (`@zuko/ui/app/image-lightbox`), лучше через `next/dynamic`.
 */
export { BrandLogo, BrandMark } from './brand-logo';
export { PageHeader } from './page-header';
export { EmptyState } from './empty-state';
export { ErrorBoundary } from './error-boundary';
export { AutoTextarea, type AutoTextareaProps } from './auto-textarea';
export { ConfirmDialog } from './confirm-dialog';
export { DialogBackdrop } from './dialog-backdrop';
export { ParticleBurst, type ParticleBurstProps } from './particle-burst';
export { actionItemVariants, actionItemIcon, type ActionItemVariants } from './action-item';
export {
  HomeIcon,
  MessageIcon,
  BellIcon,
  UserIcon,
  SettingsIcon,
  HeartIcon,
  CommentIcon,
  RepostIcon,
  LinkIcon,
  LogOutIcon,
  ImageIcon,
  CameraIcon,
  TrashIcon,
  SendIcon,
  CloseIcon,
} from './icons';
export {
  FeedSkeleton,
  CommentsSkeleton,
  ConversationsSkeleton,
  NotificationsSkeleton,
  ChatSkeleton,
  ProfileSkeleton,
} from './skeletons';
