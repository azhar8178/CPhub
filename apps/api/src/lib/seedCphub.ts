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
              client: "PulseStack",
              industry: "Restaurant Tech · Series C",
              headline: "From 3-hour deployment windows to 8 minutes — with zero downtime",
              challenge: "The engineering team was manually coordinating Friday-night deploys that regularly spilled past midnight. Twenty-three hotfixes shipped in a single quarter. A failed release in October 2023 took down ordering for 4,100 restaurant locations for 94 minutes during the dinner rush.",
              body: "We rebuilt the entire release pipeline on GitHub Actions with parallelised test suites cutting CI from 42 to 9 minutes. Blue-green deployments on ECS Fargate replaced the rolling restarts that caused downtime. LaunchDarkly feature flags decoupled deploys from releases so the team could ship daily and toggle features independently. Automated smoke tests and Datadog SLO dashboards gave the on-call rotation a live view of every release health check.",
              stack: ["AWS ECS Fargate", "GitHub Actions", "LaunchDarkly", "Terraform", "Datadog", "Blue-green deploys"],
              metrics: [
                { value: "8 min", label: "Deploy time (was 3 hr)" },
                { value: "23 → 1", label: "Hotfixes per quarter" },
                { value: "99.99%", label: "Uptime since go-live" },
                { value: "0", label: "Rollback incidents" },
              ],
            },
            {
              client: "Nexus Commerce",
              industry: "E-commerce · Scale-up",
              headline: "Survived a 40× traffic spike on Black Friday — on a smaller cluster than before",
              challenge: "Black Friday 2022 cost the company an estimated $2.1M in lost GMV when the Kubernetes cluster took 12 minutes to scale under load. HPA alone could not react fast enough to sudden viral product drops. The ops team was manually pre-scaling the night before every major sale event.",
              body: "We replaced HPA with KEDA event-driven autoscaling tied to real-time queue depth, bringing scale-out time from 12 minutes to 18 seconds. A scheduled pre-warm strategy automatically upsizes the cluster 30 minutes before known high-traffic windows. Cloudflare cache rules were tuned to serve product pages and inventory snapshots from the edge, cutting origin load by 73%. k6 load tests now run in CI on every deploy, and a Litmus chaos suite validates failover behaviour weekly.",
              stack: ["EKS", "KEDA", "Cloudflare", "k6", "Litmus", "Grafana", "Terraform"],
              metrics: [
                { value: "40×", label: "Peak traffic handled" },
                { value: "18 sec", label: "Scale-out time (was 12 min)" },
                { value: "−31%", label: "Infra cost vs prior peak" },
                { value: "0", label: "Downtime on Black Friday" },
              ],
            },
            {
              client: "CareCloud",
              industry: "HealthTech · Series B",
              headline: "SOC 2 Type II and HIPAA audit-ready in 11 weeks — cleared on first attempt",
              challenge: "An internal readiness review identified 17 critical compliance gaps three months before a major enterprise customer required SOC 2 Type II certification. Secrets were hardcoded in GitHub repos, service accounts were shared with no rotation policy, and there was no centralised audit trail. The manual access review process took three weeks each cycle.",
              body: "We deployed HashiCorp Vault with dynamic secrets for every service, eliminating all hardcoded credentials in 72 hours. OPA/Gatekeeper enforced policy-as-code at the Kubernetes admission layer — no workload could deploy without a compliant security context. Centralised SIEM via Wazuh gave auditors a tamper-proof log trail. Automated access reviews via Terraform reduced the 3-week process to a 2-hour weekly job. A scheduled external pen testing programme closed the remaining attack surface gaps before the audit window.",
              stack: ["HashiCorp Vault", "OPA / Gatekeeper", "Wazuh SIEM", "Terraform", "AWS CloudTrail", "GitHub Advanced Security"],
              metrics: [
                { value: "17 → 0", label: "Critical compliance gaps" },
                { value: "11 wk", label: "To audit-ready" },
                { value: "100%", label: "Automated policy enforcement" },
                { value: "2 hr", label: "Access review cycle (was 3 wk)" },
              ],
            },
            {
              client: "Handy.ai",
              industry: "AI SaaS · Seed",
              headline: "Cut GPU inference costs 47% while improving latency — at growing model scale",
              challenge: "Monthly GPU compute costs tripled in six months as model sizes grew. p95 inference latency sat at 4.2 seconds — above the threshold that enterprise prospects would accept. All compute ran on on-demand instances with no cost attribution per model, making it impossible to know which workloads were burning budget.",
              body: "We designed a multi-region EKS platform using Karpenter to manage spot GPU node pools with automatic on-demand fallback, achieving 80%+ spot utilisation without reliability risk. NVIDIA Triton Inference Server enabled model batching and INT8 quantisation, cutting per-request compute by 35%. Per-model Kubernetes namespaces with Prometheus cost labels gave the team real-time spend visibility. Dev environments were migrated to GPU time-sharing, eliminating idle full-GPU reservations overnight.",
              stack: ["EKS", "Karpenter", "NVIDIA Triton", "Prometheus", "Grafana", "Spot instances", "GPU time-sharing"],
              metrics: [
                { value: "−47%", label: "Monthly infra cost" },
                { value: "4.2s → 2.6s", label: "p95 inference latency" },
                { value: "99.95%", label: "SLO met" },
                { value: "80%+", label: "Spot GPU utilisation" },
              ],
            },
            {
              client: "StreamVault",
              industry: "Media Streaming · Growth",
              headline: "Slashed CDN spend by 58% and fixed APAC buffering in six weeks",
              challenge: "CDN costs exceeded $380k/month and were growing. The buffering ratio in APAC was 4.2% — nearly three times the industry benchmark. All traffic was routed purely by DNS with no latency awareness, origin had no shielding, and HLS manifests were regenerated on every viewer request regardless of content staleness.",
              body: "We built a multi-CDN orchestration layer with Cloudflare Workers routing each viewer to the lowest-latency provider in real time, with Fastly as a cost-optimised fallback for bulk traffic. Origin shielding reduced direct origin hits by 91%, and HLS manifest edge caching with 10-second TTLs eliminated the regeneration load entirely. Terraform-managed CDN rules allow the team to roll configuration changes in minutes. Real-time CDN cost allocation by region and content type gave finance the granularity they had been asking for.",
              stack: ["Cloudflare Workers", "Fastly", "AWS CloudFront", "Terraform", "Grafana", "HLS edge caching"],
              metrics: [
                { value: "−58%", label: "Monthly CDN spend" },
                { value: "0.6%", label: "Buffering ratio (was 4.2%)" },
                { value: "1.4s", label: "APAC p95 latency (was 8.1s)" },
                { value: "99.98%", label: "Global availability" },
              ],
            },
            {
              client: "Vaultline",
              industry: "B2B SaaS · Series A",
              headline: "Scaled from 150 to 1,200 tenants with zero noisy-neighbour incidents",
              challenge: "One hundred and fifty enterprise tenants shared a single Kubernetes cluster, causing 3-4 noisy-neighbour outages per month. Tenant onboarding was a two-day manual process involving six teams. There was no per-tenant resource quota or cost visibility, making pricing conversations with customers nearly impossible to back up with data.",
              body: "We designed a cell-based architecture with three cluster tiers — Standard, Business, and Enterprise — matched to tenant SLA requirements. Cilium enforced L7 network policies between namespace boundaries, eliminating the blast radius of any single tenant failure. GitOps-driven onboarding via ArgoCD ApplicationSets reduced provisioning to a 4-minute automated pipeline triggered by a single API call. Prometheus metrics labelled per tenant feed a Grafana dashboard that shows real-time CPU, memory, and egress costs per customer — directly usable by the sales team in renewal conversations.",
              stack: ["EKS", "ArgoCD", "Cilium", "Prometheus", "Grafana", "Crossplane", "Cell-based architecture"],
              metrics: [
                { value: "1,200", label: "Tenants (was 150)" },
                { value: "4 min", label: "Onboarding (was 2 days)" },
                { value: "45 → 3 min", label: "MTTR" },
                { value: "0", label: "Noisy-neighbour incidents" },
              ],
            },
          ],
        },
        {
          type: "cta",
          headline: "Want results like these?",
          sub: "Book a no-pressure discovery call. We will tell you honestly whether we are the right fit.",
          cta: { label: "Book a discovery call", href: "/contact" },
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
