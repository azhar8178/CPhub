import { Switch, Route } from "wouter";
import Layout from "@/components/Layout";
import PageView from "@/pages/PageView";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={() => <PageView slug="home" />} />
        <Route path="/services" component={() => <PageView slug="services" />} />
        <Route path="/case-studies" component={() => <PageView slug="case-studies" />} />
        <Route path="/about" component={() => <PageView slug="about" />} />
        <Route path="/contact" component={Contact} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug">{(p) => <BlogPost slug={p.slug} />}</Route>
        <Route path="/p/:slug">{(p) => <PageView slug={p.slug} />}</Route>
        <Route>
          <div className="max-w-3xl mx-auto px-6 py-32 text-center">
            <h1 className="text-5xl font-black glow-text mb-4">404</h1>
            <p className="text-slate-400">That page got autoscaled to zero.</p>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}
