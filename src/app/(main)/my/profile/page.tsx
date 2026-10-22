import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/(auth)/actions';
import { getMyBookings, getMyMatches, getMyCoachOrders } from './actions';
import { ProfileClient } from '@/components/feature/profile/ProfileClient';

interface MyProfilePageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function MyProfilePage({ searchParams }: MyProfilePageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const [bookings, matches, coachOrders, params] = await Promise.all([
    getMyBookings(),
    getMyMatches(),
    getMyCoachOrders(),
    searchParams,
  ]);

  return (
    <ProfileClient
      user={user}
      bookings={bookings}
      matches={matches}
      coachOrders={coachOrders}
      initialTab={params.tab || 'profile'}
    />
  );
}
