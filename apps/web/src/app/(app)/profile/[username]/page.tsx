import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { UserPublic } from '@zuko/contracts';
import { env } from '@/shared/config';
import { ProfilePage } from '@/views/profile';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  try {
    const cookie = (await cookies()).toString();
    const res = await fetch(`${env.API_URL}/api/users/${username}`, {
      headers: { cookie },
      cache: 'no-store',
    });
    if (!res.ok) return { title: `@${username}` };
    const user: UserPublic = await res.json();
    const description = user.bio ?? `Профиль ${user.displayName} в Zuko`;
    return {
      title: `${user.displayName} (@${user.username})`,
      description,
      openGraph: { title: user.displayName, description },
    };
  } catch {
    return { title: `@${username}` };
  }
}

export default function Page() {
  return <ProfilePage />;
}
