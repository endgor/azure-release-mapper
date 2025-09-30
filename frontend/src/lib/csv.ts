import Papa from 'papaparse'
import type { RegionAwareInventory } from './types'

function normalizeHeader(h?: string) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

function getField(row: any, keys: string[]): string {
  for (const k of keys) {
    if (row?.[k] != null && row[k] !== '') return String(row[k])
    for (const rk of Object.keys(row || {})) {
      if (normalizeHeader(rk) === normalizeHeader(k)) {
        const v = row[rk]
        if (v != null && v !== '') return String(v)
      }
    }
  }
  return ''
}

function normalizeResourceType(resourceType: string): string {
  if (!resourceType) return ''
  return resourceType.toLowerCase().trim()
}

function toResourceTypeFromCloudOps(row: any): string {
  const typeRaw = getField(row, ['type', 'Type', 'entity_type'])?.trim()
  const subTypeRaw = getField(row, ['sub_type', 'Sub_Type', 'subType', 'entity_sub_type'])?.trim()

  let resourceType = ''

  if (typeRaw && typeRaw.includes('/')) {
    resourceType = typeRaw
  } else if (typeRaw && subTypeRaw) {
    resourceType = `${typeRaw}/${subTypeRaw}`
  } else if (typeRaw) {
    resourceType = typeRaw
  } else if (subTypeRaw) {
    resourceType = subTypeRaw
  }

  return normalizeResourceType(resourceType)
}

function toResourceTypeFromAzure(row: any): string {
  const raw = row?.['RESOURCE TYPE'] ?? row?.['Resource Type'] ?? row?.['resource type']
  const resourceType = String(raw ?? '').trim()
  return normalizeResourceType(resourceType)
}

function isAzureAllResources(headers: string[]): boolean {
  const h = headers.map(normalizeHeader)
  return h.includes('resource_type') || h.includes('resource\u00a0type') || h.includes('resource\u2002type')
}

function isCloudOpsExport(headers: string[]): boolean {
  const h = headers.map(normalizeHeader)
  return h.includes('type') || h.includes('sub_type') || h.includes('entity_type')
}

function normalizeRegion(v?: string): string {
  const s = String(v || '').toLowerCase().trim()
  if (!s) return ''
  const t = s.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

  // Enhanced region mapping with more comprehensive coverage
  const map: Record<string, string> = {
    // Europe
    'weu': 'west europe',
    'westeurope': 'west europe',
    'west europe': 'west europe',
    'ne': 'north europe',
    'neu': 'north europe',
    'northeurope': 'north europe',
    'north europe': 'north europe',
    'northeurope ireland': 'north europe',
    'ireland': 'north europe',
    'swedencentral': 'sweden central',
    'sweden central': 'sweden central',
    'sdc': 'sweden central',
    'se': 'sweden central',
    'swedensouth': 'sweden south',
    'sweden south': 'sweden south',
    'uksouth': 'uk south',
    'uk south': 'uk south',
    'ukwest': 'uk west',
    'uk west': 'uk west',
    'francesouth': 'france south',
    'france south': 'france south',
    'francecentral': 'france central',
    'france central': 'france central',
    'paris': 'france central',
    'germanywestcentral': 'germany west central',
    'germany west central': 'germany west central',
    'frankfurt': 'germany west central',
    'switzerlandnorth': 'switzerland north',
    'switzerland north': 'switzerland north',
    'zurich': 'switzerland north',
    'norwayeast': 'norway east',
    'norway east': 'norway east',
    'oslo': 'norway east',

    // Asia Pacific
    'sea': 'southeast asia',
    'southeastasia': 'southeast asia',
    'southeast asia': 'southeast asia',
    'singapore': 'southeast asia',
    'eastasia': 'east asia',
    'east asia': 'east asia',
    'hong kong': 'east asia',
    'japaneast': 'japan east',
    'japan east': 'japan east',
    'tokyo': 'japan east',
    'japanwest': 'japan west',
    'japan west': 'japan west',
    'osaka': 'japan west',
    'koreacentral': 'korea central',
    'korea central': 'korea central',
    'seoul': 'korea central',
    'centralindia': 'central india',
    'central india': 'central india',
    'pune': 'central india',
    'southindia': 'south india',
    'south india': 'south india',
    'chennai': 'south india',
    'australiaeast': 'australia east',
    'australia east': 'australia east',
    'sydney': 'australia east',
    'australiasoutheast': 'australia southeast',
    'australia southeast': 'australia southeast',
    'melbourne': 'australia southeast',

    // Americas
    'eastus': 'east us',
    'east us': 'east us',
    'eus': 'east us',
    'eastus2': 'east us 2',
    'east us 2': 'east us 2',
    'eus2': 'east us 2',
    'westus': 'west us',
    'west us': 'west us',
    'wus': 'west us',
    'westus2': 'west us 2',
    'west us 2': 'west us 2',
    'wus2': 'west us 2',
    'westus3': 'west us 3',
    'west us 3': 'west us 3',
    'centralus': 'central us',
    'central us': 'central us',
    'cus': 'central us',
    'southcentralus': 'south central us',
    'south central us': 'south central us',
    'scus': 'south central us',
    'northcentralus': 'north central us',
    'north central us': 'north central us',
    'ncus': 'north central us',
    'canadacentral': 'canada central',
    'canada central': 'canada central',
    'toronto': 'canada central',
    'canadaeast': 'canada east',
    'canada east': 'canada east',
    'brazilsouth': 'brazil south',
    'brazil south': 'brazil south',
    'sao paulo': 'brazil south',

    // Middle East & Africa
    'uaenorth': 'uae north',
    'uae north': 'uae north',
    'dubai': 'uae north',
    'southafricanorth': 'south africa north',
    'south africa north': 'south africa north',
    'johannesburg': 'south africa north',
    'qatarcentral': 'qatar central',
    'qatar central': 'qatar central',
    'doha': 'qatar central'
  }

  if (map[t]) return map[t]
  return t
}

function getRegionField(row: any): string {
  const candidates = [
    'Location', 'location', 'Region', 'region', 'azure_region', 'Azure Region', 'geo', 'Geography',
    'entity_region', 'Entity Region', 'region_name', 'Region Name'
  ]
  for (const k of candidates) {
    if (row?.[k] != null && row[k] !== '') return normalizeRegion(String(row[k]))
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
