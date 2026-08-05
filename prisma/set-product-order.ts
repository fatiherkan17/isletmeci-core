import { prisma } from "../app/lib/prisma";


async function main(){

const products = await prisma.product.findMany({
 orderBy:{
  createdAt:"asc"
 }
});


for(let i=0;i<products.length;i++){

 await prisma.product.update({

  where:{
   id:products[i].id
  },

  data:{
   sortOrder:i
  }

 });

}


console.log("Ürün sıraları düzenlendi");

}


main()
.then(()=>process.exit())
.catch((e)=>{
console.error(e);
process.exit(1);
});