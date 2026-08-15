import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { campaigns, ngoProfiles, pledges, users } from "@/lib/schema";
import { formatGhs, SDGS } from "@/lib/utils";
import {
  submitCampaign,
  submitNgoProfile,
  reviewCampaign,
  reviewNgo,
  updatePledgeStatus,
} from "@/app/actions";

const Status = ({ value }: { value: string }) => (
  <span className={`status status-${value}`}>{value}</span>
);
export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (!db)
    return (
      <main className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="section-title">Configure your database</h1>
        <p className="mt-3 text-slate-600">
          Add <code>DATABASE_URL</code> and <code>NEXTAUTH_SECRET</code> to{" "}
          <code>.env.local</code>, run the migration, then seed the
          administrator account.
        </p>
      </main>
    );
  const user = session.user;
  if (user.role === "admin") return <AdminDashboard />;
  if (user.role === "ngo") return <NgoDashboard userId={user.id} />;
  return <DonorDashboard userId={user.id} />;
}
async function DonorDashboard({ userId }: { userId: string }) {
  if (!db) return null;
  const records = await db
    .select({
      id: pledges.id,
      amount: pledges.amount,
      status: pledges.status,
      createdAt: pledges.createdAt,
      campaign: campaigns.title,
    })
    .from(pledges)
    .innerJoin(campaigns, eq(pledges.campaignId, campaigns.id))
    .where(eq(pledges.donorId, userId))
    .orderBy(desc(pledges.createdAt));
  return (
    <DashboardShell
      title="Donor dashboard"
      subtitle="Review the commitments you have recorded."
    >
      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Pledge</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {records.length ? (
              records.map((p) => (
                <tr key={p.id}>
                  <td className="font-semibold">{p.campaign}</td>
                  <td>{formatGhs(Number(p.amount))}</td>
                  <td>
                    <Status value={p.status} />
                  </td>
                  <td>{p.createdAt.toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-slate-500">
                  No pledges yet. Find a campaign to support.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
async function NgoDashboard({ userId }: { userId: string }) {
  if (!db) return null;
  const profile = (
    await db
      .select()
      .from(ngoProfiles)
      .where(eq(ngoProfiles.ownerId, userId))
      .limit(1)
  )[0];
  const ownCampaigns = profile
    ? await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.ngoId, profile.id))
        .orderBy(desc(campaigns.createdAt))
    : [];
  const receivedPledges = profile
    ? await db
        .select({
          id: pledges.id,
          amount: pledges.amount,
          status: pledges.status,
          campaign: campaigns.title,
          donor: users.name,
        })
        .from(pledges)
        .innerJoin(campaigns, eq(pledges.campaignId, campaigns.id))
        .innerJoin(users, eq(pledges.donorId, users.id))
        .where(eq(campaigns.ngoId, profile.id))
        .orderBy(desc(pledges.createdAt))
    : [];
  return (
    <DashboardShell
      title="NGO dashboard"
      subtitle="Manage your organisation profile and campaign submissions."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-bold">Organisation profile</h2>
          {profile ? (
            <div className="mt-4 text-sm">
              <p className="font-semibold">{profile.name}</p>
              <p className="mt-1 text-slate-600">{profile.description}</p>
              <p className="mt-4">
                Review status: <Status value={profile.status} />
              </p>
            </div>
          ) : (
            <form className="mt-5 space-y-3" action={submitNgoProfile}>
              <input
                className="field"
                name="name"
                placeholder="NGO name"
                required
              />
              <textarea
                className="field min-h-24"
                name="description"
                placeholder="What does your NGO do?"
                required
              />
              <input
                className="field"
                type="email"
                name="contactEmail"
                placeholder="Contact email"
                required
              />
              <input
                className="field"
                name="contactPhone"
                placeholder="Contact phone (optional)"
              />
              <SdgSelect />
              <button className="button button-primary" type="submit">
                Submit profile for review
              </button>
            </form>
          )}
        </section>
        <section className="card p-6">
          <h2 className="font-bold">Submit a campaign</h2>
          {profile?.status === "approved" ? (
            <form className="mt-5 space-y-3" action={submitCampaign}>
              <input
                className="field"
                name="title"
                placeholder="Campaign title"
                required
              />
              <textarea
                className="field min-h-24"
                name="description"
                placeholder="Describe the need and intended impact"
                required
              />
              <input
                className="field"
                name="targetAmount"
                type="number"
                min="1"
                step="0.01"
                placeholder="Target amount (GHS)"
                required
              />
              <input className="field" name="deadline" type="date" required />
              <SdgSelect />
              <button className="button button-primary" type="submit">
                Submit for approval
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Campaign creation unlocks after your organisation is approved.
            </p>
          )}
        </section>
      </div>
      <section className="card mt-6 overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Target</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ownCampaigns.length ? (
              ownCampaigns.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold">{c.title}</td>
                  <td>{formatGhs(Number(c.targetAmount))}</td>
                  <td>
                    <Status value={c.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center text-slate-500">
                  No submitted campaigns.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <section className="card mt-6 overflow-x-auto">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold">Pledges received</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Donor</th>
              <th>Campaign</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {receivedPledges.length ? (
              receivedPledges.map((pledge) => (
                <tr key={pledge.id}>
                  <td>{pledge.donor}</td>
                  <td>{pledge.campaign}</td>
                  <td>{formatGhs(Number(pledge.amount))}</td>
                  <td>
                    <Status value={pledge.status} />
                  </td>
                  <td>
                    {pledge.status !== "fulfilled" && (
                      <div className="flex gap-2">
                        <form
                          action={updatePledgeStatus.bind(
                            null,
                            pledge.id,
                            "acknowledged",
                          )}
                        >
                          <button className="text-sm font-bold text-teal-700">
                            Acknowledge
                          </button>
                        </form>
                        <form
                          action={updatePledgeStatus.bind(
                            null,
                            pledge.id,
                            "fulfilled",
                          )}
                        >
                          <button className="text-sm font-bold text-teal-700">
                            Fulfil
                          </button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-slate-500">
                  No pledges received yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </DashboardShell>
  );
}
async function AdminDashboard() {
  if (!db) return null;
  const pendingNgos = await db
    .select()
    .from(ngoProfiles)
    .where(eq(ngoProfiles.status, "pending"));
  const pendingCampaigns = await db
    .select({
      id: campaigns.id,
      title: campaigns.title,
      targetAmount: campaigns.targetAmount,
      ngoName: ngoProfiles.name,
    })
    .from(campaigns)
    .innerJoin(ngoProfiles, eq(campaigns.ngoId, ngoProfiles.id))
    .where(eq(campaigns.status, "pending"));
  const recentUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(10);
  const [userCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  const [campaignCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(campaigns);
  return (
    <DashboardShell
      title="Administrator dashboard"
      subtitle="Review submissions and monitor PROMESA."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Metric label="Registered users" value={userCount.count} />
        <Metric label="Campaigns" value={campaignCount.count} />
      </div>
      <section className="card mt-6 overflow-x-auto">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold">NGO profiles awaiting review</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Organisation</th>
              <th>Focus</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            {pendingNgos.length ? (
              pendingNgos.map((ngo) => (
                <tr key={ngo.id}>
                  <td>
                    <p className="font-semibold">{ngo.name}</p>
                    <p className="text-sm text-slate-500">{ngo.contactEmail}</p>
                  </td>
                  <td>SDG {ngo.primarySdg}</td>
                  <td>
                    <div className="flex gap-2">
                      <form action={reviewNgo.bind(null, ngo.id, "approved")}>
                        <button className="button button-primary">
                          Approve
                        </button>
                      </form>
                      <form action={reviewNgo.bind(null, ngo.id, "rejected")}>
                        <button className="button button-outline">
                          Reject
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center text-slate-500">
                  No pending NGO profiles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <section className="card mt-6 overflow-x-auto">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold">Campaigns awaiting review</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>NGO</th>
              <th>Target</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            {pendingCampaigns.length ? (
              pendingCampaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="font-semibold">{campaign.title}</td>
                  <td>{campaign.ngoName}</td>
                  <td>{formatGhs(Number(campaign.targetAmount))}</td>
                  <td>
                    <div className="flex gap-2">
                      <form
                        action={reviewCampaign.bind(
                          null,
                          campaign.id,
                          "approved",
                        )}
                      >
                        <button className="button button-primary">
                          Approve
                        </button>
                      </form>
                      <form
                        action={reviewCampaign.bind(
                          null,
                          campaign.id,
                          "rejected",
                        )}
                      >
                        <button className="button button-outline">
                          Reject
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-slate-500">
                  No pending campaigns.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <section className="card mt-6 overflow-x-auto">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold">Recent registered users</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((listedUser) => (
              <tr key={listedUser.id}>
                <td>{listedUser.name}</td>
                <td>{listedUser.email}</td>
                <td>
                  <span className="status status-approved">
                    {listedUser.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </DashboardShell>
  );
}
function DashboardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <p className="eyebrow">PROMESA workspace</p>
      <h1 className="section-title">{title}</h1>
      <p className="mt-2 text-slate-600">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </main>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
function SdgSelect() {
  return (
    <select className="field" name="sdg" defaultValue="">
      <option value="" disabled>
        Select primary SDG
      </option>
      {SDGS.map((sdg, i) => (
        <option key={sdg} value={i + 1}>
          SDG {i + 1}: {sdg}
        </option>
      ))}
    </select>
  );
}
