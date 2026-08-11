"use client";

import { useEffect, useMemo, useState } from "react";

import type { Product } from "@/types/cashier";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
}

/*
 * ============================================================
 * ÜRÜN CACHE
 * ============================================================
 *
 * Ürünler her modal açılışında tekrar tekrar çekilmez.
 *
 * CACHE SÜRESİ:
 * 60 saniye
 *
 * Böylece:
 *
 * Kasa açıldı
 *      ↓
 * Ürünler arka planda yüklenir
 *      ↓
 * + Ürün
 *      ↓
 * Ürünler hazırsa anında gösterilir
 *
 * ============================================================
 */

let productsCache: Product[] | null = null;

let productsCacheTime = 0;

let productsPromise: Promise<Product[]> | null = null;

const PRODUCTS_CACHE_TIME = 60 * 1000;


/*
 * ============================================================
 * ÜRÜNLERİ GETİR
 * ============================================================
 */

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("/api/products", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Ürünler alınamadı");
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Geçersiz ürün verisi");
  }

  productsCache = data;

  productsCacheTime = Date.now();

  return data;
}


/*
 * ============================================================
 * CACHE'DEN ÜRÜN AL / GEREKİRSE API'DEN ÇEK
 * ============================================================
 */

async function getProducts(): Promise<Product[]> {
  const now = Date.now();

  /*
   * CACHE GEÇERLİ
   */

  if (
    productsCache &&
    now - productsCacheTime <
      PRODUCTS_CACHE_TIME
  ) {
    return productsCache;
  }


  /*
   * HALİHAZIRDA API İSTEĞİ VARSA
   *
   * Aynı anda birden fazla istek gönderilmesini önler.
   */

  if (productsPromise) {
    return productsPromise;
  }


  /*
   * YENİ İSTEK
   */

  productsPromise = fetchProducts();

  try {
    return await productsPromise;
  } finally {
    productsPromise = null;
  }
}


/*
 * ============================================================
 * ARKA PLANDA ÖN YÜKLEME
 * ============================================================
 *
 * ProductModal component'i yüklendiğinde ürünleri arka planda
 * almaya başlar.
 *
 * Kullanıcı "+ Ürün" butonuna bastığında ürünlerin büyük
 * ihtimalle hazır olması sağlanır.
 *
 * Hata olursa kullanıcıya gösterilmez.
 * Modal açıldığında tekrar denenir.
 *
 * ============================================================
 */

if (typeof window !== "undefined") {
  void getProducts().catch((error) => {
    console.error(
      "PRODUCT PRELOAD ERROR:",
      error
    );
  });
}


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function ProductModal({
  open,
  onClose,
  onSelect,
}: Props) {
  const [products, setProducts] = useState<Product[]>(
    productsCache ?? []
  );

  const [loading, setLoading] = useState(
    productsCache === null
  );


  /*
   * ==========================================================
   * MODAL AÇILDIĞINDA ÜRÜNLERİ KONTROL ET
   * ==========================================================
   */

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadProducts() {
      try {
        /*
         * Cache varsa önce onu anında göster.
         */

        if (productsCache) {
          setProducts(productsCache);

          setLoading(false);
        } else {
          setLoading(true);
        }


        /*
         * Güncel/cache ürünlerini al.
         */

        const data = await getProducts();

        if (cancelled) return;

        setProducts(data);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "PRODUCT MODAL ERROR:",
          error
        );

        /*
         * Cache varsa hata durumunda cache'i koru.
         */

        if (productsCache) {
          setProducts(productsCache);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [open]);


  /*
   * ==========================================================
   * KATEGORİ
   * ==========================================================
   */

  const [selectedCategory, setSelectedCategory] =
    useState<string>("ALL");


  /*
   * Modal kapanınca kategori seçimini sıfırla.
   */

  useEffect(() => {
    if (!open) {
      setSelectedCategory("ALL");
    }
  }, [open]);


  /*
   * ==========================================================
   * KATEGORİLERİ OLUŞTUR
   * ==========================================================
   */

  const categories = useMemo(() => {
    const map = new Map<string, string>();

    products.forEach((product) => {
      if (
        product.category?.id &&
        product.category?.name
      ) {
        map.set(
          product.category.id,
          product.category.name
        );
      }
    });

    return Array.from(map.entries()).map(
      ([id, name]) => ({
        id,
        name,
      })
    );
  }, [products]);


  /*
   * ==========================================================
   * FİLTRELİ ÜRÜNLER
   * ==========================================================
   */

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "ALL") {
      return products;
    }

    return products.filter(
      (product) =>
        product.category?.id ===
        selectedCategory
    );
  }, [
    products,
    selectedCategory,
  ]);


  /*
   * ==========================================================
   * MODAL KAPALI
   * ==========================================================
   */

  if (!open) return null;


  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-[#3b2c20]/60
        p-3
        backdrop-blur-sm
        sm:p-5
      "
    >
      <div
        className="
          flex
          h-[min(92vh,850px)]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-[28px]
          border
          border-[#dfcfba]
          bg-gradient-to-br
          from-[#fffaf3]
          via-[#f8eee0]
          to-[#eee0cd]
          shadow-[0_25px_70px_rgba(55,39,25,0.28)]
        "
      >

        {/* ====================================================
            BAŞLIK
           ==================================================== */}

        <div
          className="
            shrink-0
            border-b
            border-[#e3d5c3]
            bg-gradient-to-b
            from-[#fffdf9]
            to-[#f7ecde]
            px-4
            py-4
            shadow-[0_4px_12px_rgba(75,55,35,0.06)]
            sm:px-6
            sm:py-5
          "
        >
          <div className="flex items-center justify-between gap-3">

            <div className="flex min-w-0 items-center gap-3">

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-[#e0c9a8]
                  bg-gradient-to-b
                  from-[#f9ead5]
                  to-[#e9d1b0]
                  text-xl
                  shadow-[inset_0_2px_3px_rgba(255,255,255,0.9),0_4px_8px_rgba(80,58,37,0.10)]
                  sm:h-12
                  sm:w-12
                "
              >
                🛒
              </div>

              <div className="min-w-0">

                <h2
                  className="
                    truncate
                    text-xl
                    font-extrabold
                    tracking-tight
                    text-[#44362a]
                    sm:text-2xl
                  "
                >
                  Ürün Seç
                </h2>

                <p className="mt-0.5 text-xs font-medium text-[#927e68] sm:text-sm">
                  Adisyona ürün ekle
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-[#dfd0bd]
                bg-gradient-to-b
                from-[#fffdf9]
                to-[#eee2d3]
                text-xl
                font-bold
                text-[#6c5947]
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_4px_8px_rgba(75,55,35,0.08)]
                transition
                hover:-translate-y-0.5
                hover:text-[#46372a]
                active:translate-y-0
              "
              aria-label="Ürün ekranını kapat"
            >
              ×
            </button>

          </div>
        </div>


        {/* ====================================================
            KATEGORİLER
           ==================================================== */}

        <div
          className="
            shrink-0
            border-b
            border-[#e5d7c5]
            bg-[#fffaf3]/90
            px-4
            py-3
            sm:px-6
          "
        >
          <div
            className="
              flex
              gap-2
              overflow-x-auto
              pb-1
            "
          >

            {/* TÜMÜ */}

            <button
              type="button"
              onClick={() =>
                setSelectedCategory("ALL")
              }
              className={`
                shrink-0
                rounded-xl
                border
                px-4
                py-2.5
                text-xs
                font-extrabold
                transition-all
                ${
                  selectedCategory === "ALL"
                    ? `
                      border-[#b9793f]
                      bg-gradient-to-b
                      from-[#d99a60]
                      to-[#b86e32]
                      text-white
                      shadow-[inset_0_2px_2px_rgba(255,255,255,0.3),0_4px_8px_rgba(145,84,35,0.18)]
                    `
                    : `
                      border-[#dfcfbb]
                      bg-gradient-to-b
                      from-[#fffdf9]
                      to-[#f1e4d5]
                      text-[#735f4b]
                      shadow-[0_3px_6px_rgba(75,55,35,0.05)]
                      hover:-translate-y-0.5
                    `
                }
              `}
            >
              Tümü
            </button>


            {/* KATEGORİLER */}

            {categories.map((category) => {
              const active =
                selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(category.id)
                  }
                  className={`
                    shrink-0
                    rounded-xl
                    border
                    px-4
                    py-2.5
                    text-xs
                    font-extrabold
                    transition-all
                    ${
                      active
                        ? `
                          border-[#b9793f]
                          bg-gradient-to-b
                          from-[#d99a60]
                          to-[#b86e32]
                          text-white
                          shadow-[inset_0_2px_2px_rgba(255,255,255,0.3),0_4px_8px_rgba(145,84,35,0.18)]
                        `
                        : `
                          border-[#dfcfbb]
                          bg-gradient-to-b
                          from-[#fffdf9]
                          to-[#f1e4d5]
                          text-[#735f4b]
                          shadow-[0_3px_6px_rgba(75,55,35,0.05)]
                          hover:-translate-y-0.5
                        `
                    }
                  `}
                >
                  {category.name}
                </button>
              );
            })}

          </div>
        </div>


        {/* ====================================================
            ÜRÜNLER
           ==================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            px-4
            py-4
            sm:px-6
            sm:py-5
          "
        >

          {/* YÜKLENİYOR */}

          {loading && products.length === 0 && (
            <div
              className="
                flex
                min-h-64
                items-center
                justify-center
              "
            >
              <div className="text-center">

                <div
                  className="
                    mx-auto
                    mb-4
                    flex
                    h-14
                    w-14
                    animate-pulse
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[#dfc9ac]
                    bg-gradient-to-b
                    from-[#f8ead7]
                    to-[#e7d0ae]
                    text-2xl
                    shadow-[inset_0_2px_3px_rgba(255,255,255,0.9),0_5px_10px_rgba(80,58,37,0.10)]
                  "
                >
                  🍕
                </div>

                <div className="text-sm font-bold text-[#6c5947]">
                  Ürünler yükleniyor...
                </div>

              </div>
            </div>
          )}


          {/* ÜRÜN YOK */}

          {!loading &&
            filteredProducts.length === 0 && (
              <div
                className="
                  flex
                  min-h-64
                  items-center
                  justify-center
                  rounded-[24px]
                  border
                  border-dashed
                  border-[#d8c5ad]
                  bg-[#fff8ee]
                "
              >
                <div className="text-center">

                  <div
                    className="
                      mx-auto
                      mb-3
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#f1e1cd]
                      text-2xl
                    "
                  >
                    📦
                  </div>

                  <div className="font-bold text-[#675441]">
                    Ürün bulunamadı.
                  </div>

                  <div className="mt-1 text-xs text-[#9a8976]">
                    Bu kategoride aktif ürün bulunmuyor.
                  </div>

                </div>
              </div>
            )}


          {/* ÜRÜNLER */}

          {!loading &&
            filteredProducts.length > 0 && (
              <div
                className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >

                {filteredProducts.map((product) => (

                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      onSelect(product);
                      onClose();
                    }}
                    className="
                      group
                      relative
                      min-h-32
                      overflow-hidden
                      rounded-[22px]
                      border
                      border-[#dfcfba]
                      bg-gradient-to-br
                      from-[#fffdf9]
                      via-[#fff8ef]
                      to-[#f1e3d2]
                      p-4
                      text-left
                      shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_5px_12px_rgba(77,57,38,0.07)]
                      transition-all
                      duration-150
                      hover:-translate-y-1
                      hover:border-[#d19a63]
                      hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_9px_18px_rgba(118,76,38,0.14)]
                      active:translate-y-0
                    "
                  >

                    <div
                      className="
                        absolute
                        left-0
                        top-0
                        h-1
                        w-full
                        bg-gradient-to-r
                        from-[#d99a60]
                        via-[#c67d42]
                        to-[#a85d2c]
                        opacity-0
                        transition-opacity
                        group-hover:opacity-100
                      "
                    />

                    <div className="pr-2">

                      <div
                        className="
                          line-clamp-2
                          text-base
                          font-extrabold
                          leading-tight
                          text-[#46372a]
                          sm:text-lg
                        "
                      >
                        {product.name}
                      </div>

                      {product.category?.name && (
                        <div
                          className="
                            mt-2
                            inline-flex
                            rounded-lg
                            border
                            border-[#e5d7c6]
                            bg-[#f5eadc]
                            px-2
                            py-1
                            text-[10px]
                            font-bold
                            text-[#927d67]
                          "
                        >
                          {product.category.name}
                        </div>
                      )}

                    </div>


                    <div
                      className="
                        mt-5
                        flex
                        items-end
                        justify-between
                        gap-3
                      "
                    >

                      <div
                        className="
                          text-xl
                          font-extrabold
                          tracking-tight
                          text-[#a75f2d]
                          sm:text-2xl
                        "
                      >
                        {product.price.toLocaleString(
                          "tr-TR"
                        )}{" "}
                        ₺
                      </div>


                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-[#e0c7a8]
                          bg-gradient-to-b
                          from-[#fff3df]
                          to-[#f3ddbd]
                          text-lg
                          font-bold
                          text-[#9b602e]
                          shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_3px_6px_rgba(100,70,40,0.08)]
                          transition-transform
                          group-hover:scale-105
                        "
                      >
                        +
                      </div>

                    </div>

                  </button>

                ))}

              </div>
            )}

        </div>


        {/* ====================================================
            ALT
           ==================================================== */}

        <div
          className="
            shrink-0
            border-t
            border-[#e3d5c3]
            bg-gradient-to-b
            from-[#fffaf3]
            to-[#f1e4d5]
            px-4
            py-3
            sm:px-6
          "
        >
          <div className="flex items-center justify-between gap-3">

            <div className="text-xs font-medium text-[#968370]">
              {filteredProducts.length} ürün gösteriliyor
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                rounded-xl
                border
                border-[#d9ccbc]
                bg-gradient-to-b
                from-[#fffdf9]
                to-[#eee3d5]
                px-4
                py-2
                text-xs
                font-extrabold
                text-[#6f5e4c]
                shadow-[0_3px_6px_rgba(75,55,35,0.06)]
                transition
                hover:-translate-y-0.5
                active:translate-y-0
              "
            >
              Vazgeç
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}