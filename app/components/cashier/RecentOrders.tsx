"use client";

import { useEffect, useState } from "react";



interface RecentOrder {

  id: string;

  total: number;

  status: string;

  createdAt: string;


  table: {

    name: string;

    number: number;

  };


  items: {

    id: string;

    quantity: number;

    product: {

      name: string;

    };

  }[];

}





export default function RecentOrders() {



  const [orders, setOrders] =
    useState<RecentOrder[]>([]);



  useEffect(() => {

    loadOrders();

  }, []);






  async function loadOrders() {


    try {


      const response =
        await fetch("/api/orders/recent");



      if(!response.ok){

        throw new Error(
          "Siparişler alınamadı"
        );

      }




      const data =
        await response.json();



      setOrders(data);



    } catch(error){


      console.error(error);


    }


  }








  return (

    <section className="
      bg-white
      rounded-xl
      shadow
      p-6
    ">



      <div className="
        flex
        items-center
        justify-between
        mb-5
      ">



        <h2 className="
          text-xl
          font-bold
        ">

          Son Siparişler

        </h2>




        <span className="
          text-sm
          text-gray-500
        ">

          Bugün

        </span>



      </div>







      <div className="space-y-3">



        {
          orders.length === 0 ? (


            <div className="
              rounded-lg
              border
              border-gray-200
              p-4
              text-gray-500
            ">

              Henüz sipariş bulunmuyor.

            </div>


          ) : (


            orders.map((order)=>(



              <div

                key={order.id}

                className="
                  rounded-lg
                  border
                  p-4
                "

              >




                <div className="
                  flex
                  justify-between
                  items-center
                ">



                  <div className="font-bold">

                    🟠 {order.table.name}

                  </div>



                  <div className="
                    font-bold
                  ">

                    {order.total} ₺

                  </div>


                </div>






                <div className="
                  mt-3
                  text-sm
                  text-gray-600
                  space-y-1
                ">


                  {
                    order.items.map(item => (


                      <div key={item.id}>

                        {item.quantity} x {item.product.name}

                      </div>


                    ))

                  }



                </div>





              </div>


            ))


          )

        }



      </div>



    </section>

  );

}