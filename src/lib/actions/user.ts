'use server';

import { db } from "@/src/lib/db";
import { transactions, budgets } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function clearUserData() {
  try {
    // 1. Delete all transactions
    await db.delete(transactions);
    
    // 2. Delete all budget settings
    await db.delete(budgets);

    // 3. Refresh the pages so the charts update to zero
    revalidatePath("/analytics");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete data:", error);
    return { error: "Could not wipe data." };
  }
}