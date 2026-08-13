import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { createStockExit } from "@/app/actions/stock";

function unitLabel(unit: string) {
  switch (unit) {
    case "G":
      return "g";
    case "KG":
      return "kg";
    case "ML":
      return "ml";
    case "L":
      return "L";
    case "ADET":
      return "adet";
    case "PAKET":
      return "paket";
    case "KOLI":
      return "koli";
    default:
      return unit;
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function StockExitPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
  }>;
}) {
  const params = await searchParams;

  const [
    ingredients,
    locations,
    balances,
  ] = await Promise.all([
    prisma.ingredient.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        code: true,
        baseUnit: true,
        currentCostPerBaseUnit: true,
      },
    }),

    prisma.stockLocation.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),

    prisma.stockBalance.findMany(),
  ]);

  const balanceMap =
    new Map<string, number>();

  for (const balance of balances) {
    const key =
      `${balance.ingredientId}_${balance.locationId}`;

    balanceMap.set(
      key,
      balance.quantity
    );
  }

  return (
    <main className="max-w-5xl">

      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          mb-8
        "
      >

        <div>

          <h1
            className="
              text-3xl
              font-bold
              text-gray-900
            "
          >
            Stok Çıkışı
          </h1>

          <p
            className="
              text-gray-500
              mt-1
            "
          >
            Depodan veya stok alanından
            hammadde çıkışı yapın.
          </p>

        </div>

        <Link
          href="/admin/stock"
          className="
            border
            border-gray-300
            bg-white
            hover:bg-gray-50
            px-4
            py-2
            rounded-lg
            text-sm
          "
        >
          ← Stok
        </Link>

      </div>

      {/* BAŞARILI */}

      {params.success === "1" && (

        <div
          className="
            mb-6
            bg-green-50
            border
            border-green-200
            text-green-800
            rounded-xl
            p-5
          "
        >

          <p className="font-semibold">
            Stok çıkışı başarıyla kaydedildi.
          </p>

          <p className="text-sm mt-1">
            Stok bakiyesi ve stok hareketi
            güncellendi.
          </p>

        </div>

      )}

      {/* FORM */}

      <form
        action={createStockExit}
        className="
          bg-white
          rounded-xl
          shadow
          overflow-hidden
        "
      >

        <div className="p-6">

          <h2
            className="
              text-xl
              font-bold
              mb-6
            "
          >
            Stok Çıkışı Bilgileri
          </h2>

          <div
            className="
              grid
              md:grid-cols-2
              gap-6
            "
          >

            {/* HAMMADDE */}

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
                      {ingredient.code
                        ? ` (${ingredient.code})`
                        : ""}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* LOKASYON */}

            <div>

              <label
                className="
                  block
                  text-sm
                  font-medium
                  mb-2
                "
              >
                Stok Lokasyonu
              </label>

              <select
                name="locationId"
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
                  Lokasyon seçin
                </option>

                {locations.map(
                  (location) => (
                    <option
                      key={location.id}
                      value={location.id}
                    >
                      {location.name}
                      {location.code
                        ? ` (${location.code})`
                        : ""}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* MİKTAR */}

            <div>

              <label
                className="
                  block
                  text-sm
                  font-medium
                  mb-2
                "
              >
                Çıkış Miktarı
              </label>

              <input
                type="number"
                name="quantity"
                min="0.001"
                step="0.001"
                required
                placeholder="Örn. 3"
                className="
                  w-full
                  border
                  border-gray-300
                  rounded-lg
                  px-4
                  py-3
                "
              />

              <p
                className="
                  text-xs
                  text-gray-500
                  mt-2
                "
              >
                Miktar, seçilen hammaddenin
                temel stok birimi üzerinden
                düşülecektir.
              </p>

            </div>

            {/* NEDEN */}

            <div>

              <label
                className="
                  block
                  text-sm
                  font-medium
                  mb-2
                "
              >
                Açıklama
              </label>

              <input
                type="text"
                name="reason"
                placeholder="Örn. Bozulma, kullanım, test..."
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

        </div>

        {/* UYARI */}

        <div
          className="
            mx-6
            mb-6
            bg-orange-50
            border
            border-orange-200
            rounded-xl
            p-5
          "
        >

          <h3
            className="
              font-semibold
              text-orange-900
            "
          >
            Önemli
          </h3>

          <ul
            className="
              text-sm
              text-orange-800
              mt-2
              space-y-1
            "
          >

            <li>
              • Çıkış miktarı mevcut stoktan
              fazla olamaz.
            </li>

            <li>
              • Stok bakiyesi otomatik olarak
              azaltılır.
            </li>

            <li>
              • Stok hareketi
              <strong> Manuel Çıkış </strong>
              olarak kaydedilir.
            </li>

            <li>
              • Çıkış maliyeti mevcut hammadde
              maliyeti üzerinden hesaplanır.
            </li>

          </ul>

        </div>

        {/* BUTONLAR */}

        <div
          className="
            flex
            items-center
            justify-end
            gap-3
            border-t
            border-gray-200
            p-6
          "
        >

          <Link
            href="/admin/stock"
            className="
              px-5
              py-3
              rounded-lg
              border
              border-gray-300
              bg-white
              hover:bg-gray-50
              text-sm
              font-medium
            "
          >
            İptal
          </Link>

          <button
            type="submit"
            className="
              px-5
              py-3
              rounded-lg
              bg-black
              text-white
              hover:bg-gray-800
              text-sm
              font-medium
            "
          >
            − Stok Çıkışı Yap
          </button>

        </div>

      </form>

      {/* MEVCUT STOKLAR */}

      <section
        className="
          mt-6
          bg-white
          rounded-xl
          shadow
          p-6
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            mb-5
          "
        >

          <div>

            <h2
              className="
                text-xl
                font-bold
              "
            >
              Mevcut Stoklar
            </h2>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              Çıkış yapabileceğiniz mevcut
              stoklar.
            </p>

          </div>

        </div>

        {balances.length === 0 ? (

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
              Henüz stok bulunmuyor.
            </p>

            <Link
              href="/admin/stock/entry"
              className="
                inline-block
                mt-4
                bg-black
                text-white
                px-4
                py-2
                rounded-lg
              "
            >
              İlk Stok Girişini Yap
            </Link>

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

                  <th
                    className="
                      text-left
                      px-4
                      py-3
                    "
                  >
                    Hammadde
                  </th>

                  <th
                    className="
                      text-left
                      px-4
                      py-3
                    "
                  >
                    Lokasyon
                  </th>

                  <th
                    className="
                      text-right
                      px-4
                      py-3
                    "
                  >
                    Mevcut
                  </th>

                  <th
                    className="
                      text-right
                      px-4
                      py-3
                    "
                  >
                    Birim
                  </th>

                  <th
                    className="
                      text-right
                      px-4
                      py-3
                    "
                  >
                    Birim Maliyet
                  </th>

                </tr>

              </thead>

              <tbody>

                {balances
                  .filter(
                    (balance) =>
                      balance.quantity > 0
                  )
                  .map((balance) => {

                    const ingredient =
                      ingredients.find(
                        (item) =>
                          item.id ===
                          balance.ingredientId
                      );

                    const location =
                      locations.find(
                        (item) =>
                          item.id ===
                          balance.locationId
                      );

                    if (
                      !ingredient ||
                      !location
                    ) {
                      return null;
                    }

                    return (
                      <tr
                        key={balance.id}
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
                          {ingredient.name}
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                            text-gray-600
                          "
                        >
                          {location.name}
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                            text-right
                            font-semibold
                            text-green-600
                          "
                        >
                          {formatNumber(
                            balance.quantity
                          )}
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                            text-right
                            text-gray-500
                          "
                        >
                          {unitLabel(
                            ingredient.baseUnit
                          )}
                        </td>

                        <td
                          className="
                            px-4
                            py-4
                            text-right
                          "
                        >
                          {formatNumber(
                            ingredient.currentCostPerBaseUnit
                          )}{" "}
                          TL
                        </td>

                      </tr>
                    );

                  })}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </main>
  );
}
