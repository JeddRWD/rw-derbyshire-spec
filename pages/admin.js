import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [developers, setDevelopers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [developerName, setDeveloperName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteDeveloperId, setSiteDeveloperId] = useState("");

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

    setDevelopers(devs || []);
    setCategories(cats || []);
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
    alert("Site added");
  };

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
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
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

        <form onSubmit={addSite} style={cardStyle}>
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
