import Link from "next/link";
import { ArrowRight, CheckCircle2, Landmark, Search, ShieldCheck } from "lucide-react";
import { CampaignCard } from "@/components/campaign-card";
import { getPublicCampaigns } from "@/lib/queries";

export default async function Home() {
  const campaigns = await getPublicCampaigns();

  return (
    <main>
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.25fr_.75fr] lg:py-28">
          <div>
            <p className="mb-5 text-sm font-bold tracking-[0.18em] text-teal-300">PROMESA / SDG ACTION PLATFORM</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Make every pledge visible.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">PROMESA helps SDG-focused NGOs run transparent campaigns and gives donors a clear record of the commitments they make.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link className="button button-primary" href="/campaigns">Explore campaigns <ArrowRight size={17} /></Link>
              <Link className="button button-secondary" href="/register">Register your NGO</Link>
            </div>
          </div>
          <aside className="grid gap-3 self-end sm:grid-cols-3 lg:grid-cols-1" aria-label="Platform benefits">
            {[{ icon: ShieldCheck, title: "Approved", text: "Campaigns are reviewed before publication." }, { icon: Landmark, title: "SDG focused", text: "Every campaign is linked to a UN goal." }, { icon: CheckCircle2, title: "Traceable", text: "Donors and NGOs can track each pledge." }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-xl border border-slate-700 bg-slate-900 p-5"><Icon className="mb-3 text-teal-300" size={22} /><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-400">{text}</p></div>)}
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Live opportunities</p><h2 className="section-title">Campaigns seeking support</h2></div><Link className="inline-flex items-center gap-2 font-semibold text-teal-700 hover:text-teal-900" href="/campaigns">View all <ArrowRight size={16} /></Link></div>
        {campaigns.length ? <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{campaigns.slice(0, 3).map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}</div> : <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"><Search className="mx-auto text-slate-400" size={28} /><h3 className="mt-4 font-semibold">Campaigns will appear here</h3><p className="mx-auto mt-2 max-w-md text-sm text-slate-600">Once an administrator approves an NGO campaign, donors can discover it here.</p></div>}
      </section>
    </main>
  );
}
