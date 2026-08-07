import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";



export async function GET() {


  try {


    const tables =

      await prisma.table.findMany({


        orderBy:{

          number:"asc"

        },



        include:{


          orders:{


            where:{


              status:{
                not:"PAID"
              }


            },


            orderBy:{


              createdAt:"desc"


            },


            take:1,



            include:{


              items:{


                include:{


                  product:true


                }


              }


            }


          }


        }


      });






    const result = tables.map(table => ({


      ...table,


      order:
        table.orders[0] ?? null


    }));






    return NextResponse.json(result);



  } catch(error){



    console.error(error);



    return NextResponse.json(

      {
        error:"Masalar alınamadı"
      },

      {
        status:500
      }

    );



  }


}