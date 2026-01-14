"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserManagement } from "@/components/users/user-management"

export default function UsersPage() {
  return (
    <ProtectedRoute adminOnly>
      <UserManagement />
    </ProtectedRoute>
  )
}

