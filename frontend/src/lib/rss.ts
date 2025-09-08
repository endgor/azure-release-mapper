import type { ReleaseItem } from './types'

export async function fetchRss(): Promise<ReleaseItem[]> {
  const res = await fetch('/api/rss')
  if (!res.ok) throw new Error('Failed to fetch RSS')
  const data = await res.json()
  const items = (data.items || []) as any[]
  return items.map(i => ({
    id: String(i.id ?? i.link ?? i.title ?? ''),
    title: String(i.title ?? ''),
    link: String(i.link ?? ''),
    published: String(i.published ?? ''),
    summary: String(i.summary ?? ''),
    categories: Array.isArray(i.categories) ? i.categories : []
  }))
}

