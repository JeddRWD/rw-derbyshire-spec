import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";

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
    const { data: devs } = await supabase.from("developers").select("*").order("name");
    const { data: sts } = await supabase.from("sites").select("*").order("name");
    const { data: cats } = await supabase.from("categories").select("*").order("name");
    const { data: spc } = await supabase.from("specs").select("*").order("title");

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
    <>
      <style jsx global>{`
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f4f6f8;
          color: #1f2937;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: #ffffff !important;
          }

          .print-card {
            box-shadow: none !important;
            border: 1px solid #d1d5db !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print-wrapper {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f4f6f8" }}>
        <header
          className="no-print"
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
            <Image
              src="/logo.jpg"
              alt="RW Derbyshire Electrical"
              width={180}
              height={60}
              style={{ height: "auto", width: "180px" }}
            />
            <div>
              <h1 style={{ margin: 0, fontSize: 28 }}>RWD Spec Hub</h1>
              <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 14 }}>
                Developer, site, and installation spec check
              </p>
            </div>
          </div>
        </header>

        <main
          className="print-wrapper"
          style={{ maxWidth: 1100, margin: "30px auto", padding: "0 20px" }}
        >
          <div
            className="no-print"
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
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
                <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
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

            {!selectedDeveloper && <p style={{ marginTop: 18, color: "#6b7280" }}>Please select a developer.</p>}
            {selectedDeveloper && !selectedSite && <p style={{ marginTop: 18, color: "#6b7280" }}>Please select a site.</p>}

            {selectedDeveloper && selectedSite && (
              <button
                onClick={() => window.print()}
                style={{
                  marginTop: 18,
                  padding: "12px 18px",
                  background: "#1f3b63",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Print Now
              </button>
            )}
          </div>

          {selectedDeveloper && selectedSite && (
            <div style={{ marginBottom: 20, padding: "0 4px" }}>
              <h2 style={{ marginBottom: 6, fontSize: 24 }}>Site Specification</h2>
              <p style={{ margin: 0, color: "#6b7280", fontSize: 15 }}>
                {developers.find((d) => String(d.id) === String(selectedDeveloper))?.name || ""} -{" "}
                {sites.find((s) => String(s.id) === String(selectedSite))?.name || ""}
              </p>
            </div>
          )}

          {selectedDeveloper && selectedSite && filteredSpecs.map((spec) => (
            <div
              key={spec.id}
              className="print-card"
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 24,
                marginBottom: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 6, fontSize: 22 }}>{spec.title}</h3>
              <p style={{ color: "#6b7280", marginTop: 0, marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
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
              className="print-card"
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <p style={{ margin: 0, color: "#6b7280" }}>No specs found for this site.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
