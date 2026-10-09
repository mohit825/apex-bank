import Link from "next/link";

export default function Home() {
  return (
    <>
      <p>
        <Link href={"/calculator"}>Calculator</Link>
      </p>
      <main className="flex min-h-screen items-center px-6 py-16 sm:px-10">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Welcome to ApexBank
          </h1>
          <p className="mt-4 text-xl text-slate-700 sm:text-2xl">
            Secure Wealth Management Portal
          </p>
          <p className="mt-6 max-w-prose leading-7 text-slate-600">
            A simple starting point for exploring banking and wealth management.
          </p>
        </div>
      </main>
    </>
  );
}
