import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";



export async function GET() {

  try {

    const tables =
      await prisma.table.findMany({

        orderBy: {

          number: "asc"

        },

        include: {

          orders: {

            where: {

              status: {

                in: [
                  "OPEN",
                  "PREPARING",
                  "READY"
                ]

              }

            },

            orderBy: {

              createdAt: "desc"

            },

            include: {

              items: {

                include: {

                  product: true

                }

              }

            }

          }

        }

      });



    const result =
      tables.map(table => {

        // ======================================================
        // MASANIN AKTİF SİPARİŞLERİ
        //
        // SADECE:
        // OPEN
        // PREPARING
        // READY
        //
        // PAID VE CANCELLED BURAYA GİREMEZ.
        // ======================================================

        const openOrders =
          table.orders;



        // ======================================================
        // AKTİF SİPARİŞ YOKSA
        // ======================================================

        if (
          openOrders.length === 0
        ) {

          return {

            ...table,

            order: null,

            openOrderIds: [],

            openOrderCount: 0

          };

        }



        // ======================================================
        // KASADA AYNI MASANIN TÜM AKTİF
        // SİPARİŞLERİNİ TEK ADİSYONDA BİRLEŞTİR
        // ======================================================

        const itemMap =
          new Map<
            string,
            {
              id: string;
              productId: string;
              quantity: number;
              price: number;
              product:
                typeof openOrders[number]["items"][number]["product"];
            }
          >();



        for (
          const currentOrder
          of openOrders
        ) {

          for (
            const item
            of currentOrder.items
          ) {

            const existing =
              itemMap.get(
                item.productId
              );



            if (existing) {

              existing.quantity +=
                item.quantity;

            } else {

              itemMap.set(

                item.productId,

                {

                  id:
                    item.id,

                  productId:
                    item.productId,

                  quantity:
                    item.quantity,

                  price:
                    item.price,

                  product:
                    item.product

                }

              );

            }

          }

        }



        const combinedItems =
          Array.from(
            itemMap.values()
          );



        // ======================================================
        // MASANIN TOPLAMI
        // ======================================================

        const subtotal =
          openOrders.reduce(

            (sum, order) =>

              sum +
              order.subtotal,

            0

          );



        const discount =
          openOrders.reduce(

            (sum, order) =>

              sum +
              order.discount,

            0

          );



        const total =
          openOrders.reduce(

            (sum, order) =>

              sum +
              order.total,

            0

          );



        // ======================================================
        // EN SON AKTİF ORDER
        //
        // Bu sadece kasa ekranındaki birleşik
        // Order objesinin temel bilgileri için kullanılır.
        //
        // Ödeme sırasında artık sadece bunun değil,
        // MASANIN TÜM AKTİF ORDER'LARININ kapatılması gerekir.
        // ======================================================

        const latestOrder =
          openOrders[0];



        const combinedOrder = {

          ...latestOrder,

          items:
            combinedItems,

          subtotal,

          discount,

          total,

          openOrderIds:
            openOrders.map(
              order =>
                order.id
            ),

          openOrderCount:
            openOrders.length

        };



        return {

          ...table,

          order:
            combinedOrder,

          openOrderIds:
            openOrders.map(
              order =>
                order.id
            ),

          openOrderCount:
            openOrders.length

        };

      });



    return NextResponse.json(
      result
    );

  } catch (error) {

    console.error(
      "TABLES GET ERROR:",
      error
    );



    return NextResponse.json(

      {
        error:
          "Masalar alınamadı"
      },

      {
        status: 500
      }

    );

  }

}