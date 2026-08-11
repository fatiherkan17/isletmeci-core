import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function createStockEntry(formData: FormData) {
  "use server";

  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const role = String(session.role ?? "");

  if (role !== "OWNER" && role !== "MANAGER") {
    throw new Error("Bu işlem için yetkiniz bulunmuyor.");
  }

  const ingredientId = String(formData.get("ingredientId") ?? "");
  const locationId = String(formData.get("locationId") ?? "");
  const quantityRaw = String(formData.get("quantity") ?? "");
  const unitCostRaw = String(formData.get("unitCost") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  const quantity = Number(quantityRaw);
  const unitCost = Number(unitCostRaw);

  if (!ingredientId) {
    throw new Error("Hammadde seçilmelidir.");
  }

  if (!locationId) {
    throw new Error("Stok lokasyonu seçilmelidir.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Miktar 0'dan büyük olmalıdır.");
  }

  if (!Number.isFinite(unitCost) || unitCost < 0) {
    throw new Error("Birim maliyet geçerli olmalıdır.");
  }

  const ingredient = await prisma.ingredient.findUnique({
    where: {
      id: ingredientId,
    },
  });

  if (!ingredient) {
    throw new Error("Hammadde bulunamadı.");
  }

  if (!ingredient.active) {
    throw new Error("Seçilen hammadde pasif durumda.");
  }

  const location = await prisma.stockLocation.findUnique({
    where: {
      id: locationId,
    },
  });

  if (!location) {
    throw new Error("Stok lokasyonu bulunamadı.");
  }

  if (!location.active) {
    throw new Error("Seçilen stok lokasyonu pasif durumda.");
  }

  const totalCost = quantity * unitCost;

  await prisma.$transaction(async (tx) => {
    /*
     * Mevcut tüm stok bakiyelerini alıyoruz.
     * Ağırlıklı ortalama maliyet hesabında kullanılacak.
     */
    const existingBalances = await tx.stockBalance.findMany({
      where: {
        ingredientId,
      },
      select: {
        quantity: true,
      },
    });

    const existingQuantity = existingBalances.reduce(
      (total, balance) => total + balance.quantity,
      0
    );

    const currentCost = ingredient.currentCostPerBaseUnit ?? 0;

    const existingStockCost = existingQuantity * currentCost;

    const totalQuantity = existingQuantity + quantity;

    const newAverageCost =
      totalQuantity > 0
        ? (existingStockCost + totalCost) / totalQuantity
        : unitCost;

    /*
     * 1. Stok hareketi oluştur
     */
    await tx.stockMovement.create({
      data: {
        ingredientId,
        locationId,
        type: "PURCHASE",
        quantity,
        unit: ingredient.baseUnit,
        unitCost,
        totalCost,
        reason: reason || "Manuel stok girişi",
      },
    });

    /*
     * 2. Stok bakiyesini artır
     */
    await tx.stockBalance.upsert({
      where: {
        ingredientId_locationId: {
          ingredientId,
          locationId,
        },
      },
      create: {
        ingredientId,
        locationId,
        quantity,
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
    });

    /*
     * 3. Güncel ortalama maliyeti güncelle
     */
    await tx.ingredient.update({
      where: {
        id: ingredientId,
      },
      data: {
        currentCostPerBaseUnit: newAverageCost,
      },
    });
  });

  revalidatePath("/admin/stock");
  revalidatePath("/admin/stock/ingredients");
  revalidatePath("/admin/stock/locations");
  revalidatePath("/admin/stock/entry");

  redirect("/admin/stock/entry?success=1");
}

export default async function StockEntryPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
  }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const role = String(session.role ?? "");

  if (role !== "OWNER" && role !== "MANAGER") {
    redirect("/admin/stock");
  }

  const params = await searchParams;

  const [ingredients, locations] = await Promise.all([
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
  ]);

  const success = params.success === "1";

  return (
    <main className="max-w-5xl">
      {/* HEADER */}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Stok Girişi
          </h1>

          <p className="text-gray-500 mt-1">
            Depoya veya stok alanına yeni hammadde girişi yapın.
          </p>
        </div>

        <a
          href="/admin/stock"
          className="border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg text-sm"
        >
          ← Stok Yönetimi
        </a>
      </div>

      {/* BAŞARI MESAJI */}

      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
          <div className="font-semibold">
            Stok girişi başarılı.
          </div>

          <div className="text-sm mt-1">
            Stok bakiyesi ve maliyet bilgisi güncellendi.
          </div>
        </div>
      )}

      {/* HAMMADDE VEYA LOKASYON YOKSA */}

      {ingredients.length === 0 || locations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Stok girişi yapılamıyor
          </h2>

          {ingredients.length === 0 && (
            <p className="text-gray-600 mb-2">
              Önce en az bir aktif hammadde tanımlamalısınız.
            </p>
          )}

          {locations.length === 0 && (
            <p className="text-gray-600 mb-2">
              Önce en az bir aktif stok lokasyonu tanımlamalısınız.
            </p>
          )}

          <div className="flex gap-3 mt-6">
            {ingredients.length === 0 && (
              <a
                href="/admin/stock/ingredients"
                className="bg-black text-white px-4 py-2 rounded-lg text-sm"
              >
                Hammadde Yönetimi
              </a>
            )}

            {locations.length === 0 && (
              <a
                href="/admin/stock/locations"
                className="border border-gray-300 px-4 py-2 rounded-lg text-sm"
              >
                Lokasyon Yönetimi
              </a>
            )}
          </div>
        </div>
      ) : (
        <form
          action={createStockEntry}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          {/* FORM BAŞLIĞI */}

          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Yeni Stok Girişi
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Seçilen hammadde, seçilen lokasyonun stok bakiyesine
              eklenecektir.
            </p>
          </div>

          {/* FORM ALANLARI */}

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* HAMMADDE */}

            <div className="md:col-span-2">
              <label
                htmlFor="ingredientId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Hammadde
              </label>

              <select
                id="ingredientId"
                name="ingredientId"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value="">
                  Hammadde seçin
                </option>

                {ingredients.map((ingredient) => (
                  <option
                    key={ingredient.id}
                    value={ingredient.id}
                  >
                    {ingredient.name}
                    {ingredient.code
                      ? ` (${ingredient.code})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* LOKASYON */}

            <div>
              <label
                htmlFor="locationId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Stok Lokasyonu
              </label>

              <select
                id="locationId"
                name="locationId"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value="">
                  Lokasyon seçin
                </option>

                {locations.map((location) => (
                  <option
                    key={location.id}
                    value={location.id}
                  >
                    {location.name}
                    {location.code
                      ? ` (${location.code})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* MİKTAR */}

            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Miktar
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

              <p className="text-xs text-gray-500 mt-2">
                Miktar, hammaddenin temel birimi üzerinden girilir.
              </p>
            </div>

            {/* BİRİM MALİYET */}

            <div>
              <label
                htmlFor="unitCost"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Birim Maliyet (TL)
              </label>

              <input
                id="unitCost"
                name="unitCost"
                type="number"
                min="0"
                step="0.0001"
                required
                placeholder="0,00"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              />

              <p className="text-xs text-gray-500 mt-2">
                Bir temel birimin alış maliyetini girin.
              </p>
            </div>

            {/* AÇIKLAMA */}

            <div className="md:col-span-2">
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Açıklama
              </label>

              <textarea
                id="reason"
                name="reason"
                rows={4}
                placeholder="Örn: 11 Ağustos tedarikçi alımı"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none resize-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* BİLGİ KUTUSU */}

          <div className="mx-6 mb-6 rounded-lg bg-gray-50 border border-gray-200 p-4">
            <div className="font-medium text-gray-900 mb-2">
              Bu işlemde ne olacak?
            </div>

            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Stok hareketi oluşturulacak.</li>

              <li>
                • Seçilen lokasyonun stoğu artırılacak.
              </li>

              <li>
                • Hammadde güncel maliyeti ağırlıklı ortalama ile
                güncellenecek.
              </li>

              <li>
                • İşlem stok hareketlerinde kayıt altında tutulacak.
              </li>
            </ul>
          </div>

          {/* ALT BUTONLAR */}

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
            <a
              href="/admin/stock"
              className="px-5 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium"
            >
              İptal
            </a>

            <button
              type="submit"
              className="px-5 py-3 rounded-lg bg-black text-white hover:bg-gray-800 text-sm font-medium"
            >
              + Stok Girişi Yap
            </button>
          </div>
        </form>
      )}
    </main>
  );
}