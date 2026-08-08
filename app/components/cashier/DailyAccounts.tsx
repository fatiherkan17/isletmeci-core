"use client";

import { useEffect, useMemo, useState } from "react";


// ============================================================
// TİPLER
// ============================================================

interface CompletedOrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface CompletedOrder {
  id: string;

  createdAt: string;

  paidAt: string | null;

  paymentType: string | null;

  total: number;

  subtotal: number;

  discount: number;

  table: {
    id: string;
    name: string;
    number: number;
  };

  items: CompletedOrderItem[];
}

interface DailySummary {
  orderCount: number;
  total: number;
  cashTotal: number;
  cardTotal: number;
}

interface CompletedOrdersResponse {
  success: boolean;

  date: string;

  summary: DailySummary;

  orders: CompletedOrder[];
}


// ============================================================
// YARDIMCI
// ============================================================

function formatMoney(
  value: number
) {
  return value.toLocaleString(
    "tr-TR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ) + " TL";
}


function formatDate(
  date: string
) {

  const [year, month, day] =
    date.split("-");

  return `${day}.${month}.${year}`;
}


function getToday() {

  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Europe/Istanbul",

        year: "numeric",

        month: "2-digit",

        day: "2-digit",
      }
    );

  return formatter.format(
    new Date()
  );
}


function changeDate(
  date: string,
  days: number
) {

  const [
    year,
    month,
    day
  ] =
    date
      .split("-")
      .map(Number);

  const current =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  current.setUTCDate(
    current.getUTCDate() +
    days
  );

  return current
    .toISOString()
    .slice(0, 10);
}


// ============================================================
// COMPONENT
// ============================================================

export default function DailyAccounts() {

  const [
    selectedDate,
    setSelectedDate
  ] = useState(
    getToday()
  );


  const [
    data,
    setData
  ] =
    useState<CompletedOrdersResponse | null>(
      null
    );


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    error,
    setError
  ] =
    useState<string | null>(
      null
    );


  const [
    selectedOrderId,
    setSelectedOrderId
  ] =
    useState<string | null>(
      null
    );


  // ==========================================================
  // VERİYİ GETİR
  // ==========================================================

  async function loadDailyAccounts(
    date: string
  ) {

    try {

      setLoading(true);

      setError(null);


      const response =
        await fetch(
          `/api/orders/completed?date=${date}`,
          {
            cache: "no-store",
          }
        );


      if (!response.ok) {

        throw new Error(
          "Günlük hesap alınamadı"
        );

      }


      const result =
        await response.json();


      if (!result.success) {

        throw new Error(
          result.error ??
          "Günlük hesap alınamadı"
        );

      }


      setData(result);


    } catch (error) {

      console.error(
        "DAILY ACCOUNTS ERROR:",
        error
      );


      setError(
        "Günlük hesap alınamadı"
      );


      setData(null);


    } finally {

      setLoading(false);

    }

  }


  // ==========================================================
  // TARİH DEĞİŞİNCE YENİDEN GETİR
  // ==========================================================

  useEffect(() => {

    loadDailyAccounts(
      selectedDate
    );

  }, [selectedDate]);


  // ==========================================================
  // SEÇİLİ ADİSYON
  // ==========================================================

  const selectedOrder =
    useMemo(() => {

      if (
        !data ||
        !selectedOrderId
      ) {

        return null;

      }


      return (
        data.orders.find(
          order =>
            order.id ===
            selectedOrderId
        ) ?? null
      );

    }, [
      data,
      selectedOrderId
    ]);


  // ==========================================================
  // BUGÜN MÜ?
  // ==========================================================

  const isToday =
    selectedDate ===
    getToday();


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <section
      className="
        mt-6
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
        overflow-hidden
      "
    >

      {/* ====================================================
          BAŞLIK
      ==================================================== */}

      <div
        className="
          border-b
          border-gray-200
          px-5
          py-5
        "
      >

        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div>

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
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-purple-100
                  text-xl
                "
              >
                🧾
              </div>


              <div>

                <h2
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                  "
                >
                  Günlük Hesap
                </h2>


                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Tamamlanan adisyonlar
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              TARİH KONTROLLERİ
          ================================================= */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <button
              type="button"
              onClick={() =>
                setSelectedDate(
                  changeDate(
                    selectedDate,
                    -1
                  )
                )
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-gray-200
                bg-white
                text-lg
                font-bold
                text-gray-700
                hover:bg-gray-50
              "
              title="Önceki gün"
            >
              ←
            </button>


            <input
              type="date"
              value={
                selectedDate
              }
              max={
                getToday()
              }
              onChange={event =>
                setSelectedDate(
                  event.target.value
                )
              }
              className="
                h-10
                rounded-xl
                border
                border-gray-200
                px-3
                text-sm
                font-semibold
                text-gray-700
                outline-none
                focus:border-blue-500
              "
            />


            <button
              type="button"
              disabled={isToday}
              onClick={() =>
                setSelectedDate(
                  changeDate(
                    selectedDate,
                    1
                  )
                )
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-gray-200
                bg-white
                text-lg
                font-bold
                text-gray-700
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
              title="Sonraki gün"
            >
              →
            </button>

          </div>

        </div>


        {/* ==================================================
            SEÇİLİ TARİH
        ================================================== */}

        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            rounded-xl
            bg-gray-50
            px-4
            py-3
          "
        >

          <span
            className="
              text-sm
              font-semibold
              text-gray-600
            "
          >
            📅 {formatDate(
              selectedDate
            )}
          </span>


          {isToday && (

            <span
              className="
                rounded-full
                bg-green-100
                px-3
                py-1
                text-xs
                font-bold
                text-green-700
              "
            >
              BUGÜN
            </span>

          )}

        </div>

      </div>


      {/* ====================================================
          YÜKLENİYOR
      ==================================================== */}

      {loading && (

        <div
          className="
            px-5
            py-10
            text-center
            text-sm
            text-gray-500
          "
        >
          Günlük hesap yükleniyor...
        </div>

      )}


      {/* ====================================================
          HATA
      ==================================================== */}

      {!loading && error && (

        <div
          className="
            m-5
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-4
            text-sm
            font-semibold
            text-red-700
          "
        >
          {error}
        </div>

      )}


      {/* ====================================================
          VERİ
      ==================================================== */}

      {!loading &&
        !error &&
        data && (

        <>

          {/* ================================================
              ÖZET KARTLARI
          ================================================ */}

          <div
            className="
              grid
              grid-cols-2
              gap-3
              p-5
              md:grid-cols-4
            "
          >

            {/* TOPLAM */}

            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                p-4
              "
            >

              <div
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-500
                "
              >
                Toplam Ciro
              </div>


              <div
                className="
                  mt-2
                  text-xl
                  font-bold
                  text-gray-900
                "
              >
                {formatMoney(
                  data.summary.total
                )}
              </div>

            </div>


            {/* İŞLEM */}

            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                p-4
              "
            >

              <div
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-500
                "
              >
                İşlem
              </div>


              <div
                className="
                  mt-2
                  text-xl
                  font-bold
                  text-gray-900
                "
              >
                {data.summary.orderCount}
              </div>

            </div>


            {/* NAKİT */}

            <div
              className="
                rounded-xl
                border
                border-green-200
                bg-green-50
                p-4
              "
            >

              <div
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-green-700
                "
              >
                Nakit
              </div>


              <div
                className="
                  mt-2
                  text-xl
                  font-bold
                  text-green-700
                "
              >
                {formatMoney(
                  data.summary.cashTotal
                )}
              </div>

            </div>


            {/* KART */}

            <div
              className="
                rounded-xl
                border
                border-blue-200
                bg-blue-50
                p-4
              "
            >

              <div
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-blue-700
                "
              >
                Kart
              </div>


              <div
                className="
                  mt-2
                  text-xl
                  font-bold
                  text-blue-700
                "
              >
                {formatMoney(
                  data.summary.cardTotal
                )}
              </div>

            </div>

          </div>


          {/* ================================================
              ADİSYON LİSTESİ
          ================================================ */}

          <div
            className="
              border-t
              border-gray-200
            "
          >

            <div
              className="
                px-5
                py-4
              "
            >

              <h3
                className="
                  text-sm
                  font-bold
                  text-gray-900
                "
              >
                Tamamlanan Adisyonlar
              </h3>

            </div>


            {data.orders.length === 0 ? (

              <div
                className="
                  px-5
                  pb-8
                  pt-3
                  text-center
                "
              >

                <div
                  className="
                    text-4xl
                  "
                >
                  🧾
                </div>


                <p
                  className="
                    mt-3
                    text-sm
                    font-semibold
                    text-gray-500
                  "
                >
                  Bu güne ait tamamlanan
                  adisyon bulunmuyor.
                </p>

              </div>

            ) : (

              <div
                className="
                  divide-y
                  divide-gray-100
                "
              >

                {data.orders.map(
                  order => {

                    const paymentLabel =
                      order.paymentType ===
                      "CASH"
                        ? "Nakit"
                        : order.paymentType ===
                          "CARD"
                          ? "Kart"
                          : "Bilinmiyor";


                    const paymentIcon =
                      order.paymentType ===
                      "CASH"
                        ? "💵"
                        : order.paymentType ===
                          "CARD"
                          ? "💳"
                          : "💰";


                    return (

                      <button
                        key={
                          order.id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedOrderId(
                            order.id
                          )
                        }
                        className="
                          w-full
                          px-5
                          py-4
                          text-left
                          transition
                          hover:bg-gray-50
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-4
                          "
                        >

                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >

                              <span
                                className="
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-gray-100
                                  text-lg
                                "
                              >
                                🪑
                              </span>


                              <div>

                                <div
                                  className="
                                    font-bold
                                    text-gray-900
                                  "
                                >
                                  {order.table.name}
                                </div>


                                <div
                                  className="
                                    mt-1
                                    text-xs
                                    text-gray-500
                                  "
                                >

                                  {order.paidAt
                                    ? new Date(
                                        order.paidAt
                                      ).toLocaleTimeString(
                                        "tr-TR",
                                        {
                                          hour:
                                            "2-digit",
                                          minute:
                                            "2-digit",
                                        }
                                      )
                                    : "--:--"
                                  }

                                  {" · "}

                                  {paymentIcon}{" "}
                                  {paymentLabel}

                                </div>

                              </div>

                            </div>

                          </div>


                          <div
                            className="
                              shrink-0
                              text-right
                            "
                          >

                            <div
                              className="
                                font-bold
                                text-gray-900
                              "
                            >
                              {formatMoney(
                                order.total
                              )}
                            </div>


                            <div
                              className="
                                mt-1
                                text-xs
                                font-semibold
                                text-blue-600
                              "
                            >
                              Detay →
                            </div>

                          </div>

                        </div>

                      </button>

                    );

                  }
                )}

              </div>

            )}

          </div>

        </>

      )}


      {/* ====================================================
          ADİSYON DETAY MODALI
      ==================================================== */}

      {selectedOrder && (

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
          onClick={() =>
            setSelectedOrderId(
              null
            )
          }
        >

          <div
            className="
              max-h-[90vh]
              w-full
              max-w-lg
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={event =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div
              className="
                border-b
                border-gray-200
                px-5
                py-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >

                <div>

                  <div
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-gray-500
                    "
                  >
                    Tamamlanan Adisyon
                  </div>


                  <h3
                    className="
                      mt-1
                      text-2xl
                      font-bold
                      text-gray-900
                    "
                  >
                    {selectedOrder.table.name}
                  </h3>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setSelectedOrderId(
                      null
                    )
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-100
                    text-lg
                    font-bold
                    text-gray-600
                    hover:bg-gray-200
                  "
                >
                  ×
                </button>

              </div>


              <div
                className="
                  mt-3
                  text-sm
                  text-gray-500
                "
              >

                Masa {selectedOrder.table.number}

                {" · "}

                {selectedOrder.paidAt
                  ? new Date(
                      selectedOrder.paidAt
                    ).toLocaleTimeString(
                      "tr-TR",
                      {
                        hour:
                          "2-digit",
                        minute:
                          "2-digit",
                      }
                    )
                  : "--:--"
                }

              </div>

            </div>


            {/* ÜRÜNLER */}

            <div
              className="
                px-5
                py-5
              "
            >

              <div
                className="
                  space-y-3
                "
              >

                {selectedOrder.items.map(
                  item => (

                    <div
                      key={
                        item.id
                      }
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        border-gray-100
                        pb-3
                      "
                    >

                      <div>

                        <div
                          className="
                            font-semibold
                            text-gray-900
                          "
                        >
                          {item.product.name}
                        </div>


                        <div
                          className="
                            mt-1
                            text-xs
                            text-gray-500
                          "
                        >
                          {item.quantity} ×{" "}
                          {formatMoney(
                            item.price
                          )}
                        </div>

                      </div>


                      <div
                        className="
                          font-bold
                          text-gray-900
                        "
                      >
                        {formatMoney(
                          item.price *
                          item.quantity
                        )}
                      </div>

                    </div>

                  )
                )}

              </div>


              {/* TOPLAMLAR */}

              <div
                className="
                  mt-6
                  space-y-2
                  border-t
                  border-gray-200
                  pt-4
                "
              >

                <div
                  className="
                    flex
                    justify-between
                    text-sm
                    text-gray-500
                  "
                >

                  <span>
                    Ara Toplam
                  </span>

                  <span>
                    {formatMoney(
                      selectedOrder.subtotal
                    )}
                  </span>

                </div>


                {selectedOrder.discount >
                  0 && (

                  <div
                    className="
                      flex
                      justify-between
                      text-sm
                      text-red-600
                    "
                  >

                    <span>
                      İndirim
                    </span>

                    <span>
                      -
                      {formatMoney(
                        selectedOrder.discount
                      )}
                    </span>

                  </div>

                )}


                <div
                  className="
                    flex
                    justify-between
                    pt-2
                    text-lg
                    font-bold
                    text-gray-900
                  "
                >

                  <span>
                    TOPLAM
                  </span>

                  <span>
                    {formatMoney(
                      selectedOrder.total
                    )}
                  </span>

                </div>

              </div>


              {/* ÖDEME */}

              <div
                className="
                  mt-5
                  rounded-xl
                  bg-gray-50
                  px-4
                  py-3
                "
              >

                <div
                  className="
                    text-xs
                    font-semibold
                    text-gray-500
                  "
                >
                  ÖDEME
                </div>


                <div
                  className="
                    mt-1
                    font-bold
                    text-gray-900
                  "
                >

                  {selectedOrder.paymentType ===
                  "CASH"
                    ? "💵 Nakit"
                    : selectedOrder.paymentType ===
                      "CARD"
                      ? "💳 Kart"
                      : "💰 Bilinmiyor"
                  }

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </section>

  );
}