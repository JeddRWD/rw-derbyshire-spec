import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [developers, setDevelopers] = useState([]);
  const [sites, setSites] = useState([]);
  const [fireCollars, setFireCollars] = useState([]);

  const [fireCollarSiteId, setFireCollarSiteId] = useState("");
  const [fireCollarHouseType, setFireCollarHouseType] = useState("");
  const [fireCollarCount, setFireCollarCount] = useState("");

  const [editingFireCollarId, setEditingFireCollarId] = useState(null);
  const [showFireCollars, setShowFireCollars] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: developersData } = await supabase
      .from("developers")
      .select("*")
      .order("name");

    const { data: sitesData } = await supabase
      .from("sites")
      .select("*")
      .order("name");

    const { data: fireCollarData } = await supabase
      .from("fire_collar_requirements")
      .select("*")
      .order("house_type");

    setDevelopers(developersData || []);
    setSites(sitesData || []);
    setFireCollars(fireCollarData || []);
  };

  const saveFireCollar = async (e) => {
    e.preventDefault();

    if (!fireCollarSiteId || !fireCollarHouseType || fireCollarCount === "") {
      return alert("Please complete all fields.");
    }

    const selectedSite = sites.find(
      (site) => String(site.id) === String(fireCollarSiteId)
    );

    if (!selectedSite) {
      return alert("Selected site not found.");
    }

    const payload = {
      site_id: fireCollarSiteId,
      developer_id: selectedSite.developer_id,
      house_type: fireCollarHouseType.trim(),
      collar_count: Number(fireCollarCount),
    };

    let error;

    if (editingFireCollarId) {
      ({ error } = await supabase
        .from("fire_collar_requirements")
        .update(payload)
        .eq("id", editingFireCollarId));
    } else {
      ({ error } = await supabase
        .from("fire_collar_requirements")
        .insert([payload]));
    }

    if (error) {
      return alert(error.message);
    }

    resetFireCollarForm();
    loadData();
  };

  const editFireCollar = (item) => {
    setEditingFireCollarId(item.id);
    setFireCollarSiteId(item.site_id || "");
    setFireCollarHouseType(item.house_type || "");
    setFireCollarCount(item.collar_count || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteFireCollar = async (id) => {
    const confirmed = window.confirm(
      "Delete this fire collar requirement?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("fire_collar_requirements")
      .delete()
      .eq("id", id);

    if (error) {
      return alert(error.message);
    }

    loadData();
  };

  const resetFireCollarForm = () => {
    setEditingFireCollarId(null);
    setFireCollarSiteId("");
    setFireCollarHouseType("");
    setFireCollarCount("");
  };

  const getDeveloperName = (id) => {
    return developers.find((dev) => String(dev.id) === String(id))?.name || "-";
  };

  const getSiteName = (id) => {
    return sites.find((site) => String(site.id) === String(id))?.name || "-";
  };

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f4f6f8;
          color: #1f2937;
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
              maxWidth: 1200,
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ margin: 0 }}>Admin Panel</h1>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#6b7280",
                }}
              >
                Manage fire collar requirements
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/">
                <button style={buttonStyle}>
                  Spec Hub
                </button>
              </Link>

              <Link href="/fire-collars">
                <button style={buttonStyle}>
                  Fire Collar Schedule
                </button>
              </Link>
            </div>
          </div>
        </header>

        <main
          style={{
            maxWidth: 1200,
            margin: "30px auto",
            padding: "0 20px",
          }}
        >
          <form
            onSubmit={saveFireCollar}
            style={cardStyle}
          >
            <h2 style={{ marginTop: 0 }}>
              {editingFireCollarId
                ? "Edit Fire Collar Requirement"
                : "Add Fire Collar Requirement"}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
                gap: 15,
              }}
            >
              <select
                value={fireCollarSiteId}
                onChange={(e) => setFireCollarSiteId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Site</option>

                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} - {getDeveloperName(site.developer_id)}
                  </option>
                ))}
              </select>

              <input
                value={fireCollarHouseType}
                onChange={(e) =>
                  setFireCollarHouseType(e.target.value)
                }
                placeholder="House Type"
                style={inputStyle}
              />

              <input
                type="number"
                min="0"
                value={fireCollarCount}
                onChange={(e) =>
                  setFireCollarCount(e.target.value)
                }
                placeholder="Fire Collars Required"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
                flexWrap: "wrap",
              }}
            >
              <button type="submit" style={buttonStyle}>
                {editingFireCollarId
                  ? "Update Requirement"
                  : "Save Requirement"}
              </button>

              {editingFireCollarId && (
                <button
                  type="button"
                  onClick={resetFireCollarForm}
                  style={{
                    ...buttonStyle,
                    background: "#6b7280",
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div style={cardStyle}>
            <button
              type="button"
              onClick={() =>
                setShowFireCollars(!showFireCollars)
              }
              style={sectionToggleStyle}
            >
              <span>Fire Collar Requirements</span>

              <span>
                {showFireCollars ? "▲" : "▼"}
              </span>
            </button>

            {showFireCollars && (
              <div
                style={{
                  display: "grid",
                  gap: 15,
                  marginTop: 20,
                }}
              >
                {fireCollars.length === 0 ? (
                  <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                    }}
                  >
                    No fire collar requirements added yet.
                  </p>
                ) : (
                  fireCollars.map((item) => (
                    <div
                      key={item.id}
                      style={listItemStyle}
                    >
                      <div>
                        <h3
                          style={{
                            margin: "0 0 10px",
                          }}
                        >
                          {item.house_type}
                        </h3>

                        <div style={infoTextStyle}>
                          Developer:{" "}
                          {getDeveloperName(
                            item.developer_id
                          )}
                        </div>

                        <div style={infoTextStyle}>
                          Site:{" "}
                          {getSiteName(item.site_id)}
                        </div>

                        <div style={infoTextStyle}>
                          Fire Collars Required:{" "}
                          <strong>
                            {item.collar_count}
                          </strong>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            editFireCollar(item)
                          }
                          style={buttonStyle}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteFireCollar(item.id)
                          }
                          style={{
                            ...buttonStyle,
                            background: "#b91c1c",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

const cardStyle = {
  background: "#ffffff",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  padding: 25,
  marginBottom: 20,
};

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 14,
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "12px 18px",
  background: "#1f3b63",
  color: "#ffffff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const sectionToggleStyle = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontSize: 20,
  fontWeight: 700,
  color: "#1f2937",
};

const listItemStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
};

const infoTextStyle = {
  color: "#6b7280",
  marginTop: 5,
};
