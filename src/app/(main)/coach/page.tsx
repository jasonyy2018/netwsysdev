import React from 'react';
import { getCoaches } from './actions';
import { getCurrentUser } from '@/app/(auth)/actions';
import { CoachClient } from '@/components/feature/coach/CoachClient';

export default async function CoachPage() {
  const [coaches, user] = await Promise.all([
    getCoaches(),
    getCurrentUser(),
  ]);

  return <CoachClient coaches={coaches} user={user} />;
}
