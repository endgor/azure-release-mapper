import type { Request } from 'express'

interface ReleaseItem {
  id: string
  title: string
  summary?: string
  link?: string
  published?: string
}

const OLLAMA_HOST = process.env.OLLAMA_HOST || '127.0.0.1'
const OLLAMA_PORT = process.env.OLLAMA_PORT || '11434'
const OLLAMA_URL = `http://${OLLAMA_HOST}:${OLLAMA_PORT}/api/generate`
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'phi3.5:mini'

function buildPrompt(release: ReleaseItem, resourceTypes: string[]) {
  return `You are matching Azure release notes to Azure Resource Manager (ARM) resource types from Azure Portal. Map the single release provided to zero or more of the ARM resource types below.\n\nImportant: Azure product names often differ from ARM types. For example: Microsoft.Logic/workflows ≈ Azure Logic Apps; Microsoft.Web/sites ≈ App Service; Microsoft.Network/publicIPAddresses ≈ Public IP addresses; Microsoft.Storage/storageAccounts ≈ Storage accounts. Prefer correct Azure product naming when reasoning, but only return the ARM types given.\n\nRelease:\nTitle: ${release.title}\nSummary: ${release.summary || ''}\n\nARM resource types (choose from these only):\n${resourceTypes.join(', ')}\n\nReturn strictly valid JSON array with items: {"resource_type": string, "confidence": number (0-1), "impact_summary": string (<= 40 words)}. Do not include any preamble or extra keys or text.`
}

export async function analyzeReleaseWithOllama(release: ReleaseItem, resourceTypes: string[], model?: string) {
  const prompt = buildPrompt(release, resourceTypes)
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: model || DEFAULT_MODEL, prompt, stream: false })
  })
  if (!res.ok) throw new Error('Ollama request failed')
  const data = await res.json().catch(() => ({} as any))
  const text: string = (data && (data.response || data.message || '')) || ''
  let arr: any[] = []
  try { arr = JSON.parse(text) } catch { arr = [] }
  return arr
}

