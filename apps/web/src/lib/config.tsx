import { Icons } from "@/components/icons";
import {
  BrainIcon,
  Code2,
  CodeIcon,
  GlobeIcon,
  Lock,
  PlugIcon,
  Scale,
  UsersIcon,
  Wrench,
  ZapIcon,
  Linkedin,
} from "lucide-react";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "AI Tutor RAG API",
  description:
    "Empower your AI agents by securely storing and retrieving your documents. Connect your data seamlessly to LLMs, regardless of the source.",
  cta: "Get Started",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: [
    "RAG API",
    "Document Storage",
    "AI Agents",
    "LLM Integration",
    "Workflow Automation",
  ],
  links: {
    twitter: "https://twitter.com/myaitutor",
    discord: "https://discord.gg/XZ8XDQQT6Kr",
    github: "https://github.com/rossman22590/aitutor-api-rag",
  },
  hero: {
    title: "AI Tutor RAG API",
    description:
      "The intelligent solution for storing your documents and powering context-aware AI agents. Build powerful RAG applications at any scale.",
    cta: "Get Started",
  },
  whySupavec: [
    {
      name: "Full Control",
      description:
        "Leverage our RAG API—choose infrastructure. Enjoy complete freedom to adapt and modify your document workflows.",
      icon: <Code2 className="size-6" />,
    },
    {
      name: "Enterprise-Grade Privacy",
      description:
        "Implement robust data security with  Row Level Security (RLS) for granular access control. Your data stays private and secure.",
      icon: <Lock className="size-6" />,
    },
    {
      name: "Built to Scale",
      description:
        "Handle millions of documents with ease. Our system supports concurrent processing and horizontal scaling, built on AI Tutor, Next.js, and TypeScript.",
      icon: <Scale className="size-6" />,
    },
    {
      name: "Developer-First",
      description:
        "Enjoy a simple, intuitive API with comprehensive documentation, quick setup, and deep customization for modern, intelligent applications.",
      icon: <Wrench className="size-6" />,
    },
  ],
  features: [
    {
      name: "Simple Agent Workflows",
      description:
        "Easily create and manage AI agent workflows that integrate document retrieval directly into your logic.",
      icon: <BrainIcon className="h-6 w-6" />,
    },
    {
      name: "Multi-Agent Systems",
      description:
        "Coordinate multiple AI agents to work together for sophisticated, context-aware decision making.",
      icon: <UsersIcon className="h-6 w-6" />,
    },
    {
      name: "Tool Integration",
      description:
        "Seamlessly integrate external tools and APIs into your workflows for added functionality and automation.",
      icon: <PlugIcon className="h-6 w-6" />,
    },
    {
      name: "Cross-Language Support",
      description:
        "Use our API in all major programming languages for maximum flexibility in your tech stack.",
      icon: <GlobeIcon className="h-6 w-6" />,
    },
    {
      name: "Customizable Agents",
      description:
        "Design and tailor your agents to meet specific needs and use cases. Build custom solutions that truly fit your business.",
      icon: <CodeIcon className="h-6 w-6" />,
    },
    {
      name: "Efficient Execution",
      description:
        "Optimize performance with built-in efficiency features, ensuring rapid and reliable agent responses.",
      icon: <ZapIcon className="h-6 w-6" />,
    },
  ],
  pricing: [
    {
      name: "Basic",
      price: { monthly: "$9", yearly: "$99" },
      frequency: { monthly: "month", yearly: "year" },
      description: "Ideal for individuals and small projects seeking to experiment with RAG workflows.",
      features: [
        "1,000 document retrievals per month",
        "Basic API capabilities",
        "Email support",
        "Community access",
      ],
      cta: "Get Started",
    },
    {
      name: "Pro",
      price: { monthly: "$29", yearly: "$290" },
      frequency: { monthly: "month", yearly: "year" },
      description:
        "Perfect for professionals who need enhanced document storage, retrieval, and API access.",
      features: [
        "10,000 document retrievals per month",
        "Advanced API features",
        "Priority email support",
        "Customizable agent integration",
        "Collaboration tools",
      ],
      cta: "Get Started",
    },
    {
      name: "Enterprise",
      price: { monthly: "$999", yearly: "Custom" },
      frequency: { monthly: "month", yearly: "year" },
      description:
        "Tailored solutions for large organizations with high-volume needs and bespoke deployment requirements.",
      features: [
        "Unlimited document retrievals",
        "Dedicated account management",
        "24/7 enterprise support",
        "Custom AI model development",
        "On-premises deployment options",
        "Advanced analytics and reporting",
      ],
      popular: true,
      cta: "Get Started",
    },
  ],
  footer: {
    socialLinks: [
      {
        icon: <Icons.github className="size-5" />,
        url: "https://github.com/aitutor/aitutor",
      },
      {
        icon: <Icons.twitter className="size-5" />,
        url: "https://twitter.com/aitutor",
      },
      {
        icon: <Icons.discord className="size-5" />,
        url: "https://discord.gg/aitutor",
      },
      {
        icon: <Linkedin className="size-5" />,
        url: "https://linkedin.com/company/aitutor",
      },
    ],
    bottomText: "All rights reserved.",
    brandText: "AI Tutor RAG API",
  },
};

export type SiteConfig = typeof siteConfig;
