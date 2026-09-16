import { writeFileSync } from "fs";
import { getLatestBriefing } from "../src/lib/briefing";
import { renderBriefingEmailHtml } from "../src/lib/email/render";

async function main() {
  const briefing = await getLatestBriefing();
  if (!briefing) throw new Error("No briefing found. Run `npm run db:seed` first.");
  const html = renderBriefingEmailHtml(briefing, process.env.APP_URL || "http://localhost:3000");
  const outPath = process.argv[2] || "/tmp/preview-email.html";
  writeFileSync(outPath, html);
  console.log(`Wrote preview email to ${outPath}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
