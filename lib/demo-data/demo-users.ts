import { Timestamp } from "firebase/firestore"
import { demoCredentials } from "@/lib/demo-user"
import type { UserData } from "@/lib/user-service"

export interface DemoUserWithUid extends UserData {
  uid: string
}

const demoTimestamp = Timestamp.fromDate(new Date("2026-01-15T12:00:00"))

export function getDemoUsers(currentUid?: string): DemoUserWithUid[] {
  const { email: demoEmail } = demoCredentials()

  return [
    {
      uid: currentUid ?? "demo-current-user",
      email: demoEmail,
      firstName: "Demo",
      lastName: "User",
      lpId: null,
      role: "demo",
      createdAt: demoTimestamp,
      updatedAt: demoTimestamp,
    },
    {
      uid: "demo-user-alex",
      email: "alex.rivera@example.com",
      firstName: "Alex",
      lastName: "Rivera",
      lpId: 1001,
      role: "agent",
      createdAt: demoTimestamp,
      updatedAt: demoTimestamp,
    },
    {
      uid: "demo-user-jordan",
      email: "jordan.kim@example.com",
      firstName: "Jordan",
      lastName: "Kim",
      lpId: 1002,
      role: "agent",
      createdAt: demoTimestamp,
      updatedAt: demoTimestamp,
    },
    {
      uid: "demo-user-casey",
      email: "casey.nguyen@example.com",
      firstName: "Casey",
      lastName: "Nguyen",
      lpId: 2001,
      role: "agent",
      createdAt: demoTimestamp,
      updatedAt: demoTimestamp,
    },
    {
      uid: "demo-user-admin",
      email: "morgan.lee@example.com",
      firstName: "Morgan",
      lastName: "Lee",
      lpId: null,
      role: "admin",
      createdAt: demoTimestamp,
      updatedAt: demoTimestamp,
    },
  ]
}
