export interface Category {

  id: string;

  name: string;

  icon?: string | null;

}





export interface Product {

  id: string;

  name: string;

  description?: string | null;

  price: number;

  image?: string | null;

  featured?: boolean;

  active?: boolean;

  available?: boolean;

  category?: Category | null;

}







export interface OrderItem {

  id?: string;


  productId: string;


  product?: Product;


  name: string;


  price?: number;


  unitPrice: number;


  quantity: number;


  total: number;


  image?: string | null;

}







export interface OrderTotals {

  subtotal: number;


  discount: number;


  service: number;


  grandTotal: number;

}







export interface CashierTable {

  id: string;


  number: number;


  name: string;


  capacity: number;



  status:

    | "EMPTY"

    | "MENU_OPEN"

    | "ORDERED"

    | "PREPARING"

    | "READY"

    | "PAYMENT"

    | "CLOSED";



  active: boolean;





  order?: {


    id:string;



    status:

      | "OPEN"

      | "PREPARING"

      | "READY"

      | "PAID"

      | "CANCELLED";



    subtotal:number;



    discount:number;



    service?:number;



    grandTotal:number;



    total:number;



    items:OrderItem[];



  } | null;



}







export interface Order {


  id:string;


  tableId:string;



  status:


    | "OPEN"

    | "PREPARING"

    | "READY"

    | "PAID"

    | "CANCELLED";




  subtotal:number;



  discount:number;



  service?:number;



  grandTotal:number;



  total:number;





  items:OrderItem[];



}