import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

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

export default async function PurchaseSuggestionsPage() {
  const ingredients = await prisma.ingredient.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const locations = await prisma.stockLocation.findMany({
    where: {
      active: true,
    },
  });

  const balances = await prisma.stockBalance.findMany();

  const balanceMap = new Map<string, number>();

  for (const balance of balances) {
    const key =
      `${balance.ingredientId}:${balance.locationId}`;

    balanceMap.set(
      key,
      (balanceMap.get(key) ?? 0) +
        balance.quantity
    );
  }

  const suggestions = ingredients
    .map((ingredient) => {
      const totalStock = locations.reduce(
        (sum, location) => {
          const key =
            `${ingredient.id}:${location.id}`;

          return (
            sum +
            (balanceMap.get(key) ?? 0)
          );
        },
        0
      );

      const minStock =
        ingredient.minStock ?? 0;

      const targetStock =
        ingredient.targetStock ?? 0;

      if (
        totalStock > minStock
      ) {
        return null;
      }

      const purchaseQuantity =
        Math.max(
          0,
          targetStock - totalStock
        );

      return {
        id: ingredient.id,
        name: ingredient.name,
        category: ingredient.category,
        unit: ingredient.baseUnit,
        currentStock: totalStock,
        minStock,
        targetStock,
        purchaseQuantity,
        currentCost:
          ingredient.currentCostPerBaseUnit ?? 0,
        estimatedCost:
          purchaseQuantity *
          (ingredient.currentCostPerBaseUnit ?? 0),
      };
    })
    .filter(
      (
        item
      ): item is NonNullable<typeof item> =>
        item !== null
    );

  const totalEstimatedCost =
    suggestions.reduce(
      (sum, item) =>
        sum + item.estimatedCost,
      0
    );

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-3xl font-bold">
              Satın Alma İhtiyaçları
            </h1>

            <p className="text-gray-500 mt-1">
              Kritik stoklara göre önerilen
              satın alma miktarlarını yönetin.
            </p>
          </div>

          <Link
            href="/admin/stock"
            className="
              border
              border-gray-300
              bg-white
              px-5
              py-3
              rounded-lg
              font-medium
            "
          >
            ← Stok
          </Link>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white rounded-xl border p-5">
            <div className="text-sm text-gray-500">
              Kritik Hammadde
            </div>

            <div className="text-3xl font-bold mt-2">
              {suggestions.length}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <div className="text-sm text-gray-500">
              Tahmini Satın Alma
            </div>

            <div className="text-3xl font-bold mt-2">
              {totalEstimatedCost.toFixed(2)} TL
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <div className="text-sm text-gray-500">
              Sistem Mantığı
            </div>

            <div className="font-semibold mt-2">
              Minimum → Hedef Stok
            </div>
          </div>

        </div>

        <div className="bg-white rounded-xl border overflow-hidden">

          <div className="p-5 border-b">
            <h2 className="text-xl font-bold">
              Satın Alma Önerileri
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Mevcut stok minimum seviyeye
              ulaştığında hedef stoğa kadar
              tamamlanması önerilir.
            </p>
          </div>

          {suggestions.length === 0 ? (

            <div className="p-10 text-center">

              <div className="text-green-600 font-semibold text-lg">
                ✓ Satın alma gerektiren kritik
                hammadde bulunmuyor.
              </div>

              <p className="text-gray-500 mt-2">
                Tüm aktif hammaddeler minimum
                stok seviyesinin üzerinde.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 border-b">

                  <tr>

                    <th className="text-left px-5 py-4">
                      Hammadde
                    </th>

                    <th className="text-right px-5 py-4">
                      Mevcut
                    </th>

                    <th className="text-right px-5 py-4">
                      Minimum
                    </th>

                    <th className="text-right px-5 py-4">
                      Hedef
                    </th>

                    <th className="text-right px-5 py-4">
                      Önerilen
                    </th>

                    <th className="text-right px-5 py-4">
                      Tahmini Maliyet
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {suggestions.map(
                    (item) => (

                      <tr
                        key={item.id}
                        className="border-b last:border-0"
                      >

                        <td className="px-5 py-4">

                          <div className="font-semibold">
                            {item.name}
                          </div>

                          {item.category && (
                            <div className="text-xs text-gray-500">
                              {item.category}
                            </div>
                          )}

                        </td>

                        <td className="px-5 py-4 text-right text-red-600 font-semibold">
                          {item.currentStock.toFixed(3)}{" "}
                          {unitLabel(item.unit)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {item.minStock.toFixed(3)}{" "}
                          {unitLabel(item.unit)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          {item.targetStock.toFixed(3)}{" "}
                          {unitLabel(item.unit)}
                        </td>

                        <td className="px-5 py-4 text-right font-bold">
                          {item.purchaseQuantity.toFixed(3)}{" "}
                          {unitLabel(item.unit)}
                        </td>

                        <td className="px-5 py-4 text-right font-semibold">
                          {item.estimatedCost.toFixed(2)} TL
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">

          <h3 className="font-semibold text-blue-900">
            Sistem nasıl hesaplıyor?
          </h3>

          <p className="text-sm text-blue-800 mt-1">
            Mevcut stok minimum seviyeye
            eşit veya altındaysa sistem,
            mevcut stok ile hedef stok
            arasındaki farkı önerilen satın
            alma miktarı olarak hesaplar.
          </p>

        </div>

      </div>
    </main>
  );
}
