-- Store the bank username or sender name supplied by the user for manual deposits.
-- Nullable keeps existing deposit history compatible; new manual deposits are validated by /api/deposit.
ALTER TABLE public.deposits
  ADD COLUMN IF NOT EXISTS bank_username text;

CREATE INDEX IF NOT EXISTS deposits_bank_username_idx
  ON public.deposits (bank_username);
