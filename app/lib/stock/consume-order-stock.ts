import { Prisma } from "@prisma/client";

function convertToBaseUnit(
  quantity: number,
  fromUnit: string,
  baseUnit: string
): number | null {
  if (fromUnit === baseUnit) {
    return quantity;
  }

  if (fromUnit === "KG" && baseUnit === "G") {
    return quantity * 1000;
  }

  if (fromUnit === "G" && baseUnit === "KG") {
    return quantity / 1000;
  }

  if (fromUnit === "L" && baseUnit === "ML") {
    return quantity * 1000;
  }

  if (fromUnit === "ML" && baseUnit === "L") {
    return quantity / 1000;
  }

  if (fromUnit === "ADET" && baseUnit === "ADET") {
    return quantity;
  }

  return null;
}

export async function consumeOrderStock(
  tx: Prisma.TransactionClient,
  orderIds: string[],
  locationId: string
) {
  if (orderIds.length === 0) {
    return;
  }

  if (!locationId) {
    throw new Error(
      "Satış tüketimi için stok lokasyonu bulunamadı."
    );
  }

  const location =
    await tx.stockLocation.findUnique({
      where: {
        id: locationId,
      },
    });

  if (!location || !location.active) {
    throw new Error(
      "Satış tüketimi için geçerli stok lokasyonu bulunamadı."
    );
  }

  /*
   * Ödenen siparişlerin ürünlerini al.
   */
  const orderItems =
    await tx.orderItem.findMany({
      where: {
        orderId: {
          in: orderIds,
        },
      },
      select: {
        id: true,
        productId: true,
        quantity: true,
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  if (orderItems.length === 0) {
    return;
  }

  /*
   * Daha önce tüketilmiş OrderItem'ları bul.
   * Böylece aynı ödeme tekrar işlense bile
   * stok ikinci kez düşmez.
   */
  const existingMovements =
    await tx.stockMovement.findMany({
      where: {
        type: "SALE_CONSUMPTION",
        referenceType: "ORDER_ITEM",
        referenceId: {
          in: orderItems.map(
            (item) => item.id
          ),
        },
      },
      select: {
        referenceId: true,
      },
    });

  const consumedOrderItems =
    new Set(
      existingMovements
        .map(
          (movement) =>
            movement.referenceId
        )
        .filter(
          (id): id is string =>
            Boolean(id)
        )
    );

  const pendingItems =
    orderItems.filter(
      (item) =>
        !consumedOrderItems.has(item.id)
    );

  if (pendingItems.length === 0) {
    return;
  }

  /*
   * Ürünlere ait reçeteleri bul.
   */
  const productIds = [
    ...new Set(
      pendingItems.map(
        (item) => item.productId
      )
    ),
  ];

  const recipes =
    await tx.recipe.findMany({
      where: {
        productId: {
          in: productIds,
        },
        active: true,
      },
      select: {
        id: true,
        productId: true,
      },
    });

  if (recipes.length === 0) {
    return;
  }

  const recipeByProductId =
    new Map(
      recipes.map((recipe) => [
        recipe.productId,
        recipe,
      ])
    );

  /*
   * Reçete kalemlerini al.
   *
   * DİKKAT:
   * RecipeItem üzerinde ingredient relation'ı yok.
   * Bu yüzden ingredientId'leri ayrıca okuyacağız.
   */
  const recipeIds =
    recipes.map(
      (recipe) => recipe.id
    );

  const recipeItems =
    await tx.recipeItem.findMany({
      where: {
        recipeId: {
          in: recipeIds,
        },
      },
      select: {
        id: true,
        recipeId: true,
        ingredientId: true,
        quantity: true,
        unit: true,
        wastePercent: true,
      },
    });

  if (recipeItems.length === 0) {
    return;
  }

  /*
   * Reçetedeki tüm hammaddeleri tek sorguda al.
   */
  const ingredientIds = [
    ...new Set(
      recipeItems.map(
        (item) => item.ingredientId
      )
    ),
  ];

  const ingredients =
    await tx.ingredient.findMany({
      where: {
        id: {
          in: ingredientIds,
        },
      },
      select: {
        id: true,
        name: true,
        baseUnit: true,
        active: true,
        currentCostPerBaseUnit: true,
      },
    });

  const ingredientMap =
    new Map(
      ingredients.map(
        (ingredient) => [
          ingredient.id,
          ingredient,
        ]
      )
    );

  /*
   * Reçete kalemlerini reçete ID'sine göre grupla.
   */
  const recipeItemsByRecipeId =
    new Map<
      string,
      typeof recipeItems
    >();

  for (const recipeItem of recipeItems) {
    const existing =
      recipeItemsByRecipeId.get(
        recipeItem.recipeId
      ) ?? [];

    existing.push(recipeItem);

    recipeItemsByRecipeId.set(
      recipeItem.recipeId,
      existing
    );
  }

  /*
   * Önce toplam gerekli stok miktarlarını hesapla.
   */
  const requiredByIngredient =
    new Map<
      string,
      {
        ingredientId: string;
        quantity: number;
        unit: string;
      }
    >();

  for (const orderItem of pendingItems) {
    const recipe =
      recipeByProductId.get(
        orderItem.productId
      );

    if (!recipe) {
      continue;
    }

    const items =
      recipeItemsByRecipeId.get(
        recipe.id
      ) ?? [];

    for (const recipeItem of items) {
      const ingredient =
        ingredientMap.get(
          recipeItem.ingredientId
        );

      if (!ingredient) {
        throw new Error(
          `Reçetedeki hammadde bulunamadı: ${recipeItem.ingredientId}`
        );
      }

      if (!ingredient.active) {
        throw new Error(
          `${ingredient.name} pasif durumda. Satış tüketimi yapılamıyor.`
        );
      }

      const baseQuantity =
        convertToBaseUnit(
          recipeItem.quantity,
          recipeItem.unit,
          ingredient.baseUnit
        );

      if (baseQuantity === null) {
        throw new Error(
          `${ingredient.name} için reçete birimi (${recipeItem.unit}) ile stok birimi (${ingredient.baseUnit}) uyumsuz.`
        );
      }

      const wasteMultiplier =
        1 +
        Math.max(
          0,
          recipeItem.wastePercent
        ) /
          100;

      const consumedQuantity =
        baseQuantity *
        wasteMultiplier *
        orderItem.quantity;

      const existing =
        requiredByIngredient.get(
          ingredient.id
        );

      if (existing) {
        existing.quantity +=
          consumedQuantity;
      } else {
        requiredByIngredient.set(
          ingredient.id,
          {
            ingredientId:
              ingredient.id,
            quantity:
              consumedQuantity,
            unit:
              ingredient.baseUnit,
          }
        );
      }
    }
  }

  /*
   * SATIŞTAN ÖNCE TÜM STOKLARI KONTROL ET.
   *
   * Böylece bir hammadde yeterli,
   * diğer hammadde yetersiz olduğunda
   * kısmi stok düşümü oluşmaz.
   */
  for (const required of requiredByIngredient.values()) {
    const balance =
      await tx.stockBalance.findUnique({
        where: {
          ingredientId_locationId: {
            ingredientId:
              required.ingredientId,
            locationId,
          },
        },
      });

    const ingredient =
      ingredientMap.get(
        required.ingredientId
      );

    if (!balance) {
      throw new Error(
        `${ingredient?.name ?? "Hammadde"} için seçilen stok lokasyonunda stok kaydı bulunamadı.`
      );
    }

    if (
      balance.quantity <
      required.quantity
    ) {
      throw new Error(
        `Yetersiz stok: ${
          ingredient?.name ?? "Hammadde"
        }. Mevcut: ${
          balance.quantity
        } ${
          ingredient?.baseUnit ?? ""
        }, gereken: ${
          required.quantity.toFixed(4)
        } ${required.unit}.`
      );
    }
  }

  /*
   * TÜM KONTROLLER BAŞARILI.
   *
   * Artık stok hareketlerini oluştur.
   */
  for (const orderItem of pendingItems) {
    const recipe =
      recipeByProductId.get(
        orderItem.productId
      );

    if (!recipe) {
      continue;
    }

    const items =
      recipeItemsByRecipeId.get(
        recipe.id
      ) ?? [];

    for (const recipeItem of items) {
      const ingredient =
        ingredientMap.get(
          recipeItem.ingredientId
        );

      if (!ingredient) {
        continue;
      }

      const baseQuantity =
        convertToBaseUnit(
          recipeItem.quantity,
          recipeItem.unit,
          ingredient.baseUnit
        );

      if (baseQuantity === null) {
        throw new Error(
          `${ingredient.name} için birim dönüşümü yapılamıyor.`
        );
      }

      const wasteMultiplier =
        1 +
        Math.max(
          0,
          recipeItem.wastePercent
        ) /
          100;

      const consumedQuantity =
        baseQuantity *
        wasteMultiplier *
        orderItem.quantity;

      const unitCost =
        ingredient.currentCostPerBaseUnit ??
        0;

      const totalCost =
        consumedQuantity *
        unitCost;

      /*
       * 1. Satış tüketim hareketi
       */
      await tx.stockMovement.create({
        data: {
          ingredientId:
            ingredient.id,
          locationId,
          type: "SALE_CONSUMPTION",
          quantity:
            consumedQuantity,
          unit:
            ingredient.baseUnit,
          unitCost,
          totalCost,
          reason:
            `Satış tüketimi - ${orderItem.product.name}`,
          referenceType:
            "ORDER_ITEM",
          referenceId:
            orderItem.id,
        },
      });

      /*
       * 2. Stok bakiyesini düş
       */
      await tx.stockBalance.update({
        where: {
          ingredientId_locationId: {
            ingredientId:
              ingredient.id,
            locationId,
          },
        },
        data: {
          quantity: {
            decrement:
              consumedQuantity,
          },
        },
      });
    }
  }
}
