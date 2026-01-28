/**
 * GraphicsPro Label Parser
 * Intelligently parses user prompts to generate descriptive film labels
 * NEVER returns "Custom" - always a real film description
 */

const KNOWN_FILMS: Record<string, string> = {
  gold: "TeckWrap Chrome Gold",
  silver: "TeckWrap Chrome Silver",
  red: "Oracal Gloss Red Metallic",
  blue: "Oracal Gloss Blue",
  white: "KPMF Gloss White",
  black: "3M 2080 Gloss Black",
  purple: "3M 2080 Gloss Plum Explosion",
  green: "Avery Dennison Gloss Dark Green",
  orange: "Avery Dennison Gloss Orange",
  yellow: "3M 2080 Gloss Bright Yellow",
  pink: "Avery Dennison Gloss Pink",
  bronze: "KPMF Gloss Bronze",
  copper: "Avery Dennison Gloss Copper Metallic",
  gray: "3M 2080 Gloss Anthracite",
  grey: "3M 2080 Gloss Anthracite",
};

const FINISH_MODIFIERS: Record<string, string> = {
  matte: "Matte",
  satin: "Satin",
  gloss: "Gloss",
  chrome: "Chrome",
  metallic: "Metallic",
  brushed: "Brushed",
  carbon: "Carbon Fiber",
};

function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function pickFallbackFilm(colorHint: string): string {
  const lower = colorHint.toLowerCase();
  
  for (const [color, film] of Object.entries(KNOWN_FILMS)) {
    if (lower.includes(color)) {
      // Check for finish modifier
      for (const [finishKey, finishName] of Object.entries(FINISH_MODIFIERS)) {
        if (lower.includes(finishKey)) {
          // Replace the finish in the film name if applicable
          if (finishKey === "matte" || finishKey === "satin") {
            return film.replace("Gloss", finishName);
          }
          if (finishKey === "chrome") {
            return `TeckWrap Chrome ${capitalizeWords(color)}`;
          }
        }
      }
      return film;
    }
  }
  
  // Default fallback
  return "Avery Dennison Gloss Black";
}

export function parseGraphicsProLabel(prompt: string): string {
  if (!prompt || !prompt.trim()) {
    return "Avery Dennison Gloss Black";
  }

  const lower = prompt.toLowerCase().trim();

  // Pattern 1: Two-tone "top half X, bottom half Y" or "upper X, lower Y"
  const twoToneMatch = lower.match(
    /(?:top\s*half|upper\s*(?:half)?)\s+(.+?)(?:,|\s+)(?:bottom\s*half|lower\s*(?:half)?)\s+(.+?)(?:\.|$)/i
  );
  if (twoToneMatch) {
    const topFilm = pickFallbackFilm(twoToneMatch[1]);
    const bottomFilm = pickFallbackFilm(twoToneMatch[2]);
    return `${topFilm} | ${bottomFilm}`;
  }

  // Pattern 2: Chrome delete
  if (/chrome\s*delete/i.test(lower)) {
    const colorMatch = lower.match(/(matte|satin|gloss)?\s*(black|white|gray|grey)/i);
    if (colorMatch) {
      const finish = colorMatch[1] ? capitalizeWords(colorMatch[1]) : "Matte";
      const color = capitalizeWords(colorMatch[2]);
      return `${finish} ${color} Chrome Delete`;
    }
    return "Matte Black Chrome Delete";
  }

  // Pattern 3: Racing stripes / stripes
  if (/stripe/i.test(lower)) {
    const colorMatch = lower.match(/(white|black|red|blue|gold|silver|orange|yellow|green)\s*(?:racing\s*)?stripe/i);
    if (colorMatch) {
      return `${capitalizeWords(colorMatch[1])} Racing Stripes`;
    }
    return "White Racing Stripes";
  }

  // Pattern 4: Roof wrap
  if (/roof\s*(?:wrap|only)/i.test(lower)) {
    const colorMatch = lower.match(/(black|white|carbon|gloss|matte|satin)\s*(?:roof)?/i);
    if (colorMatch) {
      return `${capitalizeWords(colorMatch[1])} Roof Wrap`;
    }
    return "Gloss Black Roof Wrap";
  }

  // Pattern 5: Accent package / trim
  if (/accent|trim\s*(?:package|wrap)/i.test(lower)) {
    const colorMatch = lower.match(/(black|chrome|carbon|gold|silver)/i);
    if (colorMatch) {
      return `${capitalizeWords(colorMatch[1])} Accent Package`;
    }
    return "Gloss Black Accent Package";
  }

  // Pattern 6: Mirror caps
  if (/mirror\s*cap/i.test(lower)) {
    const colorMatch = lower.match(/(black|carbon|chrome|white)/i);
    if (colorMatch) {
      return `${capitalizeWords(colorMatch[1])} Mirror Caps`;
    }
    return "Carbon Fiber Mirror Caps";
  }

  // Pattern 7: Full body wrap with specific color
  const fullBodyMatch = lower.match(
    /(?:full\s*(?:body|wrap)|entire\s*(?:car|vehicle))\s*(?:in\s*)?(.+?)(?:\.|$)/i
  );
  if (fullBodyMatch) {
    return pickFallbackFilm(fullBodyMatch[1]);
  }

  // Fallback: Extract any color/finish keywords and create a label
  return pickFallbackFilm(prompt);
}

export function detectFinishFromPrompt(prompt: string): string {
  if (!prompt) return "gloss";
  const lower = prompt.toLowerCase();
  
  if (lower.includes("chrome")) return "chrome";
  if (lower.includes("matte")) return "matte";
  if (lower.includes("satin")) return "satin";
  if (lower.includes("brushed")) return "brushed";
  if (lower.includes("metallic")) return "metallic";
  if (lower.includes("carbon")) return "carbon";
  
  return "gloss";
}

export function detectManufacturerFromPrompt(prompt: string): string {
  if (!prompt) return "";
  const lower = prompt.toLowerCase();
  
  if (lower.includes("3m")) return "3M";
  if (lower.includes("avery")) return "Avery Dennison";
  if (lower.includes("kpmf")) return "KPMF";
  if (lower.includes("teckwrap")) return "TeckWrap";
  if (lower.includes("oracal")) return "Oracal";
  if (lower.includes("hexis")) return "Hexis";
  if (lower.includes("inozetek")) return "Inozetek";
  if (lower.includes("arlon")) return "Arlon";
  
  return "";
}
