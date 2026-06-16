export const demoCredentials = () => ({
  email: process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "demo@portfolio.local",
  password: process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "DemoView2026!",
})

export const isDemoEmail = (email: string | null | undefined) => {
  if (!email) return false
  return email.toLowerCase() === demoCredentials().email.toLowerCase()
}

export const isDemoRole = (role: string | undefined) => role === "demo"
