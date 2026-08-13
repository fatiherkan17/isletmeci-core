"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSupplier(
  formData: FormData
) {
  const name = String(
    formData.get("name") || ""
  ).trim();

  const code = String(
    formData.get("code") || ""
  ).trim();

  const phone = String(
    formData.get("phone") || ""
  ).trim();

  const email = String(
    formData.get("email") || ""
  ).trim();

  const address = String(
    formData.get("address") || ""
  ).trim();

  const taxNumber = String(
    formData.get("taxNumber") || ""
  ).trim();

  if (!name) {
    throw new Error(
      "Tedarikçi adı zorunludur."
    );
  }

  const supplier =
    await prisma.supplier.create({
      data: {
        name,
        code: code || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        taxNumber: taxNumber || null,
        active: true,
      },
    });

  revalidatePath(
    "/admin/suppliers"
  );

  redirect(
    "/admin/suppliers"
  );
}


export async function toggleSupplierStatus(
  formData: FormData
) {
  const id = String(
    formData.get("id") || ""
  ).trim();

  if (!id) {
    throw new Error(
      "Tedarikçi bulunamadı."
    );
  }

  const supplier =
    await prisma.supplier.findUnique({
      where: {
        id,
      },
    });

  if (!supplier) {
    throw new Error(
      "Tedarikçi bulunamadı."
    );
  }

  await prisma.supplier.update({
    where: {
      id,
    },
    data: {
      active: !supplier.active,
    },
  });

  revalidatePath(
    "/admin/suppliers"
  );
}
