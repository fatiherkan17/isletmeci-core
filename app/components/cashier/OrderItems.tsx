"use client";

import type { OrderItem } from "@/types/cashier";

interface Props {
  items: OrderItem[];

  onIncrease: (productId: string) => void;

  onDecrease: (productId: string) => void;

  onRemove: (productId: string) => void;
}

export default function OrderItems({
  items,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {

  if (items.length === 0) {
    return (
      <div className="border rounded-xl p-6 text-center text-gray-400">
        Henüz ürün eklenmedi.
      </div>
    );
  }


  return (
    <div className="space-y-3">

      {items.map((item) => (

        <div
          key={item.productId}
          className="border rounded-xl p-4"
        >

          <div className="flex justify-between">

            <div>

              <div className="font-bold">
                {item.name}
              </div>

              <div className="text-sm text-gray-500">
                {item.unitPrice.toLocaleString("tr-TR")} ₺
              </div>

            </div>


            <button
              onClick={() => onRemove(item.productId)}
              className="text-red-500"
            >
              ✕
            </button>

          </div>


          <div className="flex items-center justify-between mt-4">


            <div className="flex items-center gap-3">


              <button
                onClick={() => onDecrease(item.productId)}
                className="w-8 h-8 rounded bg-gray-200"
              >
                -
              </button>


              <span className="font-bold">
                {item.quantity}
              </span>


              <button
                onClick={() => onIncrease(item.productId)}
                className="w-8 h-8 rounded bg-gray-200"
              >
                +
              </button>


            </div>



            <div className="font-bold text-lg">

              {item.total.toLocaleString("tr-TR")} ₺

            </div>


          </div>


        </div>

      ))}


    </div>
  );
}