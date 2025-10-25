/**
 * Format angka ke format Rupiah Indonesia
 * @param amount - Nominal yang akan diformat
 * @returns String format Rupiah (contoh: Rp 50.000)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format angka ke format Rupiah tanpa simbol (hanya angka dan titik)
 * @param amount - Nominal yang akan diformat
 * @returns String format angka (contoh: 50.000)
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}
