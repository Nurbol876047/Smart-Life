// Chart.js canvas-қа сурет салады, сол себепті CSS айнымалыларын
// browser-дан есептелген мәні ретінде оқып алу керек (тікелей var() жазбайды).
export function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export const CHART_PALETTE = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5', '--chart-6'];

export function chartColor(index) {
  return cssVar(CHART_PALETTE[index % CHART_PALETTE.length]);
}
