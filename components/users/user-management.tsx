"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getAllUsers, deleteUser, sendPasswordReset, type UserData } from "@/lib/user-service"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserFormDialog } from "./user-form-dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Mail, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserWithUid extends UserData {
  uid: string
}

export function UserManagement() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserWithUid[]>([])
  const [loading, setLoading] = useState(true)
  const [userFormOpen, setUserFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithUid | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserWithUid | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const loadUsers = async () => {
    try {
      setLoading(true)
      const allUsers = await getAllUsers()
      setUsers(allUsers.map((u) => ({ ...u.data, uid: u.uid })))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleAddUser = () => {
    setEditingUser(null)
    setUserFormOpen(true)
  }

  const handleEditUser = (user: UserWithUid) => {
    setEditingUser(user)
    setUserFormOpen(true)
  }

  const handleDeleteClick = (user: UserWithUid) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    // Prevent deleting yourself
    if (userToDelete.uid === currentUser?.uid) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive",
      })
      setDeleteDialogOpen(false)
      return
    }

    setIsDeleting(true)
    try {
      // Delete from both Firebase Auth and Firestore
      await deleteUser(userToDelete.uid)
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      
      await loadUsers()
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSendPasswordReset = async (email: string) => {
    try {
      await sendPasswordReset(email)
      toast({
        title: "Success",
        description: "Password reset email sent",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      })
    }
  }

  const handleUserSaved = () => {
    setUserFormOpen(false)
    setEditingUser(null)
    loadUsers()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage users, roles, and access permissions
            </p>
          </div>
          <Button onClick={handleAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {users.length} user{users.length !== 1 ? "s" : ""} in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found. Click "Add User" to create the first user.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>LP ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.lpId ?? "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendPasswordReset(user.email)}
                            title="Send Password Reset"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                            disabled={user.uid === currentUser?.uid}
                            title={user.uid === currentUser?.uid ? "Cannot delete your own account" : "Delete User"}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <UserFormDialog
          open={userFormOpen}
          onOpenChange={(open) => {
            setUserFormOpen(open)
            if (!open) {
              setEditingUser(null)
            }
          }}
          user={editingUser}
          onSaved={handleUserSaved}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {userToDelete?.firstName} {userToDelete?.lastName} ({userToDelete?.email})?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

