import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [developers, setDevelopers] = useState([]);
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [specs, setSpecs] = useState([]);

  const [developerName, setDeveloperName] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteDeveloperId, setSiteDeveloperId] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const [specTitle, setSpecTitle] = useState("");
  const [specBody, setSpecBody] = useState("");
  const [specSiteId, setSpecSiteId] = useState("");
  const [specCategoryId, setSpecCategoryId] = useState("");

  const [editingSpecId, setEditingSpecId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session]);

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

  const signIn = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const addDeveloper = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("developers").insert([{ name: developerName }]);
    if (error) return alert(error.message);
    setDeveloperName("");
    loadData();
  };

  const addSite = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("sites").insert([
      { name: siteName, developer_id: siteDeveloperId },
    ]);
    if (error) return alert(error.message);
    setSiteName("");
    setSiteDeveloperId("");
    loadData();
  };

  const addCategory = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("categories").insert([{ name: categoryName }]);
    if (error) return alert(error.message);
    setCategoryName("");
    loadData();
  };

  const saveSpec = async (e) => {
    e.preventDefault();

    const payload = {
      title: specTitle,
      body: specBody,
      site_id: specSiteId,
      category_id: specCategoryId,
      updated_at: new Date().toISOString().slice(0, 10),
    };

    let error;

    if (editingSpecId) {
      ({ error } = await supabase.from("specs").update(payload).eq("id", editingSpecId));
    } else {
      ({ error } = await supabase.from("specs").insert([payload]));
    }

    if (error) return alert(error.message);

    setEditingSpecId(null);
    setSpecTitle("");
    setSpecBody("");
    setSpecSiteId("");
    setSpecCategoryId("");
    loadData();
  };

  const editSpec = (spec) => {
    setEditingSpecId(spec.id);
    setSpecTitle(spec.title || "");
    setSpecBody(spec.body || "");
    setSpecSiteId(spec.site_id || "");
    setSpecCategoryId(spec.category_id || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSpec = async (id) => {
    if (!confirm("Delete this spec?")) return;
    const { error } = await supabase.from("specs").delete().eq("id", id);
    if (error) return alert(error.message);
    loadData();
  };

  const getSiteName = (id) => sites.find((s) => String(s.id) === String(id))?.name || "";
  const getCategoryName = (id) => categories.find((c) => String(c.id) === String(id))?.name || "";

  if (loading) return <div style={{ padding: 30 }}>Loading...</div>;

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f6f8" }}>
        <form
          onSubmit={signIn}
          style={{
            width: 360,
            background: "#fff",
            padding: 30,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Admin Login</h1>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #d1d5db" }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #d1d5db" }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              border: "none",
              borderRadius: 8,
              background: "#1f3b63",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f8", padding: 30 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>Admin Panel</h1>
          <button
            onClick={signOut}
            style={{
              padding: "10px 14px",
              border: "none",
              borderRadius: 8,
              background: "#1f3b63",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <form onSubmit={addDeveloper} style={cardStyle}>
            <h2>Add Developer</h2>
            <input value={developerName} onChange={(e) => setDeveloperName(e.target.value)} placeholder="Developer name" style={inputStyle} />
            <button type="submit" style={buttonStyle}>Save Developer</button>
          </form>

          <form onSubmit={addCategory} style={cardStyle}>
            <h2>Add Category</h2>
            <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category name" style={inputStyle} />
            <button type="submit" style={buttonStyle}>Save Category</button>
          </form>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, marginBottom: 24 }}>
          <form onSubmit={addSite} style={cardStyle}>
            <h2>Add Site</h2>
            <input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Site name" style={inputStyle} />
            <select value={siteDeveloperId} onChange={(e) => setSiteDeveloperId(e.target.value)} style={inputStyle}>
              <option value="">Select Developer</option>
              {developers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <button type="submit" style={buttonStyle}>Save Site</button>
          </form>
        </div>

        <form onSubmit={saveSpec} style={{ ...cardStyle, marginBottom: 24 }}>
          <h2>{editingSpecId ? "Edit Spec" : "Add Spec"}</h2>
          <input value={specTitle} onChange={(e) => setSpecTitle(e.target.value)} placeholder="Spec title" style={inputStyle} />
          <select value={specSiteId} onChange={(e) => setSpecSiteId(e.target.value)} style={inputStyle}>
            <option value="">Select Site</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select value={specCategoryId} onChange={(e) => setSpecCategoryId(e.target.value)} style={inputStyle}>
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <textarea
            value={specBody}
            onChange={(e) => setSpecBody(e.target.value)}
            placeholder="Spec details"
            rows={8}
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" style={buttonStyle}>{editingSpecId ? "Update Spec" : "Save Spec"}</button>
            {editingSpecId && (
              <button
                type="button"
                onClick={() => {
                  setEditingSpecId(null);
                  setSpecTitle("");
                  setSpecBody("");
                  setSpecSiteId("");
                  setSpecCategoryId("");
                }}
                style={{ ...buttonStyle, background: "#6b7280" }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div style={cardStyle}>
          <h2>Existing Specs</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {specs.map((spec) => (
              <div
                key={spec.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 16,
                  background: "#fff",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>{spec.title}</h3>
                <p style={{ margin: "0 0 6px", color: "#6b7280" }}>
                  <strong>Site:</strong> {getSiteName(spec.site_id)}
                </p>
                <p style={{ margin: "0 0 12px", color: "#6b7280" }}>
                  <strong>Category:</strong> {getCategoryName(spec.category_id)}
                </p>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Arial, sans-serif", margin: 0 }}>
                  {spec.body}
                </pre>
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button onClick={() => editSpec(spec)} style={buttonStyle}>Edit</button>
                  <button onClick={() => deleteSpec(spec.id)} style={{ ...buttonStyle, background: "#b91c1c" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const inputStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 14,
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "10px 14px",
  border: "none",
  borderRadius: 8,
  background: "#1f3b63",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};