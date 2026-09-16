import { prisma } from "../src/lib/db";
import { getLatestBriefing } from "../src/lib/briefing";
import { renderBriefingEmailHtml } from "../src/lib/email/render";
import { sendEmail } from "../src/lib/email/send";

async function main() {
  const briefing = await getLatestBriefing();
  if (!briefing) throw new Error("No briefing found. Run `npm run brief:generate` first.");

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const to = settings?.recipientEmail || process.env.BRIEFING_RECIPIENT;
  if (!to) {
    throw new Error(
      "No recipient configured. Set Settings.recipientEmail (via the Settings page) or the " +
        "BRIEFING_RECIPIENT env var."
    );
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const html = renderBriefingEmailHtml(briefing, appUrl);
  const dateLabel = briefing.date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  await sendEmail({ to, subject: `AI × Moving Image — ${dateLabel}`, html });
  await prisma.briefing.update({ where: { id: briefing.id }, data: { sentAt: new Date() } });
  console.log(`Sent briefing ${briefing.id} to ${to}.`);
}

main()
  .catch((err) => {
    console.error("Failed to send morning email:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
