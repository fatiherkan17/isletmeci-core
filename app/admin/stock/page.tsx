import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

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

function movementLabel(type: string) {
  switch (type) {
    case "PURCHASE":
      return "Satın Alma";
    case "SALE_CONSUMPTION":
      return "Satış Tüketimi";
    case "WASTE":
      return "Fire";
    case "COUNT_ADJUSTMENT":
      return "Sayım Düzeltmesi";
    case "TRANSFER_IN":
      return "Transfer Girişi";
    case "TRANSFER_OUT":
      return "Transfer Çıkışı";
    case "RETURN":
      return "İade";
    case "MANUAL_IN":
      return "Manuel Giriş";
    case "MANUAL_OUT":
      return "Manuel Çıkış";
    default:
      return type;
  }
}

function movementColor(type: string) {
  switch (type) {
    case "PURCHASE":
    case "TRANSFER_IN":
    case "RETURN":
    case "MANUAL_IN":
      return "bg-green-100 text-green-700";

    case "SALE_CONSUMPTION":
    case "WASTE":
    case "TRANSFER_OUT":
    case "MANUAL_OUT":
      return "bg-red-100 text-red-700";

    case "COUNT_ADJUSTMENT":
      return "bg-orange-100 text-orange-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default async function StockPage() {
  const [
    ingredients,
    locations,
    balances,
    recentMovements,
  ] = await Promise.all([
    prisma.ingredient.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.stockLocation.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.stockBalance.findMany(),

    prisma.stockMovement.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
  ]);

  const balanceMap = new Map<string, number>();

  for (const balance of balances) {
    const current = balanceMap.get(balance.ingredientId) || 0;

    balanceMap.set(
      balance.ingredientId,
      current + balance.quantity
    );
  }

  let criticalStockCount = 0;
  let outOfStockCount = 0;
  let estimatedStockValue = 0;

  const ingredientRows = ingredients.map((ingredient) => {
    const quantity =
      balanceMap.get(ingredient.id) || 0;

    const isOutOfStock =
      quantity <= 0;

    const isCritical =
      !isOutOfStock &&
      quantity <= ingredient.minStock;

    if (isOutOfStock) {
      outOfStockCount++;
    }

    if (isCritical) {
      criticalStockCount++;
    }

    estimatedStockValue +=
      quantity * ingredient.currentCostPerBaseUnit;

    return {
      ingredient,
      quantity,
      isOutOfStock,
      isCritical,
    };
  });

  const criticalIngredients = ingredientRows.filter(
    (item) =>
      item.isCritical ||
      item.isOutOfStock
  );

  return (
    <main className="space-y-6">

      {/* =====================================================
          ÜST BAŞLIK
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Stok Yönetimi
          </h1>

          <p className="text-gray-500 mt-1">
            Hammadde, stok ve stok hareketlerini buradan takip edin.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <Link
            href="/admin/stock/ingredients"
            className="
              border border-gray-300
              bg-white
              px-4 py-2
              rounded-lg
              hover:bg-gray-50
              transition
            "
          >
            Hammaddeler
          </Link>

          <Link
            href="/admin/stock/locations"
            className="
              border border-gray-300
              bg-white
              px-4 py-2
              rounded-lg
              hover:bg-gray-50
              transition
            "
          >
            Lokasyonlar
          </Link>

          <Link
            href="/admin/stock/entry"
            className="
              bg-black
              text-white
              px-4 py-2
              rounded-lg
              hover:bg-gray-800
              transition
            "
          >
            + Stok Girişi
          </Link>

          <Link
            href="/admin/stock/count"
            className="
              border border-gray-300
              bg-white
              px-4 py-2
              rounded-lg
              hover:bg-gray-50
              transition
            "
          >
            Sayım
          </Link>

        </div>

      </div>


      {/* =====================================================
          ÖZET KARTLARI
      ====================================================== */}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* HAMMADDE */}

        <div className="bg-white rounded-xl shadow p-6">

          <p className="text-sm text-gray-500">
            Hammadde
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {ingredients.length}
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Aktif hammadde
          </p>

        </div>


        {/* KRİTİK */}

        <div className="bg-white rounded-xl shadow p-6">

          <p className="text-sm text-gray-500">
            Kritik Stok
          </p>

          <h2
            className={`text-3xl font-bold mt-2 ${
              criticalStockCount > 0
                ? "text-orange-500"
                : "text-gray-900"
            }`}
          >
            {criticalStockCount}
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Minimum seviyede veya altında
          </p>

        </div>


        {/* STOK YOK */}

        <div className="bg-white rounded-xl shadow p-6">

          <p className="text-sm text-gray-500">
            Stok Yok
          </p>

          <h2
            className={`text-3xl font-bold mt-2 ${
              outOfStockCount > 0
                ? "text-red-600"
                : "text-gray-900"
            }`}
          >
            {outOfStockCount}
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Mevcut miktarı olmayan
          </p>

        </div>


        {/* DEĞER */}

        <div className="bg-white rounded-xl shadow p-6">

          <p className="text-sm text-gray-500">
            Tahmini Stok Değeri
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {formatMoney(estimatedStockValue)} TL
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Güncel maliyetlere göre
          </p>

        </div>

      </div>


      {/* =====================================================
          STOK LOKASYONLARI
      ====================================================== */}

      <section className="bg-white rounded-xl shadow p-6">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-xl font-bold">
              Stok Lokasyonları
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Depo ve stok alanları
            </p>
          </div>

          <span className="text-sm text-gray-500">
            {locations.length} lokasyon
          </span>

        </div>


        {locations.length === 0 ? (

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
              Henüz stok lokasyonu oluşturulmamış.
            </p>

            <Link
              href="/admin/stock/locations"
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
              İlk Lokasyonu Oluştur
            </Link>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">

            {locations.map((location) => {

              const locationBalance = balances.filter(
                (balance) =>
                  balance.locationId === location.id
              );

              const totalQuantity =
                locationBalance.reduce(
                  (sum, balance) =>
                    sum + balance.quantity,
                  0
                );

              return (
                <div
                  key={location.id}
                  className="
                    border
                    border-gray-200
                    rounded-lg
                    p-4
                    hover:border-gray-400
                    transition
                  "
                >

                  <div className="flex items-center justify-between">

                    <h3 className="font-semibold">
                      {location.name}
                    </h3>

                    <span className="text-xs text-gray-400">
                      {location.code || ""}
                    </span>

                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    {locationBalance.length} stok kaydı
                  </p>

                  <p className="text-sm font-medium mt-3">
                    Toplam miktar:{" "}
                    {formatNumber(totalQuantity)}
                  </p>

                </div>
              );

            })}

          </div>

        )}

      </section>


      {/* =====================================================
          KRİTİK STOKLAR
      ====================================================== */}

      <section className="bg-white rounded-xl shadow p-6">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-xl font-bold">
              Kritik Stoklar
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Minimum stok seviyesine ulaşan hammaddeler
            </p>
          </div>

          <span
            className="
              min-w-7
              h-7
              px-2
              rounded-full
              bg-orange-100
              text-orange-600
              text-sm
              flex
              items-center
              justify-center
            "
          >
            {criticalIngredients.length}
          </span>

        </div>


        {criticalIngredients.length === 0 ? (

          <div
            className="
              border
              border-green-200
              bg-green-50
              rounded-lg
              p-5
            "
          >

            <p className="text-green-700">
              Kritik seviyede stok bulunmuyor.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="text-left px-4 py-3">
                    Hammadde
                  </th>

                  <th className="text-left px-4 py-3">
                    Birim
                  </th>

                  <th className="text-right px-4 py-3">
                    Mevcut
                  </th>

                  <th className="text-right px-4 py-3">
                    Minimum
                  </th>

                  <th className="text-right px-4 py-3">
                    Hedef
                  </th>

                  <th className="text-center px-4 py-3">
                    Durum
                  </th>

                </tr>

              </thead>

              <tbody>

                {criticalIngredients.map(
                  ({
                    ingredient,
                    quantity,
                    isOutOfStock,
                  }) => (

                    <tr
                      key={ingredient.id}
                      className="border-b last:border-0"
                    >

                      <td className="px-4 py-4 font-medium">
                        {ingredient.name}
                      </td>

                      <td className="px-4 py-4 text-gray-500">
                        {unitLabel(
                          ingredient.baseUnit
                        )}
                      </td>

                      <td
                        className={`px-4 py-4 text-right font-semibold ${
                          isOutOfStock
                            ? "text-red-600"
                            : "text-orange-600"
                        }`}
                      >
                        {formatNumber(quantity)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {formatNumber(
                          ingredient.minStock
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {formatNumber(
                          ingredient.targetStock
                        )}
                      </td>

                      <td className="px-4 py-4 text-center">

                        {isOutOfStock ? (

                          <span
                            className="
                              inline-flex
                              rounded-full
                              bg-red-100
                              text-red-700
                              px-3
                              py-1
                              text-xs
                            "
                          >
                            Stok Yok
                          </span>

                        ) : (

                          <span
                            className="
                              inline-flex
                              rounded-full
                              bg-orange-100
                              text-orange-700
                              px-3
                              py-1
                              text-xs
                            "
                          >
                            Kritik
                          </span>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          HAMMADDE STOKLARI
      ====================================================== */}

      <section className="bg-white rounded-xl shadow p-6">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-xl font-bold">
              Hammadde Stokları
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Tüm aktif hammaddelerin mevcut stokları
            </p>
          </div>

          <Link
            href="/admin/stock/ingredients"
            className="text-sm text-blue-600 hover:underline"
          >
            Tümünü Yönet →
          </Link>

        </div>


        {ingredientRows.length === 0 ? (

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
              Henüz hammadde tanımlanmamış.
            </p>

            <Link
              href="/admin/stock/ingredients"
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
              Hammadde Ekle
            </Link>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="text-left px-4 py-3">
                    Hammadde
                  </th>

                  <th className="text-left px-4 py-3">
                    Kategori
                  </th>

                  <th className="text-left px-4 py-3">
                    Birim
                  </th>

                  <th className="text-right px-4 py-3">
                    Mevcut
                  </th>

                  <th className="text-right px-4 py-3">
                    Min.
                  </th>

                  <th className="text-right px-4 py-3">
                    Birim Maliyet
                  </th>

                  <th className="text-right px-4 py-3">
                    Stok Değeri
                  </th>

                </tr>

              </thead>

              <tbody>

                {ingredientRows.map(
                  ({
                    ingredient,
                    quantity,
                  }) => (

                    <tr
                      key={ingredient.id}
                      className="border-b last:border-0"
                    >

                      <td className="px-4 py-4 font-medium">
                        {ingredient.name}
                      </td>

                      <td className="px-4 py-4 text-gray-500">
                        {ingredient.category || "-"}
                      </td>

                      <td className="px-4 py-4">
                        {unitLabel(
                          ingredient.baseUnit
                        )}
                      </td>

                      <td
                        className={`px-4 py-4 text-right font-semibold ${
                          quantity <= 0
                            ? "text-red-600"
                            : quantity <=
                                ingredient.minStock
                              ? "text-orange-600"
                              : "text-gray-900"
                        }`}
                      >
                        {formatNumber(quantity)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {formatNumber(
                          ingredient.minStock
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {formatMoney(
                          ingredient.currentCostPerBaseUnit
                        )}{" "}
                        TL
                      </td>

                      <td className="px-4 py-4 text-right font-medium">
                        {formatMoney(
                          quantity *
                            ingredient.currentCostPerBaseUnit
                        )}{" "}
                        TL
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          SON STOK HAREKETLERİ
      ====================================================== */}

      <section className="bg-white rounded-xl shadow p-6">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-xl font-bold">
              Son Stok Hareketleri
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Sistemde gerçekleşen son stok işlemleri
            </p>
          </div>

        </div>


        {recentMovements.length === 0 ? (

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
              Henüz stok hareketi bulunmuyor.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="text-left px-4 py-3">
                    Tarih
                  </th>

                  <th className="text-left px-4 py-3">
                    İşlem
                  </th>

                  <th className="text-left px-4 py-3">
                    Miktar
                  </th>

                  <th className="text-left px-4 py-3">
                    Referans
                  </th>

                </tr>

              </thead>

              <tbody>

                {recentMovements.map(
                  (movement) => {

                    const ingredient =
                      ingredients.find(
                        (item) =>
                          item.id ===
                          movement.ingredientId
                      );

                    return (

                      <tr
                        key={movement.id}
                        className="border-b last:border-0"
                      >

                        <td className="px-4 py-4 text-gray-500">

                          {new Intl.DateTimeFormat(
                            "tr-TR",
                            {
                              dateStyle: "short",
                              timeStyle: "short",
                            }
                          ).format(
                            movement.createdAt
                          )}

                        </td>

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-3
                                py-1
                                text-xs
                                ${movementColor(
                                  movement.type
                                )}
                              `}
                            >
                              {movementLabel(
                                movement.type
                              )}
                            </span>

                            {ingredient && (
                              <span className="font-medium">
                                {ingredient.name}
                              </span>
                            )}

                          </div>

                        </td>

                        <td className="px-4 py-4 font-medium">
                          {formatNumber(
                            movement.quantity
                          )}
                        </td>

                        <td className="px-4 py-4 text-gray-500">
                          {movement.referenceId || "-"}
                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </main>
  );
}