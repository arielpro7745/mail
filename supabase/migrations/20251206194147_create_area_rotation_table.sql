/*
  # Create area rotation schedule table

  1. New Tables
    - `area_rotation_schedule`
      - `id` (uuid, primary key)
      - `day_number` (integer, 0-2 for 3-day rotation)
      - `delivery_area` (integer, the area to deliver on this day)
      - `preparation_area` (integer, the area to prepare for next day)
      - `day_name_he` (text, day name in Hebrew)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS but allow public read access (this is a fixed schedule)
    - Not editable by users (system-managed)

  3. Data
    - Insert 3-day rotation pattern:
      - Day 0: Deliver area 12, Prepare area 14
      - Day 1: Deliver area 14, Prepare area 45
      - Day 2: Deliver area 45, Prepare area 12
*/

CREATE TABLE IF NOT EXISTS area_rotation_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER NOT NULL CHECK (day_number >= 0 AND day_number <= 2),
  delivery_area INTEGER NOT NULL,
  preparation_area INTEGER NOT NULL,
  day_name_he TEXT NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(day_number)
);

ALTER TABLE area_rotation_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read"
  ON area_rotation_schedule FOR SELECT
  TO public
  USING (true);

INSERT INTO area_rotation_schedule (day_number, delivery_area, preparation_area, day_name_he)
VALUES
  (0, 12, 14, 'יום ראשון'),
  (1, 14, 45, 'יום שני'),
  (2, 45, 12, 'יום שלישי')
ON CONFLICT (day_number) DO NOTHING;

CREATE TABLE IF NOT EXISTS daily_work_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_date DATE NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number >= 0 AND day_number <= 2),
  delivery_area INTEGER NOT NULL,
  preparation_area INTEGER NOT NULL,
  preparation_bags_count INTEGER DEFAULT 0,
  preparation_completed BOOLEAN DEFAULT false,
  delivery_bags_count INTEGER DEFAULT 0,
  delivery_started_at TIME,
  delivery_ended_at TIME,
  delivery_completed BOOLEAN DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(work_date)
);

ALTER TABLE daily_work_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access for today's tracking"
  ON daily_work_tracking FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow insert today's tracking"
  ON daily_work_tracking FOR INSERT
  TO public
  WITH CHECK (work_date >= CURRENT_DATE);

CREATE POLICY "Allow update today's tracking"
  ON daily_work_tracking FOR UPDATE
  TO public
  USING (work_date = CURRENT_DATE)
  WITH CHECK (work_date = CURRENT_DATE);