import Papa from 'papaparse'

export interface ResourceTypeCount {
  type: string
  count: number
}

export async function parseAzureCsv(file: File): Promise<Map<string, number>> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const map = new Map<string, number>()
        const rows = (res.data as any[]) || []
        for (const row of rows) {
          const raw = row?.['RESOURCE TYPE'] ?? row?.['Resource Type'] ?? row?.['resource type']
          const rt = String(raw ?? '').trim()
          if (!rt) continue
          map.set(rt, (map.get(rt) ?? 0) + 1)
        }
        resolve(map)
      },
      error: (err) => reject(err)
    })
  })
}

