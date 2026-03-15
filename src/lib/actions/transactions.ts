"use server";

import { db } from "@/src/lib/db";
import { transactions, budgets as budgetsTable } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function handleAddTransaction(formData: FormData) {
  const user = await db.query.users.findFirst();
  if (!user) return { error: "User not found" };

  const title = formData.get("title") as string;
  const amount = formData.get("amount") as string;
  const type = formData.get("type") as string; 
  const category = formData.get("category") as string;

  try {
    await db.insert(transactions).values({
      userId: user.id,
      title,
      amount,
      type,
      category,
      date: new Date(),
    });
    revalidatePath("/dashboard");
    revalidatePath("/budget");
  } catch (error) {
    return { error: "Failed to save" };
  }
  redirect("/dashboard");
}

export async function handleSetBudget(formData: FormData) {
  const user = await db.query.users.findFirst();
  if (!user) return { error: "User not found" };

  const category = formData.get("category") as string;
  const limit = formData.get("limit") as string;

  try {
    const existing = await db.query.budgets.findFirst({
      where: and(eq(budgetsTable.userId, user.id), eq(budgetsTable.category, category))
    });

    if (existing) {
      await db.update(budgetsTable).set({ limit }).where(eq(budgetsTable.id, existing.id));
    } else {
      await db.insert(budgetsTable).values({ userId: user.id, category, limit });
    }
    revalidatePath("/budget");
  } catch (error) {
    return { error: "Failed to update budget" };
  }
  redirect("/budget");
}

// NEW: Delete a single transaction
export async function handleDeleteTransaction(id: number) {
  try {
    await db.delete(transactions).where(eq(transactions.id, id));
    revalidatePath("/dashboard");
    revalidatePath("/budget");
  } catch (error) {
    console.error(error);
  }
}

// NEW: Delete a budget goal
export async function handleDeleteBudget(category: string) {
  try {
    const user = await db.query.users.findFirst();
    if (!user) return;
    await db.delete(budgetsTable).where(
      and(eq(budgetsTable.userId, user.id), eq(budgetsTable.category, category))
    );
    revalidatePath("/budget");
  } catch (error) {
    console.error(error);
  }
}