import { NextRequest, NextResponse } from "next/server"

// Dynamically import firebase-admin to handle cases where it might not be installed
let adminAuth: any
let adminDb: any

async function initializeAdmin() {
  if (adminAuth && adminDb) return

  try {
    const admin = await import("firebase-admin")
    const { initializeApp, getApps, cert } = await import("firebase-admin/app")
    const { getAuth } = await import("firebase-admin/auth")
    const { getFirestore } = await import("firebase-admin/firestore")

    let adminApp
    if (getApps().length === 0) {
      // Check if we have service account credentials (preferred method)
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
          adminApp = initializeApp({
            credential: cert(serviceAccount),
          })
        } catch (parseError) {
          throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's valid JSON.")
        }
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Use credentials file path
        adminApp = initializeApp()
      } else {
        // Try to use project ID with Application Default Credentials
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
        
        if (!projectId) {
          throw new Error(
            "Firebase Admin requires credentials. Please set up one of the following:\n" +
            "1. FIREBASE_SERVICE_ACCOUNT_KEY (recommended) - JSON string of service account key\n" +
            "2. GOOGLE_APPLICATION_CREDENTIALS - Path to service account JSON file\n" +
            "3. Or ensure Application Default Credentials are configured\n" +
            "\nTo get a service account key:\n" +
            "1. Go to Firebase Console → Project Settings → Service Accounts\n" +
            "2. Click 'Generate New Private Key'\n" +
            "3. Add the JSON content to FIREBASE_SERVICE_ACCOUNT_KEY in your .env.local file"
          )
        }
        
        try {
          adminApp = initializeApp({
            projectId: projectId,
          })
        } catch (initError: any) {
          throw new Error(
            `Failed to initialize Firebase Admin: ${initError.message}\n` +
            "Please set up FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS."
          )
        }
      }
    } else {
      adminApp = getApps()[0]
    }

    adminAuth = getAuth(adminApp)
    adminDb = getFirestore(adminApp)
  } catch (error: any) {
    if (error.message.includes("firebase-admin")) {
      throw new Error("firebase-admin is not installed. Please run: npm install firebase-admin")
    }
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeAdmin()

    const { uid } = await request.json()

    if (!uid) {
      return NextResponse.json(
        { error: "User UID is required" },
        { status: 400 }
      )
    }

    // Delete from Firebase Authentication
    try {
      await adminAuth.deleteUser(uid)
    } catch (authError: any) {
      // If user doesn't exist in Auth, continue with Firestore deletion
      if (authError.code !== "auth/user-not-found") {
        throw authError
      }
    }

    // Delete from Firestore
    await adminDb.collection("users").doc(uid).delete()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    )
  }
}

