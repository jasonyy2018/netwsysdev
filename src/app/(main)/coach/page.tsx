import React from 'react';
import { getCoaches } from './actions';
import { CoachClient } from '@/components/feature/coach/CoachClient';

export default async function CoachPage() {
  const coaches = await getCoaches();

  return <CoachClient coaches={coaches} />;
}
