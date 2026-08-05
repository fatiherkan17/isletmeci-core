"use client";

import { useEffect, useState } from "react";
import { createProduct } from "@/app/actions/product";
import { useRouter } from "next/navigation";


type Category = {
  id:string;
  name:string;
};



export default function NewProductPage(){


  const router = useRouter();


  const [categories,setCategories] = useState<Category[]>([]);

  const [image,setImage] = useState("");

  const [uploading,setUploading] = useState(false);

  const [saving,setSaving] = useState(false);





  useEffect(()=>{


    async function loadCategories(){


      const res = await fetch("/api/categories");


      const data = await res.json();


      console.log("Kategoriler:",data);


      setCategories(data);


    }


    loadCategories();


  },[]);









  async function uploadImage(
    e:React.ChangeEvent<HTMLInputElement>
  ){


    const file = e.target.files?.[0];


    if(!file) return;



    setUploading(true);



    try{


      const formData = new FormData();


      formData.append(
        "file",
        file
      );





      const res = await fetch(
        "/api/upload",
        {

          method:"POST",

          body:formData,

        }
      );





      const data = await res.json();



      console.log("Upload sonucu:",data);





      if(data.url){


        setImage(data.url);


      }
      else{


        alert("Fotoğraf URL oluşmadı");


      }




    }
    catch(error){


      console.error(error);


      alert("Fotoğraf yükleme hatası");


    }



    finally{


      setUploading(false);


    }


  }









  async function handleSubmit(
    formData:FormData
  ){



    if(!image){


      alert("Önce fotoğraf yükleyin");


      return;


    }



    setSaving(true);





    formData.set(
      "image",
      image
    );





    await createProduct(formData);





    router.push(
      "/admin/products"
    );


  }









  return (


    <main className="min-h-screen bg-gray-100 p-8">


      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">



        <h1 className="text-2xl font-bold mb-6">

          Yeni Ürün Ekle

        </h1>





        <form
          action={handleSubmit}
          className="space-y-4"
        >





          <input

            name="name"

            placeholder="Ürün adı"

            className="w-full border p-3 rounded"

            required

          />







          <textarea

            name="description"

            placeholder="Ürün açıklaması"

            className="w-full border p-3 rounded"

            rows={4}

          />








          <input

            name="price"

            type="number"

            placeholder="Fiyat (TL)"

            className="w-full border p-3 rounded"

            required

          />








          <select

            name="categoryId"

            className="w-full border p-3 rounded"

            required

          >


            <option value="">

              Kategori seç

            </option>



            {
              categories.map((category)=>(

                <option

                  key={category.id}

                  value={category.id}

                >

                  {category.name}

                </option>


              ))
            }



          </select>









          <div className="border rounded-lg p-4">


            <label className="font-semibold">

              Ürün Fotoğrafı

            </label>





            <input

              type="file"

              accept="image/*"

              onChange={uploadImage}

              className="block mt-3"

            />





            {
              uploading && (

                <p className="mt-3">

                  Fotoğraf yükleniyor...

                </p>

              )
            }







            {
              image && (


                <div className="mt-4">


                  <img

                    src={image}

                    alt="Ürün"

                    className="w-40 h-40 object-cover rounded-lg border"

                  />



                  <p className="text-xs break-all mt-2">

                    {image}

                  </p>



                </div>


              )
            }




          </div>









          <button

            type="submit"

            disabled={saving || uploading}

            className="w-full bg-black text-white p-3 rounded"

          >

            {
              saving
              ?
              "Kaydediliyor..."
              :
              "Kaydet"
            }


          </button>





        </form>





      </div>


    </main>


  );


}