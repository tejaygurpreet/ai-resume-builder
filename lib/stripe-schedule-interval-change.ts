import type Stripe from "stripe";

/**
 * Schedule a new price at the end of the current billing period (subscription schedules).
 */
export async function applySubscriptionScheduleIntervalChange(
  stripe: Stripe,
  stripeSubscriptionId: string,
  targetPriceId: string
): Promise<{ currentPeriodEnd: number }> {
  const stripeSubscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
    { expand: ["schedule"] }
  );

  const currentPeriodEnd = stripeSubscription.current_period_end;

  let scheduleId: string | null = null;

  if (stripeSubscription.schedule) {
    scheduleId =
      typeof stripeSubscription.schedule === "string"
        ? stripeSubscription.schedule
        : stripeSubscription.schedule.id;
  }

  if (!scheduleId) {
    const schedule = await stripe.subscriptionSchedules.create({
      from_subscription: stripeSubscriptionId,
    });
    scheduleId = schedule.id;
  }

  const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId, {
    expand: ["subscription"],
  });

  const phases = schedule.phases;
  const currentPhase = phases[0];
  if (!currentPhase) {
    throw new Error("Could not read subscription schedule.");
  }

  const phase1Items = currentPhase.items.map((item) => ({
    price: typeof item.price === "string" ? item.price : item.price.id,
    quantity: item.quantity ?? 1,
  }));

  await stripe.subscriptionSchedules.update(scheduleId, {
    phases: [
      {
        items: phase1Items,
        start_date: currentPhase.start_date,
        end_date: currentPeriodEnd,
      },
      {
        items: [{ price: targetPriceId, quantity: 1 }],
        start_date: currentPeriodEnd,
      },
    ],
  });

  return { currentPeriodEnd };
}
