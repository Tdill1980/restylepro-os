-- Clear incorrect data from inkfusion_swatches table
DELETE FROM public.inkfusion_swatches 
WHERE color_library IN ('avery', '3m_2080') 
   OR color_library != 'inkfusion';

-- Insert all 50 correct InkFusion colors

-- Bright Colors (14)
INSERT INTO public.inkfusion_swatches (name, hex, finish, color_library, media_type, media_url, sort_order, is_active) VALUES
('Celestial Aqua', '#5EE7DF', 'Gloss', 'inkfusion', 'image', '', 1, true),
('Nebula Cyan', '#00CFFF', 'Gloss', 'inkfusion', 'image', '', 2, true),
('Stellar Blue', '#0076CE', 'Gloss', 'inkfusion', 'image', '', 3, true),
('Supernova Coral', '#FF6C5C', 'Gloss', 'inkfusion', 'image', '', 4, true),
('Orion Magenta', '#D84DD4', 'Gloss', 'inkfusion', 'image', '', 5, true),
('Lunar Amber', '#FFC857', 'Gloss', 'inkfusion', 'image', '', 6, true),
('Galactic Lime', '#9EF01A', 'Gloss', 'inkfusion', 'image', '', 7, true),
('Nova Pink', '#FF1F8F', 'Gloss', 'inkfusion', 'image', '', 8, true),
('Solar Flare Yellow', '#FFD700', 'Gloss', 'inkfusion', 'image', '', 9, true),
('Ice Blue', '#87CEEB', 'Gloss', 'inkfusion', 'image', '', 10, true),
('Electric Teal', '#00CED1', 'Gloss', 'inkfusion', 'image', '', 11, true),
('Cyber Green', '#39FF14', 'Gloss', 'inkfusion', 'image', '', 12, true),
('Cherry Blossom', '#FFB7C5', 'Gloss', 'inkfusion', 'image', '', 13, true),
('Candy Apple Red', '#FF0800', 'Gloss', 'inkfusion', 'image', '', 14, true);

-- Mid-Tone Colors (14)
INSERT INTO public.inkfusion_swatches (name, hex, finish, color_library, media_type, media_url, sort_order, is_active) VALUES
('Horizon Blue', '#6DAEDB', 'Gloss', 'inkfusion', 'image', '', 15, true),
('Aurora Violet', '#8661C1', 'Satin', 'inkfusion', 'image', '', 16, true),
('Ion Green', '#00A676', 'Gloss', 'inkfusion', 'image', '', 17, true),
('Solar Copper', '#B56B45', 'Satin', 'inkfusion', 'image', '', 18, true),
('Rocket Red', '#C42021', 'Gloss', 'inkfusion', 'image', '', 19, true),
('Plasma Orange', '#FF914D', 'Gloss', 'inkfusion', 'image', '', 20, true),
('Cosmic Taupe', '#B4A69C', 'Matte', 'inkfusion', 'image', '', 21, true),
('Satellite Silver', '#C7C9CC', 'Gloss', 'inkfusion', 'image', '', 22, true),
('Crimson Burst', '#DC143C', 'Gloss', 'inkfusion', 'image', '', 23, true),
('Burnt Orange', '#CC5500', 'Satin', 'inkfusion', 'image', '', 24, true),
('Sunset Red', '#E63946', 'Gloss', 'inkfusion', 'image', '', 25, true),
('Champagne Gold', '#C9B037', 'Satin', 'inkfusion', 'image', '', 26, true),
('Tangerine', '#FF9966', 'Gloss', 'inkfusion', 'image', '', 27, true),
('Storm Blue', '#4682B4', 'Satin', 'inkfusion', 'image', '', 28, true);

-- Dark Colors (14)
INSERT INTO public.inkfusion_swatches (name, hex, finish, color_library, media_type, media_url, sort_order, is_active) VALUES
('Void Black', '#0B0B0B', 'Gloss', 'inkfusion', 'image', '', 29, true),
('Eclipse Navy', '#1E2A78', 'Gloss', 'inkfusion', 'image', '', 30, true),
('Shadow Graphite', '#4B4E54', 'Satin', 'inkfusion', 'image', '', 31, true),
('Meteorite Charcoal', '#2F3236', 'Matte', 'inkfusion', 'image', '', 32, true),
('Earth Moss', '#556B2F', 'Matte', 'inkfusion', 'image', '', 33, true),
('Midnight Teal', '#004D52', 'Gloss', 'inkfusion', 'image', '', 34, true),
('Deep Ocean Blue', '#003B6F', 'Satin', 'inkfusion', 'image', '', 35, true),
('Forest Hunter Green', '#2D5016', 'Matte', 'inkfusion', 'image', '', 36, true),
('Royal Purple', '#4B0082', 'Gloss', 'inkfusion', 'image', '', 37, true),
('Wine Burgundy', '#800020', 'Satin', 'inkfusion', 'image', '', 38, true),
('Deep Plum', '#660066', 'Satin', 'inkfusion', 'image', '', 39, true),
('Olive Drab', '#6B8E23', 'Matte', 'inkfusion', 'image', '', 40, true),
('Gunmetal', '#2C3539', 'Satin', 'inkfusion', 'image', '', 41, true),
('Midnight Blue', '#191970', 'Gloss', 'inkfusion', 'image', '', 42, true);

-- Neutral Colors (8)
INSERT INTO public.inkfusion_swatches (name, hex, finish, color_library, media_type, media_url, sort_order, is_active) VALUES
('Space Pearl', '#F2F4F6', 'Gloss', 'inkfusion', 'image', '', 43, true),
('Iron Slate', '#7A7D7F', 'Satin', 'inkfusion', 'image', '', 44, true),
('Cosmic Bronze', '#5B4636', 'Satin', 'inkfusion', 'image', '', 45, true),
('Arctic Veil', '#EDEDED', 'Gloss', 'inkfusion', 'image', '', 46, true),
('Stardust White', '#FAFAFA', 'Gloss', 'inkfusion', 'image', '', 47, true),
('Titanium Gray', '#858585', 'Satin', 'inkfusion', 'image', '', 48, true),
('Smoke Gray', '#6C6C6C', 'Matte', 'inkfusion', 'image', '', 49, true),
('Cream Beige', '#F5F5DC', 'Matte', 'inkfusion', 'image', '', 50, true);