"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function convertToBaseUnit(
  quantity: number,
  fromUnit: string,
  baseUnit: string
) {
  if (fromUnit === baseUnit) {
    return quantity;
  }

  if (fromUnit === "G" && baseUnit === "KG") {
    return quantity / 1000;
  }

  if (fromUnit === "KG" && baseUnit === "G") {
    return quantity * 1000;
  }

  if (fromUnit === "ML" && baseUnit === "L") {
    return quantity / 1000;
  }

  if (fromUnit === "L" && baseUnit === "ML") {
    return quantity * 1000;
  }

  throw new Error(
    `Birim uyumsuzluğu: ${fromUnit} → ${baseUnit}`
  );
}

function convertUnitPriceToBaseUnit(
  unitPrice: number,
  fromUnit: string,
  baseUnit: string
) {
  if (fromUnit === baseUnit) {
    return unitPrice;
  }

  if (fromUnit === "G" && baseUnit === "KG") {
    return unitPrice * 1000;
  }

  if (fromUnit === "KG" && baseUnit === "G") {
    return unitPrice / 1000;
  }

  if (fromUnit === "ML" && baseUnit === "L") {
    return unitPrice * 1000;
  }

  if (fromUnit === "L" && baseUnit === "ML") {
    return unitPrice / 1000;
  }

  throw new Error(
    `Birim fiyatı dönüştürülemiyor: ${fromUnit} → ${baseUnit}`
  );
}

export async function createPurchase(
  formData: FormData
) {
  const supplierId = String(
    formData.get("supplierId") || ""
  ).trim();

  const ingredientId = String(
    formData.get("ingredientId") || ""
  ).trim();

  const quantity = Number(
    formData.get("quantity") || 0
  );

  const unit = String(
    formData.get("unit") || ""
  ).trim();

  const unitPrice = Number(
    formData.get("unitPrice") || 0
  );

  const invoiceNo = String(
    formData.get("invoiceNo") || ""
  ).trim();

  const note = String(
    formData.get("note") || ""
  ).trim();

  const purchasedAtRaw = String(
    formData.get("purchasedAt") || ""
  ).trim();

  if (!supplierId) {
    throw new Error(
      "Tedarikçi seçilmelidir."
    );
  }

  if (!ingredientId) {
    throw new Error(
      "Hammadde seçilmelidir."
    );
  }

  if (!quantity || quantity <= 0) {
    throw new Error(
      "Miktar 0'dan büyük olmalıdır."
    );
  }

  if (!unit) {
    throw new Error(
      "Birim seçilmelidir."
    );
  }

  if (
    Number.isNaN(unitPrice) ||
    unitPrice < 0
  ) {
    throw new Error(
      "Birim fiyat geçerli olmalıdır."
    );
  }

  const supplier =
    await prisma.supplier.findUnique({
      where: {
        id: supplierId,
      },
    });

  if (!supplier) {
    throw new Error(
      "Tedarikçi bulunamadı."
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

  const total =
    quantity * unitPrice;

  const purchasedAt =
    purchasedAtRaw
      ? new Date(
          `${purchasedAtRaw}T00:00:00`
        )
      : new Date();

  const purchase =
    await prisma.$transaction(
      async (tx) => {
        const newPurchase =
          await tx.purchase.create({
            data: {
              supplierId,
              status: "DRAFT",
              invoiceNo:
                invoiceNo || null,
              note:
                note || null,
              total,
              purchasedAt,
            },
          });

        await tx.purchaseItem.create({
          data: {
            purchaseId:
              newPurchase.id,
            ingredientId,
            quantity,
            unit: unit as any,
            unitPrice,
            total,
          },
        });

        return newPurchase;
      }
    );

  revalidatePath(
    "/admin/purchases"
  );

  redirect(
    `/admin/purchases/${purchase.id}`
  );
}

export async function receivePurchase(
  purchaseId: string,
  formData?: FormData
) {
  if (!purchaseId) {
    throw new Error(
      "Satın alma bulunamadı."
    );
  }

  await prisma.$transaction(
    async (tx) => {
      const purchase =
        await tx.purchase.findUnique({
          where: {
            id: purchaseId,
          },
        });

      if (!purchase) {
        throw new Error(
          "Satın alma bulunamadı."
        );
      }

      if (purchase.status !== "DRAFT") {
        throw new Error(
          "Bu satın alma daha önce işleme alınmış."
        );
      }

      const purchaseItems =
        await tx.purchaseItem.findMany({
          where: {
            purchaseId,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

      if (purchaseItems.length === 0) {
        throw new Error(
          "Teslim alınacak hammadde bulunmuyor."
        );
      }

      const locations =
        await tx.stockLocation.findMany({
          where: {
            active: true,
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
        });

      const location =
        locations[0];

      if (!location) {
        throw new Error(
          "Aktif stok lokasyonu bulunamadı."
        );
      }

      for (const item of purchaseItems) {
        const ingredient =
          await tx.ingredient.findUnique({
            where: {
              id: item.ingredientId,
            },
          });

        if (!ingredient) {
          throw new Error(
            `Hammadde bulunamadı: ${item.ingredientId}`
          );
        }

        const baseQuantity =
          convertToBaseUnit(
            item.quantity,
            item.unit,
            ingredient.baseUnit
          );

        const baseUnitPrice =
          convertUnitPriceToBaseUnit(
            item.unitPrice,
            item.unit,
            ingredient.baseUnit
          );

        const incomingStockValue =
          baseQuantity *
          baseUnitPrice;

        const stockBalance =
          await tx.stockBalance.findUnique({
            where: {
              ingredientId_locationId: {
                ingredientId:
                  ingredient.id,
                locationId:
                  location.id,
              },
            },
          });

        const oldQuantity =
          stockBalance?.quantity || 0;

        const oldCost =
          ingredient.currentCostPerBaseUnit || 0;

        const oldStockValue =
          oldQuantity * oldCost;

        const newQuantity =
          oldQuantity +
          baseQuantity;

        const newAverageCost =
          newQuantity > 0
            ? (
                oldStockValue +
                incomingStockValue
              ) / newQuantity
            : baseUnitPrice;

        await tx.stockBalance.upsert({
          where: {
            ingredientId_locationId: {
              ingredientId:
                ingredient.id,
              locationId:
                location.id,
            },
          },

          create: {
            ingredientId:
              ingredient.id,
            locationId:
              location.id,
            quantity:
              baseQuantity,
          },

          update: {
            quantity: {
              increment:
                baseQuantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            ingredientId:
              ingredient.id,

            locationId:
              location.id,

            type: "PURCHASE",

            quantity:
              baseQuantity,

            unit:
              ingredient.baseUnit,

            unitCost:
              baseUnitPrice,

            totalCost:
              incomingStockValue,

            reason:
              "Satın alma teslim alındı",

            referenceType:
              "PURCHASE",

            referenceId:
              purchaseId,
          },
        });

        await tx.ingredient.update({
          where: {
            id: ingredient.id,
          },

          data: {
            currentCostPerBaseUnit:
              newAverageCost,
          },
        });
      }

      await tx.purchase.update({
        where: {
          id: purchaseId,
        },

        data: {
          status: "RECEIVED",
        },
      });
    }
  );

  revalidatePath(
    "/admin/purchases"
  );

  revalidatePath(
    `/admin/purchases/${purchaseId}`
  );

  revalidatePath(
    "/admin/stock"
  );

  revalidatePath(
    "/admin/recipes"
  );

  redirect(
    `/admin/purchases/${purchaseId}`
  );
}
