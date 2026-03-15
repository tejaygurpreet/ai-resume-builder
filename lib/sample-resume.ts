export const sampleSections = [
  {
    id: "s-personal",
    type: "personal",
    order: 0,
    content: {
      fullName: "Alexandra Chen",
      email: "alex.chen@email.com",
      phone: "(555) 123-4567",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/alexchen",
      website: "alexchen.dev",
    },
  },
  {
    id: "s-summary",
    type: "summary",
    order: 1,
    content: {
      text: "Results-driven software engineer with 6+ years of experience building scalable web applications. Passionate about clean code, user experience, and mentoring junior developers.",
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
          company: "TechCorp Inc.",
          location: "San Francisco, CA",
          startDate: "Jan 2022",
          endDate: "",
          current: true,
          bullets: [
            "Led migration of monolith to microservices, reducing deploy times by 70%",
            "Mentored team of 5 junior engineers through code reviews and pair programming",
            "Designed and shipped real-time analytics dashboard serving 50K+ daily users",
          ],
        },
        {
          id: "exp-2",
          title: "Software Engineer",
          company: "StartupXYZ",
          location: "Remote",
          startDate: "Mar 2019",
          endDate: "Dec 2021",
          current: false,
          bullets: [
            "Built React component library adopted by 3 product teams",
            "Optimized API response times by 45% through caching and query optimization",
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
          school: "UC Berkeley",
          location: "Berkeley, CA",
          startDate: "2015",
          endDate: "2019",
          gpa: "3.8",
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
        "GraphQL",
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
          name: "OpenSource CLI Tool",
          description: "A developer productivity CLI with 2K+ GitHub stars",
          technologies: "Rust, GitHub Actions",
          link: "github.com/alexchen/cli-tool",
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
