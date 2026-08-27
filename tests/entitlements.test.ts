/**
 * Entitlement matrix.
 *
 * Run with:  npx tsx tests/entitlements.test.ts
 *
 * The bug this pins down: four AI routes checked Pro status inline with
 * `plan === "pro" && status === "active"`. A lifetime purchase is a one-time
 * payment with no subscription object, so `status` is null and those customers
 * were silently treated as free tier and throttled to 3 AI generations per
 * resume — after paying $199.99. Everything now routes through
 * isActiveProSubscription(), which handles the lifetime case explicitly.
 */

import { isActiveProSubscription, isAiBlockedForExportOnly, hasUnlimitedExports }
  from "../lib/membership";

let pass=0, fail=0;
const t=(n:string,c:boolean)=>{c?pass++:fail++;console.log(`${c?"PASS":"FAIL"}  ${n}`)};

const lifetime:any = { plan:"pro", status:null, stripeSubscriptionId:null, currentPeriodEnd:null, planInterval:null, oneTimeExport:false };
const monthly:any  = { plan:"pro", status:"active", stripeSubscriptionId:"sub_1", currentPeriodEnd:new Date(Date.now()+86400e3), planInterval:"monthly", oneTimeExport:false };
const expired:any  = { plan:"pro", status:"active", stripeSubscriptionId:"sub_2", currentPeriodEnd:new Date(Date.now()-86400e3), planInterval:"monthly", oneTimeExport:false };
const canceled:any = { plan:"pro", status:"canceled", stripeSubscriptionId:"sub_3", currentPeriodEnd:new Date(Date.now()+86400e3), planInterval:"monthly", oneTimeExport:false };
const exportOnly:any={ plan:"export", status:null, stripeSubscriptionId:null, currentPeriodEnd:null, planInterval:null, oneTimeExport:false };
const legacyExp:any= { plan:"free", oneTimeExport:true, status:null, stripeSubscriptionId:null, currentPeriodEnd:null, planInterval:null };
const free:any     = { plan:"free", status:null, stripeSubscriptionId:null, currentPeriodEnd:null, planInterval:null, oneTimeExport:false };

console.log("\nThe lifetime-throttling bug (old inline check was plan===pro && status===active):");
t("lifetime buyer counts as Pro", isActiveProSubscription(lifetime));
t("  ...and old inline check would have FAILED them",
  !(lifetime.plan === "pro" && lifetime.status === "active"));

console.log("\nSubscription states:");
t("active monthly is Pro", isActiveProSubscription(monthly));
t("expired period is not Pro", !isActiveProSubscription(expired));
t("canceled status is not Pro", !isActiveProSubscription(canceled));
t("free is not Pro", !isActiveProSubscription(free));
t("null subscription is not Pro", !isActiveProSubscription(null));
t("export-only is not Pro", !isActiveProSubscription(exportOnly));

console.log("\nAI access:");
t("export-only blocked from AI", isAiBlockedForExportOnly(exportOnly));
t("legacy oneTimeExport blocked from AI", isAiBlockedForExportOnly(legacyExp));
t("free NOT blocked by export rule (tier check must catch it)", !isAiBlockedForExportOnly(free));
t("pro not blocked", !isAiBlockedForExportOnly(monthly));

console.log("\nExports:");
t("pro has unlimited exports", hasUnlimitedExports(monthly));
t("export-access has unlimited exports", hasUnlimitedExports(exportOnly));
t("free does not", !hasUnlimitedExports(free));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
