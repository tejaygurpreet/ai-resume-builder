"use client";

import React, { useState, useCallback } from "react";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import type { UpgradeReason } from "@/components/ui/UpgradeModal";
import { isFreeTemplate } from "@/lib/template-config";
import type { PlanState } from "./usePlan";

interface UseMembershipLimitOptions {
  plan: PlanState;
  aiGenerationsUsed?: number;
  resumeId?: string;
}

export function useMembershipLimit({
  plan,
  aiGenerationsUsed = 0,
}: UseMembershipLimitOptions) {
  const [upgradeModal, setUpgradeModal] = useState<{
    open: boolean;
    reason: UpgradeReason;
    templateName?: string;
  }>({ open: false, reason: "pro_feature" });

  const showUpgrade = useCallback(
    (reason: UpgradeReason, templateName?: string) => {
      setUpgradeModal({ open: true, reason, templateName });
    },
    []
  );

  const closeUpgrade = useCallback(() => {
    setUpgradeModal((p) => ({ ...p, open: false }));
  }, []);

  const checkAiLimit = useCallback((): boolean => {
    if (plan.isPro) return true;
    if (aiGenerationsUsed >= plan.aiGenerationsPerResume) {
      showUpgrade("ai_limit");
      return false;
    }
    return true;
  }, [plan.isPro, plan.aiGenerationsPerResume, aiGenerationsUsed, showUpgrade]);

  const checkExportLimit = useCallback((): boolean => {
    if (plan.isPro || plan.hasOneTimeExport) return true;
    if (plan.exportsUsed >= plan.maxExportsPerMonth) {
      showUpgrade("export_limit");
      return false;
    }
    return true;
  }, [
    plan.isPro,
    plan.hasOneTimeExport,
    plan.exportsUsed,
    plan.maxExportsPerMonth,
    showUpgrade,
  ]);

  const checkTemplateAccess = useCallback(
    (templateId: string, templateName: string): boolean => {
      if (plan.canUsePremiumTemplates) return true;
      if (!isFreeTemplate(templateId)) {
        showUpgrade("template_lock", templateName);
        return false;
      }
      return true;
    },
    [plan.canUsePremiumTemplates, showUpgrade]
  );

  const UpgradeModalComponent = React.createElement(UpgradeModal, {
    isOpen: upgradeModal.open,
    onClose: closeUpgrade,
    reason: upgradeModal.reason,
    templateName: upgradeModal.templateName,
  });

  return {
    checkAiLimit,
    checkExportLimit,
    checkTemplateAccess,
    showUpgrade,
    UpgradeModalComponent,
  };
}
