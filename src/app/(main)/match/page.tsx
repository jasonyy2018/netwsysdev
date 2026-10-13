import React from 'react';
import { getMatchRequests } from './actions';
import { MatchListClient } from '@/components/feature/match/MatchListClient';

export default async function MatchPage() {
  const matches = await getMatchRequests();

  return <MatchListClient initialMatches={matches} />;
}
