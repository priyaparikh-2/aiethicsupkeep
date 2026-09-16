import type { HydratedBriefing } from "@/lib/briefing";
import { parseWhoIsAffected } from "@/lib/briefing";
import { SOURCE_CATEGORY_LABELS } from "@/lib/types";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

// Renders the Morning Brief exactly to the structure in PRD §10-12:
// header -> state-of-conversation paragraph -> up to 5 developments (each
// with what happened / why it matters / where the conversation stands /
// who is affected / the question underneath / read + primary evidence
// links) -> Signal Beyond the Headlines -> What Should Priya Be Thinking
// About.
export function renderBriefingEmailHtml(briefing: HydratedBriefing, appUrl: string): string {
  const devSections = briefing.developments
    .map((dev, i) => {
      const primaryArticle = dev.articles[0];
      const primarySourceUrl = primaryArticle?.primarySourceUrl;
      const who = parseWhoIsAffected(dev.whoIsAffected);
      const tagList = dev.tags.map((t) => t.tag.name).join(", ");
      return `
      <tr><td style="padding: 28px 0 8px 0; border-top: 1px solid #ddd;">
        <div style="font-size:12px;letter-spacing:0.04em;color:#666;text-transform:uppercase;">
          ${primaryArticle ? esc(SOURCE_CATEGORY_LABELS[primaryArticle.source.sourceCategory] ?? "") + " · " + esc(primaryArticle.source.name) : ""}
          ${primaryArticle?.publicationDate ? " · " + formatDate(new Date(primaryArticle.publicationDate)) : ""}
        </div>
        <h2 style="font-size:19px;margin:6px 0 12px 0;font-family:Georgia,serif;">${i + 1}. ${esc(dev.title)}</h2>
        ${dev.newMediaForm ? '<div style="display:inline-block;font-size:11px;background:#1a1a1a;color:#faf8f5;padding:2px 8px;border-radius:3px;margin-bottom:10px;">NEW MEDIA FORM</div>' : ""}

        <p style="margin:0 0 10px 0;"><strong>What happened.</strong> ${esc(dev.whatHappened)}</p>
        <p style="margin:0 0 10px 0;"><strong>Why it matters.</strong> ${esc(dev.whyItMatters)}</p>
        <p style="margin:0 0 10px 0;"><strong>Where the conversation stands.</strong> ${esc(dev.whereConversationStands)}</p>
        ${dev.verificationNote ? `<p style="margin:0 0 10px 0;color:#8a5a00;"><em>${esc(dev.verificationNote)}</em></p>` : ""}
        <p style="margin:0 0 10px 0;"><strong>Who is affected.</strong> ${esc(who.join(", "))}</p>

        <div style="background:#f3f0ea;padding:12px 14px;border-radius:6px;margin:12px 0;">
          <div style="font-size:11px;letter-spacing:0.04em;color:#666;text-transform:uppercase;margin-bottom:4px;">Research lens — analysis, not settled fact</div>
          <p style="margin:0;">${esc(dev.researchLens ?? "")}</p>
        </div>

        <p style="margin:0 0 14px 0;"><strong>The question underneath it.</strong> ${esc(dev.questionUnderneath ?? "")}</p>

        <p style="margin:0 0 4px 0;font-size:13px;color:#555;">Tags: ${esc(tagList)}</p>
        <p style="margin:0;">
          ${primaryArticle ? `<a href="${esc(primaryArticle.url)}" style="color:#1a1a1a;">Read →</a>` : ""}
          ${primarySourceUrl ? ` &nbsp;·&nbsp; <a href="${esc(primarySourceUrl)}" style="color:#1a1a1a;">Primary evidence →</a>` : ""}
          &nbsp;·&nbsp; <a href="${esc(appUrl)}/today" style="color:#1a1a1a;">Save / highlight / add note →</a>
        </p>
      </td></tr>`;
    })
    .join("");

  const signalItems = briefing.signalBeyondHeadlines
    .map(
      (s) => `<li style="margin-bottom:10px;"><strong>${esc(s.category)}.</strong> ${esc(s.text)}</li>`
    )
    .join("");

  const provocationItems = briefing.researchProvocations
    .map(
      (p) =>
        `<li style="margin-bottom:10px;"><strong>${esc(p.category)}${p.newMediaForm ? " · NEW MEDIA FORM" : ""}.</strong> ${esc(p.text)}</li>`
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;background:#faf8f5;font-family:Georgia,Cambria,'Times New Roman',serif;color:#1a1a1a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;padding:32px 20px;">
  <tr><td>
    <div style="font-size:12px;letter-spacing:0.08em;color:#666;text-transform:uppercase;">AI × Moving Image</div>
    <h1 style="font-size:24px;margin:4px 0 20px 0;">${esc(formatDate(briefing.date))}</h1>
    <p style="font-size:15px;line-height:1.6;">${esc(briefing.stateOfConversation)}</p>
  </td></tr>

  <tr><td style="padding-top:8px;"><h2 style="font-size:14px;letter-spacing:0.06em;text-transform:uppercase;color:#444;">${briefing.developments.length === 1 ? "The one thing worth knowing" : `The ${briefing.developments.length === 5 ? "five" : briefing.developments.length} things worth knowing`}</h2></td></tr>
  ${devSections || '<tr><td style="padding:16px 0;color:#666;">No developments met the relevance bar today.</td></tr>'}

  ${
    signalItems
      ? `<tr><td style="padding-top:32px;border-top:2px solid #1a1a1a;">
    <h2 style="font-size:16px;margin:20px 0 12px 0;">Signal Beyond the Headlines</h2>
    <ul style="padding-left:18px;margin:0;">${signalItems}</ul>
  </td></tr>`
      : ""
  }

  ${
    provocationItems
      ? `<tr><td style="padding-top:24px;">
    <h2 style="font-size:16px;margin:0 0 12px 0;">What Should Priya Be Thinking About?</h2>
    <ul style="padding-left:18px;margin:0;">${provocationItems}</ul>
  </td></tr>`
      : ""
  }

  <tr><td style="padding-top:32px;border-top:1px solid #ddd;font-size:12px;color:#888;">
    <a href="${esc(appUrl)}/today" style="color:#888;">Open in the research app →</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}
