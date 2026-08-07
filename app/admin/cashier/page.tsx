"use client";

import { useEffect, useMemo, useState } from "react";

import TablesGrid from "@/app/components/cashier/TablesGrid";
import OrderPanel from "@/app/components/cashier/OrderPanel";
import RecentOrders from "@/app/components/cashier/RecentOrders";

import {
  increaseQuantity,
  decreaseQuantity,
  removeProduct,
  calculateTotals,
} from "@/lib/cashier/order";

import type {
  CashierTable,
  OrderItem,
  Product,
} from "@/types/cashier";



export default function CashierPage(){


  const [tables,setTables] =
    useState<CashierTable[]>([]);



  const [selectedTableId,setSelectedTableId] =
    useState<string | null>(null);



  const [items,setItems] =
    useState<OrderItem[]>([]);



  const [productModalOpen,setProductModalOpen] =
    useState(false);






  useEffect(()=>{

    loadTables();

  },[]);






  async function loadTables(){

    try{


      const response =
        await fetch("/api/tables");



      const data =
        await response.json();



      setTables(data);



    }catch(error){


      console.error(error);


    }

  }








  const selectedTable = useMemo(()=>{


    return (

      tables.find(

        table =>
          table.id === selectedTableId

      )

      ??

      null

    );


  },[

    tables,

    selectedTableId

  ]);








  useEffect(()=>{


    if(selectedTable?.order?.items){



      const orderItems: OrderItem[] =


        selectedTable.order.items.map(item=>({



          productId:

            item.productId,



          name:

            item.product?.name ?? "",



          unitPrice:

            item.price ?? 0,



          quantity:

            item.quantity,



          total:

            (item.price ?? 0) *

            item.quantity,



          image:

            item.product?.image ?? null,



        }));



      setItems(orderItems);



    }else{


      setItems([]);


    }



  },[selectedTable]);
  const totals = useMemo(()=>{


  return calculateTotals(items);


},[items]);









async function handleAddProduct(
  product: Product
){


  if(!selectedTable){

    return;

  }






  await fetch(

    "/api/orders",

    {


      method:"POST",


      headers:{


        "Content-Type":
          "application/json"


      },


      body:JSON.stringify({


        tableId:

          selectedTable.id,



        productId:

          product.id


      })


    }

  );





  await loadTables();



}









function handleIncrease(
  productId:string
){


  setItems(current=>


    increaseQuantity(

      current,

      productId

    )


  );


}









function handleDecrease(
  productId:string
){


  setItems(current=>


    decreaseQuantity(

      current,

      productId

    )


  );


}









function handleRemove(
  productId:string
){


  setItems(current=>


    removeProduct(

      current,

      productId

    )


  );


}
async function handleUpdateStatus(

  status:
    | "PREPARING"
    | "READY"
    | "PAID"
    | "CANCELLED"

){


  if(!selectedTable?.order?.id){

    return;

  }







  await fetch(

    "/api/orders/status",

    {


      method:"PATCH",


      headers:{


        "Content-Type":
          "application/json"


      },


      body:JSON.stringify({


        orderId:

          selectedTable.order.id,



        status


      })


    }

  );







  await loadTables();



}









async function handlePayment(

  paymentType:string

){


  if(!selectedTable?.order?.id){


    alert(

      "Açık sipariş yok"

    );


    return;


  }









  try{



    const response =

      await fetch(

        "/api/orders/payment",

        {


          method:"PATCH",


          headers:{


            "Content-Type":
              "application/json"


          },


          body:JSON.stringify({


            orderId:

              selectedTable.order.id,



            paymentType


          })


        }

      );







    if(!response.ok){


      throw new Error(

        "Ödeme başarısız"

      );


    }







    setItems([]);



    setSelectedTableId(null);







    await loadTables();






  }catch(error){



    console.error(error);



    alert(

      "Ödeme alınamadı"

    );



  }



}return (

  <main className="space-y-6">



    <h1 className="
      text-4xl
      font-bold
    ">

      💰 NONNA Kasa

    </h1>








    <div className="
      grid
      grid-cols-12
      gap-6
    ">





      <section className="
        col-span-12
        xl:col-span-8
        space-y-6
      ">



        <TablesGrid


          tables={tables}



          selectedTableId={

            selectedTableId

          }



          onSelectTable={

            setSelectedTableId

          }



        />





        <RecentOrders />





      </section>









      <aside className="
        col-span-12
        xl:col-span-4
      ">



        <OrderPanel



          table={

            selectedTable

          }



          items={

            items

          }



          totals={

            totals

          }



          productModalOpen={

            productModalOpen

          }



          setProductModalOpen={

            setProductModalOpen

          }



          onAddProduct={

            handleAddProduct

          }



          onIncrease={

            handleIncrease

          }



          onDecrease={

            handleDecrease

          }



          onRemove={

            handleRemove

          }



          onUpdateStatus={

            handleUpdateStatus

          }



          onPayment={

            handlePayment

          }



        />





      </aside>





    </div>





  </main>


);


}