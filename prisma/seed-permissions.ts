import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


async function main() {

  const permissions = [

    {
      key:"PRODUCT_CREATE",
      name:"Ürün Ekleme"
    },

    {
      key:"PRODUCT_EDIT",
      name:"Ürün Düzenleme"
    },

    {
      key:"PRODUCT_DELETE",
      name:"Ürün Silme"
    },

    {
      key:"CATEGORY_CREATE",
      name:"Kategori Ekleme"
    },

    {
      key:"CATEGORY_EDIT",
      name:"Kategori Düzenleme"
    },

    {
      key:"SETTINGS_EDIT",
      name:"İşletme Ayarları"
    },

    {
      key:"USER_MANAGE",
      name:"Personel Yönetimi"
    },

    {
      key:"ORDER_MANAGE",
      name:"Sipariş Yönetimi"
    },

    {
      key:"STOCK_MANAGE",
      name:"Stok Yönetimi"
    },

    {
      key:"CASH_MANAGE",
      name:"Kasa Yönetimi"
    }

  ];


  for(const permission of permissions){

    await prisma.permission.upsert({

      where:{
        key:permission.key
      },

      update:{},

      create:permission

    });

  }


  console.log("Yetkiler oluşturuldu");

}


main()
.finally(()=>prisma.$disconnect());