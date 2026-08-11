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

  onBackToTables?: () => void;
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
  onBackToTables,
}: Props) {
  const [paymentOpen, setPaymentOpen] = useState(false);

  const hasTable = table !== null;

  const hasOrder =
    hasTable &&
    table.order !== null &&
    table.order !== undefined;

  const handleBackToTables = () => {
    if (onBackToTables) {
      onBackToTables();
      return;
    }

    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const statusText =
    table?.status === "EMPTY"
      ? "Boş"
      : table?.status === "MENU_OPEN"
        ? "Menü Açık"
        : table?.status === "ORDERED"
          ? "Sipariş Alındı"
          : table?.status === "PREPARING"
            ? "Hazırlanıyor"
            : table?.status === "READY"
              ? "Hazır"
              : table?.status === "PAYMENT"
                ? "Hesap Bekliyor"
                : table?.status === "CLOSED"
                  ? "Kapalı"
                  : "Masa seçiniz";

  const statusColor =
    table?.status === "READY"
      ? "border-[#9ed8ac] bg-gradient-to-r from-[#ecfaef] to-[#dff4e4] text-[#28733c]"
      : table?.status === "PAYMENT"
        ? "border-[#e7aaa2] bg-gradient-to-r from-[#fff1ee] to-[#ffe0db] text-[#a43e34]"
        : table?.status === "PREPARING"
          ? "border-[#9ccfe0] bg-gradient-to-r from-[#edf9fd] to-[#dceff6] text-[#2d7089]"
          : table?.status === "ORDERED"
            ? "border-[#efc38e] bg-gradient-to-r from-[#fff5e5] to-[#ffe8c8] text-[#a55c20]"
            : table?.status === "MENU_OPEN"
              ? "border-[#ecd39d] bg-gradient-to-r from-[#fff9e9] to-[#f8ebc7] text-[#947022]"
              : "border-[#dfcfb9] bg-gradient-to-r from-[#faf4eb] to-[#f0e4d4] text-[#776552]";

  /*
   * ==========================================================
   * KASA HAZIR BUTONU
   * ==========================================================
   *
   * Kasa personeli, mutfak yetişemediğinde siparişi manuel
   * olarak HAZIR durumuna alabilir.
   *
   * Ürünler silinmez.
   * Sadece sipariş durumu READY olur.
   *
   * READY veya CLOSED durumundaki sipariş tekrar hazır
   * yapılmaz.
   */

  const canMarkReady =
    hasOrder &&
    table?.status !== "READY" &&
    table?.status !== "CLOSED";

  const handleMarkReady = () => {
    if (!canMarkReady) return;

    onUpdateStatus("READY");
  };

  const handlePayment = (paymentType: string) => {
    onPayment(paymentType);
    setPaymentOpen(false);
  };

  return (
    <>
      <aside
        className="
          flex
          h-full
          min-h-0
          w-full
          flex-col
          overflow-hidden
          rounded-[28px]
          border
          border-[#dfcfba]
          bg-gradient-to-br
          from-[#fffaf3]
          via-[#f8eee0]
          to-[#eee0cd]
          shadow-[0_12px_35px_rgba(73,53,34,0.14)]
        "
      >
        {/* =====================================================
            ÜST BAŞLIK
           ===================================================== */}

        <div
          className="
            shrink-0
            border-b
            border-[#e5d7c5]
            bg-gradient-to-b
            from-[#fffdf9]
            to-[#f8eee2]
            px-4
            py-4
            shadow-[0_4px_12px_rgba(75,55,35,0.06)]
            md:px-5
            md:py-5
          "
        >
          <div className="flex items-center gap-3">
            {/* MASALARA DÖN */}

            <button
              type="button"
              onClick={handleBackToTables}
              className="
                flex
                h-11
                shrink-0
                items-center
                gap-1.5
                rounded-2xl
                border
                border-[#decdb6]
                bg-gradient-to-b
                from-[#fffdf9]
                to-[#eee2d2]
                px-3
                text-sm
                font-extrabold
                text-[#5d4b39]
                shadow-[inset_0_2px_3px_rgba(255,255,255,0.9),0_4px_7px_rgba(74,54,35,0.10)]
                transition
                hover:-translate-y-0.5
                hover:shadow-[0_6px_10px_rgba(74,54,35,0.14)]
                active:translate-y-0
              "
              aria-label="Masalara dön"
              title="Masalara dön"
            >
              <span className="text-lg">←</span>
              <span className="hidden sm:inline">Masalara</span>
            </button>

            {/* BAŞLIK */}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2
                  className="
                    truncate
                    text-xl
                    font-extrabold
                    tracking-tight
                    text-[#45372b]
                    md:text-2xl
                  "
                >
                  {hasTable ? table.name : "Adisyon"}
                </h2>

                {hasTable && (
                  <span
                    className="
                      shrink-0
                      rounded-xl
                      border
                      border-[#dfcfb9]
                      bg-[#f3e8da]
                      px-2.5
                      py-1
                      text-xs
                      font-extrabold
                      text-[#705e4c]
                      shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]
                    "
                  >
                    #{table.number}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs font-medium text-[#927f6b] md:text-sm">
                {hasTable ? "Masa adisyonu" : "Masa seçiniz"}
              </p>
            </div>

            {/* MASA DURUMU */}

            {hasTable && (
              <div
                className={`
                  hidden
                  shrink-0
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  px-3
                  py-2
                  text-right
                  shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_3px_7px_rgba(70,50,30,0.06)]
                  sm:flex
                  ${statusColor}
                `}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-current opacity-70" />

                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider opacity-60">
                    Durum
                  </div>

                  <div className="mt-0.5 text-xs font-extrabold">
                    {statusText}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MOBİL DURUM */}

          {hasTable && (
            <div
              className={`
                mt-3
                flex
                items-center
                justify-between
                rounded-2xl
                border
                px-3
                py-2.5
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]
                sm:hidden
                ${statusColor}
              `}
            >
              <span className="text-xs font-semibold opacity-70">
                Masa durumu
              </span>

              <span className="text-xs font-extrabold">
                {statusText}
              </span>
            </div>
          )}
        </div>

        {/* =====================================================
            ANA İÇERİK ALANI
           ===================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-hidden
            px-4
            py-4
            md:px-5
            md:py-5
          "
        >
          {!hasTable ? (
            <div
              className="
                flex
                h-full
                min-h-56
                items-center
                justify-center
                rounded-[24px]
                border
                border-dashed
                border-[#d9c8b1]
                bg-[#fff8ed]
                p-6
                text-center
                text-sm
                text-[#8f7d69]
                shadow-[inset_0_2px_8px_rgba(92,67,40,0.04)]
              "
            >
              <div>
                <div
                  className="
                    mx-auto
                    mb-3
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-3xl
                    bg-gradient-to-b
                    from-[#f8ead8]
                    to-[#e8d3b7]
                    text-3xl
                    shadow-[inset_0_2px_3px_rgba(255,255,255,0.9),0_6px_12px_rgba(80,58,37,0.12)]
                  "
                >
                  🪑
                </div>

                <div className="font-bold text-[#5f4d3b]">
                  Masa seçiniz
                </div>

                <div className="mt-1 text-xs text-[#a08e7b]">
                  Adisyonu görüntülemek için bir masa seçin.
                </div>
              </div>
            </div>
          ) : (
            <div
              className="
                flex
                h-full
                min-h-0
                flex-col
              "
            >
              {/* =================================================
                  ÜRÜNLER
                 ================================================= */}

              <section className="flex min-h-0 flex-1 flex-col">
                <div className="mb-3 flex shrink-0 items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#4a3a2c]">
                      Sipariş
                    </h3>

                    <p className="mt-0.5 text-xs text-[#988674]">
                      {items.length} ürün
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setProductModalOpen(true)}
                    className="
                      rounded-xl
                      border
                      border-[#d9b98f]
                      bg-gradient-to-b
                      from-[#fff2dc]
                      to-[#f6dfbd]
                      px-3
                      py-2
                      text-xs
                      font-extrabold
                      text-[#8d5f2c]
                      shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_3px_6px_rgba(117,77,37,0.08)]
                      transition
                      hover:-translate-y-0.5
                      hover:shadow-[0_5px_9px_rgba(117,77,37,0.12)]
                      active:translate-y-0
                    "
                  >
                    + Ürün Ekle
                  </button>
                </div>

                {/* =================================================
                    SADECE ÜRÜN LİSTESİ KAYAR
                   ================================================= */}

                <div
                  className="
                    min-h-0
                    flex-1
                    overflow-y-auto
                    overscroll-contain
                    pr-1
                  "
                >
                  <OrderItems
                    items={items}
                    onIncrease={onIncrease}
                    onDecrease={onDecrease}
                    onRemove={onRemove}
                  />
                </div>
              </section>

              {/* =================================================
                  DURUM
                 ================================================= */}

              {hasOrder && (
                <div
                  className={`
                    mt-4
                    shrink-0
                    rounded-2xl
                    border
                    px-4
                    py-3
                    shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_3px_8px_rgba(70,50,30,0.05)]
                    ${statusColor}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold opacity-70">
                      Sipariş durumu
                    </span>

                    <span className="text-xs font-extrabold">
                      {statusText}
                    </span>
                  </div>
                </div>
              )}

              {/* =================================================
                  TOPLAMLAR
                 ================================================= */}

              <div className="mt-4 shrink-0">
                <Totals totals={totals} />
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            SABİT ALT AKSİYON ALANI
           ===================================================== */}

        <div
          className="
            shrink-0
            border-t
            border-[#dfcfba]
            bg-gradient-to-b
            from-[#fffaf3]
            to-[#f2e5d4]
            p-3
            shadow-[0_-10px_25px_rgba(72,52,34,0.10)]
            md:p-4
          "
        >
          {/* ÖZET */}

          {hasTable && (
            <div
              className="
                mb-3
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-[#e2d2bd]
                bg-gradient-to-b
                from-[#fffdf9]
                to-[#f1e5d7]
                px-4
                py-3
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_4px_9px_rgba(75,55,35,0.06)]
              "
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9a8976]">
                  Ödenecek
                </div>

                <div className="mt-0.5 text-xs font-medium text-[#887664]">
                  {items.length} ürün
                </div>
              </div>

              <div className="text-2xl font-extrabold tracking-tight text-[#433528]">
                {totals.grandTotal.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ₺
              </div>
            </div>
          )}

          {/* =================================================
              ANA AKSİYONLAR
             ================================================= */}

          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {/* =================================================
                HAZIR
                KASA MUTFAĞA MÜDAHALE EDEBİLİR.
               ================================================= */}

            <button
              type="button"
              disabled={!canMarkReady}
              onClick={handleMarkReady}
              className="
                relative
                h-12
                overflow-hidden
                rounded-2xl
                border
                border-[#68b67a]
                bg-gradient-to-b
                from-[#69c47d]
                to-[#3c9c55]
                px-3
                text-sm
                font-extrabold
                text-white
                shadow-[inset_0_2px_2px_rgba(255,255,255,0.35),0_5px_0_#2f8146,0_8px_14px_rgba(47,129,70,0.18)]
                transition-all
                hover:-translate-y-0.5
                hover:shadow-[inset_0_2px_2px_rgba(255,255,255,0.4),0_6px_0_#2f8146,0_10px_18px_rgba(47,129,70,0.22)]
                active:translate-y-[3px]
                active:shadow-[inset_0_2px_2px_rgba(255,255,255,0.3),0_2px_0_#2f8146]
                disabled:cursor-not-allowed
                disabled:border-[#b9d9bf]
                disabled:bg-gradient-to-b
                disabled:from-[#e3f3e6]
                disabled:to-[#cfe8d4]
                disabled:text-[#5d9869]
                disabled:shadow-none
              "
            >
              {table?.status === "READY"
                ? "✓ Hazırlandı"
                : "✓ Hazır"}
            </button>

            {/* =================================================
                ÖDEME
               ================================================= */}

            <button
              type="button"
              disabled={!hasOrder}
              onClick={() => setPaymentOpen(true)}
              className="
                h-12
                rounded-2xl
                border
                border-[#a98bca]
                bg-gradient-to-b
                from-[#a87bc8]
                to-[#7950a6]
                px-3
                text-sm
                font-extrabold
                text-white
                shadow-[inset_0_2px_2px_rgba(255,255,255,0.3),0_5px_0_#64428a,0_8px_14px_rgba(101,66,138,0.18)]
                transition-all
                hover:-translate-y-0.5
                hover:shadow-[inset_0_2px_2px_rgba(255,255,255,0.4),0_6px_0_#64428a,0_10px_18px_rgba(101,66,138,0.22)]
                active:translate-y-[3px]
                active:shadow-[inset_0_2px_2px_rgba(255,255,255,0.3),0_2px_0_#64428a]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              💳 Ödeme Al
            </button>
          </div>

          {/* İKİNCİL AKSİYONLAR */}

          <div className="mt-2 grid grid-cols-2 gap-2 md:gap-3">
            <button
              type="button"
              disabled={!hasTable}
              onClick={() => setProductModalOpen(true)}
              className="
                h-10
                rounded-xl
                border
                border-[#d9b98f]
                bg-gradient-to-b
                from-[#fff6e9]
                to-[#f3dfc1]
                text-xs
                font-extrabold
                text-[#8b602e]
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_3px_6px_rgba(100,70,40,0.07)]
                transition
                hover:-translate-y-0.5
                hover:shadow-[0_5px_9px_rgba(100,70,40,0.10)]
                active:translate-y-0
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              + Ürün
            </button>

            <button
              type="button"
              disabled={!hasTable}
              className="
                h-10
                rounded-xl
                border
                border-[#d9ccbd]
                bg-gradient-to-b
                from-[#fffdf9]
                to-[#eee4d7]
                text-xs
                font-extrabold
                text-[#6f6153]
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_3px_6px_rgba(75,55,35,0.06)]
                transition
                hover:-translate-y-0.5
                hover:shadow-[0_5px_9px_rgba(75,55,35,0.10)]
                active:translate-y-0
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              🖨 Yazdır
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================
          ÖDEME MODALI
         ===================================================== */}

      {paymentOpen && hasOrder && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-[#3b2c20]/60
            p-4
            backdrop-blur-sm
          "
        >
          <div
            className="
              w-full
              max-w-md
              overflow-hidden
              rounded-[30px]
              border
              border-[#e2d2bd]
              bg-gradient-to-b
              from-[#fffdf9]
              to-[#f6eadb]
              shadow-[0_25px_60px_rgba(48,34,22,0.25)]
            "
          >
            {/* BAŞLIK */}

            <div
              className="
                border-b
                border-[#e6d9c8]
                px-5
                py-5
                md:px-6
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#a18f7b]">
                    Ödeme
                  </div>

                  <h2 className="mt-1 text-xl font-extrabold text-[#443528]">
                    Ödeme Al
                  </h2>

                  <p className="mt-1 text-sm text-[#8d7b68]">
                    {table?.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPaymentOpen(false)}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[#dfd1c0]
                    bg-gradient-to-b
                    from-[#fffdf9]
                    to-[#eee2d3]
                    text-lg
                    font-bold
                    text-[#6e5c49]
                    shadow-[0_3px_7px_rgba(75,55,35,0.08)]
                    transition
                    hover:-translate-y-0.5
                    active:translate-y-0
                  "
                  aria-label="Ödeme ekranını kapat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* TUTAR */}

            <div className="p-5 md:p-6">
              <div
                className="
                  rounded-[24px]
                  border
                  border-[#dfcfba]
                  bg-gradient-to-b
                  from-[#fffaf3]
                  to-[#f0e2d1]
                  p-5
                  text-center
                  shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_5px_12px_rgba(76,54,34,0.06)]
                "
              >
                <div className="text-xs font-bold uppercase tracking-wider text-[#9b8976]">
                  Ödenecek Tutar
                </div>

                <div
                  className="
                    mt-2
                    text-4xl
                    font-extrabold
                    tracking-tight
                    text-[#403226]
                  "
                >
                  {totals.grandTotal.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  ₺
                </div>
              </div>

              {/* ÖDEME SEÇENEKLERİ */}

              <div className="mt-5 grid gap-3">
                {/* NAKİT */}

                <button
                  type="button"
                  onClick={() => handlePayment("CASH")}
                  className="
                    h-14
                    rounded-2xl
                    border
                    border-[#68b67a]
                    bg-gradient-to-b
                    from-[#68c27c]
                    to-[#3e9b55]
                    text-base
                    font-extrabold
                    text-white
                    shadow-[inset_0_2px_2px_rgba(255,255,255,0.3),0_5px_0_#2f8146,0_8px_14px_rgba(47,129,70,0.16)]
                    transition
                    hover:-translate-y-0.5
                    active:translate-y-[3px]
                  "
                >
                  💵 Nakit
                </button>

                {/* KART */}

                <button
                  type="button"
                  onClick={() => handlePayment("CARD")}
                  className="
                    h-14
                    rounded-2xl
                    border
                    border-[#7bb0c6]
                    bg-gradient-to-b
                    from-[#66aeca]
                    to-[#397f9b]
                    text-base
                    font-extrabold
                    text-white
                    shadow-[inset_0_2px_2px_rgba(255,255,255,0.3),0_5px_0_#2f687f,0_8px_14px_rgba(47,104,127,0.16)]
                    transition
                    hover:-translate-y-0.5
                    active:translate-y-[3px]
                  "
                >
                  💳 Kart
                </button>

                {/* VAZGEÇ */}

                <button
                  type="button"
                  onClick={() => setPaymentOpen(false)}
                  className="
                    h-11
                    rounded-xl
                    border
                    border-[#ddd0bf]
                    bg-gradient-to-b
                    from-[#fffdf9]
                    to-[#eee3d5]
                    text-sm
                    font-bold
                    text-[#6e5d4c]
                    shadow-[0_3px_7px_rgba(75,55,35,0.06)]
                    transition
                    hover:-translate-y-0.5
                    active:translate-y-0
                  "
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ÜRÜN MODALI
         ===================================================== */}

      <ProductModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSelect={(product) => {
          onAddProduct(product);
          setProductModalOpen(false);
        }}
      />
    </>
  );
}