import React from 'react';
import { getCurrentUser } from '@/app/(auth)/actions';
import { ProfileClient } from '@/components/feature/profile/ProfileClient';

export default async function MyProfilePage() {
  const user = await getCurrentUser();

  return <ProfileClient user={user} />;
}
