import Link from "next/link"
import PublicLayout from "@/components/layout/PublicLayout"
import LoginForm from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-md">
          <h1 className="text-2xl font-headline text-center mb-6">Welcome back</h1>
          <LoginForm />
          <p className="text-center text-sm text-text-muted mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-accent hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
