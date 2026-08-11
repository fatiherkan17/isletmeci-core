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
      status,
    } = body;

    // ============================================================
    // EKSİK BİLGİ KONTROLÜ
    // ============================================================

    if (!orderId || !status) {
      return NextResponse.json(
        {
          error: "Eksik bilgi",
        },
        {
          status: 400,
        }
      );
    }

    // ============================================================
    // SİPARİŞ DURUMUNU GÜNCELLE
    // ============================================================

    const order =
      await prisma.order.update({
        where: {
          id: orderId,
        },

        data: {
          status,
        },

        include: {
          table: true,
        },
      });

    // ============================================================
    // MASA DURUMUNU BELİRLE
    // ============================================================

    let tableStatus: TableStatus =
      TableStatus.ORDERED;

    // ------------------------------------------------------------
    // HAZIRLANIYOR
    // ------------------------------------------------------------

    if (status === "PREPARING") {
      tableStatus =
        TableStatus.PREPARING;
    }

    // ------------------------------------------------------------
    // HAZIR
    // ------------------------------------------------------------

    if (status === "READY") {
      tableStatus =
        TableStatus.READY;
    }

    // ------------------------------------------------------------
    // ÖDENDİ
    //
    // Sipariş tamamen ödendiyse masa tekrar boş olmalıdır.
    // ------------------------------------------------------------

    if (status === "PAID") {
      tableStatus =
        TableStatus.EMPTY;
    }

    // ============================================================
    // MASA DURUMUNU GÜNCELLE
    // ============================================================

    await prisma.table.update({
      where: {
        id: order.tableId,
      },

      data: {
        status: tableStatus,
      },
    });

    // ============================================================
    // BAŞARILI
    // ============================================================

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error(
      "STATUS UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Durum güncellenemedi",
      },
      {
        status: 500,
      }
    );
  }
}