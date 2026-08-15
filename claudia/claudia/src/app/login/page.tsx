import { LoginForm } from "@/components/login-form";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <LoginForm registered={params.registered === "1"} />
    </main>
  );
}
