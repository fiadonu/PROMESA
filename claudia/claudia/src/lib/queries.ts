import { and, eq, gt, sql } from "drizzle-orm";
import { campaigns, ngoProfiles, pledges, users } from "./schema";
import { db } from "./db";
import type { CampaignSummary } from "@/components/campaign-card";

export async function getPublicCampaigns(): Promise<CampaignSummary[]> {
  if (!db) return [];
  const rows = await db
    .select({
      id: campaigns.id,
      title: campaigns.title,
      description: campaigns.description,
      sdg: campaigns.sdg,
      targetAmount: campaigns.targetAmount,
      deadline: campaigns.deadline,
      ngoName: ngoProfiles.name,
      totalPledged: sql<string>`coalesce(sum(${pledges.amount}), 0)`,
    })
    .from(campaigns)
    .innerJoin(ngoProfiles, eq(campaigns.ngoId, ngoProfiles.id))
    .leftJoin(pledges, eq(pledges.campaignId, campaigns.id))
    .where(
      and(eq(campaigns.status, "approved"), gt(campaigns.deadline, new Date())),
    )
    .groupBy(campaigns.id, ngoProfiles.name);
  return rows.map((row) => ({
    ...row,
    targetAmount: Number(row.targetAmount),
    totalPledged: Number(row.totalPledged),
  }));
}
export async function getCampaign(id: string) {
  if (!db) return null;
  const list = await getPublicCampaigns();
  return list.find((campaign) => campaign.id === id) ?? null;
}
export async function findUserByEmail(email: string) {
  if (!db) return null;
  return (
    (
      await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1)
    )[0] ?? null
  );
}
