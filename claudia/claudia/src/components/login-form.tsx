"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function LoginForm({ registered }: { registered: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <div className="card p-7">
      <p className="eyebrow">Welcome back</p>
      <h1 className="section-title">Sign in to PROMESA</h1>
      {registered && (
        <p className="mt-4 rounded bg-emerald-50 p-3 text-sm text-emerald-800">
          Account created. Sign in to continue.
        </p>
      )}
      <form
        className="mt-7 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const result = await signIn("credentials", {
            email: data.get("email"),
            password: data.get("password"),
            redirect: false,
          });
          if (result?.error) setError("Incorrect email or password.");
          else router.push("/dashboard");
        }}
      >
        <div>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            className="field"
            id="email"
            name="email"
            type="email"
            required
          />
        </div>
        <div>
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            className="field"
            id="password"
            name="password"
            type="password"
            required
          />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="button button-primary w-full" type="submit">
          Sign in
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        New to PROMESA?{" "}
        <Link className="font-bold text-teal-700" href="/register">
          Create an account
        </Link>
      </p>
    </div>
  );
}
