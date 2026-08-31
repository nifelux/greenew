-- Install the RPC used by My Active Plans -> Collect All.
-- The function is deliberately SECURITY DEFINER so the authenticated user can
-- update their own plan and wallet in one transaction without broad table writes.
CREATE OR REPLACE FUNCTION public.collect_daily_income(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  plan_row record;
  today_date date := CURRENT_DATE;
  now_time timestamptz := now();
  collected_amount numeric := 0;
  collected_count integer := 0;
  completed_count integer := 0;
  next_days integer;
BEGIN
  -- The API also verifies the bearer token, but keep the authorization check
  -- inside the database function because this is the operation's trust boundary.
  IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Authentication required');
  END IF;

  -- Lock eligible plans before calculating income. This prevents two rapid
  -- Collect All requests from crediting the same plan twice.
  FOR plan_row IN
    SELECT
      id,
      COALESCE(daily_income, 0)::numeric AS daily_income,
      COALESCE(duration_days, 0)::integer AS duration_days,
      COALESCE(days_collected, 0)::integer AS days_collected,
      COALESCE(total_earned, 0)::numeric AS total_earned
    FROM public.user_products
    WHERE user_id = p_user_id
      AND status = 'active'
      -- Match the frontend rule: a plan becomes collectible the day after purchase.
      AND COALESCE(purchased_on::date, created_at::date, DATE '1900-01-01') < today_date
      AND COALESCE(last_collected_at::date, last_claim_date, DATE '1900-01-01') < today_date
      AND (duration_days IS NULL OR COALESCE(days_collected, 0) < duration_days)
    ORDER BY created_at ASC, id ASC
    FOR UPDATE
  LOOP
    next_days := plan_row.days_collected + 1;
    collected_amount := collected_amount + plan_row.daily_income;
    collected_count := collected_count + 1;

    IF plan_row.duration_days > 0 AND next_days >= plan_row.duration_days THEN
      completed_count := completed_count + 1;
      UPDATE public.user_products
      SET
        days_collected = next_days,
        total_earned = plan_row.total_earned + plan_row.daily_income,
        last_collected_at = now_time,
        last_claim_date = today_date,
        status = 'completed',
        updated_at = now_time
      WHERE id = plan_row.id;
    ELSE
      UPDATE public.user_products
      SET
        days_collected = next_days,
        total_earned = plan_row.total_earned + plan_row.daily_income,
        last_collected_at = now_time,
        last_claim_date = today_date,
        updated_at = now_time
      WHERE id = plan_row.id;
    END IF;
  END LOOP;

  IF collected_count = 0 OR collected_amount <= 0 THEN
    RETURN jsonb_build_object(
      'ok', false,
      'amount', 0,
      'collected', 0,
      'error', 'Nothing to collect today'
    );
  END IF;

  -- Wallets are normally created at signup. The upsert also handles older
  -- accounts whose wallet row was never created.
  INSERT INTO public.wallets (user_id, balance, updated_at)
  VALUES (p_user_id, collected_amount, now_time)
  ON CONFLICT (user_id) DO UPDATE
  SET
    balance = COALESCE(public.wallets.balance, 0) + EXCLUDED.balance,
    updated_at = EXCLUDED.updated_at;

  INSERT INTO public.wallet_transactions (user_id, type, amount, description)
  VALUES (
    p_user_id,
    'daily_income',
    collected_amount,
    'Daily income collected from ' || collected_count || ' active plan' || CASE WHEN collected_count = 1 THEN '' ELSE 's' END
  );

  RETURN jsonb_build_object(
    'ok', true,
    'amount', collected_amount,
    'collected', collected_count,
    'completed', completed_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.collect_daily_income(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.collect_daily_income(uuid) TO authenticated;

-- Ask PostgREST to expose the newly-created RPC without waiting for a restart.
NOTIFY pgrst, 'reload schema';
