export type CacheGetSet = {
  get: (key: string) => Promise<any | null>
  set: (key: string, value: any, ttlSeconds: number) => Promise<void>
}

let client: CacheGetSet | null = null

export function getCache(): CacheGetSet {
  if (client) return client
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    // Fallback in-memory cache for dev/preview. Not for production traffic.
    const mem = new Map<string, { v: any; exp: number }>()
    client = {
      async get(key) {
        const e = mem.get(key)
        if (!e) return null
        if (Date.now() > e.exp) {
          mem.delete(key)
          return null
        }
        return e.v
      },
      async set(key, value, ttl) {
        mem.set(key, { v: value, exp: Date.now() + ttl * 1000 })
      },
    }
    return client
  }

  client = {
    async get(key) {
      const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      if (!res.ok) return null
      const data = await res.json()
      return data?.result ?? null
    },
    async set(key, value, ttl) {
      await fetch(`${url}/set/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ value, ex: ttl }),
      })
    },
  }
  return client
}
