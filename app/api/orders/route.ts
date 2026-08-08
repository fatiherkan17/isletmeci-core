import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

// ============================================================
// AKTİF SİPARİŞİ / SİPARİŞLERİ GETİR
// ============================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const tableId = searchParams.get("tableId");

    if (!tableId) {
      return NextResponse.json(
        {
          error: "Masa bulunamadı",
        },
        {
          status: 400,
        }
      );
    }

    // Sadece gerçekten aktif siparişleri getiriyoruz.
    //
    // PAID ve CANCELLED artık kasa adisyonuna
    // hiçbir şekilde dahil edilmiyor.
    const orders = await prisma.order.findMany({
      where: {
        tableId,
        status: {
          in: ["OPEN", "PREPARING", "READY"],
        },
      },

      orderBy: {
        createdAt: "asc",
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("ORDER GET ERROR:", error);

    return NextResponse.json(
      {
        error: "Sipariş alınamadı",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// SİPARİŞ EKLE
//
// items
// → Müşteri QR siparişi
//
// productId
// → Kasa tarafından ürün ekleme
//
// QR'dan gelen her gönderim ayrı Order oluşturur.
// Bunun sebebi mutfakta siparişlerin ayrı takip edilmesidir.
//
// Kasa tarafında ise mevcut OPEN sipariş kullanılır.
// ============================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      tableId,
      productId,
      items,
    } = body;

    if (!tableId) {
      return NextResponse.json(
        {
          error: "Masa bilgisi eksik",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // MÜŞTERİ QR SİPARİŞİ
    //
    // Her müşteri gönderimi ayrı Order oluşturur.
    // ========================================================

    if (Array.isArray(items)) {
      if (items.length === 0) {
        return NextResponse.json(
          {
            error: "Sipariş boş",
          },
          {
            status: 400,
          }
        );
      }

      const validItems = [];

      for (const item of items) {
        if (
          !item?.productId ||
          !Number.isInteger(item?.quantity) ||
          item.quantity <= 0
        ) {
          continue;
        }

        const product =
          await prisma.product.findUnique({
            where: {
              id: item.productId,
            },
          });

        if (!product) {
          continue;
        }

        // Ürün satışa kapalıysa siparişe alınmaması
        // daha sonra ayrıca stok sistemiyle geliştirilebilir.
        if (!product.active || !product.available) {
          continue;
        }

        validItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      if (validItems.length === 0) {
        return NextResponse.json(
          {
            error: "Geçerli ürün bulunamadı",
          },
          {
            status: 400,
          }
        );
      }

      // --------------------------------------------------------
      // YENİ ORDER OLUŞTUR
      // --------------------------------------------------------

      const order = await prisma.order.create({
        data: {
          tableId,
          status: "OPEN",

          items: {
            create: validItems,
          },
        },

        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // --------------------------------------------------------
      // SİPARİŞ TOPLAMI
      // --------------------------------------------------------

      const total = order.items.reduce(
        (sum, item) =>
          sum +
          item.price * item.quantity,
        0
      );

      await prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          subtotal: total,
          total: total,
        },
      });

      // --------------------------------------------------------
      // MASA DURUMU
      // --------------------------------------------------------

      await prisma.table.update({
        where: {
          id: tableId,
        },

        data: {
          status: "ORDERED",
        },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        total,
      });
    }

    // ========================================================
    // KASA TEK ÜRÜN EKLEME
    //
    // Kasa mevcut OPEN siparişe ürün ekler.
    // ========================================================

    if (productId) {
      let order =
        await prisma.order.findFirst({
          where: {
            tableId,
            status: "OPEN",
          },

          orderBy: {
            createdAt: "desc",
          },
        });

      // --------------------------------------------------------
      // AÇIK SİPARİŞ YOKSA YENİ OLUŞTUR
      // --------------------------------------------------------

      if (!order) {
        order =
          await prisma.order.create({
            data: {
              tableId,
              status: "OPEN",
            },
          });
      }

      // --------------------------------------------------------
      // ÜRÜNÜ BUL
      // --------------------------------------------------------

      const product =
        await prisma.product.findUnique({
          where: {
            id: productId,
          },
        });

      if (!product) {
        return NextResponse.json(
          {
            error: "Ürün bulunamadı",
          },
          {
            status: 404,
          }
        );
      }

      if (!product.active || !product.available) {
        return NextResponse.json(
          {
            error: "Ürün satışa kapalı",
          },
          {
            status: 400,
          }
        );
      }

      // --------------------------------------------------------
      // AYNI ÜRÜN VARSA ADET ARTIR
      // --------------------------------------------------------

      const existingItem =
        await prisma.orderItem.findFirst({
          where: {
            orderId: order.id,
            productId,
          },
        });

      if (existingItem) {
        await prisma.orderItem.update({
          where: {
            id: existingItem.id,
          },

          data: {
            quantity:
              existingItem.quantity + 1,
          },
        });
      } else {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: 1,
            price: product.price,
          },
        });
      }

      // --------------------------------------------------------
      // KASA SİPARİŞ TOPLAMINI GÜNCELLE
      // --------------------------------------------------------

      const orderItems =
        await prisma.orderItem.findMany({
          where: {
            orderId: order.id,
          },
        });

      const total =
        orderItems.reduce(
          (sum, item) =>
            sum +
            item.price * item.quantity,
          0
        );

      await prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          subtotal: total,
          total: total,
        },
      });

      // --------------------------------------------------------
      // MASA DURUMU
      // --------------------------------------------------------

      await prisma.table.update({
        where: {
          id: tableId,
        },

        data: {
          status: "ORDERED",
        },
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        total,
      });
    }

    // ========================================================
    // GEÇERSİZ İSTEK
    // ========================================================

    return NextResponse.json(
      {
        error: "Sipariş bilgisi eksik",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "ORDER CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Sipariş oluşturulamadı",
      },
      {
        status: 500,
      }
    );
  }
}