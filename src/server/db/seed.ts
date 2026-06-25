import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const SELLER_API_URL = "https://proyecto-c-seller-bonzai.vercel.app";
const SEED_CLERK_PREFIX = "user_seed_";
const BUYER_COUNT = 30;

type SellerProduct = {
  id: string;
  name: string;
  stock: number;
  isActive: boolean;
  suspended: boolean;
};

type SellerBrowseResponse = {
  products: SellerProduct[];
};

type SeedBuyer = {
  id: string;
  clerkUserId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
  addresses: SeedAddress[];
  cart: SeedCart | null;
};

type SeedAddress = {
  id: string;
  label: string | null;
  address: string;
  apartment: string | null;
  floor: string | null;
  city: string;
  postalCode: string;
  province: string;
  createdAt: Date;
  updatedAt: Date;
};

type SeedCart = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  items: SeedCartItem[];
};

type SeedCartItem = {
  id: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};

const people = [
  ["Ana", "Pereyra"],
  ["Mateo", "Sosa"],
  ["Lucia", "Fernandez"],
  ["Tomas", "Gimenez"],
  ["Martina", "Rojas"],
  ["Julian", "Acosta"],
  ["Camila", "Molina"],
  ["Nicolas", "Silva"],
  ["Valentina", "Castro"],
  ["Santiago", "Medina"],
  ["Sofia", "Romero"],
  ["Bautista", "Herrera"],
  ["Agustina", "Vega"],
  ["Federico", "Mendez"],
  ["Florencia", "Ibarra"],
  ["Bruno", "Luna"],
  ["Emilia", "Cabrera"],
  ["Joaquin", "Peralta"],
  ["Renata", "Arias"],
  ["Ignacio", "Campos"],
  ["Mia", "Coronel"],
  ["Lautaro", "Navarro"],
  ["Paula", "Farias"],
  ["Franco", "Benitez"],
  ["Malena", "Suarez"],
  ["Dante", "Roldan"],
  ["Carolina", "Villar"],
  ["Manuel", "Bravo"],
  ["Victoria", "Quiroga"],
  ["Facundo", "Nuñez"],
] as const;

const addressPool = [
  ["Casa", "Av. Santa Fe 2841", "Ciudad Autonoma de Buenos Aires", "Buenos Aires", "C1425"],
  ["Departamento", "Obispo Trejo 742", "Cordoba", "Cordoba", "X5000"],
  ["Trabajo", "San Martin 1130", "Rosario", "Santa Fe", "S2000"],
  ["Casa", "Belgrano 451", "Mendoza", "Mendoza", "M5500"],
  ["Departamento", "Mitre 902", "La Plata", "Buenos Aires", "B1900"],
  ["Casa", "Sarmiento 1776", "Mar del Plata", "Buenos Aires", "B7600"],
  ["Trabajo", "Urquiza 620", "Parana", "Entre Rios", "E3100"],
  ["Casa", "Rivadavia 1450", "Salta", "Salta", "A4400"],
] as const;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await getSeedProducts();
  const seedBuyers = buildSeedBuyers(products);

  await deleteSeedData();
  await createSeedData(seedBuyers);

  const cartCount = seedBuyers.filter((buyer) => buyer.cart !== null).length;
  const cartItemCount = seedBuyers.reduce(
    (total, buyer) => total + (buyer.cart?.items.length ?? 0),
    0,
  );

  console.info(`Seeded ${seedBuyers.length} buyer profiles.`);
  console.info(`Seeded ${cartCount} carts with ${cartItemCount} cart items.`);
  console.info(`Used ${products.length} active seller products.`);
}

async function deleteSeedData() {
  const seedBuyerWhere = {
    buyer: { clerk_user_id: { startsWith: SEED_CLERK_PREFIX } },
  };

  await prisma.cartItem.deleteMany({ where: { cart: seedBuyerWhere } });
  await prisma.cart.deleteMany({ where: seedBuyerWhere });
  await prisma.shippingAddress.deleteMany({ where: seedBuyerWhere });
  await prisma.buyerProfile.deleteMany({
    where: { clerk_user_id: { startsWith: SEED_CLERK_PREFIX } },
  });
}

async function createSeedData(seedBuyers: SeedBuyer[]) {
  await prisma.buyerProfile.createMany({
    data: seedBuyers.map((buyer) => ({
      id: buyer.id,
      clerk_user_id: buyer.clerkUserId,
      first_name: buyer.firstName,
      last_name: buyer.lastName,
      phone: buyer.phone,
      created_at: buyer.createdAt,
      updated_at: buyer.updatedAt,
    })),
  });

  const addresses = seedBuyers.flatMap((buyer) =>
    buyer.addresses.map((address) => ({ buyerId: buyer.id, address })),
  );

  if (addresses.length > 0) {
    await prisma.shippingAddress.createMany({
      data: addresses.map(({ buyerId, address }) => ({
        id: address.id,
        buyer_id: buyerId,
        label: address.label,
        address: address.address,
        apartment: address.apartment,
        floor: address.floor,
        city: address.city,
        postal_code: address.postalCode,
        province: address.province,
        created_at: address.createdAt,
        updated_at: address.updatedAt,
      })),
    });
  }

  const carts = seedBuyers.flatMap((buyer) =>
    buyer.cart === null ? [] : [{ buyerId: buyer.id, cart: buyer.cart }],
  );

  if (carts.length > 0) {
    await prisma.cart.createMany({
      data: carts.map(({ buyerId, cart }) => ({
        id: cart.id,
        buyer_id: buyerId,
        created_at: cart.createdAt,
        updated_at: cart.updatedAt,
      })),
    });

    const items = carts.flatMap(({ cart }) =>
      cart.items.map((item) => ({ cartId: cart.id, item })),
    );

    if (items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map(({ cartId, item }) => ({
          id: item.id,
          cart_id: cartId,
          product_id: item.productId,
          quantity: item.quantity,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
        })),
      });
    }
  }
}

function buildSeedBuyers(products: SellerProduct[]) {
  const productUsage = new Map<string, number>();

  return Array.from({ length: BUYER_COUNT }, (_, index): SeedBuyer => {
    const [firstName, lastName] = people[index];
    const createdAt = daysAgo(3 + index * 3);
    const profileIncomplete = index % 10 === 2;
    const withoutAddress = index % 7 === 5;
    const emptyCart = index % 8 === 6;
    const withoutCart = index % 12 === 11;
    const cartUpdatedAt = daysAgo(getCartAgeInDays(index));

    return {
      id: seedId("buyer", index),
      clerkUserId: `${SEED_CLERK_PREFIX}${String(index + 1).padStart(2, "0")}`,
      firstName,
      lastName: profileIncomplete ? null : lastName,
      phone: profileIncomplete ? null : `+54 9 11 5555-${String(1000 + index)}`,
      createdAt,
      updatedAt: maxDate(createdAt, daysAgo(Math.max(1, index % 18))),
      addresses: withoutAddress ? [] : buildAddresses(index, createdAt),
      cart: withoutCart
        ? null
        : {
            id: seedId("cart", index),
            createdAt: maxDate(createdAt, daysAgo(2 + (index % 24))),
            updatedAt: cartUpdatedAt,
            items: emptyCart
              ? []
              : buildCartItems(index, products, productUsage, cartUpdatedAt),
          },
    };
  });
}

function buildAddresses(index: number, createdAt: Date): SeedAddress[] {
  const addressCount = index % 6 === 0 ? 2 : 1;

  return Array.from({ length: addressCount }, (_, addressIndex): SeedAddress => {
    const [label, address, city, province, postalCode] =
      addressPool[(index + addressIndex) % addressPool.length];

    return {
      id: seedId("address", index * 2 + addressIndex),
      label: addressIndex === 1 ? "Alternativa" : label,
      address,
      apartment: index % 3 === 0 ? String((index % 8) + 1) : null,
      floor: index % 4 === 0 ? String((index % 12) + 1) : null,
      city,
      postalCode,
      province,
      createdAt: maxDate(createdAt, daysAgo(index % 45)),
      updatedAt: daysAgo(index % 21),
    };
  });
}

function buildCartItems(
  buyerIndex: number,
  products: SellerProduct[],
  productUsage: Map<string, number>,
  updatedAt: Date,
): SeedCartItem[] {
  if (products.length === 0) {
    return [];
  }

  const itemCount = 1 + (buyerIndex % 4);
  const items: SeedCartItem[] = [];
  let cursor = buyerIndex * 3;

  while (items.length < itemCount && cursor < products.length * 4) {
    const product = products[cursor % products.length];
    const used = productUsage.get(product.id) ?? 0;
    const quantity = Math.min(1 + ((buyerIndex + items.length) % 3), product.stock - used);

    if (quantity > 0) {
      productUsage.set(product.id, used + quantity);
      items.push({
        id: seedId("item", buyerIndex * 4 + items.length),
        productId: product.id,
        quantity,
        createdAt: maxDate(daysAgo(90), daysAgo(getCartAgeInDays(buyerIndex) + 1)),
        updatedAt,
      });
    }

    cursor += 1;
  }

  return items;
}

async function getSeedProducts() {
  try {
    const url = new URL("/api/products/browse", SELLER_API_URL);
    url.searchParams.set("limit", "100");

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Seller API responded with ${response.status}`);
    }

    const payload = (await response.json()) as SellerBrowseResponse;
    const products = payload.products
      .filter((product) => product.isActive && !product.suspended && product.stock > 0)
      .sort((current, next) => next.stock - current.stock)
      .slice(0, 60);

    if (products.length === 0) {
      throw new Error("Seller API returned no active products with stock");
    }

    return products;
  } catch (error) {
    console.warn(
      `Could not fetch seller products for cart seed: ${getErrorMessage(error)}`,
    );

    return [];
  }
}

function getCartAgeInDays(index: number) {
  if (index % 5 === 0) return 38 + (index % 17);
  if (index % 4 === 0) return 16 + (index % 11);
  if (index % 3 === 0) return 8 + (index % 6);

  return index % 7;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);

  return date;
}

function maxDate(current: Date, next: Date) {
  return current > next ? current : next;
}

function seedId(kind: "buyer" | "address" | "cart" | "item", index: number) {
  return `seed-${kind}-${String(index + 1).padStart(3, "0")}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
