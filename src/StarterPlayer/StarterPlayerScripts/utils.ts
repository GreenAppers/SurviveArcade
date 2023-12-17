/**
 * Reformat a number to a string with a thousands separator.
 */
export function formatInteger(value: unknown) {
  return tostring(value)
    .reverse()
    .gsub('%d%d%d', '%1,')[0]
    .reverse()
    .gsub('^,', '')[0]
}
