import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
          }
        }
      `}</style>

      <div style={{ minHeight: "100vh" }}>
        {/* HEADER */}
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
            }}
          >
            {/* LEFT SIDE */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Image
                src="/logo.jpg"
                alt="RW Derbyshire Electrical"
                width={180}
                height={60}
              />

              <div>
                <h1 style={{ margin: 0 }}>RWD Spec Hub</h1>
                <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
                  Electrical installation specifications
                </p>
              </div>
            </div>

            {/* RIGHT SIDE */}
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

        {/* MAIN */}
        <main style={{ maxWidth: 1100, margin: "30px auto", padding: "0 20px" }}>
          {/* SELECT BOX */}
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

            <div style={{ display: "flex", gap: 10 }}>
              <select
                value={selectedDeveloper}
                onChange={(e) => handleDeveloperChange(e.target.value)}
                style={{ padding: 10, borderRadius: 6 }}
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
                style={{ padding: 10, borderRadius: 6 }}
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

          {/* TITLE */}
          {selectedDeveloper && selectedSite && (
            <div style={{ marginBottom: 20 }}>
              <h2>
                {
                  developers.find((d) => d.id == selectedDeveloper)?.name
                }{" "}
                - {sites.find((s) => s.id == selectedSite)?.name}
              </h2>
            </div>
          )}

          {/* SPECS */}
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
              <h3>{spec.title}</h3>
              <p style={{ color: "#6b7280" }}>
                {getCategory(spec.category_id)}
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>{spec.body}</p>
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
