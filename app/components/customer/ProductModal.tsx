"use client";


import type { Product } from "@/types/cashier";



interface Props {

  product: Product | null;

  onClose: () => void;

  onAdd: (product: Product) => void;

}





export default function ProductModal({

  product,

  onClose,

  onAdd,

}: Props) {



  if(!product){

    return null;

  }





  return (


    <div className="
      fixed
      inset-0
      z-50
      bg-black/50
      flex
      items-end
      md:items-center
      justify-center
      p-4
    ">



      <div className="
        bg-white
        w-full
        max-w-md
        rounded-3xl
        overflow-hidden
        shadow-2xl
      ">



        {
          product.image && (


            <img

              src={product.image}

              alt={product.name}

              className="
                w-full
                h-64
                object-cover
              "

            />


          )

        }







        <div className="p-6">





          {
            product.featured && (


              <div className="
                inline-flex
                bg-[#C9A227]
                text-white
                px-3
                py-1
                rounded-full
                text-xs
                font-bold
                mb-3
              ">

                ⭐ Şef Önerisi

              </div>


            )

          }







          <h2 className="
            text-2xl
            font-bold
            text-[#1F2A1F]
          ">

            {product.name}

          </h2>








          {
            product.description && (


              <p className="
                text-gray-600
                mt-4
                leading-relaxed
              ">

                {product.description}

              </p>


            )

          }







          <div className="
            flex
            justify-between
            items-center
            mt-6
          ">



            <span className="
              text-2xl
              font-bold
              text-[#C65D3A]
            ">

              {product.price} ₺

            </span>






            <button

              onClick={()=>{

                onAdd(product);

                onClose();

              }}

              className="
                bg-[#1F2A1F]
                text-white
                px-6
                py-3
                rounded-full
                font-bold
              "

            >

              ＋ Sepete Ekle

            </button>




          </div>







          <button

            onClick={onClose}

            className="
              w-full
              mt-4
              py-3
              rounded-full
              border
              border-gray-200
              text-gray-500
            "

          >

            Kapat

          </button>





        </div>





      </div>





    </div>


  );


}