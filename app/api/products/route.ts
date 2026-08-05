import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";


// Ürünleri getir
export async function GET() {

  try {

    const products = await prisma.product.findMany({

      include: {
        category: true,
      },

      orderBy: {
        sortOrder: "asc",
      },

    });


    return NextResponse.json(products);


  } catch (error) {

    console.error("PRODUCT GET ERROR:", error);


    return NextResponse.json(

      {
        error: "Ürünler alınamadı"
      },

      {
        status: 500
      }

    );

  }

}





// Yeni ürün oluştur
export async function POST(request: Request) {

  try {


    const body = await request.json();


    console.log("Gelen ürün:", body);



    const {

      name,

      description,

      price,

      image,

      categoryId,


    } = body;



    if (!name || !price || !categoryId) {


      return NextResponse.json(

        {
          error: "Eksik bilgi"
        },

        {
          status: 400
        }

      );

    }




    const product = await prisma.product.create({

      data: {


        name: String(name),


        description: description || "",


        price: Number(price),


        image: image || null,


        categoryId: String(categoryId),


      },

    });





    console.log("Oluşturulan ürün:", product);





    return NextResponse.json(

      {

        success: true,

        product,

      },

      {

        status: 201

      }

    );





  } catch (error: any) {



    console.error("PRODUCT CREATE ERROR:", error);




    return NextResponse.json(

      {

        success: false,

        error: error?.message || "Ürün oluşturulamadı"

      },

      {

        status: 500

      }

    );


  }

}