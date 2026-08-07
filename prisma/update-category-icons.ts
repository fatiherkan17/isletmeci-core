import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const icons = [

  {
    name: "KAHVALTI",
    icon: "🥐",
  },

  {
    name: "KIZARTMALAR",
    icon: "🍟",
  },

  {
    name: "OMLET",
    icon: "🍳",
  },

  {
    name: "OMLETLER",
    icon: "🍳",
  },

  {
    name: "Pizza",
    icon: "🍕",
  },

  {
    name: "PİZZA",
    icon: "🍕",
  },

  {
    name: "SALATALAR",
    icon: "🥗",
  },

  {
    name: "Sıcak İçecekler",
    icon: "☕",
  },

  {
    name: "SICAK İÇECEKLER",
    icon: "☕",
  },

  {
    name: "Soğuk İçecekler",
    icon: "🥤",
  },

  {
    name: "SOĞUK İÇECEKLER",
    icon: "🥤",
  },

  {
    name: "TATLILAR",
    icon: "🍰",
  },

];





async function main(){


  for(const item of icons){


    await prisma.category.updateMany({

      where:{

        name:item.name,

      },


      data:{

        icon:item.icon,

      },


    });


  }



  console.log("✅ Kategori ikonları güncellendi");

}





main()

.catch((error)=>{

  console.error(error);

})

.finally(async()=>{

  await prisma.$disconnect();

});