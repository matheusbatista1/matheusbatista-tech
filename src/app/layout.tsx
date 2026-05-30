import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Matheus Batista — Software Engineer",
    template: "%s · Matheus Batista",
  },
  description:
    "Backend-focused software engineer specializing in .NET, Node.js, APIs, integrations, and scalable systems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
