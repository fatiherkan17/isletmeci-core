import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { createPurchase } from "@/app/actions/purchase";

export default async function NewPurchasePage() {

  const suppliers = await prisma.supplier.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const ingredients = await prisma.ingredient.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Yeni Satın Alma
            </h1>

            <p className="text-gray-500 mt-1">
              Tedarikçiden alınan hammaddeleri kaydedin.
            </p>

          </div>

          <Link
            href="/admin/purchases"
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
            ← Satın Almalara Dön
          </Link>

        </div>

        <form
          action={createPurchase}
          className="space-y-6"
        >

          <section className="bg-white rounded-xl shadow p-6">

            <h2 className="text-lg font-bold mb-5">
              Satın Alma Bilgileri
            </h2>

            <div className="grid md:grid-cols-2 gap-5">

              <div>

                <label className="block text-sm font-medium mb-2">
                  Tedarikçi
                </label>

                <select
                  name="supplierId"
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
                    Tedarikçi seçin
                  </option>

                  {suppliers.map((supplier) => (

                    <option
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {supplier.name}
                    </option>

                  ))}

                </select>

              </div>

              <div>

                <label className="block text-sm font-medium mb-2">
                  Fatura No
                </label>

                <input
                  type="text"
                  name="invoiceNo"
                  placeholder="Fatura numarası"
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

            <div className="grid md:grid-cols-2 gap-5 mt-5">

              <div>

                <label className="block text-sm font-medium mb-2">
                  Satın Alma Tarihi
                </label>

                <input
                  type="date"
                  name="purchasedAt"
                  required
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

                <label className="block text-sm font-medium mb-2">
                  Not
                </label>

                <input
                  type="text"
                  name="note"
                  placeholder="İsteğe bağlı not"
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

          </section>


          <section className="bg-white rounded-xl shadow p-6">

            <h2 className="text-lg font-bold mb-5">
              Hammadde
            </h2>

            <div className="grid md:grid-cols-4 gap-5">

              <div className="md:col-span-2">

                <label className="block text-sm font-medium mb-2">
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

                  {ingredients.map((ingredient) => (

                    <option
                      key={ingredient.id}
                      value={ingredient.id}
                    >
                      {ingredient.name}
                    </option>

                  ))}

                </select>

              </div>


              <div>

                <label className="block text-sm font-medium mb-2">
                  Miktar
                </label>

                <input
                  type="number"
                  name="quantity"
                  min="0.001"
                  step="0.001"
                  required
                  placeholder="Örn. 25"
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

                <label className="block text-sm font-medium mb-2">
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
                    Litre (l)
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

            </div>


            <div className="grid md:grid-cols-2 gap-5 mt-5">

              <div>

                <label className="block text-sm font-medium mb-2">
                  Birim Alış Fiyatı
                </label>

                <div className="relative">

                  <input
                    type="number"
                    name="unitPrice"
                    min="0"
                    step="0.01"
                    required
                    placeholder="Örn. 50"
                    className="
                      w-full
                      border
                      border-gray-300
                      rounded-lg
                      px-4
                      py-3
                      pr-14
                    "
                  />

                  <span className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  ">
                    TL
                  </span>

                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Girilen fiyat seçilen satın alma birimi içindir.
                </p>

              </div>

            </div>

          </section>


          <section className="bg-blue-50 border border-blue-200 rounded-xl p-5">

            <h3 className="font-semibold text-blue-900">
              Önemli
            </h3>

            <p className="text-sm text-blue-800 mt-1">
              Bu kayıt oluşturulduğunda henüz stok artırılmayacaktır.
              Stok ve hammadde maliyeti, ürün teslim alındığında
              güncellenecektir.
            </p>

          </section>


          <div className="flex justify-end gap-3">

            <Link
              href="/admin/purchases"
              className="
                border
                border-gray-300
                bg-white
                px-5
                py-3
                rounded-lg
              "
            >
              İptal
            </Link>

            <button
              type="submit"
              className="
                bg-black
                text-white
                px-6
                py-3
                rounded-lg
                font-medium
                hover:bg-gray-800
              "
            >
              Satın Almayı Kaydet
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}
