import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/(auth)/actions';
import { getUserCreditProfile } from './actions';
import { CreditClient } from '@/components/feature/review/CreditClient';

export default async function MyCreditPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/my/credit');
  }

  const { profile, events } = await getUserCreditProfile(user.id);

  return <CreditClient initialProfile={profile} initialEvents={events} />;
}
