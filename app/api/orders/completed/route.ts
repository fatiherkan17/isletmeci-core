import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";


// ============================================================
// TAMAMLANAN ADİSYONLAR
//
// GET /api/orders/completed
//
// Tarih verilmezse BUGÜNÜ getirir:
//
// /api/orders/completed
//
// Belirli gün:
//
// /api/orders/completed?date=2026-08-08
//
// Örnek:
//
// /api/orders/completed?date=2026-07-08
//
// Sadece PAID siparişler getirilir.
// Tarih paidAt üzerinden hesaplanır.
// ============================================================

export async function GET(
  request: Request
) {

  try {

    const { searchParams } =
      new URL(request.url);



    // ========================================================
    // TARİH
    // ========================================================

    const requestedDate =
      searchParams.get("date");



    // ========================================================
    // BUGÜNÜ TÜRKİYE SAATİNE GÖRE AL
    //
    // Türkiye UTC+3 kullanıyor.
    // ========================================================

    const now =
      new Date();



    const turkeyDateFormatter =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone: "Europe/Istanbul",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      );



    const today =
      turkeyDateFormatter.format(
        now
      );



    const selectedDate =
      requestedDate || today;



    // ========================================================
    // TARİH FORMAT KONTROLÜ
    //
    // Beklenen:
    // YYYY-MM-DD
    // ========================================================

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        selectedDate
      )
    ) {

      return NextResponse.json(

        {
          error:
            "Geçersiz tarih. YYYY-MM-DD formatı kullanılmalı."
        },

        {
          status: 400
        }

      );

    }



    // ========================================================
    // TARİHİN GERÇEKTEN GEÇERLİ OLDUĞUNU KONTROL ET
    // ========================================================

    const [
      year,
      month,
      day
    ] =
      selectedDate
        .split("-")
        .map(Number);



    const checkDate =
      new Date(
        Date.UTC(
          year,
          month - 1,
          day
        )
      );



    if (
      checkDate.getUTCFullYear() !== year ||
      checkDate.getUTCMonth() !== month - 1 ||
      checkDate.getUTCDate() !== day
    ) {

      return NextResponse.json(

        {
          error:
            "Geçersiz tarih."
        },

        {
          status: 400
        }

      );

    }



    // ========================================================
    // TÜRKİYE GÜN BAŞLANGICI
    //
    // Türkiye UTC+3 olduğu için:
    //
    // 00:00 Türkiye
    // =
    // önceki gün 21:00 UTC
    //
    // Örneğin:
    //
    // 08.08.2026 00:00 TR
    // =
    // 07.08.2026 21:00 UTC
    // ========================================================

    const startDate =
      new Date(
        Date.UTC(
          year,
          month - 1,
          day,
          -3,
          0,
          0,
          0
        )
      );



    // ========================================================
    // ERTESİ GÜNÜN BAŞLANGICI
    //
    // [startDate, endDate)
    //
    // şeklinde sorguluyoruz.
    // Böylece gün sonu 23:59:59 problemi yaşamıyoruz.
    // ========================================================

    const endDate =
      new Date(
        startDate.getTime() +
        24 * 60 * 60 * 1000
      );



    // ========================================================
    // TAMAMLANMIŞ ADİSYONLARI GETİR
    //
    // ÖNEMLİ:
    //
    // createdAt değil PAID zamanı olan paidAt kullanılıyor.
    //
    // Böylece:
    //
    // 1 Ağustos'ta açılan
    // 2 Ağustos'ta ödenen
    //
    // sipariş 2 Ağustos'un cirosuna girer.
    // ========================================================

    const orders =
      await prisma.order.findMany({

        where: {

          status: "PAID",

          paidAt: {

            gte:
              startDate,

            lt:
              endDate

          }

        },

        orderBy: {

          paidAt: "desc"

        },

        include: {

          table: true,

          items: {

            orderBy: {

              createdAt: "asc"

            },

            include: {

              product: true

            }

          }

        }

      });



    // ========================================================
    // GÜNLÜK ÖZET
    // ========================================================

    const total =
      orders.reduce(

        (
          sum,
          order
        ) => {

          return (
            sum +
            order.total
          );

        },

        0

      );



    const cashTotal =
      orders.reduce(

        (
          sum,
          order
        ) => {

          if (
            order.paymentType ===
            "CASH"
          ) {

            return (
              sum +
              order.total
            );

          }

          return sum;

        },

        0

      );



    const cardTotal =
      orders.reduce(

        (
          sum,
          order
        ) => {

          if (
            order.paymentType ===
            "CARD"
          ) {

            return (
              sum +
              order.total
            );

          }

          return sum;

        },

        0

      );



    // ========================================================
    // SONUÇ
    // ========================================================

    return NextResponse.json({

      success: true,

      date:
        selectedDate,

      startDate,

      endDate,

      summary: {

        orderCount:
          orders.length,

        total,

        cashTotal,

        cardTotal

      },

      orders

    });



  } catch (error) {

    console.error(

      "COMPLETED ORDERS ERROR:",

      error

    );



    return NextResponse.json(

      {

        error:
          "Tamamlanan adisyonlar alınamadı"

      },

      {

        status: 500

      }

    );

  }

}