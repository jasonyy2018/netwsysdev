import React from 'react';
import { getUserCreditProfile } from './actions';
import { CreditClient } from '@/components/feature/review/CreditClient';

export default async function MyCreditPage() {
  const { profile, events } = await getUserCreditProfile();

  return <CreditClient initialProfile={profile} initialEvents={events} />;
}
