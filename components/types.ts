export type Category = 'games' | 'ubisoft' | 'classics' | 'monthly'

export type Game = {
  id: number
  name: string
  imageUrl: string
  categories: Category[]
}
