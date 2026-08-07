"use client";


import { useEffect, useState } from "react";



interface KitchenOrder {


  id:string;


  createdAt:string;


  table:{

    name:string;

    number:number;

  };


  items:{

    id:string;

    quantity:number;

    product:{

      name:string;

    };


  }[];


}







export default function KitchenPage(){



  const [orders,setOrders] =
    useState<KitchenOrder[]>([]);





  useEffect(()=>{


    loadOrders();


    const timer =
      setInterval(
        loadOrders,
        5000
      );


    return ()=>clearInterval(timer);


  },[]);







  async function loadOrders(){


    try{


      const response =
        await fetch(
          "/api/orders/kitchen"
        );



      const data =
        await response.json();



      setOrders(data);



    }catch(error){


      console.error(error);


    }


  }







  async function markReady(

    orderId:string

  ){



    try{



      await fetch(

        "/api/orders/status",

        {


          method:"PATCH",


          headers:{


            "Content-Type":
              "application/json"


          },


          body:JSON.stringify({


            orderId,


            status:"READY"


          })


        }

      );





      loadOrders();



    }catch(error){


      console.error(error);


    }



  }









  return (


    <main className="

      min-h-screen

      bg-gray-100

      p-6

    ">



      <h1 className="

        text-4xl

        font-bold

        mb-8

      ">


        👨‍🍳 NONNA Mutfak


      </h1>







      {
        orders.length===0 ? (


          <div className="

            bg-white

            rounded-xl

            shadow

            p-6

            text-gray-500

          ">


            Hazırlanacak sipariş yok.


          </div>


        ) : (



          <div className="

            grid

            md:grid-cols-2

            xl:grid-cols-3

            gap-6

          ">



            {
              orders.map(order=>(



                <div

                  key={order.id}

                  className="

                    bg-white

                    rounded-2xl

                    shadow

                    p-6

                  "

                >



                  <div className="

                    flex

                    justify-between

                    mb-5

                  ">



                    <h2 className="

                      text-2xl

                      font-bold

                    ">


                      🟦 {order.table.name}


                    </h2>



                    <span className="

                      text-sm

                      text-gray-500

                    ">


                      {
                        new Date(
                          order.createdAt
                        )
                        .toLocaleTimeString(
                          "tr-TR",
                          {
                            hour:"2-digit",
                            minute:"2-digit"
                          }
                        )
                      }


                    </span>



                  </div>







                  <div className="space-y-3">



                    {
                      order.items.map(item=>(


                        <div

                          key={item.id}

                          className="

                            border-b

                            pb-2

                            font-semibold

                          "

                        >


                          {item.quantity} x {item.product.name}


                        </div>


                      ))

                    }


                  </div>








                  <button


                    onClick={()=>
                      markReady(
                        order.id
                      )
                    }


                    className="

                      w-full

                      h-12

                      mt-6

                      rounded-xl

                      bg-green-600

                      text-white

                      font-bold

                    "


                  >


                    ✅ Hazır


                  </button>





                </div>


              ))


            }


          </div>



        )

      }



    </main>


  );


}