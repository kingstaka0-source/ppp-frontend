import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-9 items-center gap-1">
              <span className="h-4 w-2 rounded-full bg-green-500" />
              <span className="h-7 w-2 rounded-full bg-green-500" />
              <span className="h-9 w-2 rounded-full bg-green-500" />
              <span className="h-7 w-2 rounded-full bg-green-500" />
              <span className="h-4 w-2 rounded-full bg-green-500" />
            </div>

            <div className="text-3xl font-black text-white">
              Tune<span className="text-green-500">Reach</span>
            </div>
          </div>

          <h1 className="mt-6 text-2xl font-black text-white">
            Create your free account
          </h1>

          <p className="mt-2 text-sm text-white/60">
            Start discovering playlist opportunities for your music.
          </p>
        </div>

        <div className="flex justify-center">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/onboarding"
          />
        </div>
      </div>
    </main>
  );
}