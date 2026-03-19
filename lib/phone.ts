/** Keep digits only for duplicate detection (E.164-style uniqueness). */
export function normalizePhoneDigits(input: string): string {
  return (input ?? "").replace(/\D/g, "");
}

export function isValidPhoneDigits(digits: string): boolean {
  return digits.length >= 10 && digits.length <= 15;
}
