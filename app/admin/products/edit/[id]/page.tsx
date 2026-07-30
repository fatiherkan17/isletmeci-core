"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";


type Category = {

  id: string;

  name: string;

};



type Product = {

  id: string;

  name: string;

  description: string | null;

  price: number;

  image: string | null;

  categoryId: string;

  active: boolean;

  available: boolean;

  featured: boolean;

};





export default function EditProductPage() {


  const params = useParams();

  const router = useRouter();

  const id = params.id as string;



  const [product, setProduct] = useState<Product | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);



  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");

  const [categoryId, setCategoryId] = useState("");

  const [image, setImage] = useState("");



  const [active, setActive] = useState(true);

  const [available, setAvailable] = useState(true);

  const [featured, setFeatured] = useState(false);



  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);







  useEffect(() => {


    async function loadData() {


      const productRes = await fetch(`/api/products/${id}`);

      const productData = await productRes.json();



      setProduct(productData);



      setName(productData.name || "");

      setDescription(productData.description || "");

      setPrice(String(productData.price || ""));

      setCategoryId(productData.categoryId || "");

      setImage(productData.image || "");



      setActive(productData.active);

      setAvailable(productData.available);

      setFeatured(productData.featured);





      const categoryRes = await fetch("/api/categories");

      const categoryData = await categoryRes.json();


      setCategories(categoryData);



    }





    if(id){

      loadData();

    }


  },[id]);









  async function uploadImage(
    e: React.ChangeEvent<HTMLInputElement>
  ){


    const file = e.target.files?.[0];


    if(!file) return;



    setUploading(true);



    const formData = new FormData();


    formData.append("file",file);



    const res = await fetch("/api/upload",{


      method:"POST",


      body:formData,


    });



    const data = await res.json();



    setImage(data.url);



    setUploading(false);



  }









  async function deleteImage(){


    if(!image) return;



    await fetch("/api/upload/delete",{


      method:"POST",


      headers:{


        "Content-Type":"application/json",


      },


      body:JSON.stringify({


        url:image,


      }),



    });



    setImage("");



  }









  async function handleSubmit(
    e:React.FormEvent
  ){


    e.preventDefault();



    if(!name.trim()){


      alert("Ürün adı giriniz");


      return;


    }





    if(Number(price)<=0){


      alert("Geçerli fiyat giriniz");


      return;


    }





    setSaving(true);





    await fetch(`/api/products/${id}`,{


      method:"PUT",


      headers:{


        "Content-Type":"application/json",


      },


      body:JSON.stringify({



        name,


        description,


        price:Number(price),


        categoryId,


        image,


        active,


        available,


        featured,



      }),



    });




    setSaving(false);



    router.push("/admin/products");



  }









  if(!product){


    return (

      <div className="p-10">

        Yükleniyor...

      </div>

    );

  }









  return (



    <main className="min-h-screen bg-gray-100 p-8">



      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">



        <h1 className="text-2xl font-bold mb-6">

          Ürün Düzenle

        </h1>







        <form

          onSubmit={handleSubmit}

          className="space-y-4"

        >





          <input

            className="border p-3 w-full rounded"

            value={name}

            onChange={(e)=>setName(e.target.value)}

            placeholder="Ürün adı"

          />






          <textarea

            className="border p-3 w-full rounded"

            value={description}

            onChange={(e)=>setDescription(e.target.value)}

            placeholder="Açıklama"

            rows={4}

          />






          <input

            className="border p-3 w-full rounded"

            value={price}

            onChange={(e)=>setPrice(e.target.value)}

            type="number"

            placeholder="Fiyat"

          />








          <select

            className="border p-3 w-full rounded"

            value={categoryId}

            onChange={(e)=>setCategoryId(e.target.value)}

          >


            <option value="">

              Kategori seç

            </option>



            {categories.map((cat)=>(


              <option

                key={cat.id}

                value={cat.id}

              >

                {cat.name}

              </option>


            ))}



          </select>









          <div className="border rounded-xl p-4">



            <label className="font-bold block mb-3">

              Ürün Fotoğrafı

            </label>





            {image ? (


              <>


                <img

                  src={image}

                  alt={name}

                  className="w-48 h-48 object-cover rounded-xl mb-4"

                />




                <button


                  type="button"


                  onClick={deleteImage}


                  className="bg-red-600 text-white px-4 py-2 rounded mb-4"


                >

                  Fotoğrafı Kaldır

                </button>


              </>



            ):(



              <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center mb-4">


                Fotoğraf Yok


              </div>



            )}






            <input

              type="file"

              accept="image/*"

              onChange={uploadImage}

            />






            {uploading && (

              <p className="mt-2">

                Fotoğraf yükleniyor...

              </p>

            )}



          </div>









          <div className="border rounded-xl p-4 space-y-3">





            <label className="flex justify-between">


              <span>Aktif</span>


              <input

                type="checkbox"

                checked={active}

                onChange={(e)=>setActive(e.target.checked)}

              />


            </label>







            <label className="flex justify-between">


              <span>Satışta Var</span>


              <input

                type="checkbox"

                checked={available}

                onChange={(e)=>setAvailable(e.target.checked)}

              />


            </label>







            <label className="flex justify-between">


              <span>Öne Çıkan</span>


              <input

                type="checkbox"

                checked={featured}

                onChange={(e)=>setFeatured(e.target.checked)}

              />


            </label>





          </div>









          <button

            disabled={saving || uploading}

            className="bg-black text-white p-3 w-full rounded disabled:bg-gray-400"

          >


            {saving

              ? "Kaydediliyor..."

              : "Kaydet"

            }



          </button>







        </form>






      </div>





    </main>


  );


}