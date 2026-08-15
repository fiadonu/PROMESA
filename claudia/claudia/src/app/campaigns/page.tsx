import { CampaignCard } from "@/components/campaign-card";
import { getPublicCampaigns } from "@/lib/queries";
import { SDGS } from "@/lib/utils";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sdg?: string }>;
}) {
  const params = await searchParams;
  const campaigns = await getPublicCampaigns();
  const filtered = campaigns.filter(
    (c) =>
      (!params.q || c.title.toLowerCase().includes(params.q.toLowerCase())) &&
      (!params.sdg || c.sdg === Number(params.sdg)),
  );
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <p className="eyebrow">Discover verified work</p>
      <h1 className="section-title">Support an SDG campaign</h1>
      <form className="card mt-8 grid gap-3 p-4 md:grid-cols-[1fr_260px_auto]">
        <input
          className="field"
          name="q"
          defaultValue={params.q}
          placeholder="Search campaign title"
          aria-label="Search campaign title"
        />
        <select className="field" name="sdg" defaultValue={params.sdg ?? ""}>
          <option value="">All Sustainable Development Goals</option>
          {SDGS.map((sdg, index) => (
            <option key={sdg} value={index + 1}>
              SDG {index + 1}: {sdg}
            </option>
          ))}
        </select>
        <button className="button button-primary" type="submit">
          Search
        </button>
      </form>
      <p className="mt-7 text-sm text-slate-600">
        {filtered.length} active{" "}
        {filtered.length === 1 ? "campaign" : "campaigns"}
      </p>
      {filtered.length ? (
        <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="card mt-4 p-10 text-center text-slate-600">
          No active campaigns match those filters.
        </div>
      )}
    </main>
  );
}
