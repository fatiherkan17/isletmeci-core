import { getSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import EditProductForm from "./EditProductForm";


export default async function EditProductPage(){


  const session = await getSession();


  const role = session?.role as string;



  if(
    role !== "OWNER" &&
    role !== "MANAGER"
  ){

    redirect("/admin/products");

  }



  return (

    <EditProductForm />

  );


}