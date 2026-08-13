"use server";

import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function createStockEntry(formData: FormData) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const role = String(session.role ?? "");

  if (role !== "OWNER" && role !== "MANAGER") {
    throw new Error("Bu islem icin yetkiniz bulunmuyor.");
  }

  const ingredientId = String(formData.get("ingredientId") ?? "");
  const locationId = String(formData.get("locationId") ?? "");
  const quantityRaw = String(formData.get("quantity") ?? "");
  const unitCostRaw = String(formData.get("unitCost") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  const quantity = Number(quantityRaw);
  const unitCost = Number(unitCostRaw);

  if (!ingredientId) {
    throw new Error("Hammadde secilmelidir.");
  }

  if (!locationId) {
    throw new Error("Stok lokasyonu secilmelidir.");
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Miktar 0'dan buyuk olmalidir.");
  }

  if (!Number.isFinite(unitCost) || unitCost < 0) {
    throw new Error("Birim maliyet gecerli olmalidir.");
  }

  const ingredient = await prisma.ingredient.findUnique({
    where: {
      id: ingredientId,
    },
  });

  if (!ingredient) {
    throw new Error("Hammadde bulunamadi.");
  }

  if (!ingredient.active) {
    throw new Error("Secilen hammadde pasif durumda.");
  }

  const location = await prisma.stockLocation.findUnique({
    where: {
      id: locationId,
    },
  });

  if (!location) {
    throw new Error("Stok lokasyonu bulunamadi.");
  }

  if (!location.active) {
    throw new Error("Secilen stok lokasyonu pasif durumda.");
  }

  const totalCost = quantity * unitCost;

  await prisma.$transaction(async (tx) => {
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

    const existingStockCost =
      existingQuantity * currentCost;

    const totalQuantity =
      existingQuantity + quantity;

    const newAverageCost =
      totalQuantity > 0
        ? (existingStockCost + totalCost) /
          totalQuantity
        : unitCost;

    await tx.stockMovement.create({
      data: {
        ingredientId,
        locationId,
        type: "PURCHASE",
        quantity,
        unit: ingredient.baseUnit,
        unitCost,
        totalCost,
        reason: reason || "Manuel stok girisi",
      },
    });

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

  redirect("/admin/stock?stockEntry=success");
}

export default async function StockEntryPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const role = String(session.role ?? "");

  if (role !== "OWNER" && role !== "MANAGER") {
    redirect("/admin/stock");
  }

  const [ingredients, locations] =
    await Promise.all([
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

  const unitLabel = (unit: string) => {
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
  };

  return (
    <main className="max-w-5xl space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Stok Girisi
          </h1>

          <p className="text-gray-500 mt-1">
            Depoya veya stok alanina yeni hammadde girisi yapin.
          </p>
        </div>

        <a
          href="/admin/stock"
          className="border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg text-sm"
        >
          Geri Don
        </a>
      </div>

      {ingredients.length === 0 ||
      locations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">

          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Stok girisi yapilamiyor
          </h2>

          {ingredients.length === 0 && (
            <p className="text-gray-600 mb-2">
              Once en az bir aktif hammadde tanimlamalisiniz.
            </p>
          )}

          {locations.length === 0 && (
            <p className="text-gray-600 mb-2">
              Once en az bir aktif stok lokasyonu tanimlamalisiniz.
            </p>
          )}

          <div className="flex gap-3 mt-6">

            {ingredients.length === 0 && (
              <a
                href="/admin/stock/ingredients"
                className="bg-black text-white px-4 py-2 rounded-lg text-sm"
              >
                Hammadde Yonetimi
              </a>
            )}

            {locations.length === 0 && (
              <a
                href="/admin/stock/locations"
                className="border border-gray-300 px-4 py-2 rounded-lg text-sm"
              >
                Lokasyon Yonetimi
              </a>
            )}

          </div>
        </div>
      ) : (

        <form
          action={createStockEntry}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >

          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-semibold">
              Yeni Stok Girisi
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Girilen miktar secilen lokasyonun stok bakiyesine eklenecektir.
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

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
                  Hammadde secin
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
                  Lokasyon secin
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
                Miktar, hammaddenin temel birimi uzerinden girilir.
              </p>
            </div>

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
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              />

              <p className="text-xs text-gray-500 mt-2">
                Bir temel birimin alis maliyetini girin.
              </p>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Aciklama
              </label>

              <textarea
                id="reason"
                name="reason"
                rows={4}
                placeholder="Orn: 13 Agustos tedarikci alimi"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none resize-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

          </div>

          <div className="mx-6 mb-6 rounded-lg bg-gray-50 border border-gray-200 p-4">

            <div className="font-medium text-gray-900 mb-2">
              Bu islemde ne olacak?
            </div>

            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                - Stok hareketi olusturulacak.
              </li>

              <li>
                - Secilen lokasyonun stogu artirilacak.
              </li>

              <li>
                - Hammadde guncel maliyeti agirlikli ortalama ile guncellenecek.
              </li>

              <li>
                - Islem stok hareketlerinde kayit altinda tutulacak.
              </li>
            </ul>

          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">

            <a
              href="/admin/stock"
              className="px-5 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium"
            >
              Iptal
            </a>

            <button
              type="submit"
              className="px-5 py-3 rounded-lg bg-black text-white hover:bg-gray-800 text-sm font-medium"
            >
              Stok Girisini Kaydet
            </button>

          </div>

        </form>
      )}

    </main>
  );
}
