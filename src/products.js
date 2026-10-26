// Catalog of digital products. Prices are strings in USDC so they can be
// converted exactly with parseUnits (no floating point rounding).
export const products = [
  {
    id: 'classic',
    name: 'Classic Kirby',
    description: 'The original pink puffball on a sunny sky.',
    price: '0.50',
    image: '/products/classic.svg',
  },
  {
    id: 'sleepy',
    name: 'Sleepy Kirby',
    description: 'Nightcap on, dreaming under the moon.',
    price: '1.00',
    image: '/products/sleepy.svg',
  },
  {
    id: 'star-rider',
    name: 'Star Rider Kirby',
    description: 'Surfing the Warp Star at full speed.',
    price: '1.50',
    image: '/products/star-rider.svg',
  },
  {
    id: 'chef',
    name: 'Chef Kirby',
    description: 'Ready to cook something delicious.',
    price: '1.00',
    image: '/products/chef.svg',
  },
  {
    id: 'sword',
    name: 'Sword Kirby',
    description: 'Green cap and a trusty blade.',
    price: '2.00',
    image: '/products/sword.svg',
  },
  {
    id: 'snack',
    name: 'Hungry Kirby',
    description: 'Inhaling an apple. Classic move.',
    price: '0.25',
    image: '/products/snack.svg',
  },
]
