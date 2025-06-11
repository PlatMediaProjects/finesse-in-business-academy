import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";

/**
 * This script makes an existing user an administrator
 * Usage: Pass the username of an existing user to make them an administrator
 */
export async function makeUserInstructor(username: string) { // Function name remains the same for backward compatibility
  const user = await storage.getUserByUsername(username);
  
  if (!user) {
    console.error(`User ${username} not found`);
    return false;
  }
  
  // Update the user's instructor status directly in the database
  await db.update(users)
    .set({ isInstructor: true })
    .where(eq(users.id, user.id));
  
  console.log(`User ${username} is now an administrator`);
  return true;
}