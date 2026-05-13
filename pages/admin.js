import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [developers, setDevelopers] = useState([]);
  const [sites, setSites] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [fireCollars, setFireCollars] = useState([]);

  const [developerName, setDeveloperName] = useState("");
  const [siteName, setSiteName] = useState("");

  const [selectedDeveloperId, setSelectedDeveloperId] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState("");

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingSpecId, setEditingSpecId] = useState(null);

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

    const { data: specsData } = await supabase
      .from("specs")
      .select("*")
      .order("category");

    const { data: fireCollarData } = await supabase
      .from("fire_collar_requirements")
      .select("*")
      .order("house_type");

    setDevelopers(developersData || []);
    setSites(sitesData || []);
    setSpecs(specsData || []);
    setFireCollars(fireCollarData || []);
  };

  const addDeveloper = async (e) => {
    e.preventDefault();

    if (!developerName) {
      return alert("Please enter a developer name.");
    }

    const { error } = await supabase
      .from("developers")
      .insert([{ name: developerName }]);

    if (error) {
      return alert(error.message);
    }

    setDeveloperName("");
    loadData();
  };

  const addSite = async (e) => {
    e.preventDefault();

    if (!siteName || !selectedDeveloperId) {
      return alert("Please select a developer and enter site name.");
    }

    const { error } = await supabase
      .from("sites")
      .insert([
        {
          name: siteName,
          developer_id: selectedDeveloperId,
        },
      ]);

    if (error) {
      return alert(error.message);
    }

    setSiteName("");
    loadData();
  };

  const saveSpec = async (e) => {
    e.preventDefault();

    if (
      !selectedDeveloperId ||
      !selectedSiteId ||
      !category ||
      !title ||
      !content
    ) {
      return alert("Please complete all fields.");
    }

    const payload = {
      developer_id: selectedDeveloperId,
      site_id: selectedSiteId,
      category,
      title,
      content,
    };

    let error;

    if (editingSpecId) {
      ({ error } = await supabase
        .from("specs")
        .update(payload)
        .eq("id", editingSpecId));
    } else {
      ({ error } = await supabase
        .from("specs")
        .insert([payload]));
    }

    if (error) {
      return alert(error.message);
    }

    resetSpecForm();
    loadData();
  };
    const editSpec = (spec) => {
    setEditingSpecId(spec.id);
    setSelectedDeveloperId(spec.developer_id || "");
    setSelectedSiteId(spec.site_id || "");
    setCategory(spec.category || "");
    setTitle(spec.title || "");
    setContent(spec.content || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteSpec = async (id) => {
    const confirmed = window.confirm("Delete this specification?");

    if (!confirmed) return;

    const { error } = await supabase
      .from("specs")
      .delete()
      .eq("id", id);

    if (error) {
      return alert(error.message);
    }

    loadData();
  };

  const resetSpecForm = () => {
    setEditingSpecId(null);
    setCategory("");
    setTitle("");
    setContent("");
  };

  const saveFireCollar = async (e) => {
    e.preventDefault();

    if (
      !fireCollarSiteId ||
      !fireCollarHouseType ||
      fireCollarCount === ""
    ) {
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
    return developers.find(
      (developer) => String(developer.id) === String(id)
    )?.name || "-";
  };

  const getSiteName = (id) => {
    return sites.find(
      (site) => String(site.id) === String(id)
    )?.name || "-";
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
              flexWrap: "wrap",
              gap: 20,
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
                Manage developers, sites, specs and fire collars
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
          <div style={gridTwoColumnStyle}>
            <form onSubmit={addDeveloper} style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Add Developer</h2>

              <input
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
                placeholder="Developer name"
                style={inputStyle}
              />

              <button
                type="submit"
                style={{ ...buttonStyle, marginTop: 15 }}
              >
                Add Developer
              </button>
            </form>

            <form onSubmit={addSite} style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Add Site</h2>

              <select
                value={selectedDeveloperId}
                onChange={(e) => setSelectedDeveloperId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Developer</option>

                {developers.map((developer) => (
                  <option key={developer.id} value={developer.id}>
                    {developer.name}
                  </option>
                ))}
              </select>

              <input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Site name"
                style={{ ...inputStyle, marginTop: 10 }}
              />

              <button
                type="submit"
                style={{ ...buttonStyle, marginTop: 15 }}
              >
                Add Site
              </button>
            </form>
          </div>

          <form onSubmit={saveFireCollar} style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>
              {editingFireCollarId
                ? "Edit Fire Collar Requirement"
                : "Add Fire Collar Requirement"}
            </h2>

            <div style={formGridStyle}>
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
                onChange={(e) => setFireCollarHouseType(e.target.value)}
                placeholder="House Type"
                style={inputStyle}
              />

              <input
                type="number"
                min="0"
                value={fireCollarCount}
                onChange={(e) => setFireCollarCount(e.target.value)}
                placeholder="Fire Collars Required"
                style={inputStyle}
              />
            </div>

            <div style={buttonRowStyle}>
              <button type="submit" style={buttonStyle}>
                {editingFireCollarId
                  ? "Update Requirement"
                  : "Save Requirement"}
              </button>

              {editingFireCollarId && (
                <button
                  type="button"
                  onClick={resetFireCollarForm}
                  style={{ ...buttonStyle, background: "#6b7280" }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div style={cardStyle}>
            <button
              type="button"
              onClick={() => setShowFireCollars(!showFireCollars)}
              style={sectionToggleStyle}
            >
              <span>Fire Collar Requirements</span>
              <span>{showFireCollars ? "▲" : "▼"}</span>
            </button>

            {showFireCollars && (
              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                {fireCollars.length === 0 ? (
                  <p style={{ margin: 0, color: "#6b7280" }}>
                    No fire collar requirements added yet.
                  </p>
                ) : (
                  fireCollars.map((item) => (
                    <div key={item.id} style={listItemStyle}>
                      <div>
                        <strong>{item.house_type}</strong>

                        <div style={infoTextStyle}>
                          Developer: {getDeveloperName(item.developer_id)}
                        </div>

                        <div style={infoTextStyle}>
                          Site: {getSiteName(item.site_id)}
                        </div>

                        <div style={infoTextStyle}>
                          Fire Collars Required:{" "}
                          <strong>{item.collar_count}</strong>
                        </div>
                      </div>

                      <div style={buttonRowStyle}>
                        <button
                          type="button"
                          onClick={() => editFireCollar(item)}
                          style={buttonStyle}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteFireCollar(item.id)}
                          style={{ ...buttonStyle, background: "#b91c1c" }}
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

          <form onSubmit={saveSpec} style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>
              {editingSpecId ? "Edit Specification" : "Add Specification"}
            </h2>

            <div style={formGridStyle}>
              <select
                value={selectedDeveloperId}
                onChange={(e) => {
                  setSelectedDeveloperId(e.target.value);
                  setSelectedSiteId("");
                }}
                style={inputStyle}
              >
                <option value="">Select Developer</option>

                {developers.map((developer) => (
                  <option key={developer.id} value={developer.id}>
                    {developer.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Site</option>

                {sites
                  .filter(
                    (site) =>
                      !selectedDeveloperId ||
                      String(site.developer_id) === String(selectedDeveloperId)
                  )
                  .map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
              </select>

              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                style={inputStyle}
              />

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                style={inputStyle}
              />
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Specification content"
              rows={8}
              style={{
                ...inputStyle,
                marginTop: 15,
                resize: "vertical",
                fontFamily: "Arial, sans-serif",
              }}
            />

            <div style={buttonRowStyle}>
              <button type="submit" style={buttonStyle}>
                {editingSpecId ? "Update Specification" : "Save Specification"}
              </button>

              {editingSpecId && (
                <button
                  type="button"
                  onClick={resetSpecForm}
                  style={{ ...buttonStyle, background: "#6b7280" }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Specifications</h2>

            {specs.length === 0 ? (
              <p style={{ color: "#6b7280" }}>
                No specifications added yet.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {specs.map((spec) => (
                  <div key={spec.id} style={listItemStyle}>
                    <div>
                      <strong>{spec.title}</strong>

                      <div style={infoTextStyle}>
                        Developer: {getDeveloperName(spec.developer_id)}
                      </div>

                      <div style={infoTextStyle}>
                        Site: {getSiteName(spec.site_id)}
                      </div>

                      <div style={infoTextStyle}>
                        Category: {spec.category}
                      </div>
                    </div>

                    <div style={buttonRowStyle}>
                      <button
                        type="button"
                        onClick={() => editSpec(spec)}
                        style={buttonStyle}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteSpec(spec.id)}
                        style={{ ...buttonStyle, background: "#b91c1c" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
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

const gridTwoColumnStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
  marginBottom: 20,
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 15,
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

const buttonRowStyle = {
  display: "flex",
  gap: 10,
  marginTop: 15,
  flexWrap: "wrap",
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
