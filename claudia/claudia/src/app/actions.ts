"use server";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { campaigns, ngoProfiles, pledges, users } from "@/lib/schema";
import {
  campaignSchema,
  ngoSchema,
  pledgeSchema,
  registerSchema,
} from "@/lib/validation";

const values = (formData: FormData) => Object.fromEntries(formData.entries());
async function currentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Sign in is required.");
  return session.user;
}
export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse(values(formData));
  if (!parsed.success) redirect("/register?error=Please+check+your+details");
  const db = requireDb();
  const email = parsed.data.email.toLowerCase();
  const exists = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (exists.length)
    redirect("/register?error=An+account+already+uses+that+email");
  await db
    .insert(users)
    .values({
      ...parsed.data,
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
    });
  redirect("/login?registered=1");
}
export async function submitNgoProfile(formData: FormData) {
  const user = await currentUser();
  if (user.role !== "ngo")
    throw new Error("Only NGO accounts can submit an NGO profile.");
  const parsed = ngoSchema.safeParse(values(formData));
  if (!parsed.success)
    throw new Error("Please complete every required field correctly.");
  const db = requireDb();
  await db.insert(ngoProfiles).values({ ownerId: user.id, ...parsed.data });
  revalidatePath("/dashboard");
}
export async function submitCampaign(formData: FormData) {
  const user = await currentUser();
  if (user.role !== "ngo")
    throw new Error("Only NGO accounts can create campaigns.");
  const parsed = campaignSchema.safeParse(values(formData));
  if (!parsed.success)
    throw new Error("Please complete every campaign field correctly.");
  const db = requireDb();
  const ngo = (
    await db
      .select()
      .from(ngoProfiles)
      .where(
        and(
          eq(ngoProfiles.ownerId, user.id),
          eq(ngoProfiles.status, "approved"),
        ),
      )
      .limit(1)
  )[0];
  if (!ngo)
    throw new Error(
      "Your NGO profile must be approved before submitting a campaign.",
    );
  await db
    .insert(campaigns)
    .values({
      ngoId: ngo.id,
      ...parsed.data,
      targetAmount: String(parsed.data.targetAmount),
      status: "pending",
    });
  revalidatePath("/dashboard");
}
export async function createPledge(campaignId: string, formData: FormData) {
  const user = await currentUser();
  if (user.role !== "donor")
    throw new Error("Only donor accounts can create pledges.");
  const parsed = pledgeSchema.safeParse(values(formData));
  if (!parsed.success) throw new Error("Enter a valid pledge amount.");
  const db = requireDb();
  const campaign = (
    await db
      .select()
      .from(campaigns)
      .where(
        and(eq(campaigns.id, campaignId), eq(campaigns.status, "approved")),
      )
      .limit(1)
  )[0];
  if (!campaign || campaign.deadline <= new Date())
    throw new Error("This campaign is no longer accepting pledges.");
  await db
    .insert(pledges)
    .values({
      campaignId,
      donorId: user.id,
      amount: String(parsed.data.amount),
    });
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/dashboard");
}
export async function reviewNgo(id: string, decision: "approved" | "rejected") {
  const user = await currentUser();
  if (user.role !== "admin") throw new Error("Administrator access required.");
  await requireDb()
    .update(ngoProfiles)
    .set({ status: decision, reviewedAt: new Date() })
    .where(eq(ngoProfiles.id, id));
  revalidatePath("/dashboard");
}
export async function reviewCampaign(
  id: string,
  decision: "approved" | "rejected",
) {
  const user = await currentUser();
  if (user.role !== "admin") throw new Error("Administrator access required.");
  await requireDb()
    .update(campaigns)
    .set({ status: decision, reviewedAt: new Date() })
    .where(eq(campaigns.id, id));
  revalidatePath("/dashboard");
  revalidatePath("/campaigns");
}
export async function updatePledgeStatus(
  id: string,
  status: "acknowledged" | "fulfilled",
) {
  const user = await currentUser();
  if (user.role !== "ngo") throw new Error("NGO access required.");
  const db = requireDb();
  const ownedPledge = await db
    .select({ id: pledges.id })
    .from(pledges)
    .innerJoin(campaigns, eq(pledges.campaignId, campaigns.id))
    .innerJoin(ngoProfiles, eq(campaigns.ngoId, ngoProfiles.id))
    .where(and(eq(pledges.id, id), eq(ngoProfiles.ownerId, user.id)))
    .limit(1);
  if (!ownedPledge.length)
    throw new Error("You cannot update a pledge for another organisation.");
  await db.update(pledges).set({ status }).where(eq(pledges.id, id));
  revalidatePath("/dashboard");
}
