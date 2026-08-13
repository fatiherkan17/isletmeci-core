import Link from "next/link";
import { addRecipeItem } from "@/app/actions/recipe";
import { prisma } from "@/app/lib/prisma";

interface Props {
  params: Promise<{
    productId: string;
  }>;
}

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

function convertToBaseUnit(
  quantity: number,
  recipeUnit: string,
  baseUnit: string
) {
  if (recipeUnit === baseUnit) {
    return quantity;
  }

  // Ağırlık
  if (recipeUnit === "G" && baseUnit === "KG") {
    return quantity / 1000;
  }

  if (recipeUnit === "KG" && baseUnit === "G") {
    return quantity * 1000;
  }

  // Hacim
  if (recipeUnit === "ML" && baseUnit === "L") {
    return quantity / 1000;
  }

  if (recipeUnit === "L" && baseUnit === "ML") {
    return quantity * 1000;
  }

  // Diğer birimler birbirine dönüştürülmez.
  return null;
}

export default async function RecipePage({
  params,
}: Props) {
  const { productId } = await params;

  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        category: true,
      },
    });

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Ürün bulunamadı
          </h1>

          <Link
            href="/admin/recipes"
            className="
              inline-block
              mt-4
              bg-black
              text-white
              px-5
              py-3
              rounded-lg
            "
          >
            Reçetelere Dön
          </Link>
        </div>
      </main>
    );
  }

  const ingredients =
    await prisma.ingredient.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
    });

  const recipe =
    await prisma.recipe.findUnique({
      where: {
        productId,
      },
    });

  const recipeItems = recipe
    ? await prisma.recipeItem.findMany({
        where: {
          recipeId: recipe.id,
        },
        orderBy: {
          createdAt: "asc",
        },
      })
    : [];

  const ingredientMap = new Map(
    ingredients.map((ingredient) => [
      ingredient.id,
      ingredient,
    ])
  );

  let totalCost = 0;
  let hasIncompatibleUnit = false;
  let hasMissingIngredient = false;

  const calculatedItems = recipeItems.map(
    (item) => {
      const ingredient =
        ingredientMap.get(item.ingredientId);

      if (!ingredient) {
        hasMissingIngredient = true;

        return {
          ...item,
          ingredient: null,
          baseQuantity: null,
          cost: 0,
          compatibleUnit: false,
        };
      }

      const baseQuantity =
        convertToBaseUnit(
          item.quantity,
          item.unit,
          ingredient.baseUnit
        );

      if (baseQuantity === null) {
        hasIncompatibleUnit = true;

        return {
          ...item,
          ingredient,
          baseQuantity: null,
          cost: 0,
          compatibleUnit: false,
        };
      }

      const quantityWithWaste =
        baseQuantity *
        (1 + item.wastePercent / 100);

      const cost =
        quantityWithWaste *
        ingredient.currentCostPerBaseUnit;

      totalCost += cost;

      return {
        ...item,
        ingredient,
        baseQuantity,
        cost,
        compatibleUnit: true,
      };
    }
  );

  /*
   * MALİYET / KAR HESAPLARI
   *
   * Product.price:
   * ürünün mevcut satış fiyatıdır.
   *
   * totalCost:
   * reçetedeki hammaddelerin fire dahil
   * toplam maliyetidir.
   */

  const salePrice = product.price;

  const grossProfit =
    salePrice - totalCost;

  const grossMargin =
    salePrice > 0
      ? (grossProfit / salePrice) * 100
      : 0;

  const costRate =
    salePrice > 0
      ? (totalCost / salePrice) * 100
      : 0;

  const canCalculateProfit =
    !hasIncompatibleUnit &&
    !hasMissingIngredient;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
            mb-8
          "
        >

          <div>

            <div className="flex items-center gap-3">

              <h1 className="text-3xl font-bold text-gray-900">
                {product.name} - Reçete
              </h1>

              <span
                className="
                  hidden
                  md:inline-flex
                  rounded-full
                  bg-gray-200
                  text-gray-700
                  px-3
                  py-1
                  text-xs
                  font-medium
                "
              >
                {product.category.name}
              </span>

            </div>

            <p className="text-gray-500 mt-1">
              Ürün içinde kullanılan hammaddeleri
              ve miktarlarını tanımlayın.
            </p>

          </div>

          <Link
            href="/admin/recipes"
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
            ← Reçetelere Dön
          </Link>

        </div>


        {/* HAMMADDE EKLE */}

        <div
          className="
            bg-white
            rounded-xl
            shadow
            p-6
            mb-6
          "
        >

          <h2 className="text-xl font-bold mb-5">
            Hammadde Ekle
          </h2>

          <form
            action={addRecipeItem.bind(
              null,
              productId
            )}
          >

            <div className="grid gap-5">

              <div>

                <label
                  className="
                    block
                    text-sm
                    font-medium
                    mb-2
                  "
                >
                  Hammadde
                </label>

                <select
                  name="ingredientId"
                  required
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-3
                    bg-white
                  "
                >

                  <option value="">
                    Hammadde seçin
                  </option>

                  {ingredients.map(
                    (ingredient) => (
                      <option
                        key={ingredient.id}
                        value={ingredient.id}
                      >
                        {ingredient.name}
                        {" — "}
                        {ingredient.currentCostPerBaseUnit.toFixed(
                          2
                        )}
                        {" TL/"}
                        {unitLabel(
                          ingredient.baseUnit
                        )}
                      </option>
                    )
                  )}

                </select>

              </div>


              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-3
                  gap-5
                "
              >

                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      mb-2
                    "
                  >
                    Miktar
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    step="0.001"
                    required
                    placeholder="Örn. 250"
                    className="
                      w-full
                      border
                      border-gray-300
                      rounded-lg
                      px-4
                      py-3
                    "
                  />

                </div>


                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      mb-2
                    "
                  >
                    Birim
                  </label>

                  <select
                    name="unit"
                    required
                    className="
                      w-full
                      border
                      border-gray-300
                      rounded-lg
                      px-4
                      py-3
                      bg-white
                    "
                  >

                    <option value="">
                      Birim seçin
                    </option>

                    <option value="G">
                      Gram (g)
                    </option>

                    <option value="KG">
                      Kilogram (kg)
                    </option>

                    <option value="ML">
                      Mililitre (ml)
                    </option>

                    <option value="L">
                      Litre (L)
                    </option>

                    <option value="ADET">
                      Adet
                    </option>

                    <option value="PAKET">
                      Paket
                    </option>

                    <option value="KOLI">
                      Koli
                    </option>

                  </select>

                </div>


                <div>

                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      mb-2
                    "
                  >
                    Fire %
                  </label>

                  <input
                    type="number"
                    name="wastePercent"
                    min="0"
                    step="0.1"
                    defaultValue="0"
                    className="
                      w-full
                      border
                      border-gray-300
                      rounded-lg
                      px-4
                      py-3
                    "
                  />

                </div>

              </div>


              <div className="flex justify-end">

                <button
                  type="submit"
                  className="
                    bg-black
                    text-white
                    px-5
                    py-3
                    rounded-lg
                    hover:bg-gray-800
                  "
                >
                  + Hammaddeyi Reçeteye Ekle
                </button>

              </div>

            </div>

          </form>

        </div>


        {/* MEVCUT REÇETE */}

        <div
          className="
            bg-white
            rounded-xl
            shadow
            p-6
          "
        >

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-4
              mb-5
            "
          >

            <div>

              <h2 className="text-xl font-bold">
                Mevcut Reçete
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {recipeItems.length} hammadde
              </p>

            </div>

            <div className="text-right">

              <div className="text-sm text-gray-500">
                Reçete Maliyeti
              </div>

              <div
                className="
                  text-3xl
                  font-bold
                  text-gray-900
                "
              >
                {totalCost.toFixed(2)} TL
              </div>

              <div className="text-sm text-gray-500 mt-1">
                1 porsiyon için
              </div>

            </div>

          </div>


          {/* UYARI */}

          {(hasIncompatibleUnit ||
            hasMissingIngredient) && (

            <div
              className="
                mb-5
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-700
              "
            >

              <div className="font-semibold mb-1">
                Maliyet hesabı kontrol gerektiriyor.
              </div>

              {hasIncompatibleUnit && (
                <div>
                  • En az bir reçete kaleminde birim
                  uyumsuzluğu bulunuyor.
                </div>
              )}

              {hasMissingIngredient && (
                <div>
                  • En az bir reçete kaleminin
                  hammaddesi bulunamadı.
                </div>
              )}

            </div>

          )}


          {calculatedItems.length === 0 ? (

            <div
              className="
                border
                border-dashed
                border-gray-300
                rounded-lg
                p-8
                text-center
              "
            >

              <p className="text-gray-500">
                Bu ürün için henüz hammadde
                tanımlanmamış.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead
                  className="
                    border-b
                    bg-gray-50
                  "
                >

                  <tr>

                    <th className="text-left px-4 py-3">
                      Hammadde
                    </th>

                    <th className="text-right px-4 py-3">
                      Miktar
                    </th>

                    <th className="text-right px-4 py-3">
                      Birim
                    </th>

                    <th className="text-right px-4 py-3">
                      Fire
                    </th>

                    <th className="text-right px-4 py-3">
                      Birim Maliyet
                    </th>

                    <th className="text-right px-4 py-3">
                      Maliyet
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {calculatedItems.map(
                    (item) => (

                      <tr
                        key={item.id}
                        className="
                          border-b
                          last:border-0
                        "
                      >

                        <td
                          className="
                            px-4
                            py-4
                            font-medium
                          "
                        >
                          {item.ingredient?.name ||
                            "Hammadde bulunamadı"}
                        </td>

                        <td className="px-4 py-4 text-right">
                          {item.quantity}
                        </td>

                        <td className="px-4 py-4 text-right">
                          {unitLabel(item.unit)}
                        </td>

                        <td className="px-4 py-4 text-right">
                          %{item.wastePercent}
                        </td>

                        <td className="px-4 py-4 text-right">

                          {item.ingredient
                            ? `${item.ingredient.currentCostPerBaseUnit.toFixed(
                                2
                              )} TL/${unitLabel(
                                item.ingredient.baseUnit
                              )}`
                            : "-"}

                        </td>

                        <td
                          className="
                            px-4
                            py-4
                            text-right
                            font-semibold
                          "
                        >

                          {!item.compatibleUnit ? (

                            <span className="text-red-600">
                              Birim uyumsuz
                            </span>

                          ) : (

                            `${item.cost.toFixed(2)} TL`

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* MALİYET / KAR ÖZETİ */}

        <div
          className="
            mt-6
            bg-white
            rounded-xl
            shadow
            p-6
          "
        >

          <div className="mb-6">

            <h2 className="text-xl font-bold">
              Ürün Maliyet ve Kârlılık Özeti
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Güncel hammadde maliyetleri ile
              ürün satış fiyatını karşılaştırır.
            </p>

          </div>


          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              lg:grid-cols-4
              gap-4
            "
          >

            {/* SATIŞ FİYATI */}

            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                p-5
              "
            >

              <div className="text-sm text-gray-500 mb-2">
                Satış Fiyatı
              </div>

              <div className="text-2xl font-bold">
                {salePrice.toFixed(2)} TL
              </div>

            </div>


            {/* MALİYET */}

            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                p-5
              "
            >

              <div className="text-sm text-gray-500 mb-2">
                Reçete Maliyeti
              </div>

              <div className="text-2xl font-bold">
                {totalCost.toFixed(2)} TL
              </div>

            </div>


            {/* BRÜT KÂR */}

            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                p-5
              "
            >

              <div className="text-sm text-gray-500 mb-2">
                Brüt Kâr
              </div>

              <div
                className={`
                  text-2xl
                  font-bold
                  ${
                    grossProfit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                `}
              >
                {canCalculateProfit
                  ? `${grossProfit.toFixed(2)} TL`
                  : "Hesaplanamıyor"}
              </div>

            </div>


            {/* KÂR MARJI */}

            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                p-5
              "
            >

              <div className="text-sm text-gray-500 mb-2">
                Brüt Kâr Marjı
              </div>

              <div
                className={`
                  text-2xl
                  font-bold
                  ${
                    grossMargin >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                `}
              >
                {canCalculateProfit
                  ? `%${grossMargin.toFixed(2)}`
                  : "Hesaplanamıyor"}
              </div>

            </div>

          </div>


          {/* DETAY */}

          <div
            className="
              mt-5
              border-t
              pt-5
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >

            <div>

              <div className="text-sm text-gray-500">
                Maliyet / Satış Oranı
              </div>

              <div className="text-lg font-semibold mt-1">
                {canCalculateProfit
                  ? `%${costRate.toFixed(2)}`
                  : "-"}
              </div>

            </div>


            <div>

              <div className="text-sm text-gray-500">
                Hesaplama
              </div>

              <div className="text-lg font-semibold mt-1">
                {canCalculateProfit
                  ? `${salePrice.toFixed(
                      2
                    )} TL - ${totalCost.toFixed(
                      2
                    )} TL = ${grossProfit.toFixed(
                      2
                    )} TL`
                  : "Önce reçete birimlerini kontrol edin."}
              </div>

            </div>

          </div>

        </div>


        {/* BİLGİ */}

        <div
          className="
            mt-6
            rounded-xl
            border
            border-blue-200
            bg-blue-50
            p-5
          "
        >

          <div className="font-semibold text-blue-900">
            Maliyet hesabı nasıl çalışır?
          </div>

          <p className="text-sm text-blue-800 mt-2 leading-6">
            Reçetedeki miktar, fire oranı ve hammaddenin
            güncel birim maliyeti kullanılarak hesaplanır.
            Hammadde maliyeti değiştiğinde ürünün reçete
            maliyeti de otomatik olarak güncellenir.
          </p>

        </div>

      </div>
    </main>
  );
}
