// Incommensurate rhythms and passing gusts avoid a short, obvious loop while
// remaining continuous and deterministic when a visitor reverses the scroll.
export function sampleWind(time, phase = 0, seed = 0) {
  const t = Math.max(0, time);
  const drift =
    0.62 * Math.sin(t * 0.71 + seed * 1.7 + phase * 0.16) +
    0.29 * Math.sin(t * 1.19 + seed * 2.8 - phase * 0.11) +
    0.13 * Math.sin(t * 1.97 + seed * 0.47);
  const gust =
    Math.max(0, Math.sin(t * 0.23 + seed * 2.1)) ** 7 *
    (0.55 + 0.45 * Math.sin(t * 2.41 + seed * 0.9) ** 2);
  return {
    x: drift * 0.24 + gust * 0.27,
    y: 0.025 * Math.sin(t * 1.13 + seed * 2.3),
    z:
      0.11 * Math.sin(t * 0.83 + seed * 2.2) +
      0.045 * Math.sin(t * 1.53 + seed * 0.7) -
      gust * 0.1,
    twist: 0.08 * drift + 0.075 * gust,
    gust,
  };
}
