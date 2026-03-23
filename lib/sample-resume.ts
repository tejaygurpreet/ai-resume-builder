export const sampleSections = [
  {
    id: "s-personal",
    type: "personal",
    order: 0,
    content: {
      firstName: "Alexandra",
      lastName: "Chen",
      fullName: "Alexandra Chen",
      email: "alexandra.chen@email.com",
      phone: "(415) 555-0123",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/alexandra-chen",
      github: "github.com/alexchen",
      portfolio: "alexchen.dev",
      website: "alexchen.dev",
    },
  },
  {
    id: "s-summary",
    type: "summary",
    order: 1,
    content: {
      text: "Senior Software Engineer with 6+ years building scalable systems at high-growth tech companies. Proven track record leading architecture decisions, mentoring teams, and shipping reliable products. Strong in TypeScript, distributed systems, and cross-functional collaboration.",
    },
  },
  {
    id: "s-experience",
    type: "experience",
    order: 2,
    content: {
      items: [
        {
          id: "exp-1",
          title: "Senior Software Engineer",
          company: "Stripe",
          location: "San Francisco, CA",
          startDate: "Jan 2022",
          endDate: "",
          current: true,
          bullets: [
            "Led migration of payment processing pipeline to event-driven architecture with improved reliability and observability",
            "Mentored team of 6 engineers; established code review standards adopted across 3 teams",
            "Designed real-time fraud detection dashboard for operations and risk teams",
          ],
        },
        {
          id: "exp-2",
          title: "Software Engineer",
          company: "Notion",
          location: "Remote",
          startDate: "Mar 2019",
          endDate: "Dec 2021",
          current: false,
          bullets: [
            "Built collaborative editing features shipped across core product surfaces",
            "Improved API performance through query optimization and a caching layer",
          ],
        },
      ],
    },
  },
  {
    id: "s-education",
    type: "education",
    order: 3,
    content: {
      items: [
        {
          id: "edu-1",
          degree: "B.S. Computer Science",
          school: "Stanford University",
          field: "Software Engineering",
          location: "Stanford, CA",
          startDate: "2015",
          endDate: "2019",
          gpa: "3.9",
        },
      ],
    },
  },
  {
    id: "s-skills",
    type: "skills",
    order: 4,
    content: {
      items: [
        "TypeScript",
        "React",
        "Node.js",
        "Python",
        "PostgreSQL",
        "AWS",
        "Docker",
        "Kubernetes",
        "GraphQL",
        "System Design",
      ],
    },
  },
  {
    id: "s-projects",
    type: "projects",
    order: 5,
    content: {
      items: [
        {
          id: "proj-1",
          name: "Resume Parser CLI",
          description: "Open-source developer tool for parsing and validating resume JSON. MIT licensed, published to npm.",
          technologies: "Rust, GitHub Actions, npm",
          link: "github.com/alexchen/resume-cli",
        },
      ],
    },
  },
  {
    id: "s-certifications",
    type: "certifications",
    order: 6,
    content: {
      items: [
        {
          id: "cert-1",
          name: "AWS Solutions Architect",
          issuer: "Amazon Web Services",
          date: "2023",
        },
      ],
    },
  },
  {
    id: "s-languages",
    type: "languages",
    order: 7,
    content: {
      items: [
        { id: "lang-1", language: "English", proficiency: "Native" },
        { id: "lang-2", language: "Mandarin", proficiency: "Fluent" },
      ],
    },
  },
];
