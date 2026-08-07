"use client";

import { useState } from "react";

import type { OrderItem } from "@/types/cashier";


interface Props {

  items: OrderItem[];

  tableNumber: number;

  tableId: string;

  onIncrease: (productId:string)=>void;

  onDecrease: (productId:string)=>void;

  onRemove: (productId:string)=>void;

  onClear: ()=>void;

}



export default function Cart({

  items,

  tableNumber,

  tableId,

  onIncrease,

  onDecrease,

  onRemove,

  onClear,

}:Props){



  const [loading,setLoading] = useState(false);

  const [success,setSuccess] = useState(false);




  const total = items.reduce(

    (sum,item)=>

      sum + item.total,

    0

  );







  async function sendOrder(){



    if(items.length===0){

      return;

    }




    try{


      setLoading(true);



      const response = await fetch(

        "/api/orders",

        {

          method:"POST",

          headers:{

            "Content-Type":

              "application/json"

          },


          body:JSON.stringify({

            tableId,

            items

          })


        }

      );





      if(!response.ok){

        throw new Error(

          "Sipariş gönderilemedi"

        );

      }





      onClear();


      setSuccess(true);



      setTimeout(()=>{

        setSuccess(false);

      },3000);





    }catch(error){


      console.error(error);


      alert(

        "Sipariş gönderilemedi"

      );



    }finally{


      setLoading(false);


    }


  }







  if(items.length===0 && !success){

    return null;

  }








  return (



    <div className="

      fixed

      bottom-3

      left-3

      right-3

      z-[9999]

    ">




      <div className="

        bg-[#1F2A1F]

        text-white

        rounded-3xl

        border

        border-[#C9A227]

        shadow-2xl

        p-3

      ">






        {

          success && (

            <div className="

              bg-green-600

              rounded-xl

              p-2

              mb-3

              text-center

              font-bold

              text-sm

            ">


              ✓ Siparişiniz Alındı

              <br/>

              Hazırlanmaya başlandı 🍕


            </div>


          )

        }







        {

          items.length > 0 && (

          <>



          <div className="

            max-h-32

            overflow-y-auto

            space-y-2

            mb-3

          ">




            {

              items.map(item=>(



                <div

                  key={item.productId}

                  className="

                    bg-white

                    text-[#1F2A1F]

                    rounded-xl

                    p-2

                  "

                >





                  <div className="

                    flex

                    justify-between

                    items-center

                  ">



                    <div>


                      <div className="

                        font-bold

                        text-sm

                      ">


                        {item.name}


                      </div>



                      <div className="text-xs">


                        {item.unitPrice} ₺


                      </div>


                    </div>






                    <button

                      onClick={()=>onRemove(item.productId)}

                      className="

                        text-red-600

                        text-xs

                        font-bold

                      "

                    >

                      Sil


                    </button>



                  </div>








                  <div className="

                    flex

                    justify-center

                    items-center

                    gap-5

                    mt-1

                  ">




                    <button

                      onClick={()=>onDecrease(item.productId)}

                      className="

                        w-7

                        h-7

                        rounded-full

                        bg-[#1F2A1F]

                        text-white

                      "

                    >

                      -

                    </button>







                    <span className="font-bold">

                      {item.quantity}

                    </span>







                    <button

                      onClick={()=>onIncrease(item.productId)}

                      className="

                        w-7

                        h-7

                        rounded-full

                        bg-[#1F2A1F]

                        text-white

                      "

                    >

                      +

                    </button>




                  </div>



                </div>


              ))

            }



          </div>








          <div className="

            flex

            justify-between

            items-center

            mb-2

          ">



            <div>


              <div className="font-bold">

                🛒 Sepetim

              </div>



              <div className="text-xs text-white/70">


                {items.length} ürün


              </div>


            </div>







            <div className="

              font-bold

              text-lg

            ">


              {total} ₺


            </div>



          </div>







          <button

            onClick={sendOrder}

            disabled={loading}

            className="

              w-full

              h-10

              rounded-xl

              bg-[#C65D3A]

              font-bold

              text-sm

            "

          >



            {

              loading

              ?

              "Gönderiliyor..."

              :

              "Sipariş Ver"


            }



          </button>



          </>

          )

        }





      </div>




    </div>


  );


}