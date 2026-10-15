import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/(auth)/actions';
import { ProfileClient } from '@/components/feature/profile/ProfileClient';

export default async function MyProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <ProfileClient user={user} />;
}
