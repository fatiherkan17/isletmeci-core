"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";



export async function createProduct(formData: FormData) {


  const name = formData.get("name") as string;

  const description = formData.get("description") as string;

  const price = Number(formData.get("price"));

  const image = formData.get("image") as string;

  const categoryId = formData.get("categoryId") as string;



  if (!name || !price || !categoryId) {

    throw new Error("Eksik bilgi var");

  }




  const lastProduct = await prisma.product.findFirst({

    where: {

      categoryId,

    },


    orderBy: {

      sortOrder: "desc",

    },


  });




  const newSortOrder = lastProduct

    ? lastProduct.sortOrder + 1

    : 0;






  await prisma.product.create({

    data: {

      name,

      description,

      price,

      image,

      categoryId,

      sortOrder: newSortOrder,

    },

  });




  revalidatePath("/");

  revalidatePath("/admin/products");

  revalidatePath("/admin/products/new");

}




export async function updateProduct(formData: FormData) {


  const id = formData.get("id") as string;

  const name = formData.get("name") as string;

  const description = formData.get("description") as string;

  const price = Number(formData.get("price"));

  const image = formData.get("image") as string;

  const categoryId = formData.get("categoryId") as string;





  await prisma.product.update({

    where: {

      id,

    },


    data: {

      name,

      description,

      price,

      image,

      categoryId,

    },

  });




  revalidatePath("/");

  revalidatePath("/admin/products");

}





export async function toggleProductStatus(formData: FormData) {


  const id = formData.get("id") as string;



  const product = await prisma.product.findUnique({

    where: {

      id,

    },

  });




  if (!product) {

    throw new Error("Ürün bulunamadı");

  }





  await prisma.product.update({

    where: {

      id,

    },


    data: {

      active: !product.active,

    },

  });




  revalidatePath("/");

  revalidatePath("/admin/products");

}