import React from 'react';
import { getCurrentUser } from '@/app/(auth)/actions';
import { CreateMatchClient } from '@/components/feature/match/CreateMatchClient';

interface CreateMatchPageProps {
  searchParams: Promise<{
    court_name?: string;
    venue_id?: string;
    date?: string;
    start_hour?: string;
    cost_cents?: string;
    duration?: string;
  }>;
}

export default async function CreateMatchPage({ searchParams }: CreateMatchPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  return (
    <CreateMatchClient
      user={user}
      initialParams={{
        court_name: params.court_name,
        venue_id: params.venue_id,
        date: params.date,
        start_hour: params.start_hour,
        cost_cents: params.cost_cents ? parseInt(params.cost_cents, 10) : undefined,
        duration: params.duration ? parseInt(params.duration, 10) : undefined,
      }}
    />
  );
}
