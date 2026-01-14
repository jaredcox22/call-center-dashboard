"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Key, LogOut, Users, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog"

interface UserMenuProps {
  onExcludedRecordsClick: () => void
  excludedRecordsCount?: number
}

export function UserMenu({ onExcludedRecordsClick, excludedRecordsCount = 0 }: UserMenuProps) {
  const { user, isAdmin, logout } = useAuth()
  const router = useRouter()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  // Get user initials from email
  const getInitials = (email: string | null | undefined): string => {
    if (!email) return "U"
    const parts = email.split("@")[0].split(".")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false)
    logout()
  }

  const handleChangePassword = () => {
    setChangePasswordOpen(true)
  }

  const handleManageUsers = () => {
    router.push("/users")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {getInitials(user?.email)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Signed in as</p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleChangePassword}>
            <Key className="mr-2 h-4 w-4" />
            <span>Change Password</span>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExcludedRecordsClick}>
                <Ban className="mr-2 h-4 w-4" />
                <span>Excluded Records</span>
                {excludedRecordsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] font-medium"
                  >
                    {excludedRecordsCount > 999 ? "999+" : excludedRecordsCount}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleManageUsers}>
                <Users className="mr-2 h-4 w-4" />
                <span>Manage Users</span>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogoutClick} variant="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again to access the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmLogout} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

