import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/queries";
import { formatGhs, progressPercent, sdgLabel } from "@/lib/utils";
import { PledgeForm } from "@/components/pledge-form";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const campaign = await getCampaign((await params).id);
  if (!campaign) notFound();
  const progress = progressPercent(
    campaign.totalPledged,
    campaign.targetAmount,
  );
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-6 py-14 lg:grid-cols-[1fr_340px]">
      <article>
        <span className="rounded bg-teal-50 px-2 py-1 text-xs font-bold text-teal-800">
          {sdgLabel(campaign.sdg)}
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight">
          {campaign.title}
        </h1>
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Campaign by {campaign.ngoName} · Closes{" "}
          {campaign.deadline.toLocaleDateString()}
        </p>
        <p className="mt-8 whitespace-pre-wrap text-lg leading-8 text-slate-700">
          {campaign.description}
        </p>
      </article>
      <aside className="card h-fit p-6">
        <p className="text-sm text-slate-500">Pledged so far</p>
        <p className="mt-1 text-3xl font-bold">
          {formatGhs(campaign.totalPledged)}
        </p>
        <p className="text-sm text-slate-500">
          of {formatGhs(campaign.targetAmount)}
        </p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-teal-600"
            style={{ width: `${progress}%` }}
          />
        </div>
        <PledgeForm campaignId={campaign.id} />
      </aside>
    </main>
  );
}
