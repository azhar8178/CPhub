import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { api, getToken } from "@/lib/api";
import Shell from "@/components/Shell";
import Login from "@/pages/Login";
import Overview from "@/pages/Overview";
import Pages from "@/pages/Pages";
import Posts from "@/pages/Posts";
import Leads from "@/pages/Leads";
import Subscribers from "@/pages/Subscribers";
import Templates from "@/pages/Templates";
import Campaigns from "@/pages/Campaigns";
import Media from "@/pages/Media";
import SettingsPage from "@/pages/Settings";
import Team from "@/pages/Team";

export default function App() {
  const [location] = useLocation();
  const [user, setUser] = useState<{ id: number; name: string; email: string; role: string } | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) { setChecked(true); return; }
    api.me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>;

  if (location === "/login" || !user) {
    return <Login />;
  }

  return (
    <Shell user={user}>
      <Switch>
        <Route path="/" component={Overview} />
        <Route path="/pages" component={Pages} />
        <Route path="/team" component={Team} />
        <Route path="/posts" component={Posts} />
        <Route path="/leads" component={Leads} />
        <Route path="/subscribers" component={Subscribers} />
        <Route path="/templates" component={Templates} />
        <Route path="/campaigns" component={Campaigns} />
        <Route path="/media" component={Media} />
        <Route path="/settings" component={SettingsPage} />
        <Route><div className="p-10 text-slate-500">Not found</div></Route>
      </Switch>
    </Shell>
  );
}
