"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";
import { ensureOrganizationForUser } from "@/lib/org";

const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export interface RegisterState {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
  success?: boolean;
}

export async function registerUser(_prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: RegisterState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "name" | "email" | "password";
      fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const email = parsed.data.email.toLowerCase().trim();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: "An account with this email already exists" } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await db.user.create({
    data: { name: parsed.data.name, email, passwordHash },
  });

  await ensureOrganizationForUser(user.id, parsed.data.name);

  return { success: true };
}
