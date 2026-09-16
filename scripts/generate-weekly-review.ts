import { generateWeeklyReview } from "../src/lib/weeklyReview";

async function main() {
  const result = await generateWeeklyReview(new Date());
  console.log(`Generated weekly review ${result.id}.`);
}

main()
  .catch((err) => {
    console.error("Failed to generate weekly review:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
