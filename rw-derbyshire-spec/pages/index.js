import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://izqfymtwclluphioysbn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cWZ5bXR3Y2xsdXBoaW95c2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1Mzg3NzQsImV4cCI6MjA5MDExNDc3NH0.C0MVZJL0PZckHIZPbe4OHLLpbwB-1TyL11oQvC98u6g"
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

  const filteredSites = sites.filter(
    (s) => !selectedDeveloper || s.developer_id === selectedDeveloper
  );

  const filteredSpecs = specs.filter(
    (s) => !selectedSite || s.site_id === selectedSite
  );

  const getCategory = (id) =>
    categories.find((c) => c.id === id)?.name || "";

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>RW Derbyshire Spec Hub</h1>

      <div style={{ display: "flex", gap: 10 }}>
        <select onChange={(e) => setSelectedDeveloper(e.target.value)}>
          <option value="">Select Developer</option>
          {developers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select onChange={(e) => setSelectedSite(e.target.value)}>
          <option value="">Select Site</option>
          {filteredSites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 20 }}>
        {filteredSpecs.map((spec) => (
          <div key={spec.id} style={{ marginBottom: 20 }}>
            <h3>{spec.title}</h3>
            <p>{getCategory(spec.category_id)}</p>
            <pre>{spec.body}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}