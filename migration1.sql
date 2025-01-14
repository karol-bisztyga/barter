-- Step 1: Alter the matches table
ALTER TABLE public.matches ADD COLUMN date_updated bigint DEFAULT ((EXTRACT(epoch FROM now()) * (1000)::numeric))::bigint;

ALTER TABLE public.matches ADD COLUMN date_matching_owner_notified bigint DEFAULT 0;

ALTER TABLE public.matches ADD COLUMN date_matched_owner_notified bigint DEFAULT 0;

-- Step 2: Drop matches_updates table and sequence
DROP TABLE IF EXISTS public.matches_updates CASCADE;
DROP SEQUENCE IF EXISTS public.matches_updates_id_seq;

-- Step 3: Update existing rows in matches table
UPDATE public.matches
SET 
    date_updated = ((EXTRACT(epoch FROM now()) * (1000)::numeric))::bigint,
    date_matching_owner_notified = 0,
    date_matched_owner_notified = 0;

-- Step 4: Verify the changes (Optional)
-- \d public.matches;
-- SELECT * FROM public.matches LIMIT 10;
