-- Fix RLS policy for manufacturer_colors to allow reading all rows
-- Previous policy only allowed SELECT where is_verified = true
-- This caused issues when is_verified was NULL or not set

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Anyone can view verified manufacturer colors" ON public.manufacturer_colors;

-- Create new policy allowing anyone to read all manufacturer colors
CREATE POLICY "Anyone can read manufacturer colors"
ON public.manufacturer_colors
FOR SELECT
USING (true);

-- Also ensure is_verified defaults to true and update any NULL values
UPDATE public.manufacturer_colors SET is_verified = true WHERE is_verified IS NULL;
