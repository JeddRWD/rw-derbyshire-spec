import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [developers, setDevelopers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sites, setSites] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [specImages, setSpecImages] = useState([]);

  const [developerName, setDeveloperName] = useState("");
  const [editingDeveloperId, setEditingDeveloperId] = useState(null);

  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [siteName, setSiteName] = useState("");
  const [siteDeveloperId, setSiteDeveloperId] = useState("");
  const [editingSiteId, setEditingSiteId] = useState(null);

  const [specTitle, setSpecTitle] = useState("");
  const [specBody, setSpecBody] = useState("");
  const [specSiteId, setSpecSiteId] = useState("");
  const [specCategoryId, setSpecCategoryId] = useState("");
  const [editingSpecId, setEditingSpecId] = useState(null);

  const [imageSpecId, setImageSpecId] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [copyingSpec, setCopyingSpec] = useState(null);
  const [copySiteIds, setCopySiteIds] = useState([]);

  const [specFilterSiteId, setSpecFilterSiteId] = useState("");
  const [specFilterCategoryId, setSpecFilterCategoryId] = useState("");

  const [showDevelopers, setShowDevelopers] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showSites, setShowSites] = useState(false);
  const [showSpecs, setShowSpecs] = useState(true);

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
    if (session) loadData();
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

    const { data: imgs } = await supabase
      .from("spec_images")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    setDevelopers(devs || []);
    setCategories(cats || []);
    setSites(sts || []);
    setSpecs(spc || []);
    setSpecImages(imgs || []);
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

  const saveDeveloper = async (e) => {
    e.preventDefault();
    let error;

    if (editingDeveloperId) {
      ({ error } = await supabase
        .from("developers")
        .update({
          name: developerName,
          updated_by_email: session.user.email,
        })
        .eq("id", editingDeveloperId));
    } else {
      ({ error } = await supabase
        .from("developers")
        .insert([
          {
            name: developerName,
            created_by_email: session.user.email,
            updated_by_email: session.user.email,
          },
        ]));
    }

    if (error) return alert(error.message);

    resetDeveloperForm();
    loadData();
  };

  const editDeveloper = (developer) => {
    setEditingDeveloperId(developer.id);
    setDeveloperName(developer.name || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteDeveloper = async (id) => {
    if (!window.confirm("Delete this developer?")) return;
    const { error } = await supabase.from("developers").delete().eq("id", id);
    if (error) return alert(error.message);
    if (editingDeveloperId === id) resetDeveloperForm();
    loadData();
  };

  const resetDeveloperForm = () => {
    setEditingDeveloperId(null);
    setDeveloperName("");
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    let error;

    if (editingCategoryId) {
      ({ error } = await supabase
        .from("categories")
        .update({
          name: categoryName,
          updated_by_email: session.user.email,
        })
        .eq("id", editingCategoryId));
    } else {
      ({ error } = await supabase
        .from("categories")
        .insert([
          {
            name: categoryName,
            created_by_email: session.user.email,
            updated_by_email: session.user.email,
          },
        ]));
    }

    if (error) return alert(error.message);

    resetCategoryForm();
    loadData();
  };

  const editCategory = (category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return alert(error.message);
    if (editingCategoryId === id) resetCategoryForm();
    loadData();
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryName("");
  };

  const saveSite = async (e) => {
    e.preventDefault();
    let error;

    if (editingSiteId) {
      ({ error } = await supabase
        .from("sites")
        .update({
          name: siteName,
          developer_id: siteDeveloperId,
          updated_by_email: session.user.email,
        })
        .eq("id", editingSiteId));
    } else {
      ({ error } = await supabase
        .from("sites")
        .insert([
          {
            name: siteName,
            developer_id: siteDeveloperId,
            created_by_email: session.user.email,
            updated_by_email: session.user.email,
          },
        ]));
    }

    if (error) return alert(error.message);

    resetSiteForm();
    loadData();
  };

  const editSite = (site) => {
    setEditingSiteId(site.id);
    setSiteName(site.name || "");
    setSiteDeveloperId(site.developer_id || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSite = async (id) => {
    if (!window.confirm("Delete this site?")) return;
    const { error } = await supabase.from("sites").delete().eq("id", id);
    if (error) return alert(error.message);
    if (editingSiteId === id) resetSiteForm();
    loadData();
  };

  const resetSiteForm = () => {
    setEditingSiteId(null);
    setSiteName("");
    setSiteDeveloperId("");
  };

  const saveSpec = async (e) => {
    e.preventDefault();

    let error;

    if (editingSpecId) {
      ({ error } = await supabase
        .from("specs")
        .update({
          title: specTitle,
          body: specBody,
          site_id: specSiteId,
          category_id: specCategoryId,
          updated_at: new Date().toISOString().slice(0, 10),
          updated_by_email: session.user.email,
        })
        .eq("id", editingSpecId));
    } else {
      ({ error } = await supabase
        .from("specs")
        .insert([
          {
            title: specTitle,
            body: specBody,
            site_id: specSiteId,
            category_id: specCategoryId,
            updated_at: new Date().toISOString().slice(0, 10),
            created_by_email: session.user.email,
            updated_by_email: session.user.email,
          },
        ]));
    }

    if (error) return alert(error.message);

    resetSpecForm();
    loadData();
  };

  const editSpec = (spec) => {
    setEditingSpecId(spec.id);
    setSpecTitle(spec.title || "");
    setSpecBody(spec.body || "");
    setSpecSiteId(spec.site_id || "");
    setSpecCategoryId(spec.category_id || "");
    setImageSpecId(spec.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSpec = async (id) => {
    if (!window.confirm("Delete this spec?")) return;
    const { error } = await supabase.from("specs").delete().eq("id", id);
    if (error) return alert(error.message);
    if (editingSpecId === id) resetSpecForm();
    loadData();
  };

  const resetSpecForm = () => {
    setEditingSpecId(null);
    setSpecTitle("");
    setSpecBody("");
    setSpecSiteId("");
    setSpecCategoryId("");
  };

  const startCopySpec = (spec) => {
    setCopyingSpec(spec);
    setCopySiteIds([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCopySite = (siteId) => {
    setCopySiteIds((prev) =>
      prev.includes(siteId)
        ? prev.filter((id) => id !== siteId)
        : [...prev, siteId]
    );
  };

  const copySpecToSite = async (e) => {
    e.preventDefault();

    if (!copyingSpec) return;
    if (copySiteIds.length === 0) {
      return alert("Please select at least one site to copy to.");
    }

    const rowsToInsert = copySiteIds.map((siteId) => ({
      title: copyingSpec.title,
      body: copyingSpec.body,
      site_id: siteId,
      category_id: copyingSpec.category_id,
      updated_at: new Date().toISOString().slice(0, 10),
      created_by_email: session.user.email,
      updated_by_email: session.user.email,
    }));

    const { error } = await supabase.from("specs").insert(rowsToInsert);

    if (error) return alert(error.message);

    setCopyingSpec(null);
    setCopySiteIds([]);
    loadData();
    alert("Spec copied successfully to selected sites");
  };

  const uploadSpecImage = async (e) => {
    e.preventDefault();

    if (!imageSpecId) return alert("Please select a spec.");
    if (!imageFile) return alert("Please choose an image.");

    try {
      setUploadingImage(true);

      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${imageSpecId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("spec-images")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("spec-images")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("spec_images").insert([
        {
          spec_id: imageSpecId,
          image_url: publicData.publicUrl,
          caption: imageCaption || null,
        },
      ]);

      if (dbError) throw dbError;

      setImageFile(null);
      setImageCaption("");
      const fileInput = document.getElementById("spec-image-upload");
      if (fileInput) fileInput.value = "";

      await loadData();
      alert("Image uploaded");
    } catch (error) {
      alert(error.message || "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteSpecImage = async (image) => {
    if (!window.confirm("Delete this image?")) return;

    try {
      const url = new URL(image.image_url);
      const marker = "/storage/v1/object/public/spec-images/";
      const index = url.pathname.indexOf(marker);
      const storagePath =
        index >= 0
          ? decodeURIComponent(url.pathname.slice(index + marker.length))
          : null;

      if (storagePath) {
        await supabase.storage.from("spec-images").remove([storagePath]);
      }

      const { error } = await supabase
        .from("spec_images")
        .delete()
        .eq("id", image.id);

      if (error) throw error;

      await loadData();
    } catch (error) {
      alert(error.message || "Delete failed");
    }
  };

  const getSiteName = (id) =>
    sites.find((site) => String(site.id) === String(id))?.name || "";

  const getCategoryName = (id) =>
    categories.find((category) => String(category.id) === String(id))?.name || "";

  const getDeveloperName = (id) =>
    developers.find((developer) => String(developer.id) === String(id))?.name || "";

  const getImagesForSpec = (specId) =>
    specImages.filter((image) => String(image.spec_id) === String(specId));

  const filteredSpecsList = specs.filter((spec) => {
    const siteMatches = specFilterSiteId
      ? String(spec.site_id) === String(specFilterSiteId)
      : true;

    const categoryMatches = specFilterCategoryId
      ? String(spec.category_id) === String(specFilterCategoryId)
      : true;

    return siteMatches && categoryMatches;
  });

  const availableCopySites = copyingSpec
    ? sites.filter((site) => String(site.id) !== String(copyingSpec.site_id))
    : [];

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
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <h1 style={{ margin: 0 }}>Admin Panel</h1>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button
                type="button"
                style={{ ...buttonStyle, background: "#0f766e" }}
              >
                Return To Spec Hub
              </button>
            </Link>

            <button onClick={signOut} style={buttonStyle}>
              Sign Out
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          <form onSubmit={saveDeveloper} style={cardStyle}>
            <h2>{editingDeveloperId ? "Edit Developer" : "Add Developer"}</h2>
            <input
              value={developerName}
              onChange={(e) => setDeveloperName(e.target.value)}
              placeholder="Developer name"
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={buttonStyle}>
                {editingDeveloperId ? "Update Developer" : "Save Developer"}
              </button>
              {editingDeveloperId && (
                <button
                  type="button"
                  onClick={resetDeveloperForm}
                  style={{ ...buttonStyle, background: "#6b7280" }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <form onSubmit={saveCategory} style={cardStyle}>
            <h2>{editingCategoryId ? "Edit Category" : "Add Category"}</h2>
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category name"
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={buttonStyle}>
                {editingCategoryId ? "Update Category" : "Save Category"}
              </button>
              {editingCategoryId && (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  style={{ ...buttonStyle, background: "#6b7280" }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <form onSubmit={saveSite} style={{ ...cardStyle, marginBottom: 20 }}>
          <h2>{editingSiteId ? "Edit Site" : "Add Site"}</h2>
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
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" style={buttonStyle}>
              {editingSiteId ? "Update Site" : "Save Site"}
            </button>
            {editingSiteId && (
              <button
                type="button"
                onClick={resetSiteForm}
                style={{ ...buttonStyle, background: "#6b7280" }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <form onSubmit={saveSpec} style={{ ...cardStyle, marginBottom: 20 }}>
          <h2>{editingSpecId ? "Edit Spec" : "Add Spec"}</h2>
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
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" style={buttonStyle}>
              {editingSpecId ? "Update Spec" : "Save Spec"}
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

        {copyingSpec && (
          <form onSubmit={copySpecToSite} style={{ ...cardStyle, marginBottom: 20 }}>
            <h2>Copy Spec to Multiple Sites</h2>

            <p style={{ marginTop: 0, color: "#6b7280" }}>
              <strong>Spec:</strong> {copyingSpec.title}
            </p>

            <div
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 8,
                padding: 12,
                maxHeight: 260,
                overflowY: "auto",
                background: "#fff",
                marginBottom: 12,
              }}
            >
              {availableCopySites.map((site) => (
                <label
                  key={site.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: "1px solid #f1f5f9",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={copySiteIds.includes(site.id)}
                    onChange={() => toggleCopySite(site.id)}
                  />
                  <span>{site.name}</span>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setCopySiteIds(availableCopySites.map((site) => site.id))}
                style={{ ...buttonStyle, background: "#475569" }}
              >
                Select All
              </button>

              <button
                type="button"
                onClick={() => setCopySiteIds([])}
                style={{ ...buttonStyle, background: "#6b7280" }}
              >
                Clear
              </button>

              <button
                type="submit"
                style={{ ...buttonStyle, background: "#0f766e" }}
              >
                Copy Spec
              </button>

              <button
                type="button"
                onClick={() => {
                  setCopyingSpec(null);
                  setCopySiteIds([]);
                }}
                style={{ ...buttonStyle, background: "#6b7280" }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <form onSubmit={uploadSpecImage} style={{ ...cardStyle, marginBottom: 20 }}>
          <h2>Upload Image to Spec</h2>
          <select
            value={imageSpecId}
            onChange={(e) => setImageSpecId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select Spec</option>
            {specs.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.title} - {getSiteName(spec.site_id)}
              </option>
            ))}
          </select>
          <input
            id="spec-image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            style={inputStyle}
          />
          <input
            value={imageCaption}
            onChange={(e) => setImageCaption(e.target.value)}
            placeholder="Image caption (optional)"
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle} disabled={uploadingImage}>
            {uploadingImage ? "Uploading..." : "Upload Image"}
          </button>
        </form>

        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setShowDevelopers(!showDevelopers)}
            style={sectionToggleStyle}
          >
            <span>Developers</span>
            <span>{showDevelopers ? "▲" : "▼"}</span>
          </button>

          {showDevelopers && (
            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {developers.map((developer) => (
                <div key={developer.id} style={listItemStyle}>
                  <div>
                    <strong>{developer.name}</strong>
                    <div style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>
                      Added by: {developer.created_by_email || "Unknown"}
                    </div>
                    <div style={{ color: "#6b7280", marginTop: 2, fontSize: 14 }}>
                      Updated by: {developer.updated_by_email || "Unknown"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => editDeveloper(developer)}
                      style={buttonStyle}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDeveloper(developer.id)}
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

        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setShowCategories(!showCategories)}
            style={sectionToggleStyle}
          >
            <span>Categories</span>
            <span>{showCategories ? "▲" : "▼"}</span>
          </button>

          {showCategories && (
            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {categories.map((category) => (
                <div key={category.id} style={listItemStyle}>
                  <div>
                    <strong>{category.name}</strong>
                    <div style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>
                      Added by: {category.created_by_email || "Unknown"}
                    </div>
                    <div style={{ color: "#6b7280", marginTop: 2, fontSize: 14 }}>
                      Updated by: {category.updated_by_email || "Unknown"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => editCategory(category)}
                      style={buttonStyle}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(category.id)}
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

        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setShowSites(!showSites)}
            style={sectionToggleStyle}
          >
            <span>Sites</span>
            <span>{showSites ? "▲" : "▼"}</span>
          </button>

          {showSites && (
            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {sites.map((site) => (
                <div key={site.id} style={listItemStyle}>
                  <div>
                    <strong>{site.name}</strong>
                    <div style={{ color: "#6b7280", marginTop: 4 }}>
                      Developer: {getDeveloperName(site.developer_id)}
                    </div>
                    <div style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>
                      Added by: {site.created_by_email || "Unknown"}
                    </div>
                    <div style={{ color: "#6b7280", marginTop: 2, fontSize: 14 }}>
                      Updated by: {site.updated_by_email || "Unknown"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => editSite(site)}
                      style={buttonStyle}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSite(site.id)}
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

        <div style={cardStyle}>
          <button
            type="button"
            onClick={() => setShowSpecs(!showSpecs)}
            style={sectionToggleStyle}
          >
            <span>Existing Specs</span>
            <span>{showSpecs ? "▲" : "▼"}</span>
          </button>

          {showSpecs && (
            <>
              <div
                style={{
                  marginTop: 16,
                  marginBottom: 16,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <select
                  value={specFilterSiteId}
                  onChange={(e) => setSpecFilterSiteId(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 0, maxWidth: 320 }}
                >
                  <option value="">All Sites</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>

                <select
                  value={specFilterCategoryId}
                  onChange={(e) => setSpecFilterCategoryId(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 0, maxWidth: 320 }}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {(specFilterSiteId || specFilterCategoryId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSpecFilterSiteId("");
                      setSpecFilterCategoryId("");
                    }}
                    style={{ ...buttonStyle, background: "#6b7280" }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {filteredSpecsList.map((spec) => (
                  <div key={spec.id} style={specItemStyle}>
                    <h3 style={{ marginTop: 0, marginBottom: 8 }}>{spec.title}</h3>
                    <p style={{ margin: "0 0 6px", color: "#6b7280" }}>
                      <strong>Site:</strong> {getSiteName(spec.site_id)}
                    </p>
                    <p style={{ margin: "0 0 6px", color: "#6b7280" }}>
                      <strong>Category:</strong> {getCategoryName(spec.category_id)}
                    </p>
                    <p style={{ margin: "0 0 6px", color: "#6b7280" }}>
                      <strong>Added by:</strong> {spec.created_by_email || "Unknown"}
                    </p>
                    <p style={{ margin: "0 0 12px", color: "#6b7280" }}>
                      <strong>Updated by:</strong> {spec.updated_by_email || "Unknown"}
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

                    {getImagesForSpec(spec.id).length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <strong>Images</strong>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: 12,
                            marginTop: 10,
                          }}
                        >
                          {getImagesForSpec(spec.id).map((image) => (
                            <div
                              key={image.id}
                              style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: 10,
                                padding: 10,
                              }}
                            >
                              <img
                                src={image.image_url}
                                alt={image.caption || spec.title}
                                style={{
                                  width: "100%",
                                  maxHeight: 180,
                                  objectFit: "contain",
                                  borderRadius: 8,
                                  display: "block",
                                  background: "#f9fafb",
                                  padding: 6,
                                  border: "1px solid #e5e7eb",
                                  boxSizing: "border-box",
                                }}
                              />
                              {image.caption && (
                                <p
                                  style={{
                                    margin: "8px 0 0",
                                    fontSize: 13,
                                    color: "#6b7280",
                                  }}
                                >
                                  {image.caption}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => deleteSpecImage(image)}
                                style={{
                                  ...buttonStyle,
                                  background: "#b91c1c",
                                  marginTop: 10,
                                  width: "100%",
                                }}
                              >
                                Delete Image
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 14,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => editSpec(spec)}
                        style={buttonStyle}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => startCopySpec(spec)}
                        style={{ ...buttonStyle, background: "#0f766e" }}
                      >
                        Copy
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

                {filteredSpecsList.length === 0 && (
                  <p style={{ color: "#6b7280", marginTop: 10 }}>
                    No specs found for the selected filters.
                  </p>
                )}
              </div>
            </>
          )}
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

const listItemStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 16,
  background: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
};

const specItemStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 16,
  background: "#fff",
};

const sectionToggleStyle = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "transparent",
  border: "none",
  padding: 0,
  fontSize: 22,
  fontWeight: 700,
  cursor: "pointer",
  color: "#1f2937",
};
