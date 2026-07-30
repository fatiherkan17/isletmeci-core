import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(request: Request) {

  try {

    const body = await request.json();

    const { categoryId, direction } = body;


    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });


    if (!category) {

      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );

    }


    const target = await prisma.category.findFirst({

      where: {

        sortOrder:
          direction === "up"
            ? { lt: category.sortOrder }
            : { gt: category.sortOrder }

      },


      orderBy: {

        sortOrder:
          direction === "up"
            ? "desc"
            : "asc"

      }

    });



    if (target) {


      await prisma.category.update({

        where: {
          id: category.id,
        },

        data: {
          sortOrder: target.sortOrder,
        },

      });



      await prisma.category.update({

        where: {
          id: target.id,
        },

        data: {
          sortOrder: category.sortOrder,
        },

      });


    }



    return NextResponse.json({
      success: true,
    });



  } catch (error) {


    console.error(error);


    return NextResponse.json(

      {
        error: "Sıralama hatası"
      },

      {
        status:500
      }

    );

  }

}