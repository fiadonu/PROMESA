import Link from "next/link";
import { formatGhs, progressPercent, sdgLabel } from "@/lib/utils";

export type CampaignSummary = {
  id: string;
  title: string;
  description: string;
  sdg: number;
  targetAmount: number;
  totalPledged: number;
  deadline: Date;
  ngoName: string;
};
export function CampaignCard({ campaign }: { campaign: CampaignSummary }) {
  const progress = progressPercent(
    campaign.totalPledged,
    campaign.targetAmount,
  );
  return (
    <article className="card flex flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded bg-teal-50 px-2 py-1 text-xs font-bold text-teal-800">
          {sdgLabel(campaign.sdg)}
        </span>
        <span className="text-xs text-slate-500">
          Ends {campaign.deadline.toLocaleDateString()}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-bold">
        <Link
          className="hover:text-teal-700"
          href={`/campaigns/${campaign.id}`}
        >
          {campaign.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
        {campaign.description}
      </p>
      <p className="mt-4 text-xs font-semibold text-slate-500">
        By {campaign.ngoName}
      </p>
      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-teal-600"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="font-bold text-slate-800">
            {formatGhs(campaign.totalPledged)}
          </span>
          <span className="text-slate-500">
            of {formatGhs(campaign.targetAmount)}
          </span>
        </div>
      </div>
      <Link
        className="mt-5 text-sm font-bold text-teal-700 hover:text-teal-900"
        href={`/campaigns/${campaign.id}`}
      >
        View campaign →
      </Link>
    </article>
  );
}
