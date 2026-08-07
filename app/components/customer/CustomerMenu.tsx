"use client";

import { useRef, useState } from "react";

import Cart from "./Cart";
import ProductModal from "./ProductModal";

import type {
  Product,
  OrderItem,
} from "@/types/cashier";



interface Props {

  products: Product[];

  tableNumber: number;

  tableId: string;

}





export default function CustomerMenu({

  products,

  tableNumber,

  tableId,

}: Props) {



  const [items,setItems] =
    useState<OrderItem[]>([]);



  const [selectedProduct,setSelectedProduct] =
    useState<Product | null>(null);



  const categoryRefs =
    useRef<Record<string, HTMLElement | null>>({});






  const categories = Array.from(

    new Map(

      products.map(product => [

        product.category?.name ?? "Diğer",

        product.category

      ])

    )

  ).map(([name,category]) => ({

    name,

    icon: category?.icon ?? "🍽️"

  }));









  function addProduct(product:Product){


    setItems(current => {


      const existing = current.find(

        item =>
          item.productId === product.id

      );




      if(existing){


        return current.map(item =>


          item.productId === product.id

          ? {

              ...item,

              quantity:
                item.quantity + 1,


              total:
                (item.quantity + 1)
                *
                item.unitPrice,


            }


          : item


        );


      }







      return [

        ...current,

        {

          productId:
            product.id,


          name:
            product.name,


          unitPrice:
            product.price,


          quantity:1,


          total:
            product.price,


          image:
            product.image,


        }

      ];



    });


  }









  function increase(productId:string){


    setItems(current =>


      current.map(item =>


        item.productId === productId


        ? {

            ...item,

            quantity:
              item.quantity + 1,


            total:
              (item.quantity + 1)
              *
              item.unitPrice,


          }


        : item


      )


    );


  }








  function decrease(productId:string){


    setItems(current =>


      current

      .map(item =>


        item.productId === productId


        ? {

            ...item,

            quantity:
              item.quantity - 1,


            total:
              (item.quantity - 1)
              *
              item.unitPrice,


          }


        : item


      )


      .filter(

        item =>
          item.quantity > 0

      )


    );


  }









  function remove(productId:string){


    setItems(current =>


      current.filter(

        item =>
          item.productId !== productId

      )


    );


  }

    return (

    <main className="
      min-h-screen
      bg-[#F8F3EA]
      text-[#1F2A1F]
      pb-32
    ">



      <header className="
        text-center
        py-8
      ">


        <h1 className="
          text-5xl
          font-bold
        ">

          NONNA

        </h1>


        <p className="
          mt-2
          text-[#C65D3A]
        ">

          Authentic Italian Kitchen

        </p>


        <div className="
          mt-4
          inline-flex
          bg-white
          border
          border-[#E8DCC8]
          rounded-full
          px-5
          py-2
          font-semibold
        ">

          Masa {tableNumber}

        </div>


      </header>







      {/* CATEGORY BAR */}


      <div className="
        sticky
        top-0
        z-20
        bg-[#F8F3EA]/90
        backdrop-blur
        px-4
        py-3
      ">


        <div className="
          flex
          gap-3
          overflow-x-auto
        ">


          {
            categories.map(category => (


              <button

                key={category.name}


                type="button"


                onClick={()=>{


                  categoryRefs.current[category.name]
                  ?.scrollIntoView({

                    behavior:"smooth",

                    block:"start"

                  });


                }}


                className="
                  bg-[#1F2A1F]
                  text-white
                  px-5
                  py-2
                  rounded-full
                  whitespace-nowrap
                  text-sm
                  font-bold
                "

              >


                {category.icon} {category.name}


              </button>


            ))

          }


        </div>


      </div>









      <div className="
        max-w-5xl
        mx-auto
        px-4
      ">



        {

          categories.map(category => (



            <section

              key={category.name}


              ref={(el)=>{

                categoryRefs.current[category.name]=el;

              }}


              className="
                mb-12
                scroll-mt-24
              "

            >




              <h2 className="
                text-2xl
                font-bold
                mb-5
              ">


                {category.icon} {category.name}


              </h2>






              <div className="
                grid
                grid-cols-2
                gap-4
              ">




                {

                  products

                  .filter(product =>

                    (
                      product.category?.name
                      ??
                      "Diğer"

                    )
                    ===
                    category.name

                  )

                  .map(product => (





                    <div

                      key={product.id}

                      className="
                        bg-white
                        rounded-3xl
                        overflow-hidden
                        shadow-md
                        border
                        border-[#E8DCC8]
                      "

                    >







                      <button

                        type="button"


                        onClick={()=>{

                          setSelectedProduct(product);

                        }}


                        className="
                          w-full
                          text-left
                        "

                      >





                        <div className="
                          relative
                          h-44
                        ">


                          {
                            product.image ? (


                              <img

                                src={product.image}

                                alt={product.name}

                                className="
                                  w-full
                                  h-full
                                  object-cover
                                "

                              />


                            )

                            :

                            (

                              <div className="
                                h-full
                                bg-[#1F2A1F]
                                text-white
                                flex
                                items-center
                                justify-center
                                text-3xl
                                font-bold
                              ">

                                NONNA

                              </div>


                            )

                          }




                          {
                            product.featured && (


                              <div className="
                                absolute
                                top-3
                                left-3
                                bg-[#C9A227]
                                text-white
                                px-3
                                py-1
                                rounded-full
                                text-xs
                                font-bold
                              ">

                                ⭐ Şef Önerisi


                              </div>


                            )
                          }


                        </div>







                        <div className="
                          p-4
                        ">


                          <h3 className="
                            font-bold
                            text-lg
                          ">

                            {product.name}


                          </h3>



                          {
                            product.description && (


                              <p className="
                                text-xs
                                text-gray-500
                                mt-2
                                line-clamp-2
                              ">


                                {product.description}


                              </p>


                            )
                          }



                        </div>



                      </button>









                      <div className="
                        px-4
                        pb-4
                        flex
                        justify-between
                        items-center
                      ">


                        <span className="
                          text-xl
                          font-bold
                          text-[#C65D3A]
                        ">

                          {product.price} ₺


                        </span>







                        <button

                          type="button"


                          onTouchStart={(e)=>{

                            e.stopPropagation();

                            addProduct(product);

                          }}



                          onClick={(e)=>{

                            e.stopPropagation();

                            addProduct(product);

                          }}


                          className="
                            bg-[#1F2A1F]
                            text-white
                            rounded-full
                            px-4
                            py-2
                            text-sm
                            font-bold
                            active:scale-95
                            transition
                          "

                        >

                          ＋ Ekle


                        </button>



                      </div>





                    </div>





                  ))


                }





              </div>





            </section>




          ))

        }



      </div>
      



      <Cart

  items={items}

  tableNumber={tableNumber}

  tableId={tableId}

  onIncrease={increase}

  onDecrease={decrease}

  onRemove={remove}

  onClear={()=>setItems([])}

/>









      <ProductModal


        product={selectedProduct}


        onClose={()=>{

          setSelectedProduct(null);

        }}


        onAdd={addProduct}


      />






    </main>


  );


}