"use client";

import { useEffect, useState } from "react";

import type { Product } from "@/types/cashier";


interface Props {

  open: boolean;

  onClose: () => void;

  onSelect: (product: Product) => void;

}



export default function ProductModal({

  open,

  onClose,

  onSelect,

}: Props) {


  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(false);



  useEffect(() => {

    if (!open) return;

    loadProducts();

  }, [open]);





  async function loadProducts() {

    try {

      setLoading(true);


      const response = await fetch("/api/products");


      if (!response.ok) {

        throw new Error(
          "Ürünler alınamadı"
        );

      }


      const data = await response.json();


      setProducts(data);


    } catch(error) {

      console.error(error);


    } finally {

      setLoading(false);

    }

  }





  if (!open) return null;





  return (

    <div className="
      fixed
      inset-0
      z-50
      bg-black/40
      flex
      items-center
      justify-center
    ">


      <div className="
        bg-white
        rounded-2xl
        w-[900px]
        max-h-[80vh]
        overflow-hidden
        shadow-2xl
      ">


        <div className="
          flex
          justify-between
          items-center
          p-6
          border-b
        ">


          <h2 className="text-2xl font-bold">

            Ürün Seç

          </h2>



          <button

            onClick={onClose}

            className="text-3xl"

          >

            ×

          </button>


        </div>





        <div className="
          p-6
          overflow-y-auto
          max-h-[65vh]
        ">



          {loading && (

            <div className="
              text-center
              py-10
            ">

              Yükleniyor...

            </div>

          )}






          {!loading && products.length === 0 && (

            <div className="
              text-center
              text-gray-400
              py-10
            ">

              Ürün bulunamadı.

            </div>

          )}







          {!loading && (

            <div className="
              grid
              grid-cols-2
              gap-4
            ">


              {products.map((product) => (


                <button

                  key={product.id}

                  onClick={() => {

                    onSelect(product);

                    onClose();

                  }}

                  className="
                    border
                    rounded-xl
                    p-4
                    text-left
                    hover:border-blue-500
                    hover:shadow-lg
                    transition
                  "

                >


                  <div className="font-bold text-lg">

                    {product.name}

                  </div>




                  <div className="
                    text-sm
                    text-gray-500
                    mt-1
                  ">

                    {product.category?.name}

                  </div>





                  <div className="
                    mt-4
                    text-2xl
                    font-bold
                    text-green-600
                  ">

                    {product.price.toLocaleString("tr-TR")} ₺

                  </div>



                </button>


              ))}


            </div>

          )}



        </div>


      </div>


    </div>

  );

}