import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function createIngredient(formData: FormData) {
  "use server";

  const name = String(
    formData.get("name") || ""
  ).trim();

  const code = String(
    formData.get("code") || ""
  ).trim();

  const category = String(
    formData.get("category") || ""
  ).trim();

  const baseUnit = String(
    formData.get("baseUnit") || "KG"
  );

  const minStock = Number(
    formData.get("minStock") || 0
  );

  const targetStock = Number(
    formData.get("targetStock") || 0
  );

  const currentCostPerBaseUnit = Number(
    formData.get(
      "currentCostPerBaseUnit"
    ) || 0
  );

  if (!name) {
    throw new Error(
      "Hammadde adı zorunludur."
    );
  }

  const validUnits = [
    "G",
    "KG",
    "ML",
    "L",
    "ADET",
    "PAKET",
    "KOLI",
  ];

  if (!validUnits.includes(baseUnit)) {
    throw new Error(
      "Geçersiz stok birimi."
    );
  }

  if (minStock < 0) {
    throw new Error(
      "Minimum stok negatif olamaz."
    );
  }

  if (targetStock < 0) {
    throw new Error(
      "Hedef stok negatif olamaz."
    );
  }

  if (currentCostPerBaseUnit < 0) {
    throw new Error(
      "Birim maliyet negatif olamaz."
    );
  }

  await prisma.ingredient.create({
    data: {
      name,
      code: code || null,
      category: category || null,
      baseUnit: baseUnit as any,
      minStock,
      targetStock,
      currentCostPerBaseUnit,
      active: true,
    },
  });

  revalidatePath("/admin/stock");
  revalidatePath(
    "/admin/stock/ingredients"
  );

  redirect(
    "/admin/stock/ingredients"
  );
}

export default async function IngredientsPage() {
  const ingredients =
    await prisma.ingredient.findMany({
      orderBy: [
        {
          active: "desc",
        },
        {
          name: "asc",
        },
      ],
    });

  return (
    <main className="space-y-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Hammadde Yönetimi
          </h1>

          <p className="text-gray-500 mt-1">
            İşletmede kullanılan tüm
            hammaddeleri yönetin.
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
          "
        >
          ← Stok Yönetimi
        </Link>

      </div>


      {/* YENİ HAMMADDE */}

      <section className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-5">
          Yeni Hammadde
        </h2>

        <form
          action={createIngredient}
          className="
            grid
            md:grid-cols-2
            lg:grid-cols-4
            gap-4
          "
        >

          <div className="lg:col-span-2">

            <label className="block text-sm font-medium mb-1">
              Hammadde Adı *
            </label>

            <input
              name="name"
              required
              placeholder="Örn. Pizza Unu"
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-3
                py-2
              "
            />

          </div>


          <div>

            <label className="block text-sm font-medium mb-1">
              Kod
            </label>

            <input
              name="code"
              placeholder="UN-001"
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-3
                py-2
              "
            />

          </div>


          <div>

            <label className="block text-sm font-medium mb-1">
              Kategori
            </label>

            <input
              name="category"
              placeholder="Kuru Gıda"
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-3
                py-2
              "
            />

          </div>


          <div>

            <label className="block text-sm font-medium mb-1">
              Temel Birim *
            </label>

            <select
              name="baseUnit"
              defaultValue="KG"
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-3
                py-2
              "
            >

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

            <label className="block text-sm font-medium mb-1">
              Minimum Stok
            </label>

            <input
              name="minStock"
              type="number"
              step="0.001"
              min="0"
              defaultValue="0"
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-3
                py-2
              "
            />

          </div>


          <div>

            <label className="block text-sm font-medium mb-1">
              Hedef Stok
            </label>

            <input
              name="targetStock"
              type="number"
              step="0.001"
              min="0"
              defaultValue="0"
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-3
                py-2
              "
            />

          </div>


          <div>

            <label className="block text-sm font-medium mb-1">
              Birim Maliyet
            </label>

            <input
              name="currentCostPerBaseUnit"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-3
                py-2
              "
            />

          </div>


          <div className="lg:col-span-4 flex justify-end pt-2">

            <button
              type="submit"
              className="
                bg-black
                text-white
                px-6
                py-2.5
                rounded-lg
                hover:bg-gray-800
              "
            >
              + Hammadde Ekle
            </button>

          </div>

        </form>

      </section>


      {/* HAMMADDE LİSTESİ */}

      <section className="bg-white rounded-xl shadow overflow-hidden">

        <div className="p-6 border-b">

          <h2 className="text-xl font-bold">
            Hammaddeler
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {ingredients.length} hammadde kayıtlı
          </p>

        </div>


        {ingredients.length === 0 ? (

          <div className="p-10 text-center text-gray-500">

            Henüz hammadde tanımlanmamış.

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b">

                <tr>

                  <th className="text-left px-6 py-3">
                    Hammadde
                  </th>

                  <th className="text-left px-6 py-3">
                    Kod
                  </th>

                  <th className="text-left px-6 py-3">
                    Kategori
                  </th>

                  <th className="text-left px-6 py-3">
                    Birim
                  </th>

                  <th className="text-right px-6 py-3">
                    Min.
                  </th>

                  <th className="text-right px-6 py-3">
                    Hedef
                  </th>

                  <th className="text-right px-6 py-3">
                    Birim Maliyet
                  </th>

                  <th className="text-center px-6 py-3">
                    Durum
                  </th>

                </tr>

              </thead>


              <tbody>

                {ingredients.map(
                  (ingredient) => (

                    <tr
                      key={ingredient.id}
                      className="
                        border-b
                        last:border-0
                      "
                    >

                      <td className="px-6 py-4 font-medium">
                        {ingredient.name}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {ingredient.code || "-"}
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {ingredient.category || "-"}
                      </td>

                      <td className="px-6 py-4">
                        {ingredient.baseUnit}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {ingredient.minStock}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {ingredient.targetStock}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {ingredient.currentCostPerBaseUnit.toFixed(
                          2
                        )}{" "}
                        TL
                      </td>

                      <td className="px-6 py-4 text-center">

                        {ingredient.active ? (

                          <span
                            className="
                              inline-flex
                              rounded-full
                              bg-green-100
                              text-green-700
                              px-3
                              py-1
                              text-xs
                            "
                          >
                            Aktif
                          </span>

                        ) : (

                          <span
                            className="
                              inline-flex
                              rounded-full
                              bg-gray-100
                              text-gray-500
                              px-3
                              py-1
                              text-xs
                            "
                          >
                            Pasif
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

    </main>
  );
}