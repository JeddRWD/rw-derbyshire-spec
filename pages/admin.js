import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <div style={{ padding: 40 }}>
      <h1>Admin Panel</h1>
      <p>You are signed in.</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
