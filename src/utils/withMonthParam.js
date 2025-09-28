export function withMonthParam(url, month) {
  if (!month) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}month=${encodeURIComponent(month)}`
}
