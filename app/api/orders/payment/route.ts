import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { TableStatus } from "@prisma/client";



export async function PATCH(
  request: Request
) {

  try {

    const body =
      await request.json();



    const {
      orderId,
      paymentType,
    } = body;



    // ============================================================
    // SİPARİŞ ID KONTROLÜ
    // ============================================================

    if (!orderId) {

      return NextResponse.json(

        {
          error: "Sipariş bulunamadı"
        },

        {
          status: 400
        }

      );

    }



    // ============================================================
    // ÖDEME TÜRÜ KONTROLÜ
    // ============================================================

    if (
      paymentType !== "CASH" &&
      paymentType !== "CARD"
    ) {

      return NextResponse.json(

        {
          error: "Geçersiz ödeme türü"
        },

        {
          status: 400
        }

      );

    }



    // ============================================================
    // ÖDENMEK İSTENEN SİPARİŞİ BUL
    //
    // Bu sipariş üzerinden masayı tespit ediyoruz.
    // ============================================================

    const order =
      await prisma.order.findUnique({

        where: {

          id: orderId

        },

        include: {

          table: true

        }

      });



    if (!order) {

      return NextResponse.json(

        {
          error: "Sipariş bulunamadı"
        },

        {
          status: 404
        }

      );

    }



    // ============================================================
    // SİPARİŞ ZATEN ÖDENMİŞ Mİ?
    // ============================================================

    if (order.status === "PAID") {

      return NextResponse.json(

        {
          error: "Bu sipariş zaten ödenmiş"
        },

        {
          status: 400
        }

      );

    }



    // ============================================================
    // AYNI MASANIN TÜM AKTİF SİPARİŞLERİNİ BUL
    //
    // Kasa aynı masanın birden fazla QR siparişini
    // tek adisyonda gösteriyor.
    //
    // Bu nedenle ödeme sırasında masanın:
    //
    // OPEN
    // PREPARING
    // READY
    //
    // durumundaki bütün siparişleri kapanır.
    // ============================================================

    const activeOrders =
      await prisma.order.findMany({

        where: {

          tableId:
            order.tableId,

          status: {

            in: [

              "OPEN",

              "PREPARING",

              "READY"

            ]

          }

        },

        orderBy: {

          createdAt: "asc"

        }

      });



    if (activeOrders.length === 0) {

      return NextResponse.json(

        {
          error:
            "Ödenecek açık sipariş bulunamadı"
        },

        {
          status: 400
        }

      );

    }



    // ============================================================
    // TEK BİR ÖDEME ZAMANI OLUŞTUR
    //
    // Aynı masadaki tüm siparişlerin aynı ödeme işlemi
    // içerisinde kapandığını göstermek için aynı zamanı
    // kullanıyoruz.
    // ============================================================

    const paidAt =
      new Date();



    // ============================================================
    // AKTİF SİPARİŞLERİ ÖDENMİŞ OLARAK KAPAT
    //
    // paymentType:
    // CASH / CARD
    //
    // paidAt:
    // Gerçek ödeme zamanı
    // ============================================================

    await prisma.order.updateMany({

      where: {

        tableId:
          order.tableId,

        status: {

          in: [

            "OPEN",

            "PREPARING",

            "READY"

          ]

        }

      },

      data: {

        status: "PAID",

        paymentType,

        paidAt

      }

    });



    // ============================================================
    // MASAYI BOŞALT
    //
    // Masanın artık aktif siparişi kalmadı.
    // ============================================================

    await prisma.table.update({

      where: {

        id:
          order.tableId

      },

      data: {

        status:
          TableStatus.EMPTY

      }

    });



    // ============================================================
    // KAPATILAN SİPARİŞLERİ GERİ AL
    //
    // Frontend ve ileride adisyon arşivi için
    // tamamlanmış kayıtları döndürüyoruz.
    // ============================================================

    const paidOrders =
      await prisma.order.findMany({

        where: {

          id: {

            in:
              activeOrders.map(
                item => item.id
              )

          }

        },

        include: {

          table: true,

          items: {

            include: {

              product: true

            }

          }

        },

        orderBy: {

          createdAt: "asc"

        }

      });



    // ============================================================
    // TOPLAM KAPATILAN TUTAR
    // ============================================================

    const total =
      paidOrders.reduce(

        (
          sum,
          paidOrder
        ) => {

          return (
            sum +
            paidOrder.total
          );

        },

        0

      );



    // ============================================================
    // BAŞARILI ÖDEME
    // ============================================================

    return NextResponse.json({

      success: true,

      paymentType,

      paidAt,

      tableId:
        order.tableId,

      table:
        order.table,

      total,

      paidOrderCount:
        paidOrders.length,

      paidOrders

    });



  } catch (error) {

    console.error(

      "PAYMENT ERROR:",

      error

    );



    return NextResponse.json(

      {

        error:
          "Ödeme işlemi başarısız"

      },

      {

        status: 500

      }

    );

  }

}