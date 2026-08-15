import "next-auth";
declare module "next-auth" {
  interface User {
    role: "donor" | "ngo" | "admin";
  }
  interface Session {
    user: { id: string; role: "donor" | "ngo" | "admin" } & NonNullable<
      Session["user"]
    >;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    role?: "donor" | "ngo" | "admin";
  }
}
