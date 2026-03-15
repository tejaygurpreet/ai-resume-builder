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

export const templates = {
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
};

export type TemplateName = keyof typeof templates;

export type TemplateCategory =
  | "modern"
  | "minimal"
  | "professional"
  | "creative"
  | "technical"
  | "academic";

export interface TemplateInfo {
  id: TemplateName;
  name: string;
  category: TemplateCategory;
  description: string;
  accent: string;
}

export const templateRegistry: TemplateInfo[] = [
  {
    id: "modern",
    name: "Modern",
    category: "modern",
    description: "Clean layout with accent borders and skill tags",
    accent: "#2563eb",
  },
  {
    id: "professional",
    name: "Professional",
    category: "professional",
    description: "Traditional corporate style with centered header",
    accent: "#1e3a5f",
  },
  {
    id: "minimal",
    name: "Minimal",
    category: "minimal",
    description: "Ultra-clean with thin lines and small caps",
    accent: "#374151",
  },
  {
    id: "executive",
    name: "Executive",
    category: "professional",
    description: "Dark header with bold section headings",
    accent: "#1e293b",
  },
  {
    id: "tech",
    name: "Tech",
    category: "technical",
    description: "Sidebar layout with skills panel",
    accent: "#0891b2",
  },
  {
    id: "creative",
    name: "Creative",
    category: "creative",
    description: "Two-column layout with gradient header",
    accent: "#7c3aed",
  },
  {
    id: "compact",
    name: "Compact",
    category: "minimal",
    description: "Dense layout that maximizes content per page",
    accent: "#475569",
  },
  {
    id: "simple",
    name: "Simple",
    category: "minimal",
    description: "Straightforward with clean bullet points",
    accent: "#2563eb",
  },
  {
    id: "elegant",
    name: "Elegant",
    category: "professional",
    description: "Refined serif headings with subtle accent borders",
    accent: "#92702a",
  },
  {
    id: "corporate",
    name: "Corporate",
    category: "professional",
    description: "Thick top bar with sidebar skills panel",
    accent: "#1d4ed8",
  },
  {
    id: "student",
    name: "Student",
    category: "academic",
    description: "Education-first layout for new graduates",
    accent: "#059669",
  },
  {
    id: "bold",
    name: "Bold",
    category: "creative",
    description: "High-contrast with colored section bars",
    accent: "#dc2626",
  },
  {
    id: "classic",
    name: "Classic",
    category: "professional",
    description: "Traditional format with serif typography",
    accent: "#1e3a5f",
  },
  {
    id: "gradient",
    name: "Gradient",
    category: "modern",
    description: "Gradient header with pill-style skill badges",
    accent: "#6366f1",
  },
  {
    id: "timeline",
    name: "Timeline",
    category: "creative",
    description: "Visual career progression with timeline markers",
    accent: "#0891b2",
  },
  {
    id: "twocolumn",
    name: "Two Column",
    category: "modern",
    description: "Equal split with clean divider",
    accent: "#2563eb",
  },
  {
    id: "infographic",
    name: "Infographic",
    category: "creative",
    description: "Data-driven with bar charts and star ratings",
    accent: "#7c3aed",
  },
  {
    id: "academic",
    name: "Academic",
    category: "academic",
    description: "Formal layout for research and education roles",
    accent: "#1e3a5f",
  },
  {
    id: "metro",
    name: "Metro",
    category: "modern",
    description: "Flat design with colored tiles and badges",
    accent: "#0ea5e9",
  },
  {
    id: "ribbon",
    name: "Ribbon",
    category: "creative",
    description: "Decorative ribbon banners on section headers",
    accent: "#e11d48",
  },
];
