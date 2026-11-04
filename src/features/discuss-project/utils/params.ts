export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export function first(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function allowSlug(
  value: string | undefined,
  options: { slug: string }[],
): string | undefined {
  return value && options.some((option) => option.slug === value)
    ? value
    : undefined;
}
