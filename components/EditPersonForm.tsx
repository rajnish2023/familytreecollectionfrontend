"use client";

import React, { useState, useEffect, useRef } from "react";
import { authenticatedFetch } from "@/app/utils/auth";
import { API_ENDPOINTS } from '@/app/config/api';

type CountryCode = {
  name: string;
  dial_code: string;
  code: string;
};

interface EditPersonFormProps {
  personId: string;
  initialData: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditPersonForm({ personId, initialData, onSuccess, onCancel }: EditPersonFormProps) {
  const [form, setForm] = useState<any>({
    name: initialData.name || "",
    gender: initialData.gender || "",
    dateOfBirth: "",
    occupation: initialData.occupation || "",
    currentAddress: initialData.currentAddress || "",
    contactNumber: initialData.contactNumber || "",
    email: initialData.email || "",
    photo: initialData.photo || "",
    parent_ids: [],
    placeOfBirth: "",
    countryCode: initialData.countryCode || "+91",
    spouse_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eligibleParents, setEligibleParents] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [eligibleSpouses, setEligibleSpouses] = useState<any[]>([]);
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [occupationSuggestions, setOccupationSuggestions] = useState<Array<{title: string, source: string}>>([]);
  const [isLoadingOccupations, setIsLoadingOccupations] = useState(false);
  const [showOccupationDropdown, setShowOccupationDropdown] = useState(false);
  const [occupationSearchTerm, setOccupationSearchTerm] = useState("");
  const occupationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch country codes on component mount
  useEffect(() => {
    fetchCountryCodes();
    loadPersonData();
  }, []);

  // Cleanup occupation search timeout
  useEffect(() => {
    return () => {
      if (occupationTimeoutRef.current) {
        clearTimeout(occupationTimeoutRef.current);
      }
    };
  }, []);

  const fetchCountryCodes = async () => {
    try {
      setIsLoadingCountries(true);
      const response = await fetch(
        "https://gist.githubusercontent.com/pickletoni/021e2e18e83f33d16fee5daa308e6a4e/raw"
      );
      if (!response.ok) throw new Error("Failed to fetch country codes");
      const rawData: { country: string; code: string; iso: string }[] = await response.json();
      const formattedCodes: CountryCode[] = rawData.map((country) => ({
        name: country.country,
        dial_code: `+${country.code}`,
        code: country.iso,
      }));
      setCountryCodes(formattedCodes.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Error fetching country codes:", error);
      setCountryCodes([
        { name: "India", dial_code: "+91", code: "IN" },
        { name: "United States", dial_code: "+1", code: "US" },
        { name: "United Kingdom", dial_code: "+44", code: "GB" },
        { name: "Canada", dial_code: "+1", code: "CA" },
        { name: "Australia", dial_code: "+61", code: "AU" },
      ]);
    } finally {
      setIsLoadingCountries(false);
    }
  };

  const loadPersonData = async () => {
    try {
      const res = await authenticatedFetch(API_ENDPOINTS.persons.person(personId));
      const data = await res.json();
      if (data.success) {
        const p = data.data;
        setForm((prev: any) => ({
          ...prev,
          name: p.name || "",
          gender: p.gender || "",
          dateOfBirth: p.dateOfBirth ? (p.dateOfBirth.includes('T') ? p.dateOfBirth.slice(0, 10) : new Date(p.dateOfBirth).toISOString().slice(0, 10)) : "",
          occupation: p.occupation || "",
          currentAddress: p.currentAddress || "",
          contactNumber: p.contactNumber || "",
          email: p.email || "",
          photo: p.photo || "",
          parent_ids: p.parent_ids ? (Array.isArray(p.parent_ids) ? p.parent_ids.map((par: any) => typeof par === 'object' ? par._id : par) : []) : [],
          placeOfBirth: p.placeOfBirth || "",
          countryCode: p.countryCode || "+91",
          spouse_id: p.spouse_id ? (typeof p.spouse_id === 'object' ? p.spouse_id._id : p.spouse_id) : "",
        }));

        const personGender = p.gender;
        const spouseRes = await authenticatedFetch(API_ENDPOINTS.persons.eligibleSpouses);
        const spouseData = await spouseRes.json();
        let spouses = spouseData.data || [];
        // Ensure current spouse is included in dropdown
        if (p.spouse_id && !spouses.find((s: any) => s._id === (typeof p.spouse_id === 'object' ? p.spouse_id._id : p.spouse_id))) {
          const spouseId = typeof p.spouse_id === 'object' ? p.spouse_id._id : p.spouse_id;
          const spouseName = typeof p.spouse_id === 'object' ? p.spouse_id.name : 'Current Spouse';
          spouses = [{ _id: spouseId, name: spouseName }, ...spouses];
        }
        setEligibleSpouses(spouses);
      }
      
      const parentsRes = await authenticatedFetch(API_ENDPOINTS.persons.eligibleParents);
      const parentsData = await parentsRes.json();
      setEligibleParents(parentsData.data || []);
    } catch (err) {
      console.error('Error loading person data:', err);
      setError("Failed to load person data");
    }
  };

  const searchOccupations = async (query: string) => {
    if (!query || query.length < 2) {
      setOccupationSuggestions([]);
      return;
    }

    setIsLoadingOccupations(true);
    try {
      // Fallback mock data in case API fails
      const fallbackOccupations = [
        { title: "Software Engineer", source: "fallback" },
        { title: "Teacher", source: "fallback" },
        { title: "Doctor", source: "fallback" },
        { title: "Accountant", source: "fallback" },
        { title: "Graphic Designer", source: "fallback" },
      ];

      // Fetch from external API
      let apiOccupations: Array<{ title: string; source: string }> = [];
      try {
        const apiResponse = await fetch(
          `https://www.careeronestop.org/Toolkit/Wages/occupation-search.aspx?keyword=${encodeURIComponent(query)}&location=UNITED+STATES&sort=rank-desc`
        );
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          apiOccupations = (data?.Results?.slice(0, 5) || []).map((job: any) => ({
            title: job.JobTitle || job.Title || job.OccupationName || job.name || "",
            source: "api",
          })).filter((job: any) => job.title);
        }
      } catch (apiError) {
        console.warn("External API fetch failed, using fallback data:", apiError);
      }

      // Fetch previously used occupations from backend
      let previousOccupations: Array<{ title: string; source: string }> = [];
      const previousResponse = await authenticatedFetch(
        `${API_ENDPOINTS.persons.occupations}?search=${encodeURIComponent(query)}`
      );
      if (previousResponse.ok) {
        const data = await previousResponse.json();
        previousOccupations = (data.data || []).map((occ: string) => ({
          title: occ,
          source: "previous",
        }));
      }

      // Combine results, prioritizing previous occupations, then API, then fallback
      const allOccupations = [
        ...previousOccupations,
        ...apiOccupations,
        ...(apiOccupations.length === 0 ? fallbackOccupations.filter((occ) =>
          occ.title.toLowerCase().includes(query.toLowerCase())
        ) : []),
      ];

      // Deduplicate and limit to 8 suggestions
      const uniqueOccupations = Array.from(
        new Map(
          allOccupations.map((occ) => [occ.title.toLowerCase(), occ])
        ).values()
      ).slice(0, 8);

      setOccupationSuggestions(uniqueOccupations);
    } catch (error) {
      console.error("Error searching occupations:", error);
      setOccupationSuggestions([]);
    } finally {
      setIsLoadingOccupations(false);
    }
  };

  const handleOccupationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOccupationSearchTerm(value);
    setForm((prev: any) => ({ ...prev, occupation: value }));

    setShowOccupationDropdown(true);

    if (occupationTimeoutRef.current) {
      clearTimeout(occupationTimeoutRef.current);
    }

    occupationTimeoutRef.current = setTimeout(() => {
      searchOccupations(value);
    }, 300);
  };

  const selectOccupation = (occupation: string) => {
    setForm((prev: any) => ({ ...prev, occupation }));
    setOccupationSearchTerm(occupation);
    setShowOccupationDropdown(false);
    setOccupationSuggestions([]);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, multiple } = e.target;
    if (multiple) {
      const options = (e.target as HTMLSelectElement).options;
      const selected = Array.from(options).filter((o: any) => o.selected).map((o: any) => o.value);
      setForm((prev: any) => ({ ...prev, [name]: selected }));
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleParentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      setForm((prev: any) => ({ ...prev, parent_ids: [] }));
      return;
    }
    const selected = eligibleParents.find((p) => p._id === value);
    if (selected) {
      if (selected.spouse_id) {
        setForm((prev: any) => ({ ...prev, parent_ids: [selected._id, selected.spouse_id._id] }));
      } else {
        setForm((prev: any) => ({ ...prev, parent_ids: [selected._id] }));
      }
    }
  };

  const toTitleCase = (text: string): string => {
    return text
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Title-case relevant fields before submit
      const submitForm = {
        ...form,
        name: toTitleCase(form.name),
        currentAddress: toTitleCase(form.currentAddress),
        placeOfBirth: toTitleCase(form.placeOfBirth),
        occupation: toTitleCase(form.occupation),
      };
      const res = await authenticatedFetch(API_ENDPOINTS.persons.update(personId), {
        method: "PUT",
        body: JSON.stringify(submitForm),
      });
      if (!res.ok) throw new Error("Failed to update");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Error updating");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const response = await fetch(API_ENDPOINTS.upload.image, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to upload image" }));
        throw new Error(errorData.message || "Failed to upload image");
      }
      const data = await response.json();
      const photoUrl = `${API_ENDPOINTS.baseUrl}${data.data.fileUrl}`;
      setForm((prev: any) => ({ ...prev, photo: photoUrl }));
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'var(--backdrop-color)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: 12,
        padding: 32,
        minWidth: 400,
        maxWidth: 600,
        width: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border-color)',
      }}>
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            fontSize: 24,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            zIndex: 10,
          }}
          aria-label="Close"
        >
          ×
        </button>
        <h2 style={{ fontWeight: 600, fontSize: 24, marginBottom: 16, color: 'var(--text-primary)', textAlign: 'center' }}>Edit Person</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text-primary)' }}>
          <label style={{ color: 'var(--text-primary)', fontSize: 14 }}>Name
            <input name="name" value={form.name} onChange={handleFormChange} placeholder="Name" required style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '100%', background: 'var(--input-bg)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)', fontSize: 14 }}>Gender
            <select name="gender" value={form.gender} onChange={handleFormChange} required style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '100%', background: 'var(--input-bg)' }}>
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label style={{ color: 'var(--text-primary)', fontSize: 14 }}>Date of Birth
            <input name="dateOfBirth" value={form.dateOfBirth} onChange={handleFormChange} type="date" required style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '100%', background: 'var(--input-bg)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)', fontSize: 14 }}>Occupation
            <div style={{ position: 'relative' }}>
              <input 
                name="occupation" 
                value={form.occupation} 
                onChange={handleOccupationInputChange}
                onFocus={() => {
                  setShowOccupationDropdown(true);
                  if (form.occupation) {
                    searchOccupations(form.occupation);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowOccupationDropdown(false), 150);
                }}
                placeholder="Start typing to search occupations..." 
                style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '100%', background: 'var(--input-bg)' }} 
              />
              
              {/* Dropdown */}
              {showOccupationDropdown && (
                <div style={{
                  position: 'absolute',
                  zIndex: 10,
                  width: '100%',
                  marginTop: 4,
                  backgroundColor: 'var(--dropdown-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 6,
                  boxShadow: 'var(--dropdown-shadow)',
                  maxHeight: 240,
                  overflow: 'auto'
                }}>
                  {isLoadingOccupations && (
                    <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: 12, height: 12, border: '2px solid var(--primary-color)', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: 8 }}></div>
                      Searching occupations...
                    </div>
                  )}
                  
                  {!isLoadingOccupations && occupationSuggestions.length === 0 && occupationSearchTerm.length >= 2 && (
                    <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      No suggestions found. You can still enter your custom occupation.
                    </div>
                  )}
                  
                  {occupationSuggestions.map((occupation, index) => (
                    <button
                      key={index}
                      type="button"
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        fontSize: '12px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'var(--text-primary)',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onMouseDown={() => selectOccupation(occupation.title)}
                    >
                      <span>{occupation.title}</span>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: 4,
                        ...(occupation.source === 'previous' 
                          ? { backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }
                          : occupation.source === 'api'
                          ? { backgroundColor: 'var(--info-bg)', color: 'var(--info-text)' }
                          : { backgroundColor: 'var(--muted-bg)', color: 'var(--text-muted)' }
                        )
                      }}>
                        {occupation.source === 'previous' ? 'Used before' : occupation.source === 'api' ? 'Suggested' : 'Fallback'}
                      </span>
                    </button>
                  ))}
                  
                  {occupationSearchTerm.length >= 2 && !occupationSuggestions.some(occ => 
                    occ.title.toLowerCase() === occupationSearchTerm.toLowerCase()
                  ) && (
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        fontSize: '12px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        borderTop: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onMouseDown={() => selectOccupation(occupationSearchTerm)}
                    >
                      <span style={{ fontSize: '12px' }}>Add "{occupationSearchTerm}"</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 8 }}>(Custom occupation)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </label>
          <label style={{ color: 'var(--text-primary)', fontSize: 14 }}>Current Address
            <input name="currentAddress" value={form.currentAddress} onChange={handleFormChange} placeholder="Current Address" style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '100%', background: 'var(--input-bg)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)', fontSize: 14 }}>Contact Number
            <input name="contactNumber" value={form.contactNumber} onChange={handleFormChange} placeholder="Contact Number" style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '100%', background: 'var(--input-bg)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)', fontSize: 14 }}>Email
            <input name="email" value={form.email} onChange={handleFormChange} placeholder="Email" type="email" style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '100%', background: 'var(--input-bg)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)', fontSize: 14 }}>Place of Birth
            <input name="placeOfBirth" value={form.placeOfBirth} onChange={handleFormChange} placeholder="Place of Birth" style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '100%', background: 'var(--input-bg)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)', fontSize: 14 }}>Country Code
            <select name="countryCode" value={form.countryCode} onChange={handleFormChange} disabled={isLoadingCountries} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '100%', background: 'var(--input-bg)' }}>
              {isLoadingCountries ? (
                <option>Loading countries...</option>
              ) : (
                countryCodes.map((country) => (
                  <option key={country.code} value={country.dial_code}>
                    {country.name} ({country.dial_code})
                  </option>
                ))
              )}
            </select>
          </label>
          <label style={{ color: 'var(--text-primary)', fontSize: 14 }}>Spouse
            <select name="spouse_id" value={form.spouse_id} onChange={handleFormChange} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '100%', background: 'var(--input-bg)' }}>
              <option value="">Select spouse (optional)</option>
              {eligibleSpouses.map((spouse) => (
                <option key={spouse._id} value={spouse._id}>{spouse.name}</option>
              ))}
            </select>
          </label>
          <label style={{ color: 'var(--text-primary)', fontSize: 14 }}>Parents
            <select name="parentSelect" value={form.parent_ids[0] || ""} onChange={handleParentSelect} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '100%', background: 'var(--input-bg)' }}>
              <option value="">Select parent(s) (optional)</option>
              {eligibleParents.map((person) => (
                <option key={person._id} value={person._id}>
                  {person.spouse_id ? `${person.name} & ${person.spouse_id.name}` : `${person.name} (${person.gender})`}
                </option>
              ))}
            </select>
          </label>
          {error && <div style={{ color: 'var(--error-color)', fontSize: 14 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button type="button" onClick={onCancel} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--secondary-bg)', color: 'var(--text-primary)', fontWeight: 500 }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid var(--primary-color)', background: 'var(--primary-color)', color: 'var(--primary-text)', fontWeight: 500 }}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
        <div style={{ marginBottom: 16, marginTop: 16 }}>
          <label style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 400 }}>Photo</label>
          <div
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 8,
              padding: 16,
              textAlign: 'center',
              background: 'var(--upload-area-bg)',
              marginTop: 8,
              marginBottom: 8,
              position: 'relative',
            }}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={e => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files?.[0];
              if (file) {
                const input = document.createElement('input');
                input.type = 'file';
                input.files = e.dataTransfer.files;
                handleFileUpload({ target: input } as any);
              }
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="edit-photo-upload"
            />
            <label htmlFor="edit-photo-upload" style={{ cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 400 }}>
              {uploading ? 'Uploading...' : 'Click or drag image here to upload'}
            </label>
            {uploadError && <div style={{ color: 'var(--error-color)', fontSize: 12, marginTop: 4 }}>{uploadError}</div>}
            {form.photo && (
              <div style={{ marginTop: 12 }}>
                <img src={form.photo} alt="Uploaded" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 