import React from 'react';
import { getMatchRequests } from './actions';
import { getCurrentUser } from '@/app/(auth)/actions';
import { MatchListClient } from '@/components/feature/match/MatchListClient';

export default async function MatchPage() {
  const [matches, user] = await Promise.all([
    getMatchRequests(),
    getCurrentUser(),
  ]);

  return <MatchListClient initialMatches={matches} user={user} />;
}
