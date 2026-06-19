export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'AWAITING_TRACKING'
  | 'SHIPPED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED';

export type ShipmentStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export type TransactionStatus =
  | 'PENDING'
  | 'HELD'
  | 'DELIVERED'
  | 'DISPUTED'
  | 'COMPLETED'
  | 'REFUNDED';

export type PurchaseOrderItem = {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type PurchaseShipment = {
  id: string;
  trackingId: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  status: ShipmentStatus;
  deliveryAddress: string;
  deliveredAt: string | null;
  operatorId: string | null;
  driverId: string | null;
  createdAt: string;
};

export type PurchaseTransaction = {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  currency: string;
};

export type PurchaseHistoryOrder = {
  id: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  total: number;
  transactionId: string;
  createdAt: string;
  items: PurchaseOrderItem[];
  shipment: PurchaseShipment;
  transaction: PurchaseTransaction;
};
