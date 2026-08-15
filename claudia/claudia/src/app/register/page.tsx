import Link from "next/link";
import { register } from "@/app/actions";
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <div className="card p-7">
        <p className="eyebrow">Join PROMESA</p>
        <h1 className="section-title">Create your account</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Register as a donor to pledge support, or as an NGO to submit
          campaigns for approval.
        </p>
        {params.error && (
          <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">
            {params.error}
          </p>
        )}
        <form className="mt-7 space-y-4" action={register}>
          <div>
            <label className="field-label" htmlFor="name">
              Full name
            </label>
            <input
              className="field"
              id="name"
              name="name"
              required
              minLength={2}
            />
          </div>
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
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="role">
              I am registering as
            </label>
            <select className="field" id="role" name="role">
              <option value="donor">Donor</option>
              <option value="ngo">NGO representative</option>
            </select>
          </div>
          <button className="button button-primary w-full" type="submit">
            Create account
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-600">
          Already registered?{" "}
          <Link className="font-bold text-teal-700" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
