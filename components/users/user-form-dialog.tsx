"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createUserDocument, updateUser, type UserData } from "@/lib/user-service"
import { createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: UserData & { uid: string } | null
  onSaved: () => void
}

export function UserFormDialog({ open, onOpenChange, user, onSaved }: UserFormDialogProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [lpId, setLpId] = useState<string>("")
  const [role, setRole] = useState<"admin" | "agent">("agent")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const isEditing = !!user

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setEmail(user.email)
      setLpId(user.lpId?.toString() ?? "")
      setRole(user.role)
      setPassword("")
    } else {
      setFirstName("")
      setLastName("")
      setEmail("")
      setLpId("")
      setRole("agent")
      setPassword("")
    }
  }, [user, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!isEditing && !password) {
      toast({
        title: "Error",
        description: "Password is required for new users",
        variant: "destructive",
      })
      return
    }

    if (!isEditing && password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (isEditing) {
        // Update existing user
        if (!user) return

        await updateUser(user.uid, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          lpId: lpId ? parseInt(lpId, 10) : null,
          role,
        })

        // If password is provided, update it
        if (password) {
          toast({
            title: "Note",
            description: "Password changes require the user to change it themselves or use password reset",
          })
        }

        toast({
          title: "Success",
          description: "User updated successfully",
        })
      } else {
        // Create new user using a secondary auth instance
        // This prevents signing out the current admin
        const { initializeApp, getApps, deleteApp } = await import("firebase/app")
        const { getAuth, createUserWithEmailAndPassword: createUser } = await import("firebase/auth")
        
        // Create a secondary Firebase app instance
        const secondaryAppName = "secondary-auth-" + Date.now()
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        }
        
        const secondaryApp = initializeApp(firebaseConfig, secondaryAppName)
        const secondaryAuth = getAuth(secondaryApp)
        
        try {
          // Create the user with the secondary auth instance
          const userCredential = await createUser(secondaryAuth, email.trim(), password)
          
          // Create their Firestore document
          await createUserDocument(userCredential.user.uid, {
            email: email.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            lpId: lpId ? parseInt(lpId, 10) : null,
            role,
          })
          
          // Sign out from secondary auth and delete the secondary app
          await signOut(secondaryAuth)
          await deleteApp(secondaryApp)
          
          toast({
            title: "Success",
            description: "User created successfully",
          })
        } catch (createError) {
          // Clean up the secondary app on error
          try {
            await deleteApp(secondaryApp)
          } catch {}
          throw createError
        }
      }

      onSaved()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update user information. Leave password blank to keep current password."
              : "Create a new user account. The user will be able to sign in with the email and password you provide."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lpId">LP ID</Label>
            <Input
              id="lpId"
              type="number"
              value={lpId}
              onChange={(e) => setLpId(e.target.value)}
              placeholder="Enter LP ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={role} onValueChange={(value: "admin" | "agent") => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {isEditing ? "(leave blank to keep current)" : "*"}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEditing}
              minLength={6}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
