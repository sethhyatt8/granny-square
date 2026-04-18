/** Approximate hex for on-screen planning; adjust to match your skeins. */
export type YarnBrand = 'mainstays' | 'red-heart'

export type YarnColor = {
  id: string
  label: string
  hex: string
  brand: YarnBrand
}

export const YARN_PALETTE: YarnColor[] = [
  // Mainstays (Walmart) — first eight
  { id: 'ms-green', label: 'Green', hex: '#43A047', brand: 'mainstays' },
  { id: 'ms-yellow', label: 'Yellow', hex: '#FEE95F', brand: 'mainstays' },
  { id: 'ms-orange', label: 'Orange', hex: '#F28427', brand: 'mainstays' },
  { id: 'ms-pink', label: 'Pink', hex: '#E85D8A', brand: 'mainstays' },
  { id: 'ms-white', label: 'White', hex: '#F7F7F5', brand: 'mainstays' },
  { id: 'ms-gray', label: 'Gray', hex: '#8A9099', brand: 'mainstays' },
  { id: 'ms-teal', label: 'Teal', hex: '#26A69A', brand: 'mainstays' },
  { id: 'ms-purple', label: 'Purple', hex: '#6B2D8A', brand: 'mainstays' },
  // Red Heart — remainder (Super Saver–style names)
  {
    id: 'rh-aran',
    label: 'Aran',
    hex: '#F2EEE6',
    brand: 'red-heart',
  },
  { id: 'rh-burgundy', label: 'Burgundy', hex: '#6B1F34', brand: 'red-heart' },
  { id: 'rh-dusty-grey', label: 'Dusty grey', hex: '#8E9298', brand: 'red-heart' },
  {
    id: 'rh-forest-green',
    label: 'Forest green',
    hex: '#1E4D3A',
    brand: 'red-heart',
  },
  { id: 'rh-beige', label: 'Beige', hex: '#D9CBB3', brand: 'red-heart' },
  { id: 'rh-coffee', label: 'Coffee', hex: '#4A3728', brand: 'red-heart' },
  { id: 'rh-baby-blue', label: 'Baby blue', hex: '#A8D4F0', brand: 'red-heart' },
]

export const YARN_BY_ID = Object.fromEntries(
  YARN_PALETTE.map((y) => [y.id, y]),
) as Record<string, YarnColor>
