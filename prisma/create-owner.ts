import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";


const prisma = new PrismaClient();



async function main() {


  const passwordHash = await bcrypt.hash(
    "Nonna2026",
    10
  );



  const user = await prisma.user.upsert({

    where: {

      email: "fatih@nonna.com",

    },


    update: {

      name: "Fatih",

      passwordHash,

      role: UserRole.OWNER,

      active: true,

    },


    create: {

      name: "Fatih",

      email: "fatih@nonna.com",

      passwordHash,

      role: UserRole.OWNER,

      active: true,

    },


  });



  console.log("OWNER oluşturuldu:");

  console.log(user.email);


}



main()

.catch((e)=>{

  console.error(e);

})

.finally(async()=>{

  await prisma.$disconnect();

});