import { useEffect } from "react";

export const SITE_NAME = "Cloud Partner Hub";
export const DEFAULT_TITLE = `${SITE_NAME} · DevOps as a Service`;
export const DEFAULT_DESCRIPTION =
  "DevOps, cloud architecture, CI/CD, Kubernetes and SRE — delivered as a managed service by senior engineers.";

interface SeoMeta {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  twitterCard?: "summary" | "summary_large_image";
  jsonLd?: object;
  noindex?: boolean;
}

function setMeta(selector: string, attr: string, value: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    const [key, val] = attr.split("=");
    el.setAttribute(key, val ?? "");
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function removeLink(rel: string) {
  document.querySelector(`link[rel="${rel}"]`)?.remove();
}

function setJsonLd(id: string, data: object) {
  let el = document.querySelector(`script[data-seo="${id}"]`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("data-seo", id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  document.querySelector(`script[data-seo="${id}"]`)?.remove();
}

export function useSeoMeta(meta: SeoMeta) {
  useEffect(() => {
    const title = meta.title ?? DEFAULT_TITLE;
    const description = meta.description ?? DEFAULT_DESCRIPTION;
    const ogTitle = meta.ogTitle ?? title;
    const ogDescription = meta.ogDescription ?? description;
    const canonical = meta.canonical ?? window.location.href;
    const twitterCard = meta.twitterCard ?? (meta.ogImage ? "summary_large_image" : "summary");

    document.title = title;

    setMeta('meta[name="description"]', "name=description", description);
    setMeta('meta[name="robots"]', "name=robots", meta.noindex ? "noindex,nofollow" : "index,follow");

    setMeta('meta[property="og:title"]', "property=og:title", ogTitle);
    setMeta('meta[property="og:description"]', "property=og:description", ogDescription);
    setMeta('meta[property="og:type"]', "property=og:type", meta.ogType ?? "website");
    setMeta('meta[property="og:site_name"]', "property=og:site_name", SITE_NAME);
    setMeta('meta[property="og:url"]', "property=og:url", canonical);
    if (meta.ogImage) {
      setMeta('meta[property="og:image"]', "property=og:image", meta.ogImage);
    }

    setMeta('meta[name="twitter:card"]', "name=twitter:card", twitterCard);
    setMeta('meta[name="twitter:title"]', "name=twitter:title", ogTitle);
    setMeta('meta[name="twitter:description"]', "name=twitter:description", ogDescription);
    if (meta.ogImage) {
      setMeta('meta[name="twitter:image"]', "name=twitter:image", meta.ogImage);
    }

    setLink("canonical", canonical);

    if (meta.jsonLd) {
      setJsonLd("page", meta.jsonLd);
    } else {
      removeJsonLd("page");
    }
  });
}
