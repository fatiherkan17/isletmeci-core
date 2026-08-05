import { PrismaClient } from "@prisma/client";


// Eski SQLite veritabanı
const oldDb = new PrismaClient({
  datasources: {
    db: {
      url: "file:C:/Users/fatih/OneDrive/Masaüstü/isletmeci-core/prisma/dev.db",
    },
  },
});


// Yeni Supabase PostgreSQL
const newDb = new PrismaClient();



async function main() {

  console.log("Aktarım başladı...");



  // =====================
  // SETTINGS
  // =====================

  const setting = await oldDb.setting.findFirst();


  if (setting) {

    await newDb.setting.upsert({

      where: {
        id: setting.id,
      },

      update: {
        businessName: setting.businessName,
        slogan: setting.slogan,
        logo: setting.logo,
        phone: setting.phone,
        address: setting.address,
        instagram: setting.instagram,
        workingHours: setting.workingHours,
      },

      create: {
        id: setting.id,
        businessName: setting.businessName,
        slogan: setting.slogan,
        logo: setting.logo,
        phone: setting.phone,
        address: setting.address,
        instagram: setting.instagram,
        workingHours: setting.workingHours,
      },

    });

  }


  console.log("Setting tamam");





  // =====================
  // CATEGORY
  // =====================


  const categories = await oldDb.category.findMany();


  console.log("Kategori:", categories.length);



  for (const category of categories) {


    await newDb.category.upsert({

      where: {
        id: category.id,
      },

      update: {

        name: category.name,
        active: category.active,
        sortOrder: category.sortOrder,
        icon: category.icon,

      },


      create: {

        id: category.id,
        name: category.name,
        active: category.active,
        sortOrder: category.sortOrder,
        icon: category.icon,

      },

    });


  }


  console.log("Kategori aktarımı tamam");







  // =====================
  // PRODUCTS
  // =====================


  const products = await oldDb.product.findMany();


  console.log("Ürün:", products.length);



  for (const product of products) {


    await newDb.product.upsert({

      where: {
        id: product.id,
      },


      update: {

        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        active: product.active,
        available: product.available,
        featured: product.featured,
        sortOrder: product.sortOrder,
        categoryId: product.categoryId,

      },


      create: {

        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        active: product.active,
        available: product.available,
        featured: product.featured,
        sortOrder: product.sortOrder,
        categoryId: product.categoryId,

      },


    });


  }



  console.log("Ürün aktarımı tamam");



  console.log("--------------------------------");
  console.log("✅ AKTARIM TAMAMLANDI");
  console.log("--------------------------------");


}



main()


.catch((error)=>{

  console.error("HATA:", error);

})


.finally(async()=>{

  await oldDb.$disconnect();

  await newDb.$disconnect();

});