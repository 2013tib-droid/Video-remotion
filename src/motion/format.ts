/** Format angka gaya Indonesia: 1.250.000 */
export function formatNumber(value: number, decimals = 0, locale = 'id-ID'): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Gabungkan prefix + angka + suffix. */
export function formatValue(
  value: number,
  opts: { prefix?: string; suffix?: string; decimals?: number; locale?: string } = {},
): string {
  return `${opts.prefix ?? ''}${formatNumber(value, opts.decimals ?? 0, opts.locale)}${opts.suffix ?? ''}`;
}
