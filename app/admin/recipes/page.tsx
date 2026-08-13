import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

type StockUnit =
  | "G"
  | "KG"
  | "ML"
  | "L"
  | "ADET"
  | "PAKET"
  | "KOLI";

function unitLabel(unit: string) {
  const labels: Record<string, string> = {
    G: "Gram (g)",
    KG: "Kilogram (kg)",
    ML: "Mililitre (ml)",
    L: "Litre (L)",
    ADET: "Adet",
    PAKET: "Paket",
    KOLI: "Koli",
  };

  return labels[unit] || unit;
}

function getUnitMultiplier(
  fromUnit: string,
  toUnit: string
): number | null {
  if (fromUnit === toUnit) {
    return 1;
  }

  if (fromUnit === "G" && toUnit === "KG") {
    return 1 / 1000;
  }

  if (fromUnit === "KG" && toUnit === "G") {
    return 1000;
  }

  if (fromUnit === "ML" && toUnit === "L") {
    return 1 / 1000;
  }

  if (fromUnit === "L" && toUnit === "ML") {
    return 1000;
  }

  return null;
}

function calculateItemCost(item: {
  quantity: number;
  unit: string;
  wastePercent: number;
  ingredient: {
    currentCostPerBaseUnit: number;
    baseUnit: string;
  } | null;
}) {
  if (!item.ingredient) {
    return {
      compatible: false,
      cost: 0,
    };
  }

  const multiplier = getUnitMultiplier(
    item.unit,
    item.ingredient.baseUnit
  );

  if (multiplier === null) {
    return {
      compatible: false,
      cost: 0,
    };
  }

  const effectiveQuantity =
    item.quantity * (1 + item.wastePercent / 100);

  const baseQuantity =
    effectiveQuantity * multiplier;

  const cost =
    baseQuantity *
    item.ingredient.currentCostPerBaseUnit;

  return {
    compatible: true,
    cost,
  };
}

export default async function RecipesPage() {
  const products =
    await prisma.product.findMany({
      where: {
        active: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

  const categories =
    await prisma.category.findMany();

  const recipes =
    await prisma.recipe.findMany();

  const recipeItems =
    await prisma.recipeItem.findMany();

  const ingredients =
    await prisma.ingredient.findMany({
      where: {
        active: true,
      },
    });

  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category,
    ])
  );

  const recipeMap = new Map(
    recipes.map((recipe) => [
      recipe.productId,
      recipe,
    ])
  );

  const ingredientMap = new Map(
    ingredients.map((ingredient) => [
      ingredient.id,
      ingredient,
    ])
  );

  const recipeItemsMap =
    new Map<string, typeof recipeItems>();

  for (const item of recipeItems) {
    const existing =
      recipeItemsMap.get(item.recipeId) || [];

    existing.push(item);

    recipeItemsMap.set(
      item.recipeId,
      existing
    );
  }

  const rows = products.map((product) => {
    const recipe =
      recipeMap.get(product.id);

    const items = recipe
      ? recipeItemsMap.get(recipe.id) || []
      : [];

    let recipeCost = 0;
    let compatible = true;

    for (const item of items) {
      const ingredient =
        ingredientMap.get(item.ingredientId);

      const result =
        calculateItemCost({
          quantity: item.quantity,
          unit: item.unit,
          wastePercent: item.wastePercent,
          ingredient: ingredient
            ? {
                currentCostPerBaseUnit:
                  ingredient.currentCostPerBaseUnit,
                baseUnit:
                  ingredient.baseUnit,
              }
            : null,
        });

      if (!result.compatible) {
        compatible = false;
      }

      recipeCost += result.cost;
    }

    const grossProfit =
      product.price - recipeCost;

    const grossMargin =
      product.price > 0
        ? (grossProfit / product.price) * 100
        : 0;

    const costRatio =
      product.price > 0
        ? (recipeCost / product.price) * 100
        : 0;

    return {
      product,
      category:
        categoryMap.get(product.categoryId),
      recipe,
      itemCount: items.length,
      recipeCost,
      grossProfit,
      grossMargin,
      costRatio,
      compatible,
    };
  });

  const definedRecipes =
    rows.filter((row) => row.recipe);

  const totalProducts =
    rows.length;

  const recipeCount =
    definedRecipes.length;

  const missingRecipeCount =
    totalProducts - recipeCount;

  const totalRecipeCost =
    definedRecipes.reduce(
      (sum, row) =>
        sum + row.recipeCost,
      0
    );

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reçete Yönetimi
            </h1>

            <p className="text-gray-500 mt-1">
              Ürünlerin hammadde, maliyet ve kârlılık durumunu yönetin.
            </p>
          </div>

          <Link
            href="/admin/stock"
            className="
              border
              border-gray-300
              bg-white
              px-4
              py-2
              rounded-lg
              hover:bg-gray-50
              w-fit
            "
          >
            Stok Yönetimi
          </Link>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">
              Toplam Ürün
            </p>

            <p className="text-2xl font-bold mt-1">
              {totalProducts}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">
              Reçetesi Olan
            </p>

            <p className="text-2xl font-bold text-green-600 mt-1">
              {recipeCount}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">
              Reçetesi Eksik
            </p>

            <p className="text-2xl font-bold text-orange-600 mt-1">
              {missingRecipeCount}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">
              Ortalama Reçete Maliyeti
            </p>

            <p className="text-2xl font-bold mt-1">
              {recipeCount > 0
                ? (
                    totalRecipeCost /
                    recipeCount
                  ).toFixed(2)
                : "0.00"}{" "}
              TL
            </p>
          </div>

        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="px-6 py-5 border-b">

            <h2 className="text-xl font-bold">
              Ürün Maliyetleri
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Güncel hammadde maliyetlerine göre hesaplanır.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b">

                <tr>

                  <th className="text-left px-5 py-4">
                    Ürün
                  </th>

                  <th className="text-left px-5 py-4">
                    Kategori
                  </th>

                  <th className="text-right px-5 py-4">
                    Satış
                  </th>

                  <th className="text-right px-5 py-4">
                    Reçete Maliyeti
                  </th>

                  <th className="text-right px-5 py-4">
                    Brüt Kâr
                  </th>

                  <th className="text-right px-5 py-4">
                    Kâr Marjı
                  </th>

                  <th className="text-right px-5 py-4">
                    Maliyet Oranı
                  </th>

                  <th className="text-center px-5 py-4">
                    Durum
                  </th>

                  <th className="text-right px-5 py-4">
                    İşlem
                  </th>

                </tr>

              </thead>

              <tbody>

                {rows.map((row) => (

                  <tr
                    key={row.product.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >

                    <td className="px-5 py-4">

                      <div className="font-semibold text-gray-900">
                        {row.product.name}
                      </div>

                      {row.recipe && (
                        <div className="text-xs text-gray-500 mt-1">
                          {row.itemCount} hammadde
                        </div>
                      )}

                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {row.category?.name || "-"}
                    </td>

                    <td className="px-5 py-4 text-right font-medium">
                      {row.product.price.toFixed(2)} TL
                    </td>

                    <td className="px-5 py-4 text-right">

                      {!row.recipe ? (

                        <span className="text-gray-400">
                          -
                        </span>

                      ) : !row.compatible ? (

                        <span className="text-red-600 font-medium">
                          Birim uyumsuz
                        </span>

                      ) : (

                        <span className="font-semibold">
                          {row.recipeCost.toFixed(2)} TL
                        </span>

                      )}

                    </td>

                    <td className="px-5 py-4 text-right">

                      {!row.recipe ||
                      !row.compatible ? (

                        <span className="text-gray-400">
                          -
                        </span>

                      ) : (

                        <span className="font-semibold text-green-600">
                          {row.grossProfit.toFixed(2)} TL
                        </span>

                      )}

                    </td>

                    <td className="px-5 py-4 text-right">

                      {!row.recipe ||
                      !row.compatible ? (

                        <span className="text-gray-400">
                          -
                        </span>

                      ) : (

                        <span
                          className={
                            row.grossMargin >= 70
                              ? "font-bold text-green-600"
                              : row.grossMargin >= 50
                              ? "font-bold text-orange-600"
                              : "font-bold text-red-600"
                          }
                        >
                          %{row.grossMargin.toFixed(2)}
                        </span>

                      )}

                    </td>

                    <td className="px-5 py-4 text-right">

                      {!row.recipe ||
                      !row.compatible ? (

                        <span className="text-gray-400">
                          -
                        </span>

                      ) : (

                        <span className="text-gray-700">
                          %{row.costRatio.toFixed(2)}
                        </span>

                      )}

                    </td>

                    <td className="px-5 py-4 text-center">

                      {!row.recipe ? (

                        <span
                          className="
                            inline-flex
                            rounded-full
                            bg-orange-100
                            text-orange-700
                            px-3
                            py-1
                            text-xs
                            font-medium
                          "
                        >
                          Reçete Yok
                        </span>

                      ) : !row.compatible ? (

                        <span
                          className="
                            inline-flex
                            rounded-full
                            bg-red-100
                            text-red-700
                            px-3
                            py-1
                            text-xs
                            font-medium
                          "
                        >
                          Kontrol Gerekli
                        </span>

                      ) : (

                        <span
                          className="
                            inline-flex
                            rounded-full
                            bg-green-100
                            text-green-700
                            px-3
                            py-1
                            text-xs
                            font-medium
                          "
                        >
                          Hazır
                        </span>

                      )}

                    </td>

                    <td className="px-5 py-4 text-right">

                      <Link
                        href={`/admin/recipes/${row.product.id}`}
                        className="
                          inline-flex
                          bg-black
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          text-xs
                          font-medium
                          hover:bg-gray-800
                        "
                      >
                        {row.recipe
                          ? "Reçeteyi Gör"
                          : "Reçete Tanımla"}
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">

          <h3 className="font-bold text-blue-900">
            Maliyet hesabı
          </h3>

          <p className="text-sm text-blue-800 mt-1">
            Reçete maliyeti; kullanılan hammadde miktarı,
            fire oranı ve hammaddenin güncel birim maliyeti
            üzerinden hesaplanır. Hammadde maliyeti değiştiğinde
            ürün maliyeti de otomatik olarak güncellenir.
          </p>

        </div>

      </div>
    </main>
  );
}
