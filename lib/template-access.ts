import { prisma } from "@/lib/prisma";
import { isActiveProSubscription } from "@/lib/membership";
import { TEMPLATE_CONFIGS, isFreeTemplate } from "@/lib/template-config";

const VALID_TEMPLATE_IDS = new Set(TEMPLATE_CONFIGS.map((c) => c.id));

export type TemplateAccessResult =
  | { ok: true }
  | { ok: false; status: number; error: string; code: string };

/**
 * Server-side enforcement of the template paywall.
 *
 * This previously existed only in the UI (`template-gallery.tsx` hid locked
 * cards, `builder/page.tsx` refused to preselect a locked template). Neither is
 * a control. The save endpoints accepted any template id in the request body, so
 * a free account could POST `{"template":"executive-elite"}` from devtools and
 * export a Pro design — every paid template was one fetch call away from free.
 */
export async function assertTemplateAllowed(
  userId: string,
  templateId: string | undefined | null
): Promise<TemplateAccessResult> {
  if (templateId === undefined || templateId === null) return { ok: true };

  if (!VALID_TEMPLATE_IDS.has(templateId)) {
    return {
      ok: false,
      status: 400,
      error: "Unknown template.",
      code: "INVALID_TEMPLATE",
    };
  }

  if (isFreeTemplate(templateId)) return { ok: true };

  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      plan: true,
      status: true,
      stripeSubscriptionId: true,
      currentPeriodEnd: true,
      planInterval: true,
    },
  });

  if (isActiveProSubscription(sub)) return { ok: true };

  return {
    ok: false,
    status: 403,
    error: "That template is part of Pro. Upgrade to use it, or pick a free template.",
    code: "PRO_TEMPLATE_REQUIRED",
  };
}
