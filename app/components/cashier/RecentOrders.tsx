"use client";

import { useEffect, useState } from "react";

interface RecentOrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
  } | null;
}

interface RecentOrder {
  id: string;
  status: string;
  subtotal: number;
  total: number;
  createdAt: string;
  table?: {
    name: string;
    number: number;
  } | null;
  items?: RecentOrderItem[];
}

export default function RecentOrders() {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadOrders() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/orders/recent",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Sipariş geçmişi alınamadı"
        );
      }

      const data = await response.json();

      /*
       * API doğrudan dizi döndürüyorsa kullan.
       * İleride { orders: [...] } dönerse
       * onu da destekliyoruz.
       */
      const result = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
          ? data.orders
          : [];

      setOrders(result);
    } catch (error) {
      console.error(
        "RECENT ORDERS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    loadOrders();
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      {/* =====================================================
          SİPARİŞ GEÇMİŞİ İKONU
         ===================================================== */}

      <button
        type="button"
        onClick={handleOpen}
        className="
          group
          flex
          w-full
          items-center
          justify-between
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-4
          text-left
          shadow-sm
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:border-blue-300
          hover:shadow-md
        "
      >
        <div className="flex items-center gap-4">
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-blue-50
              text-2xl
              transition
              group-hover:bg-blue-100
            "
          >
            🧾
          </div>

          <div>
            <div className="font-bold text-gray-900">
              Sipariş Geçmişi
            </div>

            <div className="mt-0.5 text-xs text-gray-500">
              Son işlemleri görüntüle
            </div>
          </div>
        </div>

        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-gray-50
            text-gray-500
            transition
            group-hover:bg-blue-50
            group-hover:text-blue-600
          "
        >
          →
        </div>
      </button>

      {/* =====================================================
          GEÇMİŞ MODALI
         ===================================================== */}

      {open && (
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
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              handleClose();
            }
          }}
        >
          <div
            className="
              flex
              max-h-[90vh]
              w-full
              max-w-3xl
              flex-col
              overflow-hidden
              rounded-3xl
              bg-white
              shadow-2xl
            "
          >
            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                px-6
                py-5
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-xl
                  "
                >
                  🧾
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Sipariş Geçmişi
                  </h2>

                  <p className="text-xs text-gray-500">
                    Son işlemler
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                  text-lg
                  font-bold
                  text-gray-500
                  transition
                  hover:bg-gray-200
                  hover:text-gray-800
                "
              >
                ×
              </button>
            </div>

            {/* İÇERİK */}

            <div
              className="
                overflow-y-auto
                p-5
              "
            >
              {loading ? (
                <div
                  className="
                    flex
                    min-h-40
                    items-center
                    justify-center
                    text-sm
                    text-gray-400
                  "
                >
                  Sipariş geçmişi yükleniyor...
                </div>
              ) : orders.length === 0 ? (
                <div
                  className="
                    flex
                    min-h-40
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-dashed
                    border-gray-200
                    bg-gray-50
                    text-center
                  "
                >
                  <div className="text-3xl">
                    🧾
                  </div>

                  <div className="mt-2 font-semibold text-gray-700">
                    Sipariş geçmişi boş
                  </div>

                  <div className="mt-1 text-xs text-gray-400">
                    Henüz görüntülenecek işlem yok.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        p-4
                        transition
                        hover:border-blue-200
                        hover:shadow-sm
                      "
                    >
                      {/* ÜST */}

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-4
                        "
                      >
                        <div>
                          <div className="text-lg font-extrabold text-gray-900">
                            {order.table?.name ??
                              `Masa ${
                                order.table?.number ??
                                "-"
                              }`}
                          </div>

                          <div className="mt-1 text-xs text-gray-400">
                            {new Date(
                              order.createdAt
                            ).toLocaleString(
                              "tr-TR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-extrabold text-gray-900">
                            {Number(
                              order.total ?? 0
                            ).toLocaleString(
                              "tr-TR",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}{" "}
                            TL
                          </div>

                          <span
                            className="
                              mt-1
                              inline-flex
                              rounded-full
                              bg-green-50
                              px-2.5
                              py-1
                              text-[10px]
                              font-bold
                              text-green-600
                            "
                          >
                            {order.status ===
                            "PAID"
                              ? "ÖDENDİ"
                              : order.status}
                          </span>
                        </div>
                      </div>

                      {/* ÜRÜNLER */}

                      {order.items &&
                        order.items.length >
                          0 && (
                          <div
                            className="
                              mt-4
                              border-t
                              border-gray-100
                              pt-3
                            "
                          >
                            <div className="space-y-2">
                              {order.items.map(
                                (item) => (
                                  <div
                                    key={item.id}
                                    className="
                                      flex
                                      items-center
                                      justify-between
                                      text-sm
                                    "
                                  >
                                    <div className="text-gray-700">
                                      <span className="font-bold">
                                        {
                                          item.quantity
                                        }
                                        ×
                                      </span>{" "}
                                      {item
                                        .product
                                        ?.name ??
                                        "Ürün"}
                                    </div>

                                    <div className="font-semibold text-gray-600">
                                      {(
                                        Number(
                                          item.price ??
                                            0
                                        ) *
                                        Number(
                                          item.quantity ??
                                            0
                                        )
                                      ).toLocaleString(
                                        "tr-TR",
                                        {
                                          minimumFractionDigits:
                                            2,
                                        }
                                      )}{" "}
                                      TL
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER */}

            <div
              className="
                border-t
                border-gray-100
                bg-gray-50
                px-5
                py-4
              "
            >
              <button
                type="button"
                onClick={loadOrders}
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  bg-gray-900
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-gray-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Yükleniyor..."
                  : "↻ Yenile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}