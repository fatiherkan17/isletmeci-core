"use client";

import { useState } from "react";

import ProductModal from "./ProductModal";
import OrderItems from "./OrderItems";
import Totals from "./Totals";

import type {
  CashierTable,
  OrderItem,
  OrderTotals,
  Product,
} from "@/types/cashier";

interface Props {
  table: CashierTable | null;

  items: OrderItem[];

  totals: OrderTotals;

  productModalOpen: boolean;

  setProductModalOpen: (value: boolean) => void;

  onAddProduct: (product: Product) => void;

  onIncrease: (productId: string) => void;

  onDecrease: (productId: string) => void;

  onRemove: (productId: string) => void;

  onUpdateStatus: (
    status:
      | "PREPARING"
      | "READY"
      | "PAID"
      | "CANCELLED"
  ) => void;

  onPayment: (paymentType: string) => void;
}

export default function OrderPanel({
  table,
  items,
  totals,
  productModalOpen,
  setProductModalOpen,
  onAddProduct,
  onIncrease,
  onDecrease,
  onRemove,
  onUpdateStatus,
  onPayment,
}: Props) {
  const [paymentOpen, setPaymentOpen] = useState(false);

  const hasTable = table !== null;

  const hasOrder =
    hasTable &&
    table.order !== null &&
    table.order !== undefined;

  return (
    <>
      {/* =====================================================
          ADİSYON
      ====================================================== */}

      <aside
        className="
          bg-white
          rounded-2xl
          shadow
          p-6
          sticky
          top-6
        "
      >
        {/* ===================================================
            BAŞLIK
        ==================================================== */}

        <div
          className="
            border-b
            border-gray-200
            pb-5
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div>
              <h2
                className="
                  text-2xl
                  font-bold
                  text-gray-900
                "
              >
                Adisyon
              </h2>

              <p
                className="
                  text-sm
                  text-gray-500
                  mt-2
                "
              >
                {hasTable
                  ? table.name
                  : "Masa seçiniz"}
              </p>
            </div>

            {hasTable && (
              <div className="text-right">
                <div
                  className="
                    text-xs
                    text-gray-400
                  "
                >
                  Masa
                </div>

                <div
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                  "
                >
                  {table.number}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            DURUM
        ==================================================== */}

        {hasTable && (
          <div
            className="
              mt-5
              rounded-xl
              bg-gray-50
              border
              border-gray-200
              px-4
              py-3
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <span
                className="
                  text-sm
                  text-gray-500
                "
              >
                Durum
              </span>

              <span
                className="
                  text-sm
                  font-bold
                  text-gray-800
                "
              >
                {table.status === "EMPTY"
                  ? "Boş"
                  : table.status === "MENU_OPEN"
                  ? "Menü Açık"
                  : table.status === "ORDERED"
                  ? "Sipariş Alındı"
                  : table.status === "PREPARING"
                  ? "Hazırlanıyor"
                  : table.status === "READY"
                  ? "Hazır"
                  : table.status === "PAYMENT"
                  ? "Hesap Bekliyor"
                  : "Kapalı"}
              </span>
            </div>
          </div>
        )}

        {/* ===================================================
            ÜRÜNLER
        ==================================================== */}

        <div className="mt-6">
          {hasTable ? (
            <OrderItems
              items={items}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              onRemove={onRemove}
            />
          ) : (
            <div
              className="
                rounded-xl
                border
                border-dashed
                border-gray-300
                bg-gray-50
                p-6
                text-center
                text-gray-500
              "
            >
              Adisyonu görüntülemek için
              bir masa seçiniz.
            </div>
          )}
        </div>

        {/* ===================================================
            TOPLAMLAR
        ==================================================== */}

        {hasTable && (
          <div className="mt-6">
            <Totals totals={totals} />
          </div>
        )}

        {/* ===================================================
            AKSİYONLAR
        ==================================================== */}

        <div
          className="
            grid
            gap-3
            mt-8
          "
        >
          {/* HAZIR */}

          <button
            type="button"
            disabled={!hasOrder}
            onClick={() =>
              onUpdateStatus("READY")
            }
            className="
              h-12
              rounded-xl
              bg-green-600
              text-white
              font-semibold
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition
              hover:bg-green-700
            "
          >
            ✅ Hazır
          </button>

          {/* ÖDEME */}

          <button
            type="button"
            disabled={!hasOrder}
            onClick={() =>
              setPaymentOpen(true)
            }
            className="
              h-12
              rounded-xl
              bg-purple-600
              text-white
              font-semibold
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition
              hover:bg-purple-700
            "
          >
            💳 Ödeme Al
          </button>

          {/* ÜRÜN EKLE */}

          <button
            type="button"
            disabled={!hasTable}
            onClick={() =>
              setProductModalOpen(true)
            }
            className="
              h-12
              rounded-xl
              bg-blue-600
              text-white
              font-semibold
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition
              hover:bg-blue-700
            "
          >
            ➕ Ürün Ekle
          </button>

          {/* ADİSYON YAZDIR */}

          <button
            type="button"
            disabled={!hasTable}
            className="
              h-12
              rounded-xl
              bg-gray-700
              text-white
              font-semibold
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition
              hover:bg-gray-800
            "
          >
            🖨 Adisyon Yazdır
          </button>
        </div>
      </aside>

      {/* =====================================================
          ÖDEME MODALI
      ====================================================== */}

      {paymentOpen && hasOrder && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            p-4
          "
        >
          <div
            className="
              w-96
              max-w-full
              rounded-2xl
              bg-white
              p-6
              shadow-2xl
            "
          >
            {/* BAŞLIK */}

            <div
              className="
                mb-5
                flex
                items-center
                justify-between
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                  "
                >
                  Ödeme Al
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  {table?.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPaymentOpen(false)
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                  font-bold
                  text-gray-600
                  hover:bg-gray-200
                "
              >
                ✕
              </button>
            </div>

            {/* ÖDENECEK TUTAR */}

            <div
              className="
                mb-5
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                p-5
              "
            >
              <div
                className="
                  text-sm
                  text-gray-500
                "
              >
                Ödenecek Tutar
              </div>

              <div
                className="
                  mt-1
                  text-3xl
                  font-bold
                  text-gray-900
                "
              >
                {totals.grandTotal.toLocaleString(
                  "tr-TR",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}{" "}
                TL
              </div>
            </div>

            {/* ÖDEME SEÇENEKLERİ */}

            <div className="grid gap-3">
              {/* NAKİT */}

              <button
                type="button"
                onClick={() => {
                  onPayment("CASH");
                  setPaymentOpen(false);
                }}
                className="
                  h-12
                  rounded-xl
                  bg-green-600
                  font-bold
                  text-white
                  transition
                  hover:bg-green-700
                "
              >
                💵 Nakit
              </button>

              {/* KART */}

              <button
                type="button"
                onClick={() => {
                  onPayment("CARD");
                  setPaymentOpen(false);
                }}
                className="
                  h-12
                  rounded-xl
                  bg-blue-600
                  font-bold
                  text-white
                  transition
                  hover:bg-blue-700
                "
              >
                💳 Kart
              </button>

              {/* VAZGEÇ */}

              <button
                type="button"
                onClick={() =>
                  setPaymentOpen(false)
                }
                className="
                  h-10
                  rounded-xl
                  bg-gray-200
                  font-semibold
                  text-gray-800
                  transition
                  hover:bg-gray-300
                "
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ÜRÜN MODALI
      ====================================================== */}

      <ProductModal
        open={productModalOpen}
        onClose={() =>
          setProductModalOpen(false)
        }
        onSelect={(product) => {
          onAddProduct(product);

          setProductModalOpen(false);
        }}
      />
    </>
  );
}