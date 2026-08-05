import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/auth";

import {
  toggleProductStatus,
  toggleProductAvailability
} from "@/app/actions/product";


export default async function ProductsPage() {


  const session = await getSession();

  const userRole = session?.role as string;



  const canManage =
    userRole === "OWNER" ||
    userRole === "MANAGER";



  const products = await prisma.product.findMany({

    include:{
      category:true,
    },


    orderBy:[

      {
        sortOrder:"asc",
      },

      {
        name:"asc",
      },

    ],

  });





  async function reorderProduct(formData:FormData){

    "use server";


    const session = await getSession();


    if(
      session?.role !== "OWNER" &&
      session?.role !== "MANAGER"
    ){

      return;

    }



    const productId =
      formData.get("productId") as string;


    const direction =
      formData.get("direction") as "up"|"down";



    await fetch(

      `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/products/reorder`,

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json",
        },


        body:JSON.stringify({

          productId,

          direction,

        }),

      }

    );


  }







return (

<main className="min-h-screen bg-gray-100 p-8">


<div className="max-w-7xl mx-auto">



<div className="flex justify-between items-center mb-8">


<h1 className="text-3xl font-bold">
Ürün Yönetimi
</h1>



{
canManage &&

<Link

href="/admin/products/new"

className="bg-black text-white px-5 py-3 rounded-lg"

>

+ Yeni Ürün

</Link>

}


</div>






<div className="bg-white rounded-xl shadow overflow-hidden">



<table className="w-full">


<thead className="bg-gray-200">

<tr>

<th className="p-4 text-left">
Fotoğraf
</th>

<th className="p-4 text-left">
Sıra
</th>

<th className="p-4 text-left">
Ürün
</th>

<th className="p-4 text-left">
Kategori
</th>

<th className="p-4 text-left">
Fiyat
</th>

<th className="p-4 text-left">
Durum
</th>

<th className="p-4 text-left">
İşlem
</th>


</tr>

</thead>





<tbody>



{
products.map((product)=>(


<tr
key={product.id}
className="border-t"
>



<td className="p-4">


{
product.image ?


<img

src={product.image}

alt={product.name}

className="w-16 h-16 rounded-lg object-cover"

/>


:


<div className="w-16 h-16 bg-gray-200 rounded-lg">

</div>

}


</td>





<td className="p-4">

{product.sortOrder}

</td>





<td className="p-4 font-semibold">

{product.name}

</td>





<td className="p-4">

{product.category.name}

</td>





<td className="p-4">

{product.price} TL

</td>






<td className="p-4">


<div className="text-green-600 font-bold">

{
product.active
?
"Aktif"
:
"Pasif"
}

</div>


<div className="text-blue-600 font-bold">

{
product.available
?
"Satışta"
:
"Yok"
}

</div>


</td>







<td className="p-4">


<div className="flex gap-2 flex-wrap">





{
canManage &&

<>


<form action={reorderProduct}>


<input

type="hidden"

name="productId"

value={product.id}

/>


<input

type="hidden"

name="direction"

value="up"

/>


<button

className="bg-green-600 text-white px-3 py-2 rounded"

>

↑

</button>


</form>





<form action={reorderProduct}>


<input

type="hidden"

name="productId"

value={product.id}

/>


<input

type="hidden"

name="direction"

value="down"

/>


<button

className="bg-orange-500 text-white px-3 py-2 rounded"

>

↓

</button>


</form>


</>


}





{
canManage &&


<Link

href={`/admin/products/edit/${product.id}`}

className="bg-blue-600 text-white px-3 py-2 rounded"

>

Düzenle

</Link>


}





{
canManage &&


<form action={toggleProductAvailability}>


<input

type="hidden"

name="id"

value={product.id}

/>


<button

className="bg-red-600 text-white px-3 py-2 rounded"

>

{
product.available
?
"Satış Dışı"
:
"Satışta"
}

</button>


</form>


}





{
canManage &&


<form action={toggleProductStatus}>


<input

type="hidden"

name="id"

value={product.id}

/>


<button

className="bg-gray-700 text-white px-3 py-2 rounded"

>

{
product.active
?
"Pasif Yap"
:
"Aktif Yap"
}

</button>


</form>


}





</div>


</td>





</tr>


))

}



</tbody>


</table>


</div>


</div>


</main>


);


}