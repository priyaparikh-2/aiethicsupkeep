import { generateBriefingForDate } from "../src/lib/ingestion/generateBriefing";

async function main() {
  const result = await generateBriefingForDate(new Date());
  console.log(
    `Generated briefing ${result.briefingId} with ${result.developmentCount} development(s).`
  );
  if (result.feedErrors.length) {
    console.warn(`${result.feedErrors.length} feed(s) failed to fetch:`);
    for (const e of result.feedErrors) console.warn(`  - ${e.source}: ${e.message}`);
  }
}

main()
  .catch((err) => {
    console.error("Failed to generate morning brief:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
