import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [developers, setDevelopers] = useState([]);
  const [sites, setSites] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [specImages, setSpecImages] = useState([]);

  const [selectedDeveloper, setSelectedDeveloper] = useState("");
  const [selectedSite, setSelectedSite] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: devs } = await supabase
      .from("developers")
      .select("*")
      .order("name");

    const { data: sts } = await supabase
      .from("sites")
      .select("*")
      .order("name");

    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    const { data: spc } = await supabase
      .from("specs")
      .select("*")
      .order("title");

    const { data: imgs } = await supabase
      .from("spec_images")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    setDevelopers(devs || []);
    setSites(sts || []);
    setCategories(cats || []);
    setSpecs(spc || []);
    setSpecImages(imgs || []);
  };

  const handleDeveloperChange = (developerId) => {
    setSelectedDeveloper(developerId);
    setSelectedSite("");
  };

  const filteredSites = selectedDeveloper
    ? sites.filter(
        (site) => String(site.developer_id) === String(selectedDeveloper)
      )
    : [];

  const filteredSpecs =
    selectedDeveloper && selectedSite
      ? specs.filter((spec) => String(spec.site_id) === String(selectedSite))
      : [];

  const getCategory = (id) =>
    categories.find((c) => String(c.id) === String(id))?.name || "";

  const getImagesForSpec = (specId) =>
    specImages.filter((image) => String(image.spec_id) === String(specId));

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f4f6f8;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .print-card {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div style={{ minHeight: "100vh" }}>
        <header
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            padding: "20px 30px",
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Image
                src="/logo.jpg"
                alt="RW Derbyshire Electrical"
                width={180}
                height={60}
              />

              <div>
                <h1 style={{ margin: 0 }}>RW Derbyshire Spec Hub</h1>
                <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
                  Electrical installation specifications
                </p>
              </div>
            </div>

            <Link href="/admin">
              <button
                className="no-print"
                style={{
                  padding: "10px 16px",
                  background: "#1f3b63",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Admin Login
              </button>
            </Link>
          </div>
        </header>

        <main style={{ maxWidth: 1100, margin: "30px auto", padding: "0 20px" }}>
          <div
            className="no-print"
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              marginBottom: 20,
            }}
          >
            <h2>Select Developer and Site</h2>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <select
                value={selectedDeveloper}
                onChange={(e) => handleDeveloperChange(e.target.value)}
                style={{ padding: 10, borderRadius: 6, minWidth: 220 }}
              >
                <option value="">Select Developer</option>
                {developers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                disabled={!selectedDeveloper}
                style={{ padding: 10, borderRadius: 6, minWidth: 220 }}
              >
                <option value="">Select Site</option>
                {filteredSites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedDeveloper && selectedSite && (
              <button
                onClick={() => window.print()}
                style={{
                  marginTop: 15,
                  padding: "10px 16px",
                  background: "#1f3b63",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Print Now
              </button>
            )}
          </div>

          {selectedDeveloper && selectedSite && (
            <div style={{ marginBottom: 20 }}>
              <h2>
                {developers.find((d) => String(d.id) === String(selectedDeveloper))
                  ?.name || ""}
                {" - "}
                {sites.find((s) => String(s.id) === String(selectedSite))?.name ||
                  ""}
              </h2>
            </div>
          )}

          {filteredSpecs.map((spec) => (
            <div
              key={spec.id}
              className="print-card"
              style={{
                background: "#fff",
                padding: 20,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                marginBottom: 15,
              }}
            >
              <h3 style={{ marginTop: 0 }}>{spec.title}</h3>
              <p style={{ color: "#6b7280", marginTop: 0 }}>
                {getCategory(spec.category_id)}
              </p>

              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {spec.body}
              </p>

              {getImagesForSpec(spec.id).length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {getImagesForSpec(spec.id).map((image) => (
                      <div key={image.id}>
                        <img
  src={image.image_url}
  alt={image.caption || spec.title}
  style={{
    width: "100%",
    height: 180,
    objectFit: "cover",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    display: "block",
  }}
/>
                        {image.caption && (
                          <p
                            style={{
                              marginTop: 8,
                              color: "#6b7280",
                              fontSize: 14,
                            }}
                          >
                            {image.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {selectedDeveloper &&
            selectedSite &&
            filteredSpecs.length === 0 && <p>No specs found.</p>}
        </main>
      </div>
    </>
  );
}
