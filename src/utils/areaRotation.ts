import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ROTATION_DAYS = 3;
const START_DATE = new Date('2024-01-01');

export function getDayNumber(): number {
  const today = new Date();
  const diffTime = today.getTime() - START_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays % ROTATION_DAYS;
}

export function getTodayAreaSchedule() {
  const dayNumber = getDayNumber();

  const schedule: Record<number, { delivery: number; preparation: number; day: string }> = {
    0: { delivery: 12, preparation: 14, day: 'יום ראשון' },
    1: { delivery: 14, preparation: 45, day: 'יום שני' },
    2: { delivery: 45, preparation: 12, day: 'יום שלישי' },
  };

  return schedule[dayNumber] || { delivery: 12, preparation: 14, day: 'יום ראשון' };
}

export function getTomorrowAreaSchedule() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const diffTime = tomorrow.getTime() - START_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const dayNumber = diffDays % ROTATION_DAYS;

  const schedule: Record<number, { delivery: number; preparation: number; day: string }> = {
    0: { delivery: 12, preparation: 14, day: 'יום ראשון' },
    1: { delivery: 14, preparation: 45, day: 'יום שני' },
    2: { delivery: 45, preparation: 12, day: 'יום שלישי' },
  };

  return schedule[dayNumber] || { delivery: 12, preparation: 14, day: 'יום ראשון' };
}

export async function saveDailyTracking(
  deliveryBags: number,
  deliveryStartedAt: string | null,
  deliveryEndedAt: string | null,
  preparationBags: number
) {
  const today = new Date().toISOString().split('T')[0];
  const schedule = getTodayAreaSchedule();

  const { data: existing } = await supabase
    .from('daily_work_tracking')
    .select('id')
    .eq('work_date', today)
    .maybeSingle();

  if (existing) {
    return supabase
      .from('daily_work_tracking')
      .update({
        delivery_bags_count: deliveryBags,
        delivery_started_at: deliveryStartedAt,
        delivery_ended_at: deliveryEndedAt,
        delivery_completed: deliveryBags > 0 && !!deliveryEndedAt,
        preparation_bags_count: preparationBags,
        preparation_completed: preparationBags > 0,
        updated_at: new Date().toISOString(),
      })
      .eq('work_date', today);
  } else {
    return supabase
      .from('daily_work_tracking')
      .insert({
        work_date: today,
        day_number: getDayNumber(),
        delivery_area: schedule.delivery,
        preparation_area: schedule.preparation,
        delivery_bags_count: deliveryBags,
        delivery_started_at: deliveryStartedAt,
        delivery_ended_at: deliveryEndedAt,
        delivery_completed: deliveryBags > 0 && !!deliveryEndedAt,
        preparation_bags_count: preparationBags,
        preparation_completed: preparationBags > 0,
      });
  }
}

export async function getDailyTracking() {
  const today = new Date().toISOString().split('T')[0];
  return supabase
    .from('daily_work_tracking')
    .select('*')
    .eq('work_date', today)
    .maybeSingle();
}
