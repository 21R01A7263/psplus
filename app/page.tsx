"use client"

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'

type Category = 'games' | 'ubisoft' | 'classics' | 'monthly'

type Game = {
  id: number
  name: string
  imageUrl: string
  categories: Category[]
}

type ApiResp = Game[]

const TABS: { key: 'any' | Category; label: string }[] = [
  { key: 'any', label: 'any' },
  { key: 'games', label: 'Games catalogue' },
  { key: 'ubisoft', label: 'Ubisoft+ classics' },
  { key: 'classics', label: 'Classics catalogue' },
  { key: 'monthly', label: 'Monthly games' },
]

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function HomePage() {
  const [data, setData] = useState<ApiResp | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState<'any' | Category>('any')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounced(query, 300)

  const fetchData = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/psplus')
      if (!res.ok) throw new Error('Failed to load data')
      const json: ApiResp = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error')
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Reset tab to any when search query changes
  useEffect(() => { setActive('any') }, [debouncedQuery])

  const filtered = useMemo(() => {
    if (!data) return [] as Game[]
    let list = data
    if (active !== 'any') {
      list = list.filter(g => g.categories.includes(active))
    }
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase()
      list = list.filter(g => g.name.toLowerCase().includes(q))
    }
    // sort A-Z by name
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }, [data, active, debouncedQuery])

  const totalCount = data?.length ?? 0
  const visibleCount = filtered.length

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl noselect">
        <h1 className="text-3xl font-bold text-center">PS Plus Extra Games</h1>
        <p className="text-center text-gray-700 mt-2">
          {visibleCount} titles available this month{totalCount && visibleCount !== totalCount ? ` (of ${totalCount})` : ''}
        </p>

        {/* Search */}
        <div className="mt-6 flex items-center gap-2">
          <div className="relative w-full">
            <input
              aria-label="search"
              placeholder="search for a game..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black/30 bg-white text-black select-text"
            />
            {query && (
              <button
                aria-label="clear"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex flex-wrap gap-3">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t.key as any)}
              className={`px-5 py-2 rounded-xl border border-gray-400 ${active===t.key ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* States */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
            <div className="flex items-center justify-between">
              <span>Failed to load. {String(error)}</span>
              <button onClick={fetchData} className="rounded-md bg-black text-white px-3 py-1">Retry</button>
            </div>
          </div>
        )}

        {!data && !error && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] w-full bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {data && !error && visibleCount === 0 && (
          <div className="mt-10 text-center text-gray-600">No games found</div>
        )}

        {/* Grid */}
        {data && visibleCount > 0 && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filtered.map(g => (
              <div key={`${g.id}-${g.name}`} className="noselect">
                <div className="aspect-[3/4] w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-300">
                  {/* Image only; non-clickable */}
                  <Image
                    alt={g.name}
                    src={g.imageUrl}
                    width={300}
                    height={400}
                    className="h-full w-full object-cover"
                    draggable={false}
                    priority={false}
                  />
                </div>
                <div className="mt-2 text-center text-sm">{g.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
