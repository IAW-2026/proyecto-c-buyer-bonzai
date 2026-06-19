import { getBuyerOrders } from '@/server/services/seller-api';

export async function getOrdersForBuyer(buyerId: string) {
  return getBuyerOrders(buyerId);
}
