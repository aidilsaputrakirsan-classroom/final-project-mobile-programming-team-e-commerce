/**
 * Utility functions untuk format Order ID
 * Order ID adalah UUID yang di-generate oleh database
 */

/**
 * Format Order ID untuk tampilan singkat
 * Mengambil 8 karakter pertama dari UUID dan uppercase
 * Contoh: "0e6042d5-c3e4-4d97-89bf-8827e6804aac" -> "0E6042D5"
 */
export const formatOrderId = (orderId: string): string => {
    if (!orderId) return '-';

    // Jika sudah pendek (bukan UUID), return as-is uppercase
    if (orderId.length <= 8) {
        return orderId.toUpperCase();
    }

    // Ambil 8 karakter pertama (sebelum dash pertama di UUID)
    const shortId = orderId.replace(/-/g, '').substring(0, 8);
    return shortId.toUpperCase();
};

/**
 * Format Order ID untuk tampilan dengan prefix
 * Contoh: "0e6042d5-c3e4-4d97-89bf-8827e6804aac" -> "#0E6042D5"
 */
export const formatOrderIdWithHash = (orderId: string): string => {
    return `#${formatOrderId(orderId)}`;
};

/**
 * Cek apakah Order ID adalah UUID format
 */
export const isUUID = (orderId: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(orderId);
};
