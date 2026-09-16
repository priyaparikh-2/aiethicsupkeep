import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/SettingsForm";
import { SOURCE_REGISTRY } from "@/lib/taxonomy";
import { SOURCE_CATEGORY_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  const bySource = SOURCE_REGISTRY.reduce<Record<string, typeof SOURCE_REGISTRY>>((acc, s) => {
    (acc[s.sourceCategory] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl mb-6">Settings</h1>

      <SettingsForm
        initial={{
          deliveryTime: settings.deliveryTime,
          timezone: settings.timezone,
          recipientEmail: settings.recipientEmail,
          weeklyReviewDay: settings.weeklyReviewDay,
        }}
      />

      <div className="mt-4 text-xs text-ink/50 max-w-sm">
        Delivery is triggered externally (cron / scheduler) by running{" "}
        <code className="bg-black/5 px-1 rounded">npm run brief:generate</code> then{" "}
        <code className="bg-black/5 px-1 rounded">npm run brief:send</code> at the configured
        time. See the README for a sample cron setup.
      </div>

      <section className="mt-12 pt-8 border-t border-ink/10">
        <h2 className="text-lg mb-4">Monitored sources</h2>
        <p className="text-sm text-ink/60 mb-6">
          Per the product's editorial policy, only these registered sources (plus primary
          documents they link to) are used as evidence. Social media, content farms, SEO blogs,
          and AI-generated summaries are excluded categorically.
        </p>
        {Object.entries(bySource).map(([category, sources]) => (
          <div key={category} className="mb-4">
            <h3 className="text-xs uppercase tracking-wide text-ink/50 mb-1">
              {SOURCE_CATEGORY_LABELS[category]}
            </h3>
            <ul className="text-sm space-y-0.5">
              {sources.map((s) => (
                <li key={s.name}>
                  <a href={s.homepageUrl} target="_blank" rel="noreferrer" className="underline">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
