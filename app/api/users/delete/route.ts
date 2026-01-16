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
        // Use credentials file path (for local development)
        adminApp = initializeApp()
      } else {
        // Require FIREBASE_SERVICE_ACCOUNT_KEY - Application Default Credentials don't work in serverless environments
        throw new Error(
          "Firebase Admin requires credentials. FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required.\n\n" +
          "To set up in Vercel:\n" +
          "1. Go to Firebase Console → Project Settings → Service Accounts\n" +
          "2. Click 'Generate New Private Key' and download the JSON file\n" +
          "3. Go to Vercel Dashboard → Your Project → Settings → Environment Variables\n" +
          "4. Add FIREBASE_SERVICE_ACCOUNT_KEY with the entire JSON content as the value\n" +
          "   (You can minify the JSON or keep it formatted - both work)\n" +
          "5. Redeploy your application\n\n" +
          "For local development, you can also use:\n" +
          "- FIREBASE_SERVICE_ACCOUNT_KEY in your .env.local file, OR\n" +
          "- GOOGLE_APPLICATION_CREDENTIALS pointing to the service account JSON file path"
        )
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

