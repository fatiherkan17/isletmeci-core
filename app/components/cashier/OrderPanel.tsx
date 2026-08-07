"use client";


import { useState } from "react";

import ProductModal from "./ProductModal";
import OrderItems from "./OrderItems";
import Totals from "./Totals";


import type {
  CashierTable,
  OrderItem,
  OrderTotals,
  Product,
} from "@/types/cashier";





interface Props {


  table: CashierTable | null;


  items: OrderItem[];


  totals: OrderTotals;


  productModalOpen:boolean;


  setProductModalOpen:
    (value:boolean)=>void;



  onAddProduct:
    (product:Product)=>void;



  onIncrease:
    (productId:string)=>void;



  onDecrease:
    (productId:string)=>void;



  onRemove:
    (productId:string)=>void;



  onUpdateStatus:
    (
      status:
      | "PREPARING"
      | "READY"
      | "PAID"
      | "CANCELLED"
    )=>void;



  onPayment:
    (
      paymentType:string
    )=>void;


}









export default function OrderPanel({

  table,

  items,

  totals,

  productModalOpen,

  setProductModalOpen,

  onAddProduct,

  onIncrease,

  onDecrease,

  onRemove,

  onUpdateStatus,

  onPayment,

}:Props){



  const [paymentOpen,setPaymentOpen] =
    useState(false);





  const hasTable =
    table !== null;





  return (

    <>

      <aside className="
        bg-white
        rounded-2xl
        shadow
        p-6
        sticky
        top-6
      ">



        <div className="border-b pb-5">


          <h2 className="text-2xl font-bold">

            Adisyon

          </h2>



          <p className="text-sm text-gray-500 mt-2">

            {
              hasTable
              ? table.name
              : "Masa seçiniz"
            }

          </p>


        </div>





        <div className="mt-6">


          <OrderItems

            items={items}

            onIncrease={onIncrease}

            onDecrease={onDecrease}

            onRemove={onRemove}

          />


        </div>






        <div className="mt-6">


          <Totals

            totals={totals}

          />


        </div>







        <div className="grid gap-3 mt-8">






          <button

            disabled={
              !hasTable ||
              !table?.order
            }


            onClick={()=>


              onUpdateStatus(
                "PREPARING"
              )


            }


            className="
              h-12
              rounded-xl
              bg-orange-500
              text-white
              font-semibold
            "

          >

            👨‍🍳 Hazırlamaya Gönder

          </button>






          <button

            disabled={
              !hasTable ||
              !table?.order
            }


            onClick={()=>


              onUpdateStatus(
                "READY"
              )


            }


            className="
              h-12
              rounded-xl
              bg-green-600
              text-white
              font-semibold
            "

          >

            ✅ Hazır

          </button>







          <button

            disabled={
              !hasTable ||
              !table?.order
            }


            onClick={()=>
              setPaymentOpen(true)
            }


            className="
              h-12
              rounded-xl
              bg-purple-600
              text-white
              font-semibold
            "

          >

            💳 Ödeme Al

          </button>








          <button

            disabled={!hasTable}


            onClick={()=>
              setProductModalOpen(true)
            }


            className="
              h-12
              rounded-xl
              bg-blue-600
              text-white
              font-semibold
            "

          >

            ➕ Ürün Ekle

          </button>





          <button

            disabled={!hasTable}


            className="
              h-12
              rounded-xl
              bg-gray-700
              text-white
              font-semibold
            "

          >

            🖨 Adisyon Yazdır

          </button>



        </div>




      </aside>









      {
        paymentOpen && (


          <div className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            z-50
          ">


            <div className="
              bg-white
              rounded-2xl
              p-6
              w-80
            ">


              <h2 className="
                text-xl
                font-bold
                mb-5
              ">

                Ödeme Türü

              </h2>





              <div className="grid gap-3">



                <button

                  onClick={()=>{

                    onPayment("CASH");

                    setPaymentOpen(false);

                  }}


                  className="
                    h-12
                    rounded-xl
                    bg-green-600
                    text-white
                    font-bold
                  "

                >

                  💵 Nakit

                </button>






                <button

                  onClick={()=>{

                    onPayment("CARD");

                    setPaymentOpen(false);

                  }}


                  className="
                    h-12
                    rounded-xl
                    bg-blue-600
                    text-white
                    font-bold
                  "

                >

                  💳 Kart

                </button>






                <button

                  onClick={()=>
                    setPaymentOpen(false)
                  }


                  className="
                    h-10
                    rounded-xl
                    bg-gray-200
                  "

                >

                  Vazgeç

                </button>



              </div>


            </div>


          </div>


        )

      }








      <ProductModal


        open={productModalOpen}


        onClose={()=>
          setProductModalOpen(false)
        }


        onSelect={(product)=>{

          onAddProduct(product);

        }}


      />



    </>

  );


}