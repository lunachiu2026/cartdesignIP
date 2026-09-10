export function resolveBannerImage(value) {
  const image = String(value || '').trim()
  if (!image || image.startsWith('data:') || /^https?:\/\//i.test(image)) return image
  if (image.startsWith('/images/')) {
    const base = String(import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    return `${base}${image}`
  }
  return image
}
