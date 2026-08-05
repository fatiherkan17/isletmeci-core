import { getSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import ProductForm from "./ProductForm";


export default async function NewProductPage(){


  const session = await getSession();


  const role = session?.role as string;



  if(
    role !== "OWNER" &&
    role !== "MANAGER"
  ){

    redirect("/admin/products");

  }



  return (

    <ProductForm />

  );


}