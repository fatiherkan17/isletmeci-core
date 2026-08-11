import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";


// ============================================================
// POS CİHAZLARINI GETİR
// ============================================================

export async function GET() {
  try {
    const devices =
      await prisma.posDevice.findMany({
        orderBy: {
          createdAt: "asc",
        },
      });

    return NextResponse.json(devices);
  } catch (error) {
    console.error(
      "POS DEVICES GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "POS cihazları alınamadı",
      },
      {
        status: 500,
      }
    );
  }
}


// ============================================================
// POS CİHAZI EKLE
// ============================================================

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const {
      name,
      provider,
      brand,
      model,
      serialNumber,
      terminalId,
      ipAddress,
      port,
      active,
    } = body;


    // ========================================================
    // ZORUNLU ALANLAR
    // ========================================================

    if (
      !name ||
      !provider ||
      !brand
    ) {
      return NextResponse.json(
        {
          error:
            "POS cihazı adı, sağlayıcı ve marka zorunludur",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================================
    // PORT KONTROLÜ
    // ========================================================

    let normalizedPort:
      number | undefined;

    if (
      port !== undefined &&
      port !== null &&
      port !== ""
    ) {
      normalizedPort =
        Number(port);

      if (
        !Number.isInteger(
          normalizedPort
        ) ||
        normalizedPort < 1 ||
        normalizedPort > 65535
      ) {
        return NextResponse.json(
          {
            error:
              "Geçersiz port numarası",
          },
          {
            status: 400,
          }
        );
      }
    }


    // ========================================================
    // POS CİHAZI OLUŞTUR
    // ========================================================

    const device =
      await prisma.posDevice.create({
        data: {
          name:
            String(name).trim(),

          provider:
            String(provider).trim(),

          brand:
            String(brand).trim(),

          model:
            model
              ? String(model).trim()
              : null,

          serialNumber:
            serialNumber
              ? String(
                  serialNumber
                ).trim()
              : null,

          terminalId:
            terminalId
              ? String(
                  terminalId
                ).trim()
              : null,

          ipAddress:
            ipAddress
              ? String(
                  ipAddress
                ).trim()
              : null,

          port:
            normalizedPort,

          active:
            active !== false,
        },
      });

    return NextResponse.json(
      {
        success: true,
        device,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POS DEVICE CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "POS cihazı oluşturulamadı",
      },
      {
        status: 500,
      }
    );
  }
}