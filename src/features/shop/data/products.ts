import type { Product } from '@/features/shop/types';

const products: Product[] = [
  {
    id: 'monstera-deliciosa-grande',
    name: 'Monstera Deliciosa Grande',
    category: 'Tropical',
    careLabel: 'Easy Care',
    description:
      'A magnificent plant featuring deep fenestrations and a majestic silhouette. Native to southern Mexico.',
    price: 185,
    tags: ['Tropical', 'Easy Care'],
    imageAspect: 'featured',
    image: {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDvmzITdnPtiIPkS4rgeUp_sAQpecuSSqaLfyQX-_0G8ANMZDYUqT1AKQKZyM4gwPOIbPBW4ur3E3K7Ggm0BJLlbofNHZvcmKhuYU2ZI1PKgr4iG9qaRjGLlBEVjXwiMKTwZxNxYBY60d-G_VHhBCI0FStglHzyOQ1PKNUr74n8AcC0nyw4pMZ8G9RA9AckJRYlA-iz8isLEwG-O-FJ_XazVFBZwJmSa_oRALUsun28yPP9cvV6J_yYWzjdMdfYrt-3nvq9geEbeU',
      alt: 'Large architectural monstera deliciosa plant in a minimalist white ceramic pot against a soft beige wall with dappled sunlight shadows.',
    },
  },
  {
    id: 'juniperus-procumbens',
    name: 'Juniperus Procumbens',
    category: 'Arboreal',
    careLabel: 'Aged 12 Years',
    description:
      'An ancient juniper bonsai trained into a disciplined windswept silhouette.',
    price: 320,
    tags: ['Arboreal'],
    imageAspect: 'portrait',
    image: {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjvU-aq6DvysYjoiaH6Ddg5zTViLm0ZxdURQnbaM42_EedpgHuldr3Bwzk-RbeiXDzVx_skaEs--OFQ55IAf1JRz54gM2CSPQlorMbdOeLBbWV79NIOb58EQMn4wyQe59Rgr_gN1ZIgnr8F55PqQ6EO8Yh6CAeEHZL2Lakkilvx-cbn0EkBMuoCksoMNm4NzqlndoZkMdDoEyfm0x_YE8D4laX7REaZVe_Ksy3nRkcnh77vwDC-zaLx9GxzbyT9YcPg_Vntq1jv_I',
      alt: 'Ancient juniper bonsai tree in a shallow handmade clay pot on a dark wooden pedestal with a soft focused background.',
    },
  },
  {
    id: 'echeveria-rose',
    name: "Echeveria 'Rose'",
    category: 'Desert Flora',
    careLabel: 'High Light',
    description:
      'A compact succulent with geometric rosette symmetry and warm blush edges.',
    price: 42,
    tags: ['Desert Flora'],
    imageAspect: 'square',
    image: {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8coPgVacCN9UrzqL2Phdeckpjh1uwOImKbj7nzhGA6Iq_aDIWsSfwi4io8BH6F7LWCReppcqrauUseihhvDagl3cq79veKKZ-IxmzTPT-Y3CHMD7JwTi8H5z1V4ZJIQCn07VJoTVJ9kEtCx1OZATdW6UqQzkOTxMNPiHkMEAwnxDOihVqpzBu_8ZiAg0QCUCJEfBb5VdQtjBw98WOzmYfwicBiezcwnGqrfUGxK5RlOfaiRwj-BrEHRjYj5JNmADo5hvrTNVuzoU',
      alt: 'Close-up of a rare variegated succulent showing intricate geometric patterns and soft pink edges in bright natural morning light.',
    },
  },
  {
    id: 'ficus-lyrata-bambino',
    name: 'Ficus Lyrata Bambino',
    category: 'Tropical',
    careLabel: 'Indoors',
    description:
      'A sculptural fiddle leaf fig with glossy leaves and a compact indoor posture.',
    price: 68,
    tags: ['Tropical'],
    imageAspect: 'square',
    image: {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp8Om9nQmPO1H_sullz3caXsUA03uM-l7LExPQn10bUS77Y739lavmGSmr6Uf2-xj9-4xAF9cg1wcALRtoJoisoEW-LS9WrtCIQMRSMT2FJAuapC6T1yPG3jN6sHTAM1yzeYaABskg8EPpIi_HRjioF55M9bPTlCpNpJphzohDZdZtNtvclsKT6O7HP6QT_RDMAwsHx2s9B3yGfekm8o7S9XCdu2-SjmoROXaqkWZ1PAsE2RvdRRJt_9q2JPpRJ9hj2EY1CJYRuwA',
      alt: 'Stunning fiddle leaf fig tree with large glossy leaves in a matte black designer pot positioned next to a large floor-to-ceiling window.',
    },
  },
  {
    id: 'cura-vessel-no-4',
    name: 'Cura Vessel No. 4',
    category: 'Accessories',
    careLabel: 'Handmade Ceramic',
    description:
      'An artisan ceramic vessel in grounded earth tones for elevated plant staging.',
    price: 115,
    tags: ['Accessories'],
    imageAspect: 'square',
    image: {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdutgNlT7yZuZ2fJt4SNa_X8-H4lPH7_fxBCV7moR1rIYsU2WMvqo4NnWHYi9U5_kW8dT1N4YHOw9Heq4EYA9Jb1qJK4_V4p7i-KIkbWg59rnmYuhnIfwJ8dYUWkS3czxMXjTaBPQtaXQTamvXuzi4YCYrdDEK1kSVL9ODlhRiQ843ATrpa8dyfBRK_tkKwRgnmylOq7DF1HqWEqOlAF4dz4CtCAj8sEXJPl8kTiUsW14pKSaa7nSkD1jeIJupvKnoWvHh-l3s4Vw',
      alt: 'Collection of artisan handmade ceramic plant pots in earth tones like terracotta, charcoal, and sand, arranged on a stone ledge.',
    },
  },
];

export async function getProducts() {
  return products;
}

export async function getProductById(id: string) {
  return products.find((product) => product.id === id) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 3) {
  const productTags = new Set(product.tags);

  return products
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => ({
      product: candidate,
      score:
        (candidate.category === product.category ? 4 : 0) +
        candidate.tags.filter((tag) => productTags.has(tag)).length * 2 +
        (candidate.careLabel === product.careLabel ? 1 : 0),
    }))
    .sort(
      (current, next) =>
        next.score - current.score ||
        current.product.name.localeCompare(next.product.name),
    )
    .slice(0, limit)
    .map(({ product: candidate }) => candidate);
}

export async function getProductCategories() {
  return Array.from(new Set(products.map((product) => product.category)))
    .filter((category) => category !== 'Accessories')
    .sort();
}

export type ProductSearchItem = {
  id: string;
  label: string;
  type: 'product' | 'category' | 'tag';
  detail?: string;
};

export async function getProductSearchItems(): Promise<ProductSearchItem[]> {
  const categories = await getProductCategories();
  const tags = Array.from(
    new Set(products.flatMap((product) => product.tags)),
  ).sort();

  return [
    ...products.map((product) => ({
      id: product.id,
      label: product.name,
      type: 'product' as const,
      detail: product.category,
    })),
    ...categories.map((category) => ({
      id: category,
      label: category,
      type: 'category' as const,
      detail: 'Category',
    })),
    ...tags.map((tag) => ({
      id: tag,
      label: tag,
      type: 'tag' as const,
      detail: 'Care note',
    })),
  ];
}

export async function searchProducts({
  query,
  category,
}: {
  query?: string;
  category?: string;
}) {
  const normalizedQuery = query?.trim().toLowerCase() ?? '';
  const normalizedCategory = category?.trim().toLowerCase() ?? '';

  return products.filter((product) => {
    const matchesCategory = normalizedCategory
      ? product.category.toLowerCase() === normalizedCategory
      : true;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      product.name,
      product.category,
      product.careLabel,
      product.description,
      ...product.tags,
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}
