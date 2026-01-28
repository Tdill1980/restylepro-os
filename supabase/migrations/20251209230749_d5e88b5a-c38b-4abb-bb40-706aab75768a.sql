-- Step 1: Delete old CustomStyling renders for Tesla Model X (these use old soft-light studio)
DELETE FROM color_visualizations 
WHERE mode_type = 'CustomStyling' 
  AND (vehicle_make ILIKE '%tesla%' AND vehicle_model ILIKE '%x%');

-- Step 2: Add custom_styling_prompt_key column for prompt-specific caching
ALTER TABLE color_visualizations
ADD COLUMN IF NOT EXISTS custom_styling_prompt_key text;