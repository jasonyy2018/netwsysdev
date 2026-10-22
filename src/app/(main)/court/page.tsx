import React from 'react';
import { getVenues } from './actions';
import { getCurrentUser } from '@/app/(auth)/actions';
import { CourtBookingClient } from '@/components/feature/court/CourtBookingClient';

export default async function CourtPage() {
  const [venues, user] = await Promise.all([
    getVenues(),
    getCurrentUser(),
  ]);

  return <CourtBookingClient venues={venues} user={user} />;
}
