import { db, cphubPagesTable, cphubPostsTable, cphubSettingsTable, cphubEmailTemplatesTable } from "@cphub/db";
import { count } from "drizzle-orm";
import { logger } from "./logger";

export async function seedCphubContent(): Promise<void> {
  const [{ value: pageCount }] = await db.select({ value: count() }).from(cphubPagesTable);
  const [{ value: settingsCount }] = await db.select({ value: count() }).from(cphubSettingsTable);
  const [{ value: postCount }] = await db.select({ value: count() }).from(cphubPostsTable);
  const [{ value: tmplCount }] = await db.select({ value: count() }).from(cphubEmailTemplatesTable);

  // Already fully seeded — nothing to do.
  if (Number(pageCount) > 0 && Number(postCount) > 0 && Number(tmplCount) > 0 && Number(settingsCount) > 0) {
    return;
  }
  logger.info("[seedCphub] seeding missing CMS content");

  const now = new Date();

  // ── Site settings ──────────────────────────────────────────────────────────
  if (Number(settingsCount) === 0) {
  await db.insert(cphubSettingsTable).values([
    {
      key: "branding",
      value: {
        siteName: "Cloud Partner Hub",
        tagline: "DevOps. Cloud. Done Right.",
        logoText: "CloudPartnerHub",
        primaryColor: "#7c3aed",
        accentColor: "#06b6d4",
      },
    },
    {
      key: "contact",
      value: {
        email: "hello@cloudpartnerhub.com",
        phone: "+1 (555) 010-2030",
        address: "Remote-first · Global delivery",
        social: {
          linkedin: "https://linkedin.com/company/cloudpartnerhub",
          twitter: "https://twitter.com/cloudpartnerhub",
          github: "https://github.com/cloudpartnerhub",
        },
      },
    },
    {
      key: "navigation",
      value: {
        primary: [
          { label: "Services", href: "/services" },
          { label: "Case Studies", href: "/case-studies" },
          { label: "Blog", href: "/blog" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ],
      },
    },
  ]);
  }

  // ── Pages ──────────────────────────────────────────────────────────────────
  if (Number(pageCount) === 0) {
  await db.insert(cphubPagesTable).values([
    {
      slug: "home",
      title: "DevOps as a Service",
      subtitle: "Streamline workflows. Scale with confidence.",
      heroImage: null,
      sections: [
        {
          type: "hero",
          eyebrow: "Cloud Partner Hub",
          headline: "DevOps as a Service",
          sub: "Tie up your software development and IT operations with cloud-based DevOps automation to reach the ultimate performance and perfect in-house workflows.",
          ctaPrimary: { label: "Book a discovery call", href: "/contact" },
          ctaSecondary: { label: "See our work", href: "/case-studies" },
        },
        {
          type: "stats",
          headline: "Clients that Implement DevOps",
          items: [
            { value: "28%", label: "Significant workflow improvements" },
            { value: "24%", label: "Higher end-quality of products" },
            { value: "32%", label: "Reduced time-to-market" },
            { value: "4.9/5", label: "Average client rating" },
          ],
        },
        {
          type: "services",
          headline: "What we deliver",
          sub: "Engineering teams trust us to build, automate and operate their cloud platforms.",
          items: [
            { icon: "cloud", title: "Cloud Architecture", body: "AWS, GCP and Azure landing zones, well-architected by default, multi-account governance baked in." },
            { icon: "workflow", title: "CI/CD Pipelines", body: "Push-button deployments with GitHub Actions, GitLab CI, ArgoCD and Flux. Test, scan, ship — safely." },
            { icon: "container", title: "Kubernetes Platforms", body: "Production-grade EKS/GKE/AKS clusters with observability, GitOps and policy guardrails." },
            { icon: "lock", title: "Cloud Security", body: "IAM hardening, secrets management, CIS benchmarks, and continuous compliance scans." },
            { icon: "activity", title: "Observability", body: "End-to-end metrics, logs and traces with Prometheus, Grafana, Loki, Tempo or Datadog." },
            { icon: "zap", title: "SRE & On-call", body: "SLOs, error budgets, incident response and on-call rotations as a managed service." },
          ],
        },
        {
          type: "process",
          headline: "How we engage",
          items: [
            { step: "01", title: "Assess", body: "We audit your current platform, pipelines and cost posture in 2 weeks." },
            { step: "02", title: "Architect", body: "A pragmatic roadmap with measurable milestones — no boil-the-ocean rewrites." },
            { step: "03", title: "Implement", body: "Embedded engineers ship in your codebase, with your team in the loop." },
            { step: "04", title: "Operate", body: "Optional 24/7 SRE coverage with strict SLOs and transparent reporting." },
          ],
        },
        {
          type: "logos",
          headline: "Clients we've helped scale",
          items: ["MyMyCar", "Handy.ai", "Dinarys", "Northwind", "Acme Cloud", "Bridgewatt"],
        },
        {
          type: "cta",
          headline: "Ready to ship faster, safer?",
          sub: "Book a free 30-minute architecture review. No slides, just whiteboards.",
          cta: { label: "Schedule a call", href: "/contact" },
        },
      ],
      seoTitle: "DevOps as a Service · Cloud Partner Hub",
      seoDescription:
        "Cloud Partner Hub delivers DevOps, cloud architecture, CI/CD, Kubernetes and SRE as a managed service. Streamline workflows, ship faster, scale safely.",
      seoKeywords: "devops as a service, cloud consulting, kubernetes, sre, ci/cd, aws, gcp",
      status: "published",
      publishedAt: now,
    },
    {
      slug: "services",
      title: "Services",
      subtitle: "Everything your platform team wishes they had time to build.",
      sections: [
        {
          type: "hero",
          eyebrow: "Services",
          headline: "Cloud & DevOps, end to end",
          sub: "From the first commit to the 3am page. We design, build and operate the platform you need.",
        },
        {
          type: "services",
          headline: "Service offerings",
          items: [
            { icon: "cloud", title: "Cloud Foundations", body: "Greenfield AWS / GCP / Azure landing zones — multi-account, SSO, guardrails and FinOps from day one." },
            { icon: "workflow", title: "CI/CD Modernization", body: "Replace brittle bash with declarative pipelines. Trunk-based development, preview environments, progressive delivery." },
            { icon: "container", title: "Kubernetes Platform Engineering", body: "Opinionated K8s platforms: GitOps, service mesh, autoscaling, cost controls, multi-tenant namespaces." },
            { icon: "lock", title: "Security & Compliance", body: "SOC 2 / ISO 27001 readiness. IAM least-privilege, secrets, image scanning, policy-as-code." },
            { icon: "activity", title: "Observability & SRE", body: "SLOs you can actually defend, dashboards engineers actually use, runbooks that actually run." },
            { icon: "database", title: "Data Platform", body: "Managed Postgres, Kafka, ClickHouse. Backups that get restored. Pipelines that don't break silently." },
          ],
        },
        {
          type: "cta",
          headline: "Want a tailored proposal?",
          sub: "Tell us about your stack. We'll come back in 48h with a plan and a fixed-price option.",
          cta: { label: "Request a proposal", href: "/contact" },
        },
      ],
      seoTitle: "Services · Cloud Partner Hub",
      seoDescription: "Cloud foundations, CI/CD, Kubernetes, security, observability and SRE — delivered by senior DevOps engineers.",
      status: "published",
      publishedAt: now,
    },
    {
      slug: "case-studies",
      title: "Case Studies",
      subtitle: "Real teams. Real numbers. Real outcomes.",
      sections: [
        {
          type: "hero",
          eyebrow: "Case Studies",
          headline: "Outcomes, not slides",
          sub: "A selection of recent engagements. Names changed where we're under NDA.",
        },
        {
          type: "cases",
          items: [
            {
              client: "MyMyCar",
              industry: "Mobility · Series B",
              headline: "From 40-min deploys to 4 minutes",
              body: "Rebuilt CI/CD on GitHub Actions + ArgoCD. Cut release lead time by 90%, eliminated weekend deploys.",
              metrics: [
                { value: "10x", label: "Faster deploys" },
                { value: "−62%", label: "Failed releases" },
                { value: "2 wk", label: "To first cut" },
              ],
            },
            {
              client: "Handy.ai",
              industry: "AI SaaS · Seed",
              headline: "GPU Kubernetes at startup budget",
              body: "Designed a multi-region EKS platform with spot GPUs and Karpenter. Inference cost down 47% with better latency.",
              metrics: [
                { value: "−47%", label: "Infra cost" },
                { value: "p95 ↓ 38%", label: "Inference latency" },
                { value: "99.95%", label: "SLO met" },
              ],
            },
            {
              client: "Dinarys",
              industry: "Fintech · Scale-up",
              headline: "SOC 2 in 90 days, without panic",
              body: "Implemented policy-as-code, centralized logging, secrets rotation and an on-call program. Cleared audit on first attempt.",
              metrics: [
                { value: "90 d", label: "To audit-ready" },
                { value: "0", label: "Critical findings" },
                { value: "100%", label: "Coverage" },
              ],
            },
          ],
        },
      ],
      seoTitle: "Case Studies · Cloud Partner Hub",
      seoDescription: "How real teams shipped faster, cut cost and passed audits with Cloud Partner Hub.",
      status: "published",
      publishedAt: now,
    },
    {
      slug: "about",
      title: "About",
      subtitle: "Senior engineers, no junior bench.",
      sections: [
        {
          type: "hero",
          eyebrow: "About",
          headline: "We're a small team of senior platform engineers.",
          sub: "No offshore handoffs, no pyramid staffing. The engineer you meet is the engineer who ships.",
        },
        {
          type: "values",
          headline: "What we believe",
          items: [
            { title: "Pragmatic over perfect", body: "We ship the right thing now and the great thing next quarter." },
            { title: "Boring tech, where possible", body: "Postgres, Linux, Terraform, K8s. We pick boring on purpose." },
            { title: "Your team, smarter", body: "Every engagement leaves your team more capable than we found it." },
            { title: "Transparent pricing", body: "Fixed-price options, weekly reports, no surprises." },
          ],
        },
      ],
      seoTitle: "About · Cloud Partner Hub",
      seoDescription: "Senior platform engineers building cloud and DevOps platforms for ambitious teams.",
      status: "published",
      publishedAt: now,
    },
    {
      slug: "contact",
      title: "Contact",
      subtitle: "Tell us about your stack. We'll come back within one business day.",
      sections: [
        {
          type: "hero",
          eyebrow: "Contact",
          headline: "Let's talk.",
          sub: "Architecture review, fixed-price project or full SRE coverage — start with a conversation.",
        },
      ],
      seoTitle: "Contact · Cloud Partner Hub",
      seoDescription: "Talk to a senior DevOps engineer. We reply within one business day.",
      status: "published",
      publishedAt: now,
    },
  ]);
  }

  // ── Blog posts ─────────────────────────────────────────────────────────────
  if (Number(postCount) === 0) {
  await db.insert(cphubPostsTable).values([
    {
      slug: "the-platform-engineer-mindset",
      title: "The platform-engineer mindset (and why it changes everything)",
      excerpt:
        "Platform engineering isn't DevOps with a new hat. It's a product mindset applied to your internal developer experience.",
      body: `Platform engineering treats your developers as customers. That single shift in framing changes how you prioritise, measure and ship.

## Start with the developer's day

Map the path from "I have an idea" to "it's in production". Where are the cliffs? Where do people wait for someone else? That's your backlog.

## Pick your golden paths

You don't need infinite flexibility. You need two or three well-paved roads — service templates, deployment patterns, observability defaults — that 80% of teams happily ride on.

## Measure what matters

Lead time, deployment frequency, change-failure rate, MTTR. Boring DORA metrics, religiously tracked. They are the difference between "we feel faster" and "we *are* faster".

## Sell it internally

The best platform team is invisible because everyone uses it. Treat your platform like a product: changelogs, office hours, a real roadmap.`,
      coverImage: null,
      author: "Cloud Partner Hub",
      tags: ["platform-engineering", "devops", "culture"],
      status: "published",
      publishedAt: now,
    },
    {
      slug: "kubernetes-without-the-tears",
      title: "Kubernetes without the tears: a sane starter platform",
      excerpt:
        "You don't need a 12-person platform team to run Kubernetes well. Here's the minimum viable setup we ship to startups.",
      body: `Most teams adopt Kubernetes too early or too late. Here's the lean setup we ship when a team is ready.

- **Managed control plane.** EKS, GKE, AKS. Don't run your own.
- **GitOps from day one.** ArgoCD or Flux. Cluster state lives in git.
- **Autoscaling that pays for itself.** Karpenter or Cluster Autoscaler + spot.
- **Observability defaults.** Prometheus, Loki, Grafana with pre-built dashboards.
- **Policy as code.** Kyverno or OPA. Catch mistakes in PR, not at 3am.

Ship this and you'll handle 100x growth without rewriting.`,
      author: "Cloud Partner Hub",
      tags: ["kubernetes", "architecture"],
      status: "published",
      publishedAt: now,
    },
    {
      slug: "finops-cost-cutting",
      title: "Cloud cost-cutting that doesn't break things",
      excerpt:
        "The fastest way to cut cloud spend is to stop wasting it. Here's our checklist for a 30% reduction without touching architecture.",
      body: `Most cloud bills have 20–40% of waste hiding in plain sight. We start here:

1. **Right-size before reserving.** Reserved Instances on oversized workloads are still oversized workloads.
2. **Kill zombies.** Idle load balancers, unattached disks, old snapshots. They add up.
3. **Spot what you can.** Stateless workers, batch jobs, dev environments.
4. **Tier your storage.** S3 Intelligent-Tiering, lifecycle policies. Free money.
5. **Tag everything.** You can't cut what you can't see.

This list alone has saved clients an average of 31% in the first 60 days.`,
      author: "Cloud Partner Hub",
      tags: ["finops", "cost"],
      status: "published",
      publishedAt: now,
    },
  ]);
  }

  // ── Email templates ────────────────────────────────────────────────────────
  if (Number(tmplCount) === 0) {
  await db.insert(cphubEmailTemplatesTable).values([
    {
      slug: "lead-acknowledgement",
      name: "Lead acknowledgement",
      subject: "Thanks for reaching out to Cloud Partner Hub",
      bodyHtml: `<p>Hi {{name}},</p><p>Thanks for getting in touch. One of our engineers will reply within one business day.</p><p>In the meantime, you might enjoy our <a href="https://cloudpartnerhub.com/case-studies">case studies</a>.</p><p>— The Cloud Partner Hub team</p>`,
      bodyText: "Hi {{name}}, thanks for getting in touch. One of our engineers will reply within one business day.",
      description: "Auto-sent when a contact form is submitted.",
    },
    {
      slug: "newsletter-welcome",
      name: "Newsletter welcome",
      subject: "Welcome to the Cloud Partner Hub digest",
      bodyHtml: `<p>Welcome! You'll get one carefully-curated email a month with our newest case studies, engineering essays and free tools.</p><p>No fluff. Unsubscribe in one click.</p>`,
      description: "Sent when a visitor subscribes to the newsletter.",
    },
  ]);
  }

  logger.info("Seeded initial Cloud Partner Hub CMS content.");
}
