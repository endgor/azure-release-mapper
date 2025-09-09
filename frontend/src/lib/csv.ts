import Papa from 'papaparse'
import type { RegionAwareInventory } from './types'

export interface ResourceTypeCount {
  type: string
  count: number
}

function normalizeHeader(h?: string) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

function getField(row: any, keys: string[]): string {
  for (const k of keys) {
    if (row?.[k] != null && row[k] !== '') return String(row[k])
    // try loose header match by normalizing keys
    for (const rk of Object.keys(row || {})) {
      if (normalizeHeader(rk) === normalizeHeader(k)) {
        const v = row[rk]
        if (v != null && v !== '') return String(v)
      }
    }
  }
  return ''
}

function toResourceTypeFromCloudOps(row: any): string {
  const typeRaw = getField(row, ['type', 'Type', 'entity_type'])?.trim()
  const subTypeRaw = getField(row, ['sub_type', 'Sub_Type', 'subType', 'entity_sub_type'])?.trim()

  // If already looks like Microsoft.Provider/resourceType, use as-is
  if (typeRaw && typeRaw.includes('/')) return typeRaw

  // If provider + resource available, combine
  if (typeRaw && subTypeRaw) {
    return `${typeRaw}/${subTypeRaw}`
  }

  // Fallbacks
  if (typeRaw) return typeRaw
  if (subTypeRaw) return subTypeRaw
  return ''
}

function toResourceTypeFromAzure(row: any): string {
  const raw = row?.['RESOURCE TYPE'] ?? row?.['Resource Type'] ?? row?.['resource type']
  return String(raw ?? '').trim()
}

function isAzureAllResources(headers: string[]): boolean {
  const h = headers.map(normalizeHeader)
  return h.includes('resource_type') || h.includes('resource\u00a0type') || h.includes('resource\u2002type')
}

function isCloudOpsExport(headers: string[]): boolean {
  const h = headers.map(normalizeHeader)
  // Minimal signal is a 'type' column, often with 'sub_type' alongside
  return h.includes('type') || h.includes('sub_type') || h.includes('entity_type')
}

export async function parseResourceCsv(file: File): Promise<Map<string, number>> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const map = new Map<string, number>()
        const rows = (res.data as any[]) || []
        const headers: string[] = (res.meta?.fields as string[]) || []

        const azure = isAzureAllResources(headers)
        const cloudops = isCloudOpsExport(headers)

        for (const row of rows) {
          let rt = ''
          if (azure) {
            rt = toResourceTypeFromAzure(row)
          } else if (cloudops) {
            rt = toResourceTypeFromCloudOps(row)
          } else {
            // Auto-detect per-row fallback
            rt = toResourceTypeFromAzure(row) || toResourceTypeFromCloudOps(row)
          }
          rt = String(rt || '').trim()
          if (!rt) continue
          map.set(rt, (map.get(rt) ?? 0) + 1)
        }
        resolve(map)
      },
      error: (err) => reject(err)
    })
  })
}

// Back-compat: keep old name as alias
export const parseAzureCsv = parseResourceCsv

// --- Region-aware parsing ---

function normalizeRegion(v?: string): string {
  const s = String(v || '').toLowerCase().trim()
  if (!s) return ''
  // Normalize common punctuation/spacing
  const t = s.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  // Map a few known short forms and variants
  const map: Record<string, string> = {
    'weu': 'west europe',
    'westeurope': 'west europe',
    'ne': 'north europe',
    'northeurope': 'north europe',
    'swedencentral': 'sweden central',
    'se': 'sweden central',
    'sea': 'southeast asia',
    'southeastasia': 'southeast asia',
    'eastus': 'east us',
    'eastus2': 'east us 2',
    'westus': 'west us',
    'westus2': 'west us 2',
    'uksouth': 'uk south',
    'ukwest': 'uk west',
    'northeurope (ireland)': 'north europe',
  }
  if (map[t]) return map[t]
  return t
}

function getRegionField(row: any): string {
  // Try common headers for Azure exports and CloudOps
  const candidates = [
    'Location', 'location', 'Region', 'region', 'azure_region', 'Azure Region', 'geo', 'Geography',
    'entity_region', 'Entity Region', 'region_name', 'Region Name'
  ]
  for (const k of candidates) {
    if (row?.[k] != null && row[k] !== '') return normalizeRegion(String(row[k]))
    // try normalized header match
    for (const rk of Object.keys(row || {})) {
      if (normalizeHeader(rk) === normalizeHeader(k)) {
        const v = row[rk]
        if (v != null && v !== '') return normalizeRegion(String(v))
      }
    }
  }
  return ''
}

export async function parseResourceCsvWithRegions(file: File): Promise<RegionAwareInventory> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const byType = new Map<string, number>()
        const regions = new Set<string>()
        const rows = (res.data as any[]) || []
        const headers: string[] = (res.meta?.fields as string[]) || []

        const azure = isAzureAllResources(headers)
        const cloudops = isCloudOpsExport(headers)

        for (const row of rows) {
          let rt = ''
          if (azure) {
            rt = toResourceTypeFromAzure(row)
          } else if (cloudops) {
            rt = toResourceTypeFromCloudOps(row)
          } else {
            rt = toResourceTypeFromAzure(row) || toResourceTypeFromCloudOps(row)
          }
          rt = String(rt || '').trim()
          if (!rt) continue
          byType.set(rt, (byType.get(rt) ?? 0) + 1)

          const region = getRegionField(row)
          if (region) regions.add(region)
        }
        resolve({ byType, regions })
      },
      error: (err) => reject(err)
    })
  })
}
