"use client";

import type { OrderTotals } from "@/types/cashier";

interface Props {
  totals: OrderTotals;
}

export default function Totals({
  totals,
}: Props) {

  return (
    <div className="space-y-3 border-t pt-5">

      <div className="flex justify-between">

        <span className="text-gray-500">
          Ara Toplam
        </span>

        <span className="font-semibold">
          {totals.subtotal.toLocaleString("tr-TR")} ₺
        </span>

      </div>


      <div className="flex justify-between">

        <span className="text-gray-500">
          İndirim
        </span>

        <span className="font-semibold">
          {totals.discount.toLocaleString("tr-TR")} ₺
        </span>

      </div>


      <div className="flex justify-between">

        <span className="text-gray-500">
          Servis
        </span>

        <span className="font-semibold">
          {totals.service.toLocaleString("tr-TR")} ₺
        </span>

      </div>


      <hr />


      <div className="flex justify-between text-2xl font-bold">

        <span>
          TOPLAM
        </span>

        <span>
          {totals.grandTotal.toLocaleString("tr-TR")} ₺
        </span>

      </div>

    </div>
  );
}