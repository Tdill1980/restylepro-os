# Swatch Upload TODO Checklist

## Storage Structure
All swatches go to: `swatches/{brand}/{code}.png`

Base URL: `https://abgevylqeazbydrtovzp.supabase.co/storage/v1/object/public/swatches/`

---

## Brand Upload Checklist

### ✅ 3M (65 colors)
- [ ] Extract from `3m-2080.pdf` (8 rows × 10 cols)
- [ ] Upload to `swatches/3m/`
- [ ] Verify: `swatches/3m/2080-G12.png`

### ✅ Avery (77 colors)
- [ ] Extract from `avery-sw900.pdf` (12 rows × 6 cols)
- [ ] Upload to `swatches/avery/`
- [ ] Verify: `swatches/avery/SW900-190-O.png`

### ✅ Oracal (48 colors)
- [ ] Extract from `oracal-970ra.pdf` (10 rows × 10 cols)
- [ ] Upload to `swatches/oracal/`
- [ ] Verify: `swatches/oracal/970RA-070.png`

### ✅ Hexis (55 colors)
- [ ] Extract from Hexis color card (8 rows × 8 cols)
- [ ] Upload to `swatches/hexis/`
- [ ] Verify: `swatches/hexis/HX20BTUB.png`

### ✅ Inozetek (45 colors)
- [ ] Extract from Inozetek poster (8 rows × 5 cols)
- [ ] Upload to `swatches/inozetek/`
- [ ] Verify: `swatches/inozetek/SG015.png`

### ✅ KPMF (40 colors)
- [ ] Extract from KPMF K75000 poster (7 rows × 6 cols)
- [ ] Upload to `swatches/kpmf/`
- [ ] Verify: `swatches/kpmf/K75400.png`

### ✅ Arlon (15 colors)
- [ ] Upload individual tiles to `swatches/arlon/`
- [ ] Verify: `swatches/arlon/SLX-GlossBlack.png`

### ✅ TeckWrap (12 colors)
- [ ] Upload individual tiles to `swatches/teckwrap/`
- [ ] Verify: `swatches/teckwrap/TW-GlossBlack.png`

### ✅ VViViD (10 colors)
- [ ] Upload individual tiles to `swatches/vvivid/`
- [ ] Verify: `swatches/vvivid/VV-GlossBlack.png`

### ✅ STEK (8 colors)
- [ ] Upload individual tiles to `swatches/stek/`
- [ ] Verify: `swatches/stek/DYNO-Black.png`

### ✅ Carlas (6 colors)
- [ ] Upload individual tiles to `swatches/carlas/`
- [ ] Verify: `swatches/carlas/CARLAS-Black.png`

### ✅ FlexiShield (5 colors)
- [ ] Upload individual tiles to `swatches/flexishield/`
- [ ] Verify: `swatches/flexishield/FS-Black.png`

---

## Final Steps

1. [ ] All PNGs uploaded to Supabase Storage
2. [ ] Run `seed-curated-colors` with `{ "seedAll": true }`
3. [ ] Test ColorPro - thumbnails should display
4. [ ] Verify fallback to hex color works for missing images

---

## Extraction Script Config Reference

```javascript
// 3M 2080
{ pdf: "3m-2080.pdf", folder: "3m", rows: 8, cols: 10, prefix: "2080" }

// Avery SW900
{ pdf: "avery-sw900.pdf", folder: "avery", rows: 12, cols: 6, prefix: "SW900" }

// Oracal 970RA
{ pdf: "oracal-970ra.pdf", folder: "oracal", rows: 10, cols: 10, prefix: "970RA" }

// Hexis
{ pdf: "hexis-skintac.pdf", folder: "hexis", rows: 8, cols: 8, prefix: "HX" }

// Inozetek
{ pdf: "inozetek.pdf", folder: "inozetek", rows: 8, cols: 5, prefix: "SG" }

// KPMF
{ pdf: "kpmf-k75000.pdf", folder: "kpmf", rows: 7, cols: 6, prefix: "K75" }
```
