import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";


export async function GET() {

  try {


    const orders =

      await prisma.order.findMany({



        where:{


          status:{

            in:[

              "OPEN",

              "PREPARING"

            ]

          }


        },



        orderBy:{


          createdAt:"asc"


        },



        include:{



          table:true,



          items:{



            include:{


              product:true


            }



          }



        }



      });







    return NextResponse.json(orders);




  } catch(error){



    console.error(

      "KITCHEN ORDERS ERROR:",

      error

    );



    return NextResponse.json(


      {

        error:

          "Mutfak siparişleri alınamadı"


      },


      {

        status:500

      }


    );


  }

}