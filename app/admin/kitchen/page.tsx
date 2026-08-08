"use client";

import { useEffect, useMemo, useState } from "react";



interface KitchenOrder {

  id: string;

  createdAt: string;

  status: "OPEN" | "PREPARING";

  table: {

    name: string;

    number: number;

  };

  items: {

    id: string;

    quantity: number;

    product: {

      name: string;

    };

  }[];

}



export default function KitchenPage() {

  const [orders, setOrders] =
    useState<KitchenOrder[]>([]);



  const [loading, setLoading] =
    useState(true);



  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);



  useEffect(() => {

    loadOrders();



    const timer =
      setInterval(
        loadOrders,
        5000
      );



    return () =>
      clearInterval(timer);

  }, []);



  async function loadOrders() {

    try {

      const response =
        await fetch(
          "/api/orders/kitchen",
          {
            cache: "no-store"
          }
        );



      if (!response.ok) {

        throw new Error(
          "Siparişler alınamadı"
        );

      }



      const data =
        await response.json();



      setOrders(data);

    } catch (error) {

      console.error(
        "KITCHEN LOAD ERROR:",
        error
      );

    } finally {

      setLoading(false);

    }

  }



  async function updateStatus(

    orderId: string,

    status:
      | "PREPARING"
      | "READY"

  ) {

    try {

      setUpdatingOrderId(
        orderId
      );



      const response =
        await fetch(

          "/api/orders/status",

          {

            method: "PATCH",

            headers: {

              "Content-Type":
                "application/json"

            },

            body: JSON.stringify({

              orderId,

              status

            })

          }

        );



      if (!response.ok) {

        throw new Error(
          "Sipariş durumu güncellenemedi"
        );

      }



      await loadOrders();

    } catch (error) {

      console.error(
        "KITCHEN STATUS ERROR:",
        error
      );

    } finally {

      setUpdatingOrderId(
        null
      );

    }

  }



  const newOrders =
    useMemo(

      () =>
        orders.filter(
          order =>
            order.status === "OPEN"
        ),

      [orders]

    );



  const preparingOrders =
    useMemo(

      () =>
        orders.filter(
          order =>
            order.status ===
            "PREPARING"
        ),

      [orders]

    );



  const totalItems =
    useMemo(

      () =>
        orders.reduce(

          (sum, order) =>

            sum +
            order.items.reduce(

              (
                itemSum,
                item
              ) =>

                itemSum +
                item.quantity,

              0

            ),

          0

        ),

      [orders]

    );



  function formatTime(
    date: string
  ) {

    return new Date(
      date
    ).toLocaleTimeString(

      "tr-TR",

      {

        hour: "2-digit",

        minute: "2-digit"

      }

    );

  }



  function getElapsedMinutes(
    date: string
  ) {

    const created =
      new Date(
        date
      ).getTime();



    const now =
      Date.now();



    return Math.max(

      0,

      Math.floor(
        (
          now - created
        ) /
        60000
      )

    );

  }



  return (

    <main className="
      min-h-screen
      bg-slate-950
      text-white
      p-4
      md:p-6
      lg:p-8
    ">



      {/* =====================================================
          ÜST BAŞLIK
      ====================================================== */}

      <header className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        lg:justify-between
        gap-5
        mb-8
      ">



        <div>

          <div className="
            flex
            items-center
            gap-3
            mb-2
          ">

            <div className="
              w-11
              h-11
              rounded-2xl
              bg-orange-500
              flex
              items-center
              justify-center
              text-2xl
              shadow-lg
            ">

              👨‍🍳

            </div>



            <div>

              <h1 className="
                text-3xl
                md:text-4xl
                font-black
                tracking-tight
              ">

                NONNA Mutfak

              </h1>



              <p className="
                text-slate-400
                text-sm
                mt-1
              ">

                Sipariş hazırlama merkezi

              </p>

            </div>

          </div>

        </div>



        {/* =================================================
            ÖZETLER
        ================================================== */}

        <div className="
          grid
          grid-cols-3
          gap-3
        ">



          <div className="
            min-w-[100px]
            rounded-2xl
            bg-slate-900
            border
            border-slate-800
            px-4
            py-3
          ">

            <div className="
              text-xs
              text-slate-500
              uppercase
              tracking-wide
            ">

              Yeni

            </div>



            <div className="
              text-2xl
              font-black
              text-orange-400
              mt-1
            ">

              {newOrders.length}

            </div>

          </div>



          <div className="
            min-w-[100px]
            rounded-2xl
            bg-slate-900
            border
            border-slate-800
            px-4
            py-3
          ">

            <div className="
              text-xs
              text-slate-500
              uppercase
              tracking-wide
            ">

              Hazırlanan

            </div>



            <div className="
              text-2xl
              font-black
              text-blue-400
              mt-1
            ">

              {preparingOrders.length}

            </div>

          </div>



          <div className="
            min-w-[100px]
            rounded-2xl
            bg-slate-900
            border
            border-slate-800
            px-4
            py-3
          ">

            <div className="
              text-xs
              text-slate-500
              uppercase
              tracking-wide
            ">

              Ürün

            </div>



            <div className="
              text-2xl
              font-black
              text-white
              mt-1
            ">

              {totalItems}

            </div>

          </div>



        </div>

      </header>





      {/* =====================================================
          YÜKLENİYOR
      ====================================================== */}

      {loading ? (

        <div className="
          min-h-[50vh]
          flex
          items-center
          justify-center
        ">

          <div className="
            text-center
          ">

            <div className="
              text-5xl
              mb-4
              animate-pulse
            ">

              👨‍🍳

            </div>



            <p className="
              text-slate-400
            ">

              Siparişler yükleniyor...

            </p>

          </div>

        </div>

      ) : orders.length === 0 ? (

        /* =================================================
           BOŞ MUTFAK
        ================================================== */

        <div className="
          min-h-[55vh]
          rounded-3xl
          border
          border-slate-800
          bg-slate-900
          flex
          items-center
          justify-center
        ">

          <div className="
            text-center
            px-6
          ">

            <div className="
              text-7xl
              mb-6
            ">

              🍕


            </div>



            <h2 className="
              text-2xl
              font-bold
              mb-2
            ">

              Mutfak hazır

            </h2>



            <p className="
              text-slate-500
            ">

              Hazırlanacak yeni sipariş bulunmuyor.

            </p>

          </div>

        </div>

      ) : (

        /* =================================================
           SİPARİŞLER
        ================================================== */

        <div className="
          grid
          xl:grid-cols-2
          gap-6
        ">



          {/* ===============================================
              YENİ SİPARİŞLER
          ================================================ */}

          <section>

            <div className="
              flex
              items-center
              justify-between
              mb-4
            ">

              <div>

                <h2 className="
                  text-xl
                  font-black
                  flex
                  items-center
                  gap-2
                ">

                  <span className="
                    w-3
                    h-3
                    rounded-full
                    bg-orange-500
                    animate-pulse
                  " />

                  Yeni Siparişler

                </h2>



                <p className="
                  text-sm
                  text-slate-500
                  mt-1
                ">

                  Hazırlanmaya bekleyen siparişler

                </p>

              </div>



              <div className="
                rounded-full
                bg-orange-500/10
                border
                border-orange-500/20
                px-3
                py-1
                text-sm
                font-bold
                text-orange-400
              ">

                {newOrders.length}

              </div>

            </div>



            <div className="
              space-y-4
            ">

              {newOrders.length === 0 ? (

                <div className="
                  rounded-2xl
                  border
                  border-dashed
                  border-slate-800
                  p-8
                  text-center
                  text-slate-600
                ">

                  Yeni sipariş bekleniyor.

                </div>

              ) : (

                newOrders.map(
                  order => (

                    <div
                      key={order.id}
                      className="
                        rounded-3xl
                        border
                        border-orange-500/30
                        bg-slate-900
                        overflow-hidden
                        shadow-2xl
                      "
                    >



                      {/* SİPARİŞ BAŞLIĞI */}

                      <div className="
                        bg-orange-500
                        text-slate-950
                        px-5
                        py-4
                        flex
                        items-center
                        justify-between
                        gap-4
                      ">



                        <div>

                          <div className="
                            text-xs
                            font-bold
                            uppercase
                            opacity-70
                          ">

                            Yeni Sipariş

                          </div>



                          <div className="
                            text-2xl
                            md:text-3xl
                            font-black
                            mt-1
                          ">

                            MASA{" "}

                            {order.table.number}

                          </div>

                        </div>



                        <div className="
                          text-right
                        ">

                          <div className="
                            text-sm
                            font-bold
                          ">

                            {formatTime(
                              order.createdAt
                            )}

                          </div>



                          <div className="
                            text-xs
                            font-semibold
                            mt-1
                          ">

                            {getElapsedMinutes(
                              order.createdAt
                            )} dk önce

                          </div>

                        </div>



                      </div>



                      {/* ÜRÜNLER */}

                      <div className="
                        p-5
                      ">



                        <div className="
                          space-y-3
                        ">

                          {order.items.map(
                            item => (

                              <div
                                key={item.id}
                                className="
                                  flex
                                  items-center
                                  gap-4
                                  rounded-2xl
                                  bg-slate-950
                                  border
                                  border-slate-800
                                  px-4
                                  py-4
                                "
                              >



                                <div className="
                                  w-12
                                  h-12
                                  shrink-0
                                  rounded-xl
                                  bg-orange-500/10
                                  border
                                  border-orange-500/20
                                  flex
                                  items-center
                                  justify-center
                                  text-xl
                                  font-black
                                  text-orange-400
                                ">

                                  {item.quantity}

                                </div>



                                <div className="
                                  font-bold
                                  text-lg
                                ">

                                  {item.product.name}

                                </div>



                              </div>

                            )
                          )}

                        </div>



                        <button

                          disabled={
                            updatingOrderId ===
                            order.id
                          }



                          onClick={() =>
                            updateStatus(
                              order.id,
                              "PREPARING"
                            )
                          }



                          className="
                            w-full
                            h-14
                            mt-5
                            rounded-2xl
                            bg-blue-600
                            hover:bg-blue-500
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                            text-white
                            font-black
                            text-lg
                            transition
                            shadow-lg
                          "
                        >

                          {
                            updatingOrderId ===
                            order.id
                              ? "Güncelleniyor..."
                              : "👨‍🍳 Hazırlamaya Al"
                          }

                        </button>



                      </div>



                    </div>

                  )
                )

              )}

            </div>

          </section>





          {/* ===============================================
              HAZIRLANAN SİPARİŞLER
          ================================================ */}

          <section>

            <div className="
              flex
              items-center
              justify-between
              mb-4
            ">

              <div>

                <h2 className="
                  text-xl
                  font-black
                  flex
                  items-center
                  gap-2
                ">

                  <span className="
                    w-3
                    h-3
                    rounded-full
                    bg-blue-500
                  " />

                  Hazırlanıyor

                </h2>



                <p className="
                  text-sm
                  text-slate-500
                  mt-1
                ">

                  Mutfağın üzerinde çalıştığı siparişler

                </p>

              </div>



              <div className="
                rounded-full
                bg-blue-500/10
                border
                border-blue-500/20
                px-3
                py-1
                text-sm
                font-bold
                text-blue-400
              ">

                {preparingOrders.length}

              </div>

            </div>



            <div className="
              space-y-4
            ">

              {preparingOrders.length === 0 ? (

                <div className="
                  rounded-2xl
                  border
                  border-dashed
                  border-slate-800
                  p-8
                  text-center
                  text-slate-600
                ">

                  Hazırlanan sipariş yok.

                </div>

              ) : (

                preparingOrders.map(
                  order => (

                    <div
                      key={order.id}
                      className="
                        rounded-3xl
                        border
                        border-blue-500/30
                        bg-slate-900
                        overflow-hidden
                        shadow-2xl
                      "
                    >



                      {/* BAŞLIK */}

                      <div className="
                        bg-blue-600
                        px-5
                        py-4
                        flex
                        items-center
                        justify-between
                        gap-4
                      ">



                        <div>

                          <div className="
                            text-xs
                            font-bold
                            uppercase
                            text-blue-100
                          ">

                            Hazırlanıyor

                          </div>



                          <div className="
                            text-2xl
                            md:text-3xl
                            font-black
                            mt-1
                          ">

                            MASA{" "}

                            {order.table.number}

                          </div>

                        </div>



                        <div className="
                          text-right
                        ">

                          <div className="
                            text-sm
                            font-bold
                          ">

                            {formatTime(
                              order.createdAt
                            )}

                          </div>



                          <div className="
                            text-xs
                            text-blue-100
                            mt-1
                          ">

                            {getElapsedMinutes(
                              order.createdAt
                            )} dk

                          </div>

                        </div>



                      </div>



                      {/* ÜRÜNLER */}

                      <div className="
                        p-5
                      ">



                        <div className="
                          space-y-3
                        ">

                          {order.items.map(
                            item => (

                              <div
                                key={item.id}
                                className="
                                  flex
                                  items-center
                                  gap-4
                                  rounded-2xl
                                  bg-slate-950
                                  border
                                  border-slate-800
                                  px-4
                                  py-4
                                "
                              >



                                <div className="
                                  w-12
                                  h-12
                                  shrink-0
                                  rounded-xl
                                  bg-blue-500/10
                                  border
                                  border-blue-500/20
                                  flex
                                  items-center
                                  justify-center
                                  text-xl
                                  font-black
                                  text-blue-400
                                ">

                                  {item.quantity}

                                </div>



                                <div className="
                                  font-bold
                                  text-lg
                                ">

                                  {item.product.name}

                                </div>



                              </div>

                            )
                          )}

                        </div>



                        <button

                          disabled={
                            updatingOrderId ===
                            order.id
                          }



                          onClick={() =>
                            updateStatus(
                              order.id,
                              "READY"
                            )
                          }



                          className="
                            w-full
                            h-14
                            mt-5
                            rounded-2xl
                            bg-green-600
                            hover:bg-green-500
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                            text-white
                            font-black
                            text-lg
                            transition
                            shadow-lg
                          "
                        >

                          {
                            updatingOrderId ===
                            order.id
                              ? "Güncelleniyor..."
                              : "✅ Siparişi Hazırla"
                          }

                        </button>



                      </div>



                    </div>

                  )
                )

              )}

            </div>

          </section>



        </div>

      )}

    </main>

  );

}