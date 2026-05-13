import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function FireCollarsPage() {
  const [developers, setDevelopers] = useState([]);
  const [sites, setSites] = useState([]);
  const [rows, setRows] = useState([]);

  const [developerId, setDeveloperId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [houseType, setHouseType] = useState("");
  const [collarCount, setCollarCount] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const developersResult = await supabase
      .from("developers")
      .select("*")
      .order("name");

    const sitesResult = await supabase
      .from("sites")
      .select("*")
      .order("name");

    const rowsResult = await supabase
      .from("fire_collar_requirements")
      .select("*")
      .order("house_type");

    setDevelopers(developersResult.data || []);
    setSites(sitesResult.data || []);
    setRows(rowsResult.data || []);

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

  const totalHouseTypes = new Set(
    filteredRows.map((x) => x.house_type)
  ).size;

  async function handleSave(e) {
    e.preventDefault();

    if (!developerId || !siteId || !houseType || !collarCount) {
      alert("Please complete all fields");
      return;
    }

    setSaving(true);

    const payload = {
      developer_id: developerId,
      site_id: siteId,
      house_type: houseType,
      collar_count: Number(collarCount),
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("fire_collar_requirements")
        .update(payload)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("fire_collar_requirements")
        .insert(payload);
    }

    if (result.error) {
      alert(result.error.message);
      setSaving(false);
      return;
    }

    resetForm();
    await loadData();
    setSaving(false);
  }

  function handleEdit(row) {
    setEditingId(row.id);
    setDeveloperId(row.developer_id);
    setSiteId(row.site_id);
    setHouseType(row.house_type);
    setCollarCount(row.collar_count);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id) {
    const confirmed = confirm("Delete this item?");
    if (!confirmed) return;

    await supabase
      .from("fire_collar_requirements")
      .delete()
      .eq("id", id);

    await loadData();
  }

  function resetForm() {
    setEditingId(null);
    setHouseType("");
    setCollarCount("");
  }

  function getDeveloperName(id) {
    return developers.find((x) => x.id === id)?.name || "-";
  }

  function getSiteName(id) {
    return sites.find((x) => x.id === id)?.name || "-";
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-xl">
          <h1 className="text-4xl font-bold">
            Fire Collar Schedule
          </h1>

          <p className="mt-3 text-slate-200 text-lg">
            Manage fire collar requirements across all developments and sites.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Total Fire Collars
            </p>

            <p className="mt-4 text-5xl font-bold text-slate-900">
              {totalCollars}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              House Types
            </p>

            <p className="mt-4 text-5xl font-bold text-slate-900">
              {totalHouseTypes}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <select
              value={developerId}
              onChange={(e) => {
                setDeveloperId(e.target.value);
                setSiteId("");
              }}
              className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-slate-900"
            >
              <option value="">All Developers</option>

              {developers.map((developer) => (
                <option key={developer.id} value={developer.id}>
                  {developer.name}
                </option>
              ))}
            </select>

            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-slate-900"
            >
              <option value="">All Sites</option>

              {filteredSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <form
            onSubmit={handleSave}
            className="grid gap-4 md:grid-cols-3"
          >
            <input
              value={houseType}
              onChange={(e) => setHouseType(e.target.value)}
              placeholder="House Type"
              className="rounded-2xl border border-slate-300 p-4"
            />

            <input
              type="number"
              value={collarCount}
              onChange={(e) => setCollarCount(e.target.value)}
              placeholder="Fire Collars Required"
              className="rounded-2xl border border-slate-300 p-4"
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-slate-900 p-4 font-semibold text-white transition hover:bg-slate-700"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Requirement"
                : "Add Requirement"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Fire Collar Requirements
              </h2>

              <p className="mt-1 text-slate-500">
                Live overview of all fire collar requirements.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Print
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-500">
              Loading...
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-10 text-center text-slate-500">
              No fire collar requirements found.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      Developer
                    </th>

                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      Site
                    </th>

                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      House Type
                    </th>

                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      Fire Collars
                    </th>

                    <th className="p-4 text-right text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-4">
                        {getDeveloperName(row.developer_id)}
                      </td>

                      <td className="p-4">
                        {getSiteName(row.site_id)}
                      </td>

                      <td className="p-4 font-semibold text-slate-900">
                        {row.house_type}
                      </td>

                      <td className="p-4">
                        <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">
                          {row.collar_count}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(row)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(row.id)}
                            className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
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
