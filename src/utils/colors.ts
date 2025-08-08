export const colorPalettes = {
  default: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'],
  vibrant: ['#ff4757', '#2ed573', '#3742fa', '#ffa502', '#ff6348', '#5352ed'],
  pastel: ['#ffb3ba', '#baffc9', '#bae1ff', '#ffffba', '#ffb3d9', '#d4b3ff'],
  monochrome: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d'],
  warm: ['#ff6b6b', '#ff8e53', '#ffa726', '#ffcc02', '#ffeb3b', '#fff176'],
  cool: ['#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a']
};

export function getColors(palette: string | string[], count: number): string[] {
  if (Array.isArray(palette)) {
    return palette.slice(0, count);
  }
  
  const colors = colorPalettes[palette as keyof typeof colorPalettes] || colorPalettes.default;
  return colors.slice(0, count);
}

export function generateGradient(startColor: string, endColor: string, steps: number): string[] {
  const colors: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const color = interpolateColor(startColor, endColor, ratio);
    colors.push(color);
  }
  
  return colors;
}

function interpolateColor(color1: string, color2: string, ratio: number): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
