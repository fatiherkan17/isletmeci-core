import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ÜRÜNLERİ TEMİZLE
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // KATEGORİLER

  const kahvalti = await prisma.category.create({
    data: {
      name: "Kahvaltı",
    },
  });

  const pizza = await prisma.category.create({
    data: {
      name: "Pizza",
    },
  });

  const icecek = await prisma.category.create({
    data: {
      name: "İçecek",
    },
  });

  // ÜRÜNLER

  await prisma.product.create({
    data: {
      name: "Zengin Kahvaltı",
      description: "Serpme kahvaltı",
      price: 850,
      image: "/images/kahvalti.jpg",
      categoryId: kahvalti.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Simit Kahvaltı",
      description: "Simit, peynir, zeytin",
      price: 340,
      image: "/images/simit.jpg",
      categoryId: kahvalti.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Margherita Pizza",
      description: "Domates sos, mozzarella",
      price: 590,
      image: "/images/margherita.jpg",
      categoryId: pizza.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Çiçek Pizza",
      description: "Özel pizza",
      price: 870,
      image: "/images/cicek-pizza.jpg",
      categoryId: pizza.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Türk Kahvesi",
      description: "Geleneksel Türk kahvesi",
      price: 120,
      image: "/images/kahve.jpg",
      categoryId: icecek.id,
    },
  });

  // MASALAR

  const tableCount = await prisma.table.count();

  if (tableCount === 0) {
    for (let i = 1; i <= 10; i++) {
      await prisma.table.create({
        data: {
          number: i,
          name: `Masa ${i}`,
          capacity: 4,
          status: "EMPTY",
          active: true,
        },
      });
    }

    console.log("✅ 10 masa oluşturuldu");
  }

  console.log("✅ Seed tamamlandı");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });