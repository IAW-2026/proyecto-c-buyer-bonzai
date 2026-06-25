import { prisma } from '@/lib/prisma';
import { checkoutAddressSelectionSchema } from '../schema';

export type CheckoutBuyerProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  isComplete: boolean;
};

export type CheckoutShippingAddress = {
  id: string;
  label: string | null;
  address: string;
  apartment: string | null;
  floor: string | null;
  city: string;
  postalCode: string;
  province: string;
  country: string;
};

export type CheckoutShippingData = {
  profile: CheckoutBuyerProfile;
  addresses: CheckoutShippingAddress[];
};

export type CheckoutShippingSelection = {
  profile: Required<Omit<CheckoutBuyerProfile, 'isComplete'>>;
  address: CheckoutShippingAddress;
};

type BuyerProfileDefaults = {
  firstName?: string | null;
  lastName?: string | null;
};

export async function getCheckoutShippingData(
  clerkUserId: string,
  defaults: BuyerProfileDefaults = {},
): Promise<CheckoutShippingData> {
  const buyer = await prisma.buyerProfile.findUnique({
    where: { clerk_user_id: clerkUserId },
    include: {
      addresses: {
        orderBy: { created_at: 'asc' },
      },
    },
  });

  const storedProfile = {
    first_name: buyer?.first_name ?? '',
    last_name: buyer?.last_name ?? '',
    phone: buyer?.phone ?? '',
  };

  return {
    profile: {
      firstName: storedProfile.first_name || defaults.firstName?.trim() || '',
      lastName: storedProfile.last_name || defaults.lastName?.trim() || '',
      phone: storedProfile.phone,
      isComplete: isCompleteBuyerProfile(storedProfile),
    },
    addresses: buyer?.addresses.map(mapShippingAddress) ?? [],
  };
}

export async function getCheckoutShippingSelection(
  clerkUserId: string,
  addressId: string | null,
): Promise<CheckoutShippingSelection | null> {
  const result = checkoutAddressSelectionSchema.safeParse({ addressId });

  if (!result.success) {
    return null;
  }

  const address = await prisma.shippingAddress.findFirst({
    where: {
      id: result.data.addressId,
      buyer: {
        clerk_user_id: clerkUserId,
      },
    },
    include: {
      buyer: true,
    },
  });

  if (!address) {
    return null;
  }

  const profile = {
    firstName: address.buyer.first_name?.trim() ?? '',
    lastName: address.buyer.last_name?.trim() ?? '',
    phone: address.buyer.phone?.trim() ?? '',
  };

  if (!profile.firstName || !profile.lastName || !profile.phone) {
    return null;
  }

  return {
    profile,
    address: mapShippingAddress(address),
  };
}

export function formatShippingAddress(details: CheckoutShippingAddress) {
  return [
    details.address,
    details.apartment ? `Depto ${details.apartment}` : null,
    details.floor ? `Piso ${details.floor}` : null,
  ]
    .filter(Boolean)
    .join(', ');
}

function mapShippingAddress(address: {
  id: string;
  label: string | null;
  address: string;
  apartment: string | null;
  floor: string | null;
  city: string;
  postal_code: string;
  province: string;
  country: string;
}): CheckoutShippingAddress {
  return {
    id: address.id,
    label: address.label,
    address: address.address,
    apartment: address.apartment,
    floor: address.floor,
    city: address.city,
    postalCode: address.postal_code,
    province: address.province,
    country: address.country,
  };
}

function isCompleteBuyerProfile(profile: {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
}) {
  return Boolean(
    profile.first_name?.trim() &&
      profile.last_name?.trim() &&
      profile.phone?.trim(),
  );
}
