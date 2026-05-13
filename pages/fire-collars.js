import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function FireCollarsPage() {
  const [developers, setDevelopers] = useState([]);
  const [sites, setSites] = useState([]);
  const [rows, setRows] = useState([]);

  const [developerId, setDeveloperId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [houseType, setHouseType] = useState("");
  const [plotNumber, setPlotNumber] = useState("");
  const [collarCount, setCollarCount] = useState(0);
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);

    const developersResult = await supabase
      .from("developers")
      .select("id, name")
      .order("name");

    const sitesResult = await supabase
      .from("sites")
      .select("id, name, developer_id")
      .order("name");

    const collarResult = await supabase
      .from("fire_collar_requirements")
      .select("*")
      .order("plot_number", { ascending: true });

    if (developersResult.error) alert(developersResult.error.message);
    if (sitesResult.error) alert(sitesResult.error.message);
    if (collarResult.error) alert(collarResult.error.message);

    setDevelopers(developersResult.data || []);
    setSites(sitesResult.data || []);
    setRows(collarResult.data || []);
    setLoading(false);
  }

  const filteredSites = useMemo(() => {
    if (!developerId) return sites;
    return sites.filter((site) => site.developer_id === developerId);
  }, [sites, developerId]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (developerId && row.developer_id !== developerId) return false;
      if (siteId && row.site_id !== siteId) return false;
      return true;
    });
  }, [rows, developerId, siteId]);

  const totalCollars = filteredRows.reduce(
    (total, row) => total + Number(row.collar_count || 0),
    0
  );

  const totalPlots = filteredRows.length;

  const totalHouseTypes = new Set(
    filteredRows.map((row) => String(row.house_type || "").trim().toLowerCase())
  ).size;

  async function handleSave(e) {
    e.preventDefault();

    if (!developerId || !siteId || !houseType) {
      alert("Please complete developer, site and house type.");
      return;
    }

    setSaving(true);

    const payload = {
      developer_id: developerId,
      site_id: siteId,
      house_type: houseType.trim(),
      plot_number: plotNumber.trim() || null,
      collar_count: Number(collarCount || 0),
      notes: notes.trim() || null,
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("fire_collar_requirements")
        .update(payload)
        .eq("id", editingId);
    } else {
      result = await supabase.from("fire_collar_requirements").insert(payload);
    }

    if (result.error) {
      alert(result.error.message);
      setSaving(false);
      return;
    }

    resetForm();
    await loadInitialData();
    setSaving(false);
  }

  function handleEdit(row) {
    setEditingId(row.id);
    setDeveloperId(row.developer_id);
    setSiteId(row.site_id);
    setHouseType(row.house_type || "");
    setPlotNumber(row.plot_number || "");
    setCollarCount(row.collar_count || 0);
    setNotes(row.notes || "");

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleDelete(id) {
    const confirmed = confirm("Delete this fire collar requirement?");
    if (!confirmed) return;

    const result = await supabase
      .from("fire_collar_requirements")
      .delete()
      .eq("id", id);

    if (result.error) {
      alert(result.error.message);
      return;
    }

    await loadInitialData();
  }

  function resetForm() {
    setEditingId(null);
    setHouseType("");
    setPlotNumber("");
    setCollarCount(0);
    setNotes("");
  }

  function getDeveloperName(id) {
    const developer = developers.find((dev) => dev.id === id);
    return developer ? developer.name : "Unknown";
  }

  function getSiteName(id) {
    const site = sites.find((item) => item.id === id);
    return site ? site.name : "Unknown";
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold text-slate-900">
            Fire Collar Schedule
          </h1>
          <p className="mt-2 text-slate-600">
            Record and view how many fire collars are required for each
            property, plot or house type.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Total Fire Collars</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalCollars}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">Properties / Plots Listed</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalPlots}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-slate-500">House Types Covered</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalHouseTypes}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-2xl bg-white p-6 shadow space-y-4"
        >
          <h2 className="text-xl font-bold text-slate-900">
            {editingId ? "Edit Fire Collar Requirement" : "Add Requirement"}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Developer
              </label>
              <select
                value={developerId}
                onChange={(e) => {
                  setDeveloperId(e.target.value);
                  setSiteId("");
                }}
                className="w-full rounded-xl border border-slate-300 p-3"
              >
                <option value="">Select developer</option>
                {developers.map((developer) => (
                  <option key={developer.id} value={developer.id}>
                    {developer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Site
              </label>
              <select
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3"
              >
                <option value="">Select site</option>
                {filteredSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                House Type
              </label>
              <input
                value={houseType}
                onChange={(e) => setHouseType(e.target.value)}
                placeholder="Example: Elliston"
                className="w-full rounded-xl border border-slate-300 p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Plot Number
              </label>
              <input
                value={plotNumber}
                onChange={(e) => setPlotNumber(e.target.value)}
                placeholder="Example: 12"
                className="w-full rounded-xl border border-slate-300 p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Fire Collars Required
              </label>
              <input
                type="number"
                min="0"
                value={collarCount}
                onChange={(e) => setCollarCount(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Notes
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Example: SVP, boiler cupboard, garage ceiling"
                className="w-full rounded-xl border border-slate-300 p-3"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Fire Collar Requirements
              </h2>
              <p className="text-sm text-slate-500">
                Filter by developer and site using the dropdowns above.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Print Schedule
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : filteredRows.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-slate-500">
              No fire collar requirements added yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-700">
                    <th className="p-3">Developer</th>
                    <th className="p-3">Site</th>
                    <th className="p-3">Plot</th>
                    <th className="p-3">House Type</th>
                    <th className="p-3">Collars</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        {getDeveloperName(row.developer_id)}
                      </td>
                      <td className="p-3">{getSiteName(row.site_id)}</td>
                      <td className="p-3">{row.plot_number || "-"}</td>
                      <td className="p-3 font-medium">{row.house_type}</td>
                      <td className="p-3 font-bold">{row.collar_count}</td>
                      <td className="p-3">{row.notes || "-"}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(row)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(row.id)}
                            className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
