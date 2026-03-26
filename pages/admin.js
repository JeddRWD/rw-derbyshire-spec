import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [developers, setDevelopers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sites, setSites] = useState([]);
  const [specs, setSpecs] = useState([]);

  const [developerName, setDeveloperName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteDeveloperId, setSiteDeveloperId] = useState("");

  const [specTitle, setSpecTitle] = useState("");
  const [specBody, setSpecBody] = useState("");
  const [specSiteId, setSpecSiteId] = useState("");
  const [specCategoryId, setSpecCategoryId] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error) setSession(data.session);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    const { data: devs } = await supabase
      .from("developers")
      .select("*")
      .order("name");

    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    const { data: sts } = await supabase
      .from("sites")
      .select("*")
      .order("name");

    const { data: spc } = await supabase
      .from("specs")
      .select("*")
      .order("title");

    setDevelopers(devs || []);
    setCategories(cats || []);
    setSites(sts || []);
    setSpecs(spc || []);
  };

  const signIn = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const addDeveloper = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("developers")
      .insert([{ name: developerName }]);

    if (error) {
      alert(error.message);
      return;
    }

    setDeveloperName("");
    loadData();
  };

  const addCategory = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("categories")
      .insert([{ name: categoryName }]);

    if (error) {
      alert(error.message);
      return;
    }

    setCategoryName("");
    loadData();
  };

  const addSite = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("sites").insert([
      {
        name: siteName,
        developer_id: siteDeveloperId,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setSiteName("");
    setSiteDeveloperId("");
    loadData();
  };

  const addSpec = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("specs").insert([
      {
        title: specTitle,
        body: specBody,
        site_id: specSiteId,
        category_id: specCategoryId,
        updated_at: new Date().toISOString().slice(0, 10),
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setSpecTitle("");
    setSpecBody("");
    setSpecSiteId("");
    setSpecCategoryId("");
    loadData();
  };

  const getSiteName = (id) =>
    sites.find((site) => String(site.id) === String(id))?.name || "";

  const getCategoryName = (id) =>
    categories.find((category) => String(category.id) === String(id))?.name || "";

  if (!session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f4f6f8",
        }}
      >
        <form
          onSubmit={signIn}
          style={{
            width: 360,
            background: "#fff",
            padding: 30,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Admin Login</h1>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            style={{ width: "100%", padding: 12, marginBottom: 12 }}
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            style={{ width: "100%", padding: 12, marginBottom: 12 }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              border: "none",
              background: "#1f3b63",
              color: "#fff",
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
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          <form onSubmit={addDeveloper} style={cardStyle}>
            <h2>Add Developer</h2>
            <input
              value={developerName}
              onChange={(e) => setDeveloperName(e.target.value)}
              placeholder="Developer name"
              style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>
              Save Developer
            </button>
          </form>

          <form onSubmit={addCategory} style={cardStyle}>
            <h2>Add Category</h2>
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category name"
              style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>
              Save Category
            </button>
          </form>
        </div>

        <form onSubmit={addSite} style={{ ...cardStyle, marginBottom: 20 }}>
          <h2>Add Site</h2>
          <input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Site name"
            style={inputStyle}
          />

          <select
            value={siteDeveloperId}
            onChange={(e) => setSiteDeveloperId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select Developer</option>
            {developers.map((developer) => (
              <option key={developer.id} value={developer.id}>
                {developer.name}
              </option>
            ))}
          </select>

          <button type="submit" style={buttonStyle}>
            Save Site
          </button>
        </form>

        <form onSubmit={addSpec} style={{ ...cardStyle, marginBottom: 20 }}>
          <h2>Add Spec</h2>

          <input
            value={specTitle}
            onChange={(e) => setSpecTitle(e.target.value)}
            placeholder="Spec title"
            style={inputStyle}
          />

          <select
            value={specSiteId}
            onChange={(e) => setSpecSiteId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select Site</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>

          <select
            value={specCategoryId}
            onChange={(e) => setSpecCategoryId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <textarea
            value={specBody}
            onChange={(e) => setSpecBody(e.target.value)}
            placeholder="Spec details"
            rows={8}
            style={{ ...inputStyle, resize: "vertical" }}
          />

          <button type="submit" style={buttonStyle}>
            Save Spec
          </button>
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
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "Arial, sans-serif",
                    margin: 0,
                  }}
                >
                  {spec.body}
                </pre>
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
