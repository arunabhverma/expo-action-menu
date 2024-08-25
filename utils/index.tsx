export function convertRgbToRgba(rgb: string, opacity: number): string {
  const rgbValues: number[] = rgb.match(/\d+/g)?.map(Number) ?? [];
  if (opacity < 0 || opacity > 1) {
    throw new Error("Opacity must be between 0 and 1");
  }
  const rgba: string = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`;
  return rgba;
}
