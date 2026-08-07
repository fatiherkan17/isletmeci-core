import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";




// AÇIK SİPARİŞ GETİR

export async function GET(
  request: Request
) {

  try {


    const { searchParams } =
      new URL(request.url);


    const tableId =
      searchParams.get("tableId");



    if(!tableId){

      return NextResponse.json(

        {
          error:"Masa bulunamadı"
        },

        {
          status:400
        }

      );

    }






    const order =
      await prisma.order.findFirst({

        where:{

          tableId,

          status:{
            not:"PAID"
          }

        },


        include:{

          items:{

            include:{

              product:true

            }

          }

        }


      });




    return NextResponse.json(order);



  } catch(error){


    console.error(
      "ORDER GET ERROR:",
      error
    );


    return NextResponse.json(

      {
        error:"Sipariş alınamadı"
      },

      {
        status:500
      }

    );


  }

}











// SİPARİŞ EKLE

export async function POST(
  request:Request
){

  try {



    const body =
      await request.json();



    const {

      tableId,

      productId,

      items,

    } = body;






    if(!tableId){


      return NextResponse.json(

        {
          error:"Masa bilgisi eksik"
        },

        {
          status:400
        }

      );

    }







    let order =
      await prisma.order.findFirst({

        where:{

          tableId,

          status:"OPEN"

        }

      });








    if(!order){


      order =
        await prisma.order.create({

          data:{

            tableId,

            status:"OPEN"

          }

        });


    }









    // ============================
    // MÜŞTERİ SEPET SİPARİŞİ
    // ============================


    if(Array.isArray(items)){



      for(const item of items){



        const existingItem =
          await prisma.orderItem.findFirst({

            where:{

              orderId:
                order.id,


              productId:
                item.productId

            }

          });






        if(existingItem){



          await prisma.orderItem.update({

            where:{

              id:
                existingItem.id

            },


            data:{

              quantity:

                existingItem.quantity
                +
                item.quantity

            }


          });




        } else {



          const product =
            await prisma.product.findUnique({

              where:{

                id:
                  item.productId

              }

            });






          if(product){


            await prisma.orderItem.create({

              data:{

                orderId:
                  order.id,


                productId:
                  product.id,


                quantity:
                  item.quantity,


                price:
                  product.price


              }

            });


          }


        }



      }



    }








    // ============================
    // KASA TEK ÜRÜN EKLEME
    // ============================


    else if(productId){



      const existingItem =
        await prisma.orderItem.findFirst({

          where:{

            orderId:
              order.id,


            productId

          }

        });







      if(existingItem){



        await prisma.orderItem.update({

          where:{

            id:
              existingItem.id

          },


          data:{

            quantity:
              existingItem.quantity + 1

          }


        });



      } else {



        const product =
          await prisma.product.findUnique({

            where:{

              id:
                productId

            }

          });





        if(product){


          await prisma.orderItem.create({

            data:{

              orderId:
                order.id,


              productId:
                product.id,


              quantity:1,


              price:
                product.price


            }

          });


        }


      }



    }









    const orderItems =
      await prisma.orderItem.findMany({

        where:{

          orderId:
            order.id

        }

      });







    const total =
      orderItems.reduce(

        (sum,item)=>

          sum +

          (
            item.price *
            item.quantity
          ),

        0

      );









    await prisma.order.update({

      where:{

        id:
          order.id

      },


      data:{

        subtotal:
          total,


        total:
          total

      }


    });









    // MASA DURUMU

    await prisma.table.update({

      where:{

        id:
          tableId

      },


      data:{

        status:
          "ORDERED"

      }


    });







    return NextResponse.json({

      success:true,

      orderId:
        order.id

    });







  } catch(error){



    console.error(

      "ORDER CREATE ERROR:",

      error

    );



    return NextResponse.json(

      {

        error:
          "Sipariş oluşturulamadı"

      },

      {

        status:500

      }

    );


  }


}