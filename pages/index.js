import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://izqfymtwclluphioysbn.supabase.co",
  "YOUR_ANON_KEY_HERE"
);

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
    const { data: devs } = await supabase.from("developers").select("*");
    const { data: sts } = await supabase.from("sites").select("*");
    const { data: cats } = await supabase.from("categories").select("*");
    const { data: spc } = await supabase.from("specs").select("*");

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
    ? sites.filter((site) => String(site.developer_id) === String(selectedDeveloper))
    : [];

  const filteredSpecs =
    selectedDeveloper && selectedSite
      ? specs.filter((spec) => String(spec.site_id) === String(selectedSite))
      : [];

  const getCategory = (id) =>
    categories.find((c) => String(c.id) === String(id))?.name || "";

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>RW Derbyshire Spec Hub</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <select
          value={selectedDeveloper}
          onChange={(e) => handleDeveloperChange(e.target.value)}
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
        >
          <option value="">Select Site</option>
          {filteredSites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedDeveloper && <p>Please select a developer.</p>}
      {selectedDeveloper && !selectedSite && <p>Please select a site.</p>}

      <div style={{ marginTop: 20 }}>
        {selectedDeveloper &&
          selectedSite &&
          filteredSpecs.map((spec) => (
            <div
              key={spec.id}
              style={{
                marginBottom: 20,
                padding: 15,
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            >
              <h3>{spec.title}</h3>
              <p style={{ color: "#666", marginBottom: 10 }}>
                {getCategory(spec.category_id)}
              </p>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Arial" }}>
                {spec.body}
              </pre>
            </div>
          ))}

        {selectedDeveloper && selectedSite && filteredSpecs.length === 0 && (
          <p>No specs found for this site.</p>
        )}
      </div>
    </div>
  );
}
