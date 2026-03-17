/**
 * Template configuration - 50 professional resume templates
 * Each template maps to a base component with unique accent and display name
 */

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

export type BaseTemplateId =
  | "modern"
  | "professional"
  | "minimal"
  | "executive"
  | "tech"
  | "creative"
  | "compact"
  | "simple"
  | "elegant"
  | "corporate"
  | "student"
  | "bold"
  | "classic"
  | "gradient"
  | "timeline"
  | "twocolumn"
  | "metro"
  | "ribbon"
  | "academic"
  | "infographic";

export interface TemplateConfig {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  baseTemplate: BaseTemplateId;
  accent: string;
  fontFamily?: string;
}

export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  // Modern (5)
  { id: "modern", name: "Modern", category: "modern", description: "Clean layout with accent borders and skill tags", baseTemplate: "modern", accent: "#2563eb" },
  { id: "modern-pro", name: "Modern Pro", category: "modern", description: "Professional modern design with refined typography", baseTemplate: "modern", accent: "#6366f1" },
  { id: "modern-edge", name: "Modern Edge", category: "modern", description: "Sharp lines and contemporary layout", baseTemplate: "modern", accent: "#0ea5e9" },
  { id: "modern-clean", name: "Modern Clean", category: "modern", description: "Minimalist modern with ample whitespace", baseTemplate: "modern", accent: "#059669" },
  { id: "modern-gradient", name: "Modern Gradient", category: "modern", description: "Gradient accents for a fresh look", baseTemplate: "gradient", accent: "#7c3aed" },
  // Professional (6)
  { id: "professional", name: "Professional", category: "professional", description: "Traditional corporate style with centered header", baseTemplate: "professional", accent: "#1e3a5f" },
  { id: "professional-classic", name: "Professional Classic", category: "professional", description: "Timeless professional format", baseTemplate: "classic", accent: "#1e3a5f" },
  { id: "professional-ats", name: "Professional ATS", category: "professional", description: "Optimized for applicant tracking systems", baseTemplate: "professional", accent: "#1d4ed8" },
  { id: "professional-clean", name: "Professional Clean", category: "professional", description: "Streamlined professional layout", baseTemplate: "simple", accent: "#2563eb" },
  { id: "professional-blue", name: "Professional Blue", category: "professional", description: "Corporate blue accent theme", baseTemplate: "professional", accent: "#1e40af" },
  { id: "professional-corporate", name: "Professional Corporate", category: "professional", description: "Executive-ready corporate design", baseTemplate: "corporate", accent: "#1e3a5f" },
  // Minimal (5)
  { id: "minimal", name: "Minimal", category: "minimal", description: "Ultra-clean with thin lines and small caps", baseTemplate: "minimal", accent: "#374151" },
  { id: "minimal-light", name: "Minimal Light", category: "minimal", description: "Light and airy minimal design", baseTemplate: "minimal", accent: "#6b7280" },
  { id: "minimal-dark", name: "Minimal Dark", category: "minimal", description: "Refined dark accent minimal style", baseTemplate: "minimal", accent: "#1f2937" },
  { id: "minimal-line", name: "Minimal Line", category: "minimal", description: "Line-focused minimal layout", baseTemplate: "simple", accent: "#4b5563" },
  { id: "minimal-ats", name: "Minimal ATS", category: "minimal", description: "ATS-optimized minimal format", baseTemplate: "compact", accent: "#374151" },
  // Creative (5)
  { id: "creative", name: "Creative", category: "creative", description: "Two-column layout with gradient header", baseTemplate: "creative", accent: "#7c3aed" },
  { id: "creative-bold", name: "Creative Bold", category: "creative", description: "High-contrast creative design", baseTemplate: "bold", accent: "#dc2626" },
  { id: "creative-designer", name: "Creative Designer", category: "creative", description: "Portfolio-style creative layout", baseTemplate: "creative", accent: "#e11d48" },
  { id: "creative-portfolio", name: "Creative Portfolio", category: "creative", description: "Showcase your work with style", baseTemplate: "twocolumn", accent: "#8b5cf6" },
  { id: "creative-gradient", name: "Creative Gradient", category: "creative", description: "Vibrant gradient creative theme", baseTemplate: "gradient", accent: "#6366f1" },
  // Executive (5)
  { id: "executive", name: "Executive", category: "executive", description: "Dark header with bold section headings", baseTemplate: "executive", accent: "#1e293b" },
  { id: "executive-elite", name: "Executive Elite", category: "executive", description: "Premium executive presentation", baseTemplate: "executive", accent: "#0f172a" },
  { id: "executive-gold", name: "Executive Gold", category: "executive", description: "Refined gold accent executive style", baseTemplate: "elegant", accent: "#92400e" },
  { id: "executive-boardroom", name: "Executive Boardroom", category: "executive", description: "Board-ready professional format", baseTemplate: "corporate", accent: "#1e3a5f" },
  { id: "executive-premium", name: "Executive Premium", category: "executive", description: "Luxury executive design", baseTemplate: "classic", accent: "#1e293b" },
  // Tech (5)
  { id: "tech", name: "Tech", category: "tech", description: "Sidebar layout with skills panel", baseTemplate: "tech", accent: "#0891b2" },
  { id: "tech-developer", name: "Tech Developer", category: "tech", description: "Developer-focused tech layout", baseTemplate: "tech", accent: "#0d9488" },
  { id: "tech-engineer", name: "Tech Engineer", category: "tech", description: "Engineering resume optimized", baseTemplate: "tech", accent: "#0284c7" },
  { id: "tech-startup", name: "Tech Startup", category: "tech", description: "Startup-friendly tech design", baseTemplate: "metro", accent: "#0ea5e9" },
  { id: "tech-minimal", name: "Tech Minimal", category: "tech", description: "Clean minimal tech style", baseTemplate: "compact", accent: "#64748b" },
  // Student (5)
  { id: "student", name: "Student", category: "student", description: "Education-first layout for new graduates", baseTemplate: "student", accent: "#059669" },
  { id: "student-starter", name: "Student Starter", category: "student", description: "Perfect for first resume", baseTemplate: "student", accent: "#10b981" },
  { id: "student-modern", name: "Student Modern", category: "student", description: "Contemporary student design", baseTemplate: "student", accent: "#0d9488" },
  { id: "student-internship", name: "Student Internship", category: "student", description: "Internship application optimized", baseTemplate: "academic", accent: "#047857" },
  { id: "student-graduate", name: "Student Graduate", category: "student", description: "Graduate program ready", baseTemplate: "academic", accent: "#059669" },
  // Elegant (4)
  { id: "elegant", name: "Elegant", category: "elegant", description: "Refined serif headings with subtle accent borders", baseTemplate: "elegant", accent: "#92702a" },
  { id: "elegant-serif", name: "Elegant Serif", category: "elegant", description: "Classic serif typography", baseTemplate: "elegant", accent: "#78350f" },
  { id: "elegant-light", name: "Elegant Light", category: "elegant", description: "Light elegant design", baseTemplate: "elegant", accent: "#a16207" },
  { id: "elegant-premium", name: "Elegant Premium", category: "elegant", description: "Premium elegant presentation", baseTemplate: "classic", accent: "#854d0e" },
  // Corporate (5)
  { id: "corporate", name: "Corporate", category: "corporate", description: "Thick top bar with sidebar skills panel", baseTemplate: "corporate", accent: "#1d4ed8" },
  { id: "corporate-ats", name: "Corporate ATS", category: "corporate", description: "ATS-friendly corporate format", baseTemplate: "corporate", accent: "#1e40af" },
  { id: "corporate-structured", name: "Corporate Structured", category: "corporate", description: "Highly structured corporate layout", baseTemplate: "professional", accent: "#1e3a5f" },
  { id: "corporate-simple", name: "Corporate Simple", category: "corporate", description: "Simple corporate design", baseTemplate: "simple", accent: "#2563eb" },
  { id: "corporate-executive", name: "Corporate Executive", category: "corporate", description: "Executive corporate style", baseTemplate: "executive", accent: "#1e293b" },
  // Compact (5)
  { id: "compact", name: "Compact", category: "compact", description: "Dense layout that maximizes content per page", baseTemplate: "compact", accent: "#475569" },
  { id: "compact-onepage", name: "Compact One Page", category: "compact", description: "Optimized for single-page resumes", baseTemplate: "compact", accent: "#64748b" },
  { id: "compact-ats", name: "Compact ATS", category: "compact", description: "ATS-optimized compact format", baseTemplate: "compact", accent: "#334155" },
  { id: "compact-modern", name: "Compact Modern", category: "compact", description: "Modern compact design", baseTemplate: "compact", accent: "#0ea5e9" },
  { id: "compact-minimal", name: "Compact Minimal", category: "compact", description: "Minimal compact layout", baseTemplate: "compact", accent: "#6b7280" },
  // Additional variety (5) - timeline, ribbon, infographic, metro, twocolumn
  { id: "timeline", name: "Timeline", category: "creative", description: "Visual career progression with timeline markers", baseTemplate: "timeline", accent: "#0891b2" },
  { id: "ribbon", name: "Ribbon", category: "creative", description: "Decorative ribbon banners on section headers", baseTemplate: "ribbon", accent: "#e11d48" },
  { id: "infographic", name: "Infographic", category: "creative", description: "Data-driven with visual elements", baseTemplate: "infographic", accent: "#7c3aed" },
  { id: "metro", name: "Metro", category: "modern", description: "Flat design with colored tiles and badges", baseTemplate: "metro", accent: "#0ea5e9" },
  { id: "twocolumn", name: "Two Column", category: "modern", description: "Equal split with clean divider", baseTemplate: "twocolumn", accent: "#2563eb" },
];

export const TEMPLATE_CATEGORIES: { key: TemplateCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "modern", label: "Modern" },
  { key: "professional", label: "Professional" },
  { key: "minimal", label: "Minimal" },
  { key: "creative", label: "Creative" },
  { key: "executive", label: "Executive" },
  { key: "tech", label: "Tech" },
  { key: "student", label: "Student" },
  { key: "elegant", label: "Elegant" },
  { key: "corporate", label: "Corporate" },
  { key: "compact", label: "Compact" },
];
