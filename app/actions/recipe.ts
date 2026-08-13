"use server";

import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

export async function addRecipeItem(
  productId: string,
  formData: FormData
) {
  const ingredientId = String(
    formData.get("ingredientId") || ""
  );

  const quantity = Number(
    formData.get("quantity") || 0
  );

  const unit = String(
    formData.get("unit") || ""
  );

  const wastePercent = Number(
    formData.get("wastePercent") || 0
  );

  if (!productId) {
    throw new Error("Ürün bulunamadı.");
  }

  if (!ingredientId) {
    throw new Error("Hammadde seçilmelidir.");
  }

  if (!quantity || quantity <= 0) {
    throw new Error(
      "Miktar 0'dan büyük olmalıdır."
    );
  }

  if (!unit) {
    throw new Error("Birim seçilmelidir.");
  }

  if (wastePercent < 0) {
    throw new Error(
      "Fire negatif olamaz."
    );
  }

  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

  if (!product) {
    throw new Error("Ürün bulunamadı.");
  }

  let recipe =
    await prisma.recipe.findUnique({
      where: {
        productId,
      },
    });

  if (!recipe) {
    recipe =
      await prisma.recipe.create({
        data: {
          productId,
          name: `${product.name} Reçetesi`,
          active: true,
        },
      });
  }

  const existing =
    await prisma.recipeItem.findFirst({
      where: {
        recipeId: recipe.id,
        ingredientId,
      },
    });

  if (existing) {
    await prisma.recipeItem.update({
      where: {
        id: existing.id,
      },
      data: {
        quantity,
        unit: unit as any,
        wastePercent,
      },
    });
  } else {
    await prisma.recipeItem.create({
      data: {
        recipeId: recipe.id,
        ingredientId,
        quantity,
        unit: unit as any,
        wastePercent,
      },
    });
  }

  redirect(
    `/admin/recipes/${productId}`
  );
}
