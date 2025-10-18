import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

export const revalidate = 21600 // 6h ISR for the route

const ENDPOINTS = [
  { key: 'games', url: 'https://www.playstation.com/bin/imagic/gameslist?locale=en-in&categoryList=plus-games-list' },
  { key: 'ubisoft', url: 'https://www.playstation.com/bin/imagic/gameslist?locale=en-in&categoryList=ubisoft-classics-list' },
  { key: 'classics', url: 'https://www.playstation.com/bin/imagic/gameslist?locale=en-in&categoryList=plus-classics-list' },
  { key: 'monthly', url: 'https://www.playstation.com/bin/imagic/gameslist?locale=en-in&categoryList=plus-monthly-games-list' }
] as const

type Category = typeof ENDPOINTS[number]['key']

type RawGame = {
  conceptId: number
  name: string
  imageUrl: string
}

type Game = {
  id: number
  name: string
  imageUrl: string
  categories: Category[]
}

function cors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  response.headers.set('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400')
  return response
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }))
}

// Memoized aggregator using Next's cache with ISR and tagging
const getGamesCached = unstable_cache(
  async () => {
    const settled = await Promise.allSettled(
      ENDPOINTS.map(e =>
        fetch(e.url, { next: { revalidate } })
          .then(r => r.json())
          .then((arr: any[]) => ({ key: e.key, arr }))
      )
    )

    const results: { key: Category; arr: any[] }[] = []
    let failed = 0
    for (const s of settled) {
      if (s.status === 'fulfilled') results.push(s.value)
      else failed++
    }

    const map = new Map<number, Game>()

    for (const { key, arr } of results) {
      for (const bucket of arr || []) {
        for (const g of (bucket.games || []) as RawGame[]) {
          const existing = map.get(g.conceptId)
          if (existing) {
            if (!existing.categories.includes(key)) existing.categories.push(key)
          } else {
            map.set(g.conceptId, {
              id: g.conceptId,
              name: g.name,
              imageUrl: g.imageUrl,
              categories: [key]
            })
          }
        }
      }
    }

    const list = Array.from(map.values())
    list.sort((a, b) => a.name.localeCompare(b.name))

    return { list, failed }
  },
  ['psplus-games-cache'],
  { revalidate, tags: ['games'] }
)

export async function GET() {
  try {
    const { list, failed } = await getGamesCached()

    const res = NextResponse.json(list, {
      headers: {
        // cache at the CDN/Edge for 1h; serve stale up to a week
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=604800'
      }
    })
    if (failed > 0) {
      res.headers.set('X-Partial-Data', 'true')
      res.headers.set('X-Partial-Failures', String(failed))
    }
    return cors(res)
  } catch (e: any) {
    return cors(NextResponse.json({ error: e?.message ?? 'Failed to fetch' }, { status: 500 }))
  }
}
