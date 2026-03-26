import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

const supabase = createClient(
  "https://izqfymtwclluphioysbn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cWZ5bXR3Y2xsdXBoaW95c2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Mzg3NzQsImV4cCI6MjA5MDExNDc3NH0.C0MVZJL0PZckHIZPbe4OHLLpbwB-1TyL11oQvC98u6g"
);

export default function Home() {
  const [developers, setDevelopers] = useState([]);
  const [sites, setSites] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedDeveloper, setSelectedDeveloper] = useState("");
  const [selectedSite, setSelectedSite] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: devs } = await supabase.from("developers").select("*");
    const { data: sts } = await supabase.from("sites").select("*");
    const { data: cats } = await supabase.from("categories").select("*");
    const { data: spc } = await supabase.from("specs").select("*");

    setDevelopers(devs || []);
    setSites(sts || []);
    setCategories(cats || []);
    setSpecs(spc || []);
  };

  const handleDeveloperChange = (developerId) => {
    setSelectedDeveloper(developerId);
    setSelectedSite("");
  };

  const filteredSites = selectedDeveloper
    ? sites.filter((site) => String(site.developer_id) === String(selectedDeveloper))
    : [];

  const filteredSpecs =
    selectedDeveloper && selectedSite
      ? specs.filter((spec) => String(spec.site_id) === String(selectedSite))
      : [];

  const getCategory = (id) =>
    categories.find((c) => String(c.id) === String(id))?.name || "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
      }}
    >
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "20px 30px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Image
              src="/logo.jpg"
              alt="RW Derbyshire Electrical"
              width={180}
              height={60}
              style={{ height: "auto", width: "180px" }}
            />
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>RW Derbyshire Spec Hub</h1>
            <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 14 }}>
              Developer, site, and installation specification reference
            </p>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "30px auto", padding: "0 20px" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            marginBottom: 24,
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>
            Select Developer and Site
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Developer
              </label>
              <select
                value={selectedDeveloper}
                onChange={(e) => handleDeveloperChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  fontSize: 15,
                }}
              >
                <option value="">Select Developer</option>
                {developers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Site
              </label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                disabled={!selectedDeveloper}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  fontSize: 15,
                }}
              >
                <option value="">Select Site</option>
                {filteredSites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!selectedDeveloper && (
            <p style={{ marginTop: 18, color: "#6b7280" }}>
              Please select a developer.
            </p>
          )}

          {selectedDeveloper && !selectedSite && (
            <p style={{ marginTop: 18, color: "#6b7280" }}>
              Please select a site.
            </p>
          )}
        </div>

        <div>
          {selectedDeveloper &&
            selectedSite &&
            filteredSpecs.map((spec) => (
              <div
                key={spec.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 20,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 6, fontSize: 22 }}>
                  {spec.title}
                </h3>
                <p
                  style={{
                    color: "#6b7280",
                    marginTop: 0,
                    marginBottom: 16,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {getCategory(spec.category_id)}
                </p>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "Arial, sans-serif",
                    margin: 0,
                    lineHeight: 1.6,
                    fontSize: 15,
                  }}
                >
                  {spec.body}
                </pre>
              </div>
            ))}

          {selectedDeveloper && selectedSite && filteredSpecs.length === 0 && (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <p style={{ margin: 0, color: "#6b7280" }}>
                No specs found for this site.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
