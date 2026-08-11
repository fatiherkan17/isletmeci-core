import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

type SearchParams = {
  success?: string;
  error?: string;
};

async function createStockExit(formData: FormData) {
  "use server";

  const ingredientId = String(formData.get("ingredientId") || "");
  const locationId = String(formData.get("locationId") || "");
  const quantity = Number(formData.get("quantity") || 0);
  const reason = String(formData.get("reason") || "").trim();

  if (!ingredientId || !locationId) {
    throw new Error("Hammadde ve stok lokasyonu seçilmelidir.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Çıkış miktarı 0'dan büyük olmalıdır.");
  }

  const ingredient = await prisma.ingredient.findUnique({
    where: {
      id: ingredientId,
    },
  });

  if (!ingredient || !ingredient.active) {
    throw new Error("Seçilen hammadde bulunamadı veya pasif durumda.");
  }

  const location = await prisma.stockLocation.findUnique({
    where: {
      id: locationId,
    },
  });

  if (!location || !location.active) {
    throw new Error("Seçilen stok lokasyonu bulunamadı veya pasif durumda.");
  }

  await prisma.$transaction(async (tx) => {
    const balance = await tx.stockBalance.findUnique({
      where: {
        ingredientId_locationId: {
          ingredientId,
          locationId,
        },
      },
    });

    const currentQuantity = balance?.quantity ?? 0;

    if (currentQuantity < quantity) {
      throw new Error(
        `Yetersiz stok. Mevcut stok: ${currentQuantity} ${ingredient.baseUnit}`
      );
    }

    const newQuantity = currentQuantity - quantity;

    await tx.stockBalance.upsert({
      where: {
        ingredientId_locationId: {
          ingredientId,
          locationId,
        },
      },
      update: {
        quantity: newQuantity,
      },
      create: {
        ingredientId,
        locationId,
        quantity: newQuantity,
      },
    });

    await tx.stockMovement.create({
      data: {
        ingredientId,
        locationId,
        type: "MANUAL_OUT",
        quantity,
        unit: ingredient.baseUnit,
        unitCost: ingredient.currentCostPerBaseUnit,
        totalCost: quantity * ingredient.currentCostPerBaseUnit,
        reason: reason || "Manuel stok çıkışı",
      },
    });
  });

  return;
}

export default async function StockExitPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

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
    orderBy: {
      name: "asc",
    },
  });

  const balances = await prisma.stockBalance.findMany();

  const balanceMap = new Map<string, number>();

  for (const balance of balances) {
    balanceMap.set(
      `${balance.ingredientId}_${balance.locationId}`,
      balance.quantity
    );
  }

  const success = params.success === "1";
  const error = params.error;

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* BA�?LIK */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Stok Çıkışı
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Depo veya stok alanından hammadde çıkışı yapın.
            </p>
          </div>

          <Link
            href="/admin/stock"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            ← Stok Yönetimi
          </Link>
        </div>

        {/* BA�?ARILI */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            Stok çıkışı başarıyla gerçekleştirildi.
          </div>
        )}

        {/* HATA */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        )}

        {/* VERİ YOK */}
        {ingredients.length === 0 || locations.length === 0 ? (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Stok çıkışı yapılamıyor
            </h2>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              {ingredients.length === 0 && (
                <p>Önce en az bir aktif hammadde tanımlamalısınız.</p>
              )}

              {locations.length === 0 && (
                <p>Önce en az bir aktif stok lokasyonu tanımlamalısınız.</p>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              {ingredients.length === 0 && (
                <Link
                  href="/admin/stock/ingredients"
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Hammadde Yönetimi
                </Link>
              )}

              {locations.length === 0 && (
                <Link
                  href="/admin/stock/locations"
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Lokasyon Yönetimi
                </Link>
              )}
            </div>
          </section>
        ) : (
          <form
            action={createStockExit}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            {/* FORM BA�?LI�?I */}
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Yeni Stok Çıkışı
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Seçilen hammaddenin stok miktarı azaltılacaktır.
              </p>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              {/* HAMMADDE */}
              <div className="md:col-span-2">
                <label
                  htmlFor="ingredientId"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Hammadde
                </label>

                <select
                  id="ingredientId"
                  name="ingredientId"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                >
                  <option value="">Hammadde seçin</option>

                  {ingredients.map((ingredient) => (
                    <option
                      key={ingredient.id}
                      value={ingredient.id}
                    >
                      {ingredient.name} — mevcut maliyet:{" "}
                      {ingredient.currentCostPerBaseUnit.toFixed(2)} TL /{" "}
                      {ingredient.baseUnit}
                    </option>
                  ))}
                </select>
              </div>

              {/* LOKASYON */}
              <div>
                <label
                  htmlFor="locationId"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Stok Lokasyonu
                </label>

                <select
                  id="locationId"
                  name="locationId"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                >
                  <option value="">Lokasyon seçin</option>

                  {locations.map((location) => (
                    <option
                      key={location.id}
                      value={location.id}
                    >
                      {location.name}
                      {location.code ? ` — ${location.code}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* MİKTAR */}
              <div>
                <label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Çıkış Miktarı
                </label>

                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  required
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Miktar, hammaddenin temel birimi üzerinden girilir.
                </p>
              </div>

              {/* AÇIKLAMA */}
              <div className="md:col-span-2">
                <label
                  htmlFor="reason"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Açıklama
                </label>

                <textarea
                  id="reason"
                  name="reason"
                  rows={4}
                  placeholder="Örn: Fire, kullanım, bozulma veya manuel çıkış açıklaması"
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            {/* BİLGİ */}
            <div className="mx-6 mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="mb-2 font-medium text-gray-900">
                Bu işlemde ne olacak?
              </div>

              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Stok hareketi oluşturulacak.</li>

                <li>
                  • Seçilen lokasyonun stoğu azaltılacak.
                </li>

                <li>
                  • Çıkış, mevcut hammadde maliyeti üzerinden
                  kaydedilecek.
                </li>

                <li>
                  • İşlem stok hareketlerinde kayıt altında tutulacak.
                </li>

                <li>
                  • Yeterli stok yoksa işlem gerçekleştirilmeyecek.
                </li>
              </ul>
            </div>

            {/* BUTONLAR */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
              <Link
                href="/admin/stock"
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium hover:bg-gray-50"
              >
                İptal
              </Link>

              <button
                type="submit"
                className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                − Stok Çıkışı Yap
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}



