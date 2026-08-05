export type UserRole =
  | "OWNER"
  | "MANAGER"
  | "STAFF";



export function canManageUsers(
  role: string
) {

  return role === "OWNER";

}



export function canManageSettings(
  role: string
) {

  return (
    role === "OWNER" ||
    role === "MANAGER"
  );

}



export function canManageProducts(
  role: string
) {

  return (
    role === "OWNER" ||
    role === "MANAGER" ||
    role === "STAFF"
  );

}



export function canManageCategories(
  role: string
) {

  return (
    role === "OWNER" ||
    role === "MANAGER"
  );

}