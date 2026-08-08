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

  const [
    tables,
    setTables
  ] =
    useState<CashierTable[]>([]);


  const [
    selectedTableId,
    setSelectedTableId
  ] =
    useState<string | null>(null);


  const [
    items,
    setItems
  ] =
    useState<OrderItem[]>([]);


  const [
    productModalOpen,
    setProductModalOpen
  ] =
    useState(false);


  // ==========================================================
  // MASALARI GETİR
  // ==========================================================

  useEffect(() => {

    loadTables();


    const timer =
      setInterval(
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
          table =>
            table.id ===
            selectedTableId
        )
        ??
        null
      );

    }, [
      tables,
      selectedTableId
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
          item => ({

            productId:
              item.productId,

            name:
              item.product?.name ??
              "",

            unitPrice:
              item.price ??
              0,

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


      setItems(
        orderItems
      );

    } else {

      setItems([]);

    }

  }, [
    selectedTable
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
      items
    ]);


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
      current =>
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
      current =>
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
      current =>
        removeProduct(
          current,
          productId
        )
    );

  }


  // ==========================================================
  // SİPARİŞ DURUMU
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
                    .order
                    .id,

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
                    .order
                    .id,

                paymentType,

              }),

          }
        );


      if (!response.ok) {

        throw new Error(
          "Ödeme başarısız"
        );

      }


      setItems([]);


      setSelectedTableId(
        null
      );


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
        space-y-6
      "
    >

      {/* ====================================================
          ÜST BAŞLIK
      ==================================================== */}

      <div
        className="
          flex
          flex-col
          gap-2
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >

        <div>

          <h1
            className="
              text-4xl
              font-bold
              text-gray-900
            "
          >
            💰 NONNA Kasa
          </h1>


          <p
            className="
              mt-1
              text-sm
              text-gray-500
            "
          >
            Masa, adisyon ve ödeme yönetimi
          </p>

        </div>

      </div>


      {/* ====================================================
          ANA KASA
      ==================================================== */}

      <div
        className="
          grid
          grid-cols-12
          gap-6
        "
      >

        {/* ==================================================
            MASALAR
        ================================================== */}

        <section
          className="
            col-span-12
            xl:col-span-8
            space-y-6
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
              setSelectedTableId
            }

          />


          {/* =================================================
              SON İŞLEMLER
          ================================================= */}

          <RecentOrders />

        </section>


        {/* ==================================================
            ADİSYON
        ================================================== */}

        <aside
          className="
            col-span-12
            xl:col-span-4
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

        </aside>

      </div>


      {/* ====================================================
          GÜNLÜK HESAP
      ==================================================== */}

      <DailyAccounts />

    </main>

  );

}