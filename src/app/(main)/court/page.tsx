import React from 'react';
import { getVenues } from './actions';
import { CourtBookingClient } from '@/components/feature/court/CourtBookingClient';

export default async function CourtPage() {
  const venues = await getVenues();

  return <CourtBookingClient venues={venues} />;
}
