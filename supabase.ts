import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: false },
    })
  : null;

export interface CloudATMReport {
  id: string;
  atm_id: string;
  status: 'has_cash' | 'low_cash' | 'no_cash' | 'jammed';
  rating: number | null;
  comment: string | null;
  tags: string[] | null;
  user_name: string | null;
  created_at: string;
}

export async function fetchATMReports(): Promise<CloudATMReport[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('atm_reports')
    .select('id, atm_id, status, rating, comment, tags, user_name, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Supabase: failed to load ATM reports', error);
    return [];
  }

  return (data ?? []) as CloudATMReport[];
}

export async function createATMReport(input: Omit<CloudATMReport, 'id' | 'created_at'>) {
  if (!supabase) throw new Error('Supabase is not configured');

  const { data, error } = await supabase
    .from('atm_reports')
    .insert({
      atm_id: input.atm_id,
      status: input.status,
      rating: input.rating,
      comment: input.comment,
      tags: input.tags,
      user_name: input.user_name,
    })
    .select('id, atm_id, status, rating, comment, tags, user_name, created_at')
    .single();

  if (error) throw error;
  return data as CloudATMReport;
}

export function subscribeToATMReports(onReport: (report: CloudATMReport) => void) {
  if (!supabase) return () => undefined;

  const channel = supabase
    .channel('atm-reports-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'atm_reports' },
      (payload) => onReport(payload.new as CloudATMReport)
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.info('Supabase Realtime: connected');
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
