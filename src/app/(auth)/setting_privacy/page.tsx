import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, parseInt(sessionId)),
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <SettingsClient
      name={user.fullName ?? "Guest User"}
      email={user.email ?? "No email linked"}
    />
  );
}