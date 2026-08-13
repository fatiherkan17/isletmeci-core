import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { TableStatus } from "@prisma/client";

import { createPayment } from "@/app/lib/payment/payment-service";
import { consumeOrderStock } from "@/app/lib/stock/consume-order-stock";

export async function PATCH(
  request: Request
) {
  try {
    const body = await request.json();

    const {
      orderId,
      paymentType,
    } = body;

    // ============================================================
    // SİPARİŞ KONTROLÜ
    // ============================================================

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Sipariş bulunamadı",
        },
        {
          status: 400,
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
          error: "Geçersiz ödeme türü",
        },
        {
          status: 400,
        }
      );
    }

    // ============================================================
    // SİPARİŞİ BUL
    // ============================================================

    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          table: true,
        },
      });

    if (!order) {
      return NextResponse.json(
        {
          error: "Sipariş bulunamadı",
        },
        {
          status: 404,
        }
      );
    }

    // ============================================================
    // SİPARİŞ ZATEN ÖDENMİŞ Mİ?
    // ============================================================

    if (order.status === "PAID") {
      return NextResponse.json(
        {
          error:
            "Bu sipariş zaten ödenmiş",
        },
        {
          status: 400,
        }
      );
    }

    // ============================================================
    // AYNI MASANIN TÜM AKTİF SİPARİŞLERİ
    //
    // OPEN
    // PREPARING
    // READY
    //
    // Bu siparişlerin tamamı tek hesap olarak kapatılır.
    // ============================================================

    const activeOrders =
      await prisma.order.findMany({
        where: {
          tableId: order.tableId,
          status: {
            in: [
              "OPEN",
              "PREPARING",
              "READY",
            ],
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    if (activeOrders.length === 0) {
      return NextResponse.json(
        {
          error:
            "Ödenecek açık sipariş bulunamadı",
        },
        {
          status: 400,
        }
      );
    }

    // ============================================================
    // TOPLAM
    // ============================================================

    const total =
      activeOrders.reduce(
        (sum, activeOrder) =>
          sum + activeOrder.total,
        0
      );

    // ============================================================
    // AKTİF STOK LOKASYONU
    // ============================================================

    const stockLocation =
      await prisma.stockLocation.findFirst({
        where: {
          active: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    if (!stockLocation) {
      return NextResponse.json(
        {
          error:
            "Aktif stok lokasyonu bulunamadı.",
        },
        {
          status: 400,
        }
      );
    }

    const activeOrderIds =
      activeOrders.map(
        (activeOrder) =>
          activeOrder.id
      );

    // ============================================================
    // ÖDEME ÖNCESİ STOK KONTROLÜ
    //
    // consumeOrderStock gerçek stok tüketim işlemini yapar.
    //
    // Burada transaction sonunda özel hata fırlatıyoruz.
    // Böylece yapılan bütün stok değişiklikleri rollback edilir.
    //
    // Amaç:
    // POS'a gitmeden önce stok yeterli mi kontrol etmek.
    // ============================================================

    try {
      await prisma.$transaction(
        async (tx) => {
          await consumeOrderStock(
            tx,
            activeOrderIds,
            stockLocation.id
          );

          throw new Error(
            "__STOCK_PREFLIGHT_ROLLBACK__"
          );
        }
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "__STOCK_PREFLIGHT_ROLLBACK__"
      ) {
        // Beklenen rollback.
        // Stokta gerçek değişiklik bırakılmaz.
      } else {
        console.error(
          "STOCK PREFLIGHT ERROR:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Stok kontrolü başarısız.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // ============================================================
    // KART ÖDEMESİ
    //
    // POS sadece kart ödemesinde devreye girer.
    // ============================================================

    if (paymentType === "CARD") {
      const idempotencyKey =
        `order-${order.tableId}-${Date.now()}-${crypto.randomUUID()}`;

      const paymentResult =
        await createPayment({
          orderId: order.id,
          amount: total,
          method: "CARD",
          idempotencyKey,
        });

      // ==========================================================
      // POS BAŞARISIZ
      //
      // Hiçbir Order kapanmaz.
      // Masa kapanmaz.
      // Stok değişmez.
      // ==========================================================

      if (!paymentResult.success) {
        return NextResponse.json(
          {
            success: false,

            error:
              paymentResult.errorMessage ??
              "POS ödeme işlemi başarısız",

            paymentId:
              paymentResult.paymentId,

            paymentStatus:
              paymentResult.status,

            errorCode:
              paymentResult.errorCode ??
              null,
          },
          {
            status: 402,
          }
        );
      }
    }

    // ============================================================
    // ÖDEME BAŞARILI
    // ============================================================

    const paidAt = new Date();

    // ============================================================
    // GERÇEK KAPATMA + STOK TÜKETİMİ
    //
    // Hepsi TEK transaction.
    //
    // Bir işlem başarısız olursa:
    //
    // Order PAID olmaz
    // stok düşmez
    // masa EMPTY olmaz
    //
    // transaction rollback olur.
    // ============================================================

    await prisma.$transaction(
      async (tx) => {
        // --------------------------------------------------------
        // 1. STOK TÜKETİMİ
        // --------------------------------------------------------

        await consumeOrderStock(
          tx,
          activeOrderIds,
          stockLocation.id
        );

        // --------------------------------------------------------
        // 2. SİPARİŞLERİ PAID YAP
        // --------------------------------------------------------

        await tx.order.updateMany({
          where: {
            id: {
              in: activeOrderIds,
            },
            status: {
              in: [
                "OPEN",
                "PREPARING",
                "READY",
              ],
            },
          },
          data: {
            status: "PAID",
            paymentType,
            paidAt,
          },
        });

        // --------------------------------------------------------
        // 3. MASAYI BOŞALT
        // --------------------------------------------------------

        await tx.table.update({
          where: {
            id: order.tableId,
          },
          data: {
            status: TableStatus.EMPTY,
          },
        });
      }
    );

    // ============================================================
    // KAPATILAN SİPARİŞLERİ GERİ AL
    // ============================================================

    const paidOrders =
      await prisma.order.findMany({
        where: {
          id: {
            in: activeOrderIds,
          },
        },
        include: {
          table: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    // ============================================================
    // TOPLAM KAPATILAN TUTAR
    // ============================================================

    const paidTotal =
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
    // BAŞARILI ÖDEME CEVABI
    // ============================================================

    return NextResponse.json({
      success: true,

      paymentType,

      paidAt,

      tableId:
        order.tableId,

      table:
        {
          ...order.table,
          status:
            TableStatus.EMPTY,
        },

      total:
        paidTotal,

      paidOrderCount:
        paidOrders.length,

      paidOrders,
    });
  } catch (error) {
    console.error(
      "PAYMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Ödeme işlemi başarısız",
      },
      {
        status: 500,
      }
    );
  }
}
