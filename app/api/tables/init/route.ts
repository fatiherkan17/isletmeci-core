import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST() {
  try {
    const count = await prisma.table.count();

    if (count === 0) {
      await prisma.table.createMany({
        data: Array.from({ length: 10 }, (_, i) => ({
          number: i + 1,
          name: `Masa ${i + 1}`,
          capacity: 4,
          status: "EMPTY",
          active: true,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Masalar hazır.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Masalar oluşturulamadı.",
      },
      {
        status: 500,
      }
    );
  }
}