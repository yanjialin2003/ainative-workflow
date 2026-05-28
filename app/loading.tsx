import { SiteShell } from "@/app/components/site-shell";

export default function Loading() {
  return (
    <SiteShell>
      <section className="hero">
        <div className="hero-card hero-copy">
          <div className="skeleton-line" style={{ width: "30%" }} />
          <div className="skeleton-line" style={{ width: "70%", height: 64, marginTop: 16 }} />
          <div className="skeleton-line" style={{ width: "90%", marginTop: 16 }} />
          <div className="skeleton-line" style={{ width: "72%", marginTop: 12 }} />
        </div>
        <div className="hero-card hero-aside">
          <div className="skeleton-line" style={{ width: "55%" }} />
          <div className="skeleton-line" style={{ width: "100%" }} />
          <div className="skeleton-line" style={{ width: "84%" }} />
        </div>
      </section>
      <section className="section">
        <div className="skeleton-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </section>
    </SiteShell>
  );
}
