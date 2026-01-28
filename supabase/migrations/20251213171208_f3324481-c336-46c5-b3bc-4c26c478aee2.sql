-- Delete old cached FadeWraps renders so fresh proofs are generated
DELETE FROM public.color_visualizations
WHERE mode_type = 'fadewraps';