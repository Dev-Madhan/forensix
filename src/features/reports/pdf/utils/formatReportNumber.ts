export function formatReportNumber(index: number, pad = 2): string {
  return String(index).padStart(pad, "0");
}

export function formatSimilarity(score: number | null | undefined): string {
  if (score === null || score === undefined || isNaN(score)) return "Pending";
  // If score is 0 to 1, multiply by 100
  const normalized = score <= 1 ? score * 100 : score;
  return `${normalized.toFixed(1)}%`;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || isNaN(bytes)) return "Not recorded";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
