
-- Add agent-specific columns to the subscriptions table if they don't exist
DO $$
BEGIN
    -- Check if markus column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'subscriptions'
                   AND column_name = 'markus') THEN
        ALTER TABLE public.subscriptions ADD COLUMN markus BOOLEAN DEFAULT false;
    END IF;

    -- Check if kara column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'subscriptions'
                   AND column_name = 'kara') THEN
        ALTER TABLE public.subscriptions ADD COLUMN kara BOOLEAN DEFAULT false;
    END IF;

    -- Check if connor column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'subscriptions'
                   AND column_name = 'connor') THEN
        ALTER TABLE public.subscriptions ADD COLUMN connor BOOLEAN DEFAULT false;
    END IF;

    -- Check if chloe column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'subscriptions'
                   AND column_name = 'chloe') THEN
        ALTER TABLE public.subscriptions ADD COLUMN chloe BOOLEAN DEFAULT false;
    END IF;

    -- Check if luther column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'subscriptions'
                   AND column_name = 'luther') THEN
        ALTER TABLE public.subscriptions ADD COLUMN luther BOOLEAN DEFAULT false;
    END IF;

    -- Check if all_in_one column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'subscriptions'
                   AND column_name = 'all_in_one') THEN
        ALTER TABLE public.subscriptions ADD COLUMN all_in_one BOOLEAN DEFAULT false;
    END IF;

    -- Check if trial_start column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'subscriptions'
                   AND column_name = 'trial_start') THEN
        ALTER TABLE public.subscriptions ADD COLUMN trial_start TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Check if trial_end column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'subscriptions'
                   AND column_name = 'trial_end') THEN
        ALTER TABLE public.subscriptions ADD COLUMN trial_end TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
