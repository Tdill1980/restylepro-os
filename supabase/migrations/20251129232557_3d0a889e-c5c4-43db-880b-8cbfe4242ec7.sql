-- Add order_metadata column to store pricing details
ALTER TABLE design_pack_purchases 
ADD COLUMN order_metadata JSONB DEFAULT NULL;