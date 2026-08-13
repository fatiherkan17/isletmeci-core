import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

function unitLabel(unit: string) {
  const labels: Record<string, string> = {
    G: "g",
    KG: "kg",
    ML: "ml",
    L: "L",
    ADET: "adet",
    PAKET: "paket",
    KOLI: "koli",
  };

  return labels[unit] || unit;
}

function movementLabel(type: string) {
  const labels: Record<string, string> = {
    PURCHASE: "Satın Alma",
    SALE_CONSUMPTION: "Satış Tüketimi",
    WASTE: "Fire",
    COUNT_ADJUSTMENT: "Sayım Düzeltmesi",
    TRANSFER_IN: "Transfer Giriş",
    TRANSFER_OUT: "Transfer Çıkış",
    RETURN: "İade",
    MANUAL_IN: "Manuel Giriş",
    MANUAL_OUT: "Manuel Çıkış",
  };

  return labels[type] || type;
}

function movementClass(type: string) {
  if (
    type === "PURCHASE" ||
    type === "TRANSFER_IN" ||
    type === "RETURN" ||
    type === "MANUAL_IN"
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    type === "SALE_CONSUMPTION" ||
    type === "WASTE" ||
    type === "TRANSFER_OUT" ||
    type === "MANUAL_OUT"
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-blue-100 text-blue-700";
}

function quantityPrefix(type: string) {
  if (
    type === "PURCHASE" ||
    type === "TRANSFER_IN" ||
    type === "RETURN" ||
    type === "MANUAL_IN"
  ) {
    return "+";
  }

  if (
    type === "SALE_CONSUMPTION" ||
    type === "WASTE" ||
    type === "TRANSFER_OUT" ||
    type === "MANUAL_OUT"
  ) {
    return "-";
  }

  return "";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function StockMovementsPage() {
  const movements =
    await prisma.stockMovement.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    });

  const ingredientIds = [
    ...new Set(
      movements.map(
        (movement) => movement.ingredientId
      )
    ),
  ];

  const locationIds = [
    ...new Set(
      movements.map(
        (movement) => movement.locationId
      )
    ),
  ];

  const ingredients =
    ingredientIds.length > 0
      ? await prisma.ingredient.findMany({
          where: {
            id: {
              in: ingredientIds,
            },
          },
        })
      : [];

  const locations =
    locationIds.length > 0
      ? await prisma.stockLocation.findMany({
          where: {
            id: {
              in: locationIds,
            },
          },
        })
      : [];

  const ingredientMap = new Map(
    ingredients.map((ingredient) => [
      ingredient.id,
      ingredient,
    ])
  );

  const locationMap = new Map(
    locations.map((location) => [
      location.id,
      location,
    ])
  );

  const purchaseMovements =
    movements.filter(
      (movement) =>
        movement.type === "PURCHASE"
    );

  const totalPurchaseCost =
    purchaseMovements.reduce(
      (sum, movement) =>
        sum + movement.totalCost,
      0
    );

  return (
    <main className="min-h-screen bg-gray-100">

      <div className="max-w-7xl mx-auto px-6 py-8">

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

            <h1
              className="
                text-3xl
                font-bold
                text-gray-900
              "
            >
              Stok Hareketleri
            </h1>

            <p
              className="
                text-gray-500
                mt-1
              "
            >
              İşletmedeki tüm stok giriş ve
              çıkış hareketlerini takip edin.
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
              hover:bg-gray-50
              w-fit
            "
          >
            ← Stok
          </Link>

        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-5
            mb-6
          "
        >

          <div
            className="
              bg-white
              rounded-xl
              shadow
              p-5
            "
          >
            <p className="text-sm text-gray-500">
              Toplam Hareket
            </p>

            <p className="text-2xl font-bold mt-1">
              {movements.length}
            </p>
          </div>

          <div
            className="
              bg-white
              rounded-xl
              shadow
              p-5
            "
          >
            <p className="text-sm text-gray-500">
              Satın Alma Hareketleri
            </p>

            <p className="text-2xl font-bold mt-1">
              {purchaseMovements.length}
            </p>
          </div>

          <div
            className="
              bg-white
              rounded-xl
              shadow
              p-5
            "
          >
            <p className="text-sm text-gray-500">
              Satın Alma Tutarı
            </p>

            <p className="text-2xl font-bold mt-1">
              {totalPurchaseCost.toFixed(2)} TL
            </p>
          </div>

        </div>

        <div
          className="
            bg-white
            rounded-xl
            shadow
            overflow-hidden
          "
        >

          {movements.length === 0 ? (

            <div className="p-10 text-center">

              <p className="text-gray-500">
                Henüz stok hareketi bulunmuyor.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead
                  className="
                    bg-gray-50
                    border-b
                  "
                >

                  <tr>

                    <th className="text-left px-5 py-4">
                      Tarih
                    </th>

                    <th className="text-left px-5 py-4">
                      Hammadde
                    </th>

                    <th className="text-left px-5 py-4">
                      Hareket
                    </th>

                    <th className="text-left px-5 py-4">
                      Lokasyon
                    </th>

                    <th className="text-right px-5 py-4">
                      Miktar
                    </th>

                    <th className="text-right px-5 py-4">
                      Birim Maliyet
                    </th>

                    <th className="text-right px-5 py-4">
                      Toplam Maliyet
                    </th>

                    <th className="text-left px-5 py-4">
                      Açıklama
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {movements.map(
                    (movement) => {

                      const ingredient =
                        ingredientMap.get(
                          movement.ingredientId
                        );

                      const location =
                        locationMap.get(
                          movement.locationId
                        );

                      const prefix =
                        quantityPrefix(
                          movement.type
                        );

                      return (
                        <tr
                          key={movement.id}
                          className="
                            border-b
                            last:border-0
                            hover:bg-gray-50
                          "
                        >

                          <td
                            className="
                              px-5
                              py-4
                              text-gray-600
                              whitespace-nowrap
                            "
                          >
                            {formatDate(
                              movement.createdAt
                            )}
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              font-semibold
                            "
                          >
                            {ingredient?.name ||
                              "Hammadde bulunamadı"}
                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                ${movementClass(
                                  movement.type
                                )}
                              `}
                            >
                              {movementLabel(
                                movement.type
                              )}
                            </span>

                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-gray-600
                            "
                          >
                            {location?.name || "-"}
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-right
                              font-semibold
                              whitespace-nowrap
                            "
                          >

                            <span
                              className={
                                prefix === "+"
                                  ? "text-green-600"
                                  : prefix === "-"
                                  ? "text-red-600"
                                  : "text-gray-700"
                              }
                            >
                              {prefix}
                              {movement.quantity}{" "}
                              {unitLabel(
                                movement.unit
                              )}
                            </span>

                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-right
                              whitespace-nowrap
                            "
                          >
                            {movement.unitCost.toFixed(2)} TL
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-right
                              font-semibold
                              whitespace-nowrap
                            "
                          >
                            {movement.totalCost.toFixed(2)} TL
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-gray-600
                            "
                          >
                            {movement.reason || "-"}
                          </td>

                        </tr>
                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}
