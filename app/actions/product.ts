"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";



export async function toggleProductAvailability(
  formData: FormData
){

  const id =
    formData.get("id") as string;



  const product =
    await prisma.product.findUnique({

      where:{
        id
      }

    });



  if(!product){

    throw new Error(
      "Ürün bulunamadı"
    );

  }



  await prisma.product.update({

    where:{
      id
    },

    data:{

      available:
        !product.available

    }

  });



  revalidatePath(
    "/admin/products"
  );

}





export async function toggleProductStatus(
  formData: FormData
){

  const id =
    formData.get("id") as string;



  const product =
    await prisma.product.findUnique({

      where:{
        id
      }

    });



  if(!product){

    throw new Error(
      "Ürün bulunamadı"
    );

  }



  await prisma.product.update({

    where:{
      id
    },


    data:{

      active:
        !product.active

    }


  });



  revalidatePath(
    "/admin/products"
  );


}






export async function deleteProduct(
  formData: FormData
){

  const id =
    formData.get("id") as string;



  await prisma.product.delete({

    where:{
      id
    }

  });



  revalidatePath(
    "/admin/products"
  );


}






export async function updateProduct(
  formData: FormData
){

  const id =
    formData.get("id") as string;


  const name =
    formData.get("name") as string;


  const description =
    formData.get("description") as string;


  const price =
    Number(
      formData.get("price")
    );


  const image =
    formData.get("image") as string;



  const categoryId =
    formData.get("categoryId") as string;



  await prisma.product.update({

    where:{
      id
    },


    data:{


      name,


      description,


      price,


      image,


      categoryId


    }


  });



  revalidatePath(
    "/admin/products"
  );


}






export async function createProduct(
  formData: FormData
){

  const name =
    formData.get("name") as string;


  const description =
    formData.get("description") as string;


  const price =
    Number(
      formData.get("price")
    );


  const image =
    formData.get("image") as string;



  const categoryId =
    formData.get("categoryId") as string;




  const lastProduct =
    await prisma.product.findFirst({

      orderBy:{

        sortOrder:"desc"

      }

    });




  await prisma.product.create({

    data:{


      name,


      description,


      price,


      image,


      categoryId,


      sortOrder:
        lastProduct
        ?
        lastProduct.sortOrder + 1
        :
        0


    }

  });



  revalidatePath(
    "/admin/products"
  );


}