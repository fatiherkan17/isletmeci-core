import type { OrderItem, OrderTotals, Product } from "@/types/cashier";

export function addProduct(
  items: OrderItem[],
  product: Product
): OrderItem[] {
  const existing = items.find(
    (item) => item.productId === product.id
  );

  if (existing) {
    return items.map((item) =>
      item.productId === product.id
        ? {
            ...item,
            quantity: item.quantity + 1,
            total: (item.quantity + 1) * item.unitPrice,
          }
        : item
    );
  }

  return [
    ...items,
    {
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity: 1,
      total: product.price,
      image: product.image ?? null,
    },
  ];
}

export function increaseQuantity(
  items: OrderItem[],
  productId: string
): OrderItem[] {
  return items.map((item) =>
    item.productId === productId
      ? {
          ...item,
          quantity: item.quantity + 1,
          total: (item.quantity + 1) * item.unitPrice,
        }
      : item
  );
}

export function decreaseQuantity(
  items: OrderItem[],
  productId: string
): OrderItem[] {
  return items
    .map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity: item.quantity - 1,
            total: (item.quantity - 1) * item.unitPrice,
          }
        : item
    )
    .filter((item) => item.quantity > 0);
}

export function removeProduct(
  items: OrderItem[],
  productId: string
): OrderItem[] {
  return items.filter(
    (item) => item.productId !== productId
  );
}

export function calculateTotals(
  items: OrderItem[],
  discount = 0,
  service = 0
): OrderTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return {
    subtotal,
    discount,
    service,
    grandTotal: subtotal - discount + service,
  };
}