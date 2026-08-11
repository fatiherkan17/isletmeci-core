"use client";

import { useEffect, useMemo, useState } from "react";

import TablesGrid from "@/app/components/cashier/TablesGrid";
import OrderPanel from "@/app/components/cashier/OrderPanel";
import RecentOrders from "@/app/components/cashier/RecentOrders";
import DailyAccounts from "@/app/components/cashier/DailyAccounts";

import {
  increaseQuantity,
  decreaseQuantity,
  removeProduct,
  calculateTotals,
} from "@/lib/cashier/order";

import type {
  CashierTable,
  OrderItem,
  Product,
} from "@/types/cashier";

// ============================================================
// KASA
// ============================================================

export default function CashierPage() {
  // ==========================================================
  // MASALAR
  // ==========================================================

  const [tables, setTables] =
    useState<CashierTable[]>([]);

  // ==========================================================
  // SEÇİLİ MASA
  // ==========================================================

  const [selectedTableId, setSelectedTableId] =
    useState<string | null>(null);

  // ==========================================================
  // ADİSYON ÜRÜNLERİ
  // ==========================================================

  const [items, setItems] =
    useState<OrderItem[]>([]);

  // ==========================================================
  // ÜRÜN MODALI
  // ==========================================================

  const [productModalOpen, setProductModalOpen] =
    useState(false);

  // ==========================================================
  // GÜNLÜK İŞLEMLER PANELİ
  //
  // Artık sayfanın altında uzayan bir bölüm değil.
  // Kasa içerisinde açılıp kapanan ayrı çalışma alanı.
  // ==========================================================

  const [dailyAccountsOpen, setDailyAccountsOpen] =
    useState(false);

  // ==========================================================
  // MASALARI GETİR
  // ==========================================================

  useEffect(() => {
    loadTables();

    const timer = setInterval(
      loadTables,
      3000
    );

    return () =>
      clearInterval(timer);
  }, []);

  async function loadTables() {
    try {
      const response =
        await fetch(
          "/api/tables",
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Masalar alınamadı"
        );
      }

      const data =
        await response.json();

      setTables(data);
    } catch (error) {
      console.error(
        "CASHIER TABLES ERROR:",
        error
      );
    }
  }

  // ==========================================================
  // SEÇİLİ MASA
  // ==========================================================

  const selectedTable =
    useMemo(() => {
      return (
        tables.find(
          (table) =>
            table.id ===
            selectedTableId
        ) ?? null
      );
    }, [
      tables,
      selectedTableId,
    ]);

  // ==========================================================
  // SEÇİLİ MASANIN ÜRÜNLERİ
  // ==========================================================

  useEffect(() => {
    if (
      selectedTable?.order?.items
    ) {
      const orderItems:
        OrderItem[] =
        selectedTable.order.items.map(
          (item) => ({
            productId:
              item.productId,

            name:
              item.product?.name ??
              "",

            unitPrice:
              item.price ?? 0,

            quantity:
              item.quantity,

            total:
              (item.price ?? 0) *
              item.quantity,

            image:
              item.product?.image ??
              null,
          })
        );

      setItems(orderItems);
    } else {
      setItems([]);
    }
  }, [
    selectedTable,
  ]);

  // ==========================================================
  // TOPLAMLAR
  // ==========================================================

  const totals =
    useMemo(() => {
      return calculateTotals(
        items
      );
    }, [
      items,
    ]);

  // ==========================================================
  // MASA SEÇ
  //
  // Mevcut davranış korunuyor.
  // ==========================================================

  function handleSelectTable(
    tableId: string
  ) {
    setDailyAccountsOpen(false);
    setSelectedTableId(tableId);
  }

  // ==========================================================
  // MASALARA DÖN
  //
  // Yeni navigasyon noktası.
  // Mevcut sipariş silinmez.
  // Sadece aktif masa seçimi kaldırılır.
  // ==========================================================

  function handleBackToTables() {
    setProductModalOpen(false);
    setSelectedTableId(null);
  }

  // ==========================================================
  // ÜRÜN EKLE
  // ==========================================================

  async function handleAddProduct(
    product: Product
  ) {
    if (!selectedTable) {
      return;
    }

    try {
      const response =
        await fetch(
          "/api/orders",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                tableId:
                  selectedTable.id,

                productId:
                  product.id,
              }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Ürün eklenemedi"
        );
      }

      await loadTables();
    } catch (error) {
      console.error(
        "ADD PRODUCT ERROR:",
        error
      );

      alert(
        "Ürün eklenemedi"
      );
    }
  }

  // ==========================================================
  // MİKTAR ARTIR
  // ==========================================================

  function handleIncrease(
    productId: string
  ) {
    setItems(
      (current) =>
        increaseQuantity(
          current,
          productId
        )
    );
  }

  // ==========================================================
  // MİKTAR AZALT
  // ==========================================================

  function handleDecrease(
    productId: string
  ) {
    setItems(
      (current) =>
        decreaseQuantity(
          current,
          productId
        )
    );
  }

  // ==========================================================
  // ÜRÜN SİL
  // ==========================================================

  function handleRemove(
    productId: string
  ) {
    setItems(
      (current) =>
        removeProduct(
          current,
          productId
        )
    );
  }

  // ==========================================================
  // SİPARİŞ DURUMU
  //
  // Mevcut API korunuyor.
  // ==========================================================

  async function handleUpdateStatus(
    status:
      | "PREPARING"
      | "READY"
      | "PAID"
      | "CANCELLED"
  ) {
    if (
      !selectedTable?.order?.id
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          "/api/orders/status",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                orderId:
                  selectedTable
                    .order.id,

                status,
              }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Durum güncellenemedi"
        );
      }

      await loadTables();
    } catch (error) {
      console.error(
        "UPDATE STATUS ERROR:",
        error
      );

      alert(
        "Sipariş durumu güncellenemedi"
      );
    }
  }

  // ==========================================================
  // ÖDEME
  //
  // Mevcut ödeme API'si korunuyor.
  // Ödeme başarılı olduğunda masa ekranına dönülüyor.
  // ==========================================================

  async function handlePayment(
    paymentType: string
  ) {
    if (
      !selectedTable?.order?.id
    ) {
      alert(
        "Açık sipariş yok"
      );

      return;
    }

    try {
      const response =
        await fetch(
          "/api/orders/payment",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                orderId:
                  selectedTable
                    .order.id,

                paymentType,
              }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Ödeme başarısız"
        );
      }

      // ------------------------------------------------------
      // ÖDEME BAŞARILI
      // ------------------------------------------------------

      setItems([]);

      setProductModalOpen(false);

      setSelectedTableId(null);

      await loadTables();
    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      alert(
        "Ödeme alınamadı"
      );
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main
      className="
        flex
        h-dvh
        max-h-dvh
        min-h-0
        flex-col
        overflow-hidden
      "
    >
      {/* ====================================================
          ÜST KASA BAR
         ==================================================== */}

      <header
        className="
          flex
          shrink-0
          items-center
          justify-between
          gap-4
          border-b
          border-gray-200
          bg-white
          px-4
          py-3
          md:px-6
          md:py-4
        "
      >
        <div className="min-w-0">
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-black
                text-lg
                text-white
              "
            >
              ₺
            </div>

            <div className="min-w-0">
              <h1
                className="
                  truncate
                  text-xl
                  font-extrabold
                  tracking-tight
                  text-gray-900
                  md:text-2xl
                "
              >
                NONNA Kasa
              </h1>

              <p
                className="
                  hidden
                  text-xs
                  text-gray-500
                  sm:block
                "
              >
                Masa, adisyon ve ödeme
                yönetimi
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            GÜNLÜK İŞLEMLER
           ================================================== */}

        <button
          type="button"
          onClick={() =>
            setDailyAccountsOpen(
              true
            )
          }
          className="
            flex
            shrink-0
            items-center
            gap-2
            rounded-xl
            border
            border-gray-200
            bg-white
            px-3
            py-2.5
            text-sm
            font-bold
            text-gray-700
            shadow-sm
            transition
            hover:border-gray-300
            hover:bg-gray-50
            active:scale-[0.98]
            md:px-4
          "
        >
          <span className="text-base">
            📊
          </span>

          <span className="hidden sm:inline">
            Günlük İşlemler
          </span>

          <span className="sm:hidden">
            Günlük
          </span>
        </button>
      </header>

      {/* ====================================================
          ANA KASA ÇALIŞMA ALANI
         ==================================================== */}

      <div
        className="
          min-h-0
          flex-1
          overflow-hidden
          bg-gray-100
          p-3
          md:p-4
        "
      >
        <div
          className="
            flex
            h-full
            min-h-0
            flex-col
            gap-3
            xl:grid
            xl:grid-cols-12
            xl:gap-4
          "
        >
          {/* ==================================================
              SOL / MASALAR
             ================================================== */}

          <section
            className={`
              min-h-0
              flex-1
              xl:col-span-8
              xl:flex
              xl:flex-col
              ${
                selectedTableId
                  ? "hidden xl:flex"
                  : "flex"
              }
            `}
          >
            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                pr-1
                scrollbar-thin
              "
            >
              <TablesGrid
                tables={
                  tables
                }

                selectedTableId={
                  selectedTableId
                }

                onSelectTable={
                  handleSelectTable
                }
              />

              {/* =================================================
                  SON İŞLEMLER
                 ================================================= */}

              <div
                className="
                  mt-3
                  hidden
                  md:block
                "
              >
                <RecentOrders />
              </div>
            </div>
          </section>

          {/* ==================================================
              SAĞ / ADİSYON
             ================================================== */}

          <aside
            className={`
              min-h-0
              flex-1
              xl:col-span-4
              xl:flex
              xl:flex-col
              ${
                selectedTableId
                  ? "flex"
                  : "hidden xl:flex"
              }
            `}
          >
            {/* =================================================
                MASALARA DÖN
               ================================================= */}

            {selectedTable && (
              <button
                type="button"
                onClick={
                  handleBackToTables
                }
                className="
                  mb-2
                  flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-gray-700
                  shadow-sm
                  transition
                  hover:bg-gray-50
                  active:scale-[0.99]
                  xl:hidden
                "
              >
                <span className="text-lg">
                  ←
                </span>

                <span>
                  Masalara Dön
                </span>
              </button>
            )}

            <div
              className="
                min-h-0
                flex-1
                overflow-hidden
                rounded-2xl
              "
            >
              <OrderPanel
                table={
                  selectedTable
                }

                items={
                  items
                }

                totals={
                  totals
                }

                productModalOpen={
                  productModalOpen
                }

                setProductModalOpen={
                  setProductModalOpen
                }

                onAddProduct={
                  handleAddProduct
                }

                onIncrease={
                  handleIncrease
                }

                onDecrease={
                  handleDecrease
                }

                onRemove={
                  handleRemove
                }

                onUpdateStatus={
                  handleUpdateStatus
                }

                onPayment={
                  handlePayment
                }
              />
            </div>
          </aside>
        </div>
      </div>

      {/* ====================================================
          GÜNLÜK HESAPLAR — MODAL / ÇALIŞMA ALANI
          
          Mevcut DailyAccounts bileşeni çöpe atılmıyor.
          Sadece ana sayfanın altına uzaması engelleniyor.
         ==================================================== */}

      {dailyAccountsOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/50
            p-2
            md:p-6
          "
        >
          <div
            className="
              flex
              h-[96dvh]
              w-full
              max-w-7xl
              min-h-0
              flex-col
              overflow-hidden
              rounded-2xl
              bg-gray-100
              shadow-2xl
            "
          >
            {/* =================================================
                PANEL BAŞLIĞI
               ================================================= */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-between
                border-b
                border-gray-200
                bg-white
                px-4
                py-3
                md:px-6
                md:py-4
              "
            >
              <div>
                <h2
                  className="
                    text-lg
                    font-extrabold
                    text-gray-900
                    md:text-xl
                  "
                >
                  📊 Günlük İşlemler
                </h2>

                <p
                  className="
                    mt-0.5
                    hidden
                    text-xs
                    text-gray-500
                    sm:block
                  "
                >
                  Günlük satış ve
                  tamamlanan adisyonlar
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDailyAccountsOpen(
                    false
                  )
                }
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-100
                  text-lg
                  font-bold
                  text-gray-600
                  transition
                  hover:bg-gray-200
                  active:scale-95
                "
                aria-label="Günlük işlemleri kapat"
              >
                ✕
              </button>
            </div>

            {/* =================================================
                MEVCUT DAILY ACCOUNTS
               ================================================= */}

            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                p-2
                md:p-4
              "
            >
              <DailyAccounts />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}