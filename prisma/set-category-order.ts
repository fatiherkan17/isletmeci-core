import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


async function main() {


  const categories = await prisma.category.findMany({

    orderBy: {
      name: "asc",
    },

  });



  for (let i = 0; i < categories.length; i++) {


    await prisma.category.update({

      where: {
        id: categories[i].id,
      },


      data: {

        sortOrder: i,

      },


    });


  }



  console.log("Kategori sıraları güncellendi.");

}


main()

.catch((e)=>{

  console.error(e);

  process.exit(1);

})


.finally(async()=>{

  await prisma.$disconnect();

});