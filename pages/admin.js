import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [session, setSession] = useState(null);

  const [sites, setSites] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [specImages, setSpecImages] = useState([]);

  const [copyFromSiteId, setCopyFromSiteId] = useState("");
  const [copyToSiteId, setCopyToSiteId] = useState("");

  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    loadSession();
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session]);

  const loadData = async () => {
    const { data: sts } = await supabase.from("sites").select("*").order("name");
    const { data: spc } = await supabase.from("specs").select("*");
    const { data: imgs } = await supabase.from("spec_images").select("*");

    setSites(sts || []);
    setSpecs(spc || []);
    setSpecImages(imgs || []);
  };

  const duplicateSiteSpecs = async (e) => {
    e.preventDefault();

    if (!copyFromSiteId || !copyToSiteId) {
      return alert("Select both sites");
    }

    const specsToCopy = specs.filter(
      (s) => String(s.site_id) === String(copyFromSiteId)
    );

    if (specsToCopy.length === 0) {
      return alert("No specs found on source site");
    }

    const rows = specsToCopy.map((spec) => ({
      title: spec.title,
      body: spec.body,
      site_id: copyToSiteId,
      category_id: spec.category_id,
      created_by_email: session.user.email,
      updated_by_email: session.user.email,
      updated_at: new Date().toISOString().slice(0, 10),
    }));

    const { error } = await supabase.from("specs").insert(rows);

    if (error) return alert(error.message);

    alert("Site duplicated successfully");
    loadData();
  };

  const getImagesForSpec = (specId) =>
    specImages.filter((img) => String(img.spec_id) === String(specId));

  if (!session) return <div style={{ padding: 40 }}>Login required</div>;

  return (
    <div style={{ padding: 30, background: "#f4f6f8", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>Admin Panel</h1>

          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/">
              <button style={buttonStyleGreen}>
                Return To Spec Hub
              </button>
            </Link>
          </div>
        </div>

        {/* SITE DUPLICATION */}
        <div style={cardStyle}>
          <h2>Duplicate Site Specs</h2>

          <form onSubmit={duplicateSiteSpecs}>
            <select
              value={copyFromSiteId}
              onChange={(e) => setCopyFromSiteId(e.target.value)}
              style={inputStyle}
            >
              <option value="">Copy FROM site</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={copyToSiteId}
              onChange={(e) => setCopyToSiteId(e.target.value)}
              style={inputStyle}
            >
              <option value="">Copy TO site</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <button type="submit" style={buttonStyle}>
              Duplicate Specs
            </button>
          </form>
        </div>

        {/* SPECS */}
        <div style={cardStyle}>
          <h2>Specs</h2>

          {specs.map((spec) => (
            <div key={spec.id} style={specItemStyle}>
              <h3>{spec.title}</h3>

              <pre style={{ whiteSpace: "pre-wrap" }}>
                {spec.body}
              </pre>

              {/* IMAGES */}
              {getImagesForSpec(spec.id).length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <strong>Images</strong>

                  <div style={imageGrid}>
                    {getImagesForSpec(spec.id).map((img) => (
                      <img
                        key={img.id}
                        src={img.image_url}
                        style={imageStyle}
                        onClick={() => setLightboxImage(img.image_url)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightboxImage && (
        <div style={lightboxOverlay} onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} style={lightboxImageStyle} />
        </div>
      )}
    </div>
  );
}

/* STYLES */

const cardStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
};

const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
};

const buttonStyle = {
  padding: 10,
  background: "#1f3b63",
  color: "#fff",
  border: "none",
  borderRadius: 8,
};

const buttonStyleGreen = {
  ...buttonStyle,
  background: "#0f766e",
};

const specItemStyle = {
  border: "1px solid #ddd",
  padding: 15,
  marginBottom: 10,
  borderRadius: 10,
};

const imageGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 10,
  marginTop: 10,
};

const imageStyle = {
  width: "100%",
  height: 120,
  objectFit: "contain",
  cursor: "pointer",
  border: "1px solid #ddd",
  borderRadius: 8,
  background: "#fff",
};

/* LIGHTBOX */
const lightboxOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  cursor: "pointer",
};

const lightboxImageStyle = {
  maxWidth: "90%",
  maxHeight: "90%",
};
