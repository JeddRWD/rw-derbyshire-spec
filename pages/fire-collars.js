import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function FireCollarsPage() {
  const [developers, setDevelopers] = useState([]);
  const [sites, setSites] = useState([]);
  const [fireCollars, setFireCollars] = useState([]);

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

    const { data: collars } = await supabase
      .from("fire_collar_requirements")
      .select("*")
      .order("house_type");

    setDevelopers(devs || []);
    setSites(sts || []);
    setFireCollars(collars || []);
  };

  const handleDeveloperChange = (developerId) => {
    setSelectedDeveloper(developerId);
    setSelectedSite("");
  };

  const filteredSites = selectedDeveloper
    ? sites.filter((site) => String(site.developer_id) === String(selectedDeveloper))
    : [];

  const filteredFireCollars = useMemo(() => {
    if (!selectedDeveloper || !selectedSite) return [];

    return fireCollars
      .filter((item) => String(item.site_id) === String(selectedSite))
      .sort((a, b) => (a.house_type || "").localeCompare(b.house_type || ""));
  }, [selectedDeveloper, selectedSite, fireCollars]);

  const totalCollars = filteredFireCollars.reduce(
    (total, item) => total + Number(item.collar_count || 0),
    0
  );

  const selectedDeveloperName =
    developers.find((d) => String(d.id) === String(selectedDeveloper))?.name || "";

  const selectedSiteName =
    sites.find((s) => String(s.id) === String(selectedSite))?.name || "";

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
                width={250}
                height={150}
              />

              <div>
                <h1 style={{ margin: 0 }}>Fire Collar Schedule</h1>
                <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
                  Property fire collar requirements
                </p>
              </div>
            </div>

            <div className="no-print" style={{ display: "flex", gap: 10 }}>
              <Link href="/">
                <button style={buttonStyle}>Spec Hub</button>
              </Link>

              <Link href="/admin">
                <button style={buttonStyle}>Admin Login</button>
              </Link>
            </div>
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
                style={selectStyle}
              >
                <option value="">Select Developer</option>
                {developers.map((developer) => (
                  <option key={developer.id} value={developer.id}>
                    {developer.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                disabled={!selectedDeveloper}
                style={selectStyle}
              >
                <option value="">Select Site</option>
                {filteredSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedDeveloper && selectedSite && (
              <button onClick={() => window.print()} style={{ ...buttonStyle, marginTop: 15 }}>
                Print Now
              </button>
            )}
          </div>

          {!selectedDeveloper || !selectedSite ? (
            <div style={emptyCardStyle}>
              <h2 style={{ marginTop: 0 }}>No Site Selected</h2>
              <p style={{ marginBottom: 0, color: "#6b7280" }}>
                Please select both a developer and site to view fire collar requirements.
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <h2>
                  {selectedDeveloperName} - {selectedSiteName}
                </h2>
              </div>

              <div
                className="print-card"
                style={{
                  background: "#fff",
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  marginBottom: 20,
                }}
              >
                <h2 style={{ marginTop: 0 }}>Total Fire Collars Required</h2>
                <p
                  style={{
                    fontSize: 46,
                    fontWeight: 700,
                    color: "#1f3b63",
                    margin: 0,
                  }}
                >
                  {totalCollars}
                </p>
              </div>

              {filteredFireCollars.length === 0 ? (
                <p>No fire collar requirements found for this site.</p>
              ) : (
                <div
                  className="print-card"
                  style={{
                    background: "#fff",
                    padding: 20,
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <h2 style={{ marginTop: 0 }}>House Type Requirements</h2>

                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #1f3b63" }}>
                        <th style={thStyle}>House Type</th>
                        <th style={thStyle}>Fire Collars Required</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredFireCollars.map((item) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td style={tdStyle}>
                            <strong>{item.house_type}</strong>
                          </td>
                          <td style={tdStyle}>{item.collar_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

const buttonStyle = {
  padding: "10px 16px",
  background: "#1f3b63",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const selectStyle = {
  padding: 10,
  borderRadius: 6,
  minWidth: 220,
  border: "1px solid #d1d5db",
};

const emptyCardStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
};

const thStyle = {
  textAlign: "left",
  padding: "12px 8px",
};

const tdStyle = {
  padding: "14px 8px",
};
