import Link from "next/link"
import PublicLayout from "@/components/layout/PublicLayout"
import RegisterForm from "@/components/auth/RegisterForm"

export default function RegisterPage() {
  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-md">
          <h1 className="text-2xl font-headline text-center mb-6">Create your account</h1>
          <RegisterForm />
          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
