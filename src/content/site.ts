/**
 * All portfolio content lives here. Edit this file to update the site —
 * no component changes needed. Optional fields (dates, points, links)
 * are simply hidden when left out.
 */

export const profile = {
  name: "Ankit Rana",
  roles: ["Data Scientist", "Generative AI Engineer", "Machine Learning Developer"],
  location: "India",
  email: "ankitrana451800@gmail.com",
  github: "https://github.com/Ankit-rana18",
  linkedin: "https://www.linkedin.com/in/ankit-rana-1aa386253",
  cv: "/Ankit_Rana_CV.pdf",
  /** Short line under the big hero heading. */
  intro: "Data scientist & generative AI engineer building intelligent systems and scalable data solutions",
  summary:
    "I build machine learning models, LLM-powered RAG applications, AI agents and the data pipelines behind them, using Python, SQL, LangChain, Microsoft Fabric and Databricks.",
};

/** Used for <title>, meta description and social previews. */
export const seo = {
  title: "Ankit Rana — Data Scientist & Generative AI Engineer",
  description:
    "Portfolio of Ankit Rana, a data scientist and generative AI engineer building RAG applications, ML models, AI agents and data pipelines.",
  // Set NEXT_PUBLIC_SITE_URL in your hosting environment to your real domain.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const about = {
  /** Revealed character by character as you scroll. */
  statement:
    "I'm a data scientist and generative AI engineer with over a year of hands-on work across machine learning, GenAI and data engineering. I turn business problems into AI systems that actually run, from RAG assistants and forecasting models to the pipelines that feed them. Let's build something intelligent together!",
  paragraphs: [
    "I'm a data scientist and generative AI engineer with over a year of hands-on work across machine learning, GenAI, data science and data engineering, in both enterprise and startup teams.",
    "I started in data engineering at Indorama Ventures, moving data from SAP into PostgreSQL and building the dashboards people used to make decisions. Internships since then took me into sales forecasting with LSTM and ARIMA models, Microsoft Fabric analytics, and generative AI.",
    "What I enjoy most is turning a business problem into an AI system that actually runs: retrieval-augmented assistants, predictive models served behind APIs, and the pipelines that keep them fed with clean data.",
  ],
  facts: [
    { label: "Studying", value: "M.Sc. Data Science, VIT Vellore" },
    { label: "Certified", value: "OCI 2025 Data Science Professional" },
    { label: "Focus", value: "RAG, AI agents, forecasting, data pipelines" },
  ],
};

export type Capability = {
  name: string;
  description: string;
  stack: string[];
  /** Counted up when the card enters view. Every figure comes from the CV. */
  metric: { value: number; suffix?: string; label: string };
  visual: "graph" | "forecast" | "pipeline" | "document";
};

/** "What I do" capability cards. */
export const whatIDo: Capability[] = [
  {
    name: "Generative AI",
    description: "RAG assistants, AI agents and LLM applications built with LangChain, LangGraph, FAISS and Hugging Face models.",
    stack: ["LangChain", "LangGraph", "FAISS", "Hugging Face", "Google Gemma"],
    metric: { value: 1000, suffix: "+", label: "financial documents indexed for semantic search" },
    visual: "graph",
  },
  {
    name: "Machine Learning",
    description: "Forecasting and predictive models using LSTM, ARIMA, regression and classification.",
    stack: ["TensorFlow", "Scikit-learn", "LSTM", "ARIMA", "Feature engineering"],
    metric: { value: 3, label: "forecasting model families built for sales prediction" },
    visual: "forecast",
  },
  {
    name: "Data Engineering",
    description: "Scalable ETL pipelines, streaming systems, Microsoft Fabric, Azure Databricks, PySpark and Delta Lake.",
    stack: ["Microsoft Fabric", "Azure Databricks", "PySpark", "Delta Lake", "Event Hub"],
    metric: { value: 3, label: "Medallion layers in a real-time streaming platform" },
    visual: "pipeline",
  },
  {
    name: "AI Automation",
    description: "Intelligent document extraction, workflow automation, OCR and AI-powered business applications.",
    stack: ["Python", "OCR", "Document extraction", "FastAPI", "Workflow automation"],
    metric: { value: 30, suffix: "%", label: "less manual effort from automated reporting" },
    visual: "document",
  },
];

export type Experience = {
  role: string;
  company: string;
  location?: string;
  period?: string;
  points?: string[];
  /** Technologies named in the role's own bullet points. */
  stack?: string[];
  /** One-line summary shown under the role. */
  summary?: string;
  /** Named projects delivered in the role. */
  projects?: string[];
};

export const experience: Experience[] = [
  {
    role: "Data Analyst Intern",
    company: "ARKCA Corporate",
    period: "Aug 2026 – Present",
    summary: "Working across data analytics, business intelligence and AI-driven business process automation.",
    points: [
      "Developing automated reporting and data processing systems using Python, SQL and APIs.",
      "Building campaign analytics and reporting pipelines for large-scale communication datasets.",
      "Developing intelligent document processing workflows for business and regulatory documentation.",
      "Implementing data extraction, validation, deduplication and transformation pipelines.",
      "Exploring AI agents and workflow automation to streamline operational processes.",
      "Building business intelligence solutions that convert raw operational data into actionable insights.",
    ],
    stack: ["Python", "SQL", "APIs", "Document processing", "AI agents", "Business intelligence"],
    projects: [
      "Smartflo Report Automation",
      "TATA TELE Campaign Analytics",
      "EPR Document Automation",
      "FSSAI Document Automation",
      "AI-powered Billing Automation",
      "ARKCA Email Classification & Response Workflow",
      "Sales Intelligence and Lead Profiling",
    ],
  },
  {
    role: "Data Science Intern – Generative AI Developer",
    company: "WorldwideWonder",
    period: "Feb 2026 – Aug 2026",
    points: [
      "Developed LLM-powered applications and AI assistants.",
      "Worked with Retrieval-Augmented Generation (RAG) architectures.",
      "Implemented document ingestion, chunking, embedding and vector search.",
      "Explored LangChain, LangGraph, Hugging Face and vector databases.",
      "Developed AI-powered application workflows.",
    ],
    stack: ["LangChain", "LangGraph", "Hugging Face", "RAG", "Vector databases"],
  },
  {
    role: "Data Engineer Intern",
    company: "World Tech",
    location: "Thailand",
    period: "Oct 2025 – Nov 2025",
    points: [
      "Developed data pipelines using Microsoft Fabric.",
      "Integrated Meta Ads data for centralized analytics.",
      "Designed Delta Lake-based analytical data models.",
      "Implemented ETL workflows and data transformations.",
      "Developed Power BI dashboards and analytical reports using DAX.",
    ],
    stack: ["Microsoft Fabric", "Delta Lake", "ETL", "Power BI", "DAX"],
  },
  {
    role: "Data Science Intern – AI Model Developer",
    company: "SBS",
    location: "Hyderabad",
    period: "Jun 2025 – Jul 2025",
    points: [
      "Worked on predictive modelling and time-series forecasting.",
      "Implemented LSTM, ARIMA and Linear Regression models.",
      "Performed data preprocessing, feature engineering and model evaluation.",
      "Developed API-based integrations using FastAPI.",
      "Explored AI agents and intelligent automation.",
    ],
    stack: ["LSTM", "ARIMA", "Linear Regression", "FastAPI"],
  },
  {
    role: "Data Engineering",
    company: "Indorama Ventures GCC",
    period: "Aug 2023 – Jul 2024",
    points: [
      "Worked on ETL operations and SAP data extraction.",
      "Performed data cleaning, validation and preprocessing.",
      "Used Python and SQL for analytical data preparation.",
      "Supported business reporting and visualization using Tableau.",
    ],
    stack: ["SAP", "Python", "SQL", "Tableau"],
  },
];

export const projectCategories = ["Generative AI", "Data Engineering", "Analytics", "Automation"] as const;
export type ProjectCategory = (typeof projectCategories)[number];

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  categories: ProjectCategory[];
  stack: string[];
  points?: string[];
  repo?: string;
  /** Decorative mood image shown behind the card's details (not a screenshot of the project).
      `lowRes` softens small images so they don't look pixelated when scaled up. */
  image?: { src: string; lowRes?: boolean };
  demo?: string;
};

export const projects: Project[] = [
  {
    slug: "ridesync",
    image: { src: "/projects/ridesync.webp", lowRes: true },
    title: "RideSync",
    tagline: "Real-time ride-sharing data engineering platform.",
    categories: ["Data Engineering", "Generative AI"],
    stack: ["Azure Event Hub", "Databricks", "PySpark", "Delta Lake"],
    points: [
      "Designed a real-time Medallion architecture on Azure Event Hub, Databricks, PySpark and Delta Lake.",
      "Developed AI agents for ride matching, pricing and demand prediction.",
      "Built scalable streaming pipelines producing analytics-ready datasets.",
    ],
  },
  {
    slug: "finance-assistant",
    image: { src: "/projects/finance-assistant.webp" },
    title: "Finance Knowledge Assistant",
    tagline: "RAG-based AI application for financial documents.",
    categories: ["Generative AI"],
    stack: ["LangChain", "FAISS", "Hugging Face", "Google Gemma"],
    points: [
      "Retrieval-augmented assistant built with LangChain, FAISS, Hugging Face and Google Gemma.",
      "Semantic search over 1000+ embedded financial documents.",
      "Answers include source attribution, with conversational memory across turns.",
    ],
  },
  {
    slug: "fabric-etl",
    image: { src: "/projects/fabric-etl.webp", lowRes: true },
    title: "Microsoft Fabric ETL and Analytics",
    tagline: "ETL pipelines and analytics built on Microsoft Fabric.",
    categories: ["Data Engineering", "Analytics"],
    stack: ["Microsoft Fabric"],
  },
  {
    slug: "smartflo-reports",
    image: { src: "/projects/smartflo-reports.webp", lowRes: true },
    title: "Smartflo Report Automation",
    tagline: "Automated reporting for Smartflo.",
    categories: ["Automation"],
    stack: [],
  },
  {
    slug: "billing-automation",
    image: { src: "/projects/billing-automation.webp" },
    title: "Billing Automation",
    tagline: "AI-powered document extraction for billing documents.",
    categories: ["Automation", "Generative AI"],
    stack: ["Document extraction", "AI"],
  },
  {
    slug: "meta-ads",
    image: { src: "/projects/meta-ads.webp" },
    title: "Meta Ads Analytics System",
    tagline: "End-to-end marketing analytics across multiple business entities.",
    categories: ["Analytics", "Data Engineering"],
    stack: ["Microsoft Fabric", "Delta Lake", "Power BI"],
    points: [
      "End-to-end marketing analytics platform on Microsoft Fabric, Delta Lake and Power BI.",
      "Automated ingestion, transformation and reporting across multiple business entities.",
    ],
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "SQL", "PySpark"] },
  {
    group: "Machine learning",
    items: ["Scikit-learn", "TensorFlow", "LSTM", "ARIMA", "Regression", "Classification", "Feature engineering"],
  },
  {
    group: "Generative AI",
    items: ["LangChain", "LangGraph", "RAG", "Hugging Face", "FAISS", "Google Gemma", "AI agents", "Prompt engineering"],
  },
  {
    group: "Data & cloud",
    items: ["Microsoft Fabric", "Databricks", "Delta Lake", "PostgreSQL", "Azure", "AWS"],
  },
  { group: "Apps & BI", items: ["Next.js", "FastAPI", "Streamlit", "Power BI", "Tableau", "Git"] },
];

export const education = [
  { degree: "M.Sc. Data Science", school: "Vellore Institute of Technology (VIT), Vellore", score: "CGPA 9.14 / 10" },
  { degree: "B.Sc. Data Science", school: "Techno India University", score: "CGPA 9.20 / 10" },
];

export const certifications = [
  "Oracle Cloud Infrastructure 2025 Certified Data Science Professional",
  "DataCamp Associate AI Engineer for Developers",
  "NPTEL Cloud Computing (Elite)",
];

export const nav = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];
