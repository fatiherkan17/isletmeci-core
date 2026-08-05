"use server";

import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";



export async function createUser(
  formData: FormData
) {


  const name =
    String(formData.get("name"));


  const email =
    String(formData.get("email"));


  const password =
    String(formData.get("password"));


  const role =
    String(formData.get("role")) as
    "STAFF" | "MANAGER";



  if (
    !name ||
    !email ||
    !password
  ) {

    throw new Error(
      "Eksik bilgi var"
    );

  }




  const exists =
    await prisma.user.findUnique({

      where:{
        email
      }

    });



  if(exists){

    throw new Error(
      "Bu e-posta zaten kayıtlı"
    );

  }




  const passwordHash =
    await bcrypt.hash(
      password,
      10
    );





  await prisma.user.create({

    data:{

      name,

      email,

      passwordHash,

      role,

      active:true

    }

  });





  revalidatePath(
    "/admin/users"
  );


}








export async function toggleUserStatus(

  formData:FormData

){


  const id =
    String(formData.get("id"));



  const user =
    await prisma.user.findUnique({

      where:{
        id
      }

    });



  if(!user){

    throw new Error(
      "Kullanıcı bulunamadı"
    );

  }




  await prisma.user.update({

    where:{
      id
    },


    data:{

      active:
      !user.active

    }

  });





  revalidatePath(
    "/admin/users"
  );


}








export async function togglePermission(

  formData:FormData

){


  const userId =
    String(formData.get("userId"));



  const permissionId =
    String(formData.get("permissionId"));






  const existing =
    await prisma.userPermission.findFirst({

      where:{

        userId:userId,

        permissionId:permissionId

      }

    });







  if(existing){


    await prisma.userPermission.delete({

      where:{

        id:existing.id

      }

    });



  }

  else{



    await prisma.userPermission.create({

      data:{

        userId:userId,

        permissionId:permissionId

      }

    });



  }





  revalidatePath(

    `/admin/users/${userId}/permissions`

  );


}