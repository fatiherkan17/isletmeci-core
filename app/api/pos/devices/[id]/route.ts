import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";


// ============================================================
// POS CİHAZINI GETİR
// ============================================================

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await context.params;

    const device =
      await prisma.posDevice.findUnique({
        where: {
          id,
        },
      });

    if (!device) {
      return NextResponse.json(
        {
          error:
            "POS cihazı bulunamadı",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      device
    );
  } catch (error) {
    console.error(
      "POS DEVICE GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "POS cihazı alınamadı",
      },
      {
        status: 500,
      }
    );
  }
}


// ============================================================
// POS CİHAZINI GÜNCELLE
// ============================================================

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await context.params;

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
    // MEVCUT CİHAZI KONTROL ET
    // ========================================================

    const existingDevice =
      await prisma.posDevice.findUnique({
        where: {
          id,
        },
      });

    if (!existingDevice) {
      return NextResponse.json(
        {
          error:
            "POS cihazı bulunamadı",
        },
        {
          status: 404,
        }
      );
    }


    // ========================================================
    // PORT KONTROLÜ
    // ========================================================

    let normalizedPort:
      number | null | undefined;

    if (
      port === null ||
      port === ""
    ) {
      normalizedPort =
        null;
    } else if (
      port !== undefined
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
    // GÜNCELLEME VERİSİ
    //
    // Gönderilmeyen alanlar mevcut değerini korur.
    // ========================================================

    const data: {
      name?: string;
      provider?: string;
      brand?: string;
      model?: string | null;
      serialNumber?: string | null;
      terminalId?: string | null;
      ipAddress?: string | null;
      port?: number | null;
      active?: boolean;
    } = {};


    if (name !== undefined) {
      data.name =
        String(name).trim();
    }

    if (provider !== undefined) {
      data.provider =
        String(provider).trim();
    }

    if (brand !== undefined) {
      data.brand =
        String(brand).trim();
    }

    if (model !== undefined) {
      data.model =
        model
          ? String(model).trim()
          : null;
    }

    if (serialNumber !== undefined) {
      data.serialNumber =
        serialNumber
          ? String(
              serialNumber
            ).trim()
          : null;
    }

    if (terminalId !== undefined) {
      data.terminalId =
        terminalId
          ? String(
              terminalId
            ).trim()
          : null;
    }

    if (ipAddress !== undefined) {
      data.ipAddress =
        ipAddress
          ? String(
              ipAddress
            ).trim()
          : null;
    }

    if (port !== undefined) {
      data.port =
        normalizedPort;
    }

    if (active !== undefined) {
      data.active =
        Boolean(active);
    }


    // ========================================================
    // CİHAZI GÜNCELLE
    // ========================================================

    const device =
      await prisma.posDevice.update({
        where: {
          id,
        },

        data,
      });

    return NextResponse.json(
      {
        success: true,
        device,
      }
    );
  } catch (error) {
    console.error(
      "POS DEVICE UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "POS cihazı güncellenemedi",
      },
      {
        status: 500,
      }
    );
  }
}