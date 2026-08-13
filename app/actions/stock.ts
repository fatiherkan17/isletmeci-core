"use server";

import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createStockExit(
  formData: FormData
) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const role = String(session.role ?? "");

  if (
    role !== "OWNER" &&
    role !== "MANAGER"
  ) {
    throw new Error(
      "Bu işlem için yetkiniz bulunmuyor."
    );
  }

  const ingredientId = String(
    formData.get("ingredientId") ?? ""
  ).trim();

  const locationId = String(
    formData.get("locationId") ?? ""
  ).trim();

  const quantityRaw = String(
    formData.get("quantity") ?? ""
  );

  const reason = String(
    formData.get("reason") ?? ""
  ).trim();

  const quantity = Number(quantityRaw);

  if (!ingredientId) {
    throw new Error(
      "Hammadde seçilmelidir."
    );
  }

  if (!locationId) {
    throw new Error(
      "Stok lokasyonu seçilmelidir."
    );
  }

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    throw new Error(
      "Miktar 0'dan büyük olmalıdır."
    );
  }

  const ingredient =
    await prisma.ingredient.findUnique({
      where: {
        id: ingredientId,
      },
    });

  if (!ingredient) {
    throw new Error(
      "Hammadde bulunamadı."
    );
  }

  if (!ingredient.active) {
    throw new Error(
      "Seçilen hammadde pasif durumda."
    );
  }

  const location =
    await prisma.stockLocation.findUnique({
      where: {
        id: locationId,
      },
    });

  if (!location) {
    throw new Error(
      "Stok lokasyonu bulunamadı."
    );
  }

  if (!location.active) {
    throw new Error(
      "Seçilen stok lokasyonu pasif durumda."
    );
  }

  const unitCost =
    ingredient.currentCostPerBaseUnit ?? 0;

  const totalCost =
    quantity * unitCost;

  await prisma.$transaction(
    async (tx) => {
      /*
       * Stok miktarını kontrol ederek azaltıyoruz.
       *
       * Böylece stok hiçbir zaman negatif
       * miktara düşürülemez.
       */
      const balance =
        await tx.stockBalance.findUnique({
          where: {
            ingredientId_locationId: {
              ingredientId,
              locationId,
            },
          },
        });

      if (!balance) {
        throw new Error(
          "Seçilen lokasyonda bu hammadde için stok kaydı bulunmuyor."
        );
      }

      if (balance.quantity < quantity) {
        throw new Error(
          `Yetersiz stok. Mevcut stok: ${balance.quantity} ${ingredient.baseUnit}`
        );
      }

      /*
       * 1. Stok hareketi oluştur
       */
      await tx.stockMovement.create({
        data: {
          ingredientId,
          locationId,
          type: "MANUAL_OUT",
          quantity,
          unit: ingredient.baseUnit,
          unitCost,
          totalCost,
          reason:
            reason ||
            "Manuel stok çıkışı",
        },
      });

      /*
       * 2. Stok bakiyesini azalt
       */
      await tx.stockBalance.update({
        where: {
          ingredientId_locationId: {
            ingredientId,
            locationId,
          },
        },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });
    }
  );

  revalidatePath("/admin/stock");
  revalidatePath(
    "/admin/stock/movements"
  );
  revalidatePath(
    "/admin/stock/entry"
  );
  revalidatePath(
    "/admin/stock/exit"
  );

  redirect(
    "/admin/stock/exit?success=1"
  );
}
