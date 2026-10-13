import { z } from 'zod';

export const CourtBookingSchema = z.object({
  court_id: z.string().uuid().or(z.string().min(1)),
  court_name: z.string().min(1),
  slot_ids: z.array(z.string().min(1)).min(1, '至少选择一个预订时段'),
  slot_times: z.array(z.string()),
  amount_cents: z.number().int().positive('金额必须为正数'),
});

export type CourtBookingInput = z.infer<typeof CourtBookingSchema>;

export interface VenueDetail {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  facilities: string[];
  rating: number;
  courts_count: number;
  starting_price_cents: number;
}

export interface CourtDetail {
  id: string;
  venue_id: string;
  name: string;
  surface: 'hard' | 'clay' | 'grass';
  indoor: boolean;
  price_cents_per_hour: number;
}

export interface SlotItem {
  id: string;
  court_id: string;
  slot_date: string;
  start_hour: number;
  price_cents: number;
  status: 'available' | 'locked' | 'booked' | 'closed';
}
