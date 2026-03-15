"use server";

import { db } from "@/src/lib/db";
import { users, verificationCodes } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sendVerificationEmail } from "@/src/lib/actions/email";

/**
 * SIGN UP: Creates user & generates verification code
 */
export async function handleSignUp(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const [newUser] = await db.insert(users).values({
      fullName,
      email,
      password,
    }).returning();

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(verificationCodes).values({
      userId: newUser.id,
      code,
      expiresAt,
      type: "email_verification",
    });

    await sendVerificationEmail(email, code, "email_verification");

  } catch (error) {
    console.error(error);
    return { error: "User already exists or database error" };
  }

  redirect(`/verify?email=${email}&type=signup`);
}

/**
 * SIGN IN: Authenticates the user
 */
export async function handleSignIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || user.password !== password) {
      return { error: "Invalid email or password" };
    }

    if (!user.isVerified) {
      redirect(`/verify?email=${email}&type=signup`);
    }

    (await cookies()).set("session", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    redirect("/dashboard");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    return { error: "Something went wrong." };
  }
}

/**
 * RESEND: For the "Didn't receive a code?" button on the verify page
 */
export async function sendVerifyCode(email: string, type: 'signup' | 'reset') {
  const dbType = type === 'reset' ? 'password_reset' : 'email_verification';

  try {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) return { error: "Email not found" };

    // Delete any existing codes of this type for the user
    await db.delete(verificationCodes).where(
      and(
        eq(verificationCodes.userId, user.id),
        eq(verificationCodes.type, dbType)
      )
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(verificationCodes).values({
      userId: user.id,
      code,
      expiresAt,
      type: dbType,
    });

    await sendVerificationEmail(email, code, dbType);

  } catch (error) {
    console.error(error);
    return { error: "Failed to resend code." };
  }
}

/**
 * FORGOT PASSWORD: Sends reset code
 */
export async function handleForgotPassword(email: string) {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) return { error: "Email not found" };

    // Delete any existing reset codes for the user
    await db.delete(verificationCodes).where(
      and(
        eq(verificationCodes.userId, user.id),
        eq(verificationCodes.type, "password_reset")
      )
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await db.insert(verificationCodes).values({
      userId: user.id,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      type: "password_reset",
    });

    await sendVerificationEmail(email, code, "password_reset");

    redirect(`/verify?email=${email}&type=reset`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    return { error: "Failed to process request." };
  }
}

/**
 * VERIFY CODE: Logic for both Signup and Password Reset
 */
export async function handleVerifyCode(email: string, code: string, type: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) return { error: "User not found" };

    const record = await db.query.verificationCodes.findFirst({
      where: and(
        eq(verificationCodes.userId, user.id),
        eq(verificationCodes.code, code),
        eq(verificationCodes.type, type === "reset" ? "password_reset" : "email_verification")
      ),
    });

    if (!record) return { error: "Invalid code. Please try again." };
    if (record.expiresAt < new Date()) return { error: "Code has expired. Please request a new one." };

    // Clean up the used code
    await db.delete(verificationCodes).where(eq(verificationCodes.id, record.id));

    if (type === "reset") {
      redirect(`/reset?email=${email}`);
    } else {
      // Mark user as verified and set session
      await db.update(users).set({ isVerified: true }).where(eq(users.id, user.id));

      (await cookies()).set("session", user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      redirect("/dashboard");
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    return { error: "Verification failed." };
  }
}

/**
 * RESET PASSWORD: Sets the new password
 */
export async function handleResetPassword(email: string, newPassword: string) {
  try {
    await db.update(users)
      .set({ password: newPassword })
      .where(eq(users.email, email));

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (user) {
      (await cookies()).set("session", user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }

    redirect("/dashboard");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    return { error: "Could not update password. Please try again." };
  }
}

/**
 * LOG OUT: Clears the session cookie
 */
export async function handleLogOut() {
  try {
    (await cookies()).delete("session");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("Logout error:", error);
  }

  redirect("/login");
}