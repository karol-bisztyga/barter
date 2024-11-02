type RGB = {
  r: number;
  g: number;
  b: number;
};

type HSL = {
  h: number;
  s: number;
  l: number;
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string): RGB {
  let cleanedHex = hex.replace(/^#/, '');
  if (cleanedHex.length === 3) {
    cleanedHex = cleanedHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const num = parseInt(cleanedHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Helper function to convert RGB to HSL
function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Helper function to convert HSL to RGB
function hslToRgb({ h, s, l }: HSL): RGB {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// Helper function to convert RGB to hex
function rgbToHex({ r, g, b }: RGB): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

// Function to generate a single random harmonic color
export function generateRandomHarmonicColor(baseColor: string): string {
  const baseHsl = rgbToHsl(hexToRgb(baseColor));
  const randomHueShift = Math.random() * 360; // Random value between 0 and 360
  const newHue = (baseHsl.h + randomHueShift) % 360;

  const newColorHSL: HSL = { h: newHue, s: baseHsl.s, l: baseHsl.l };
  const newColorRGB = hslToRgb(newColorHSL);
  return rgbToHex(newColorRGB);
}

export enum TargetColor {
  GREEN = 'Green',
  YELLOW = 'Yellow',
  RED = 'Red',
}

export function generateHarmonicColor(baseColor: string, target: TargetColor): string {
  const baseHsl = rgbToHsl(hexToRgb(baseColor));
  let targetHue: number;

  switch (target) {
    case TargetColor.GREEN:
      targetHue = 120;
      break;
    case TargetColor.YELLOW:
      targetHue = 60;
      break;
    case TargetColor.RED:
      targetHue = 0;
      break;
    default:
      throw new Error('Invalid target color');
  }

  // Adjust the hue towards the target hue
  const hueDifference = (targetHue - baseHsl.h + 360) % 360;
  const newHue = (baseHsl.h + hueDifference) % 360;

  const newColorHSL: HSL = { h: newHue, s: baseHsl.s, l: baseHsl.l };
  const newColorRGB = hslToRgb(newColorHSL);
  return rgbToHex(newColorRGB);
}
