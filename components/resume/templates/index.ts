import ModernTemplate from "./modern";
import ProfessionalTemplate from "./professional";
import MinimalTemplate from "./minimal";
import ExecutiveTemplate from "./executive";
import TechTemplate from "./tech";
import CreativeTemplate from "./creative";
import CompactTemplate from "./compact";
import SimpleTemplate from "./simple";
import ElegantTemplate from "./elegant";
import CorporateTemplate from "./corporate";
import StudentTemplate from "./student";
import BoldTemplate from "./bold";
import ClassicTemplate from "./classic";
import GradientTemplate from "./gradient";
import TimelineTemplate from "./timeline";
import TwoColumnTemplate from "./twocolumn";
import InfographicTemplate from "./infographic";
import AcademicTemplate from "./academic";
import MetroTemplate from "./metro";
import RibbonTemplate from "./ribbon";
import { TEMPLATE_CONFIGS } from "@/lib/template-config";

const baseTemplates = {
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  tech: TechTemplate,
  creative: CreativeTemplate,
  compact: CompactTemplate,
  simple: SimpleTemplate,
  elegant: ElegantTemplate,
  corporate: CorporateTemplate,
  student: StudentTemplate,
  bold: BoldTemplate,
  classic: ClassicTemplate,
  gradient: GradientTemplate,
  timeline: TimelineTemplate,
  twocolumn: TwoColumnTemplate,
  infographic: InfographicTemplate,
  academic: AcademicTemplate,
  metro: MetroTemplate,
  ribbon: RibbonTemplate,
} as const;

// Build templates object: each config maps to its base component
type BaseTemplateKey = keyof typeof baseTemplates;
export const templates = Object.fromEntries(
  TEMPLATE_CONFIGS.map((c) => [c.id, baseTemplates[c.baseTemplate as BaseTemplateKey]])
) as Record<string, (typeof baseTemplates)[BaseTemplateKey]>;

export type TemplateName = keyof typeof templates;

export type TemplateCategory =
  | "modern"
  | "minimal"
  | "professional"
  | "creative"
  | "executive"
  | "tech"
  | "student"
  | "elegant"
  | "corporate"
  | "compact";

export interface TemplateInfo {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  accent: string;
}

export const templateRegistry: TemplateInfo[] = TEMPLATE_CONFIGS.map((c) => ({
  id: c.id,
  name: c.name,
  category: c.category,
  description: c.description,
  accent: c.accent,
}));

export function getAccentForTemplate(templateId: string): string {
  const info = templateRegistry.find((t) => t.id === templateId);
  return info?.accent ?? "#2563eb";
}
