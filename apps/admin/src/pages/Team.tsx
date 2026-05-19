import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Page } from "@/lib/api";
import { Button, Card, Input, Textarea, PageHeader } from "@/components/ui";
import { Plus, Save, Trash2, GripVertical, Linkedin } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  location: string;
  linkedin: string;
  avatar?: string;
}

interface TeamSection {
  type: "team";
  headline?: string;
  sub?: string;
  items: TeamMember[];
}

function blankMember(): TeamMember {
  return { name: "", role: "", bio: "", location: "Remote 🌍", linkedin: "" };
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function Team() {
  const qc = useQueryClient();

  const { data: pages, isLoading } = useQuery({
    queryKey: ["pages"],
    queryFn: api.pages.list,
  });

  const aboutPage = pages?.find((p: Page) => p.slug === "about");

  const rawTeamSection = aboutPage
    ? (aboutPage.sections as unknown as TeamSection[]).find((s) => s.type === "team")
    : undefined;

  const [headline, setHeadline] = useState<string | undefined>(undefined);
  const [sub, setSub] = useState<string | undefined>(undefined);
  const [members, setMembers] = useState<TeamMember[] | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const effectiveHeadline = headline ?? rawTeamSection?.headline ?? "The team";
  const effectiveSub = sub ?? rawTeamSection?.sub ?? "";
  const effectiveMembers: TeamMember[] = members ?? rawTeamSection?.items ?? [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!aboutPage) throw new Error("About page not found");
      const sections = (aboutPage.sections as unknown as TeamSection[]).map((s) =>
        s.type === "team"
          ? { ...s, headline: effectiveHeadline, sub: effectiveSub, items: effectiveMembers }
          : s
      );
      if (!sections.find((s) => s.type === "team")) {
        sections.push({ type: "team", headline: effectiveHeadline, sub: effectiveSub, items: effectiveMembers });
      }
      return api.pages.update(aboutPage.id, { sections: sections as unknown as Page["sections"] });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setErr(null);
    },
    onError: (e) => setErr((e as Error).message),
  });

  function updateMember(i: number, field: keyof TeamMember, value: string) {
    setMembers((prev) => {
      const next = [...(prev ?? effectiveMembers)];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function addMember() {
    setMembers((prev) => [...(prev ?? effectiveMembers), blankMember()]);
  }

  function removeMember(i: number) {
    setMembers((prev) => {
      const next = [...(prev ?? effectiveMembers)];
      next.splice(i, 1);
      return next;
    });
  }

  function moveMember(from: number, to: number) {
    setMembers((prev) => {
      const next = [...(prev ?? effectiveMembers)];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Team" subtitle="Manage team members on the About page." />
        <div className="p-8 text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  if (!aboutPage) {
    return (
      <div>
        <PageHeader title="Team" subtitle="Manage team members on the About page." />
        <div className="p-8 text-sm text-red-500">About page not found. Create a page with slug "about" first.</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle="Manage the team section on the About page."
        actions={
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? "Saving…" : saved ? "Saved!" : "Save changes"}
          </Button>
        }
      />

      <div className="p-8 space-y-5">
        {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{err}</div>}

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Section header</h3>
          <Input
            label="Headline"
            value={effectiveHeadline}
            onChange={(e) => setHeadline(e.target.value)}
          />
          <Textarea
            label="Subheading"
            rows={2}
            value={effectiveSub}
            onChange={(e) => setSub(e.target.value)}
          />
        </Card>

        <div className="space-y-3">
          {effectiveMembers.map((m, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-1">
                  <button
                    className="text-slate-300 hover:text-slate-600 disabled:opacity-20"
                    disabled={i === 0}
                    onClick={() => moveMember(i, i - 1)}
                    title="Move up"
                  >
                    <GripVertical className="w-4 h-4 rotate-180" />
                  </button>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
                  >
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      getInitials(m.name)
                    )}
                  </div>
                  <button
                    className="text-slate-300 hover:text-slate-600 disabled:opacity-20"
                    disabled={i === effectiveMembers.length - 1}
                    onClick={() => moveMember(i, i + 1)}
                    title="Move down"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 grid md:grid-cols-2 gap-3">
                  <Input
                    label="Full name"
                    value={m.name}
                    onChange={(e) => updateMember(i, "name", e.target.value)}
                  />
                  <Input
                    label="Role / title"
                    value={m.role}
                    onChange={(e) => updateMember(i, "role", e.target.value)}
                  />
                  <div className="md:col-span-2">
                    <Textarea
                      label="Bio"
                      rows={3}
                      value={m.bio}
                      onChange={(e) => updateMember(i, "bio", e.target.value)}
                    />
                  </div>
                  <Input
                    label="Location"
                    value={m.location}
                    onChange={(e) => updateMember(i, "location", e.target.value)}
                  />
                  <div className="relative">
                    <Input
                      label="LinkedIn URL"
                      value={m.linkedin}
                      onChange={(e) => updateMember(i, "linkedin", e.target.value)}
                    />
                    {m.linkedin && (
                      <a
                        href={m.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-3 bottom-2.5 text-blue-600 hover:text-blue-800"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Avatar URL (optional — leave blank for initials)"
                      value={m.avatar ?? ""}
                      onChange={(e) => updateMember(i, "avatar", e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={() => removeMember(i)}
                  className="flex-shrink-0 p-1.5 text-slate-300 hover:text-red-500 transition"
                  title="Remove member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <Button variant="secondary" onClick={addMember}>
          <Plus className="w-4 h-4" /> Add team member
        </Button>
      </div>
    </div>
  );
}
