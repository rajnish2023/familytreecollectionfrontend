"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetch, canEdit } from "@/app/utils/auth";
import { useTheme } from "@/context/ThemeContext";
// import LocationInput from "../../../components/LocationInput";

interface CountryCode {
  name: string;
  dial_code: string;
  code: string;
}

interface EligibleSpouse {
  _id: string;
  name: string;
}

interface Parents {
  _id: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  spouse_id?: {
    _id: string;
    name: string;
    gender: string;
    dateOfBirth: string;
  } | null;
}

interface FormData {
  name: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
  currentAddress: string;
  contactNumber: string;
  countryCode: string;
  email: string;
  occupation: string;
  photo: string;
  spouse_id: string;
  parent_ids: string[];
  children_ids: string[];
}

function toTitleCase(text: string): string {
  return text
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export default function NewMemberPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [eligibleSpouses, setEligibleSpouses] = useState<EligibleSpouse[]>([]);
  const [isLoadingSpouses, setIsLoadingSpouses] = useState(false);
  const [isPersonAdult, setIsPersonAdult] = useState(false);
  const [eligibleParents, setEligibleParents] = useState<Parents[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(false);
  const [occupationSuggestions, setOccupationSuggestions] = useState<Array<{title: string, source: string}>>([]);
  const [isLoadingOccupations, setIsLoadingOccupations] = useState(false);
  const [showOccupationDropdown, setShowOccupationDropdown] = useState(false);
  const [occupationSearchTerm, setOccupationSearchTerm] = useState("");
  const occupationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    gender: "",
    dateOfBirth: "",
    placeOfBirth: "",
    currentAddress: "",
    contactNumber: "",
    countryCode: "+91",
    email: "",
    occupation: "",
    photo: "",
    spouse_id: "",
    parent_ids: [],
    children_ids: [],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      gender: "",
      dateOfBirth: "",
      placeOfBirth: "",
      currentAddress: "",
      contactNumber: "",
      countryCode: "+91",
      email: "",
      occupation: "",
      photo: "",
      spouse_id: "",
      parent_ids: [],
      children_ids: [],
    });
    setUploadedPhotoUrl("");
    setEligibleSpouses([]);
    setIsPersonAdult(false);
    setError(null);
  };

  useEffect(() => {
    fetchCountryCodes();
    fetchEligibleParents();
  }, []);

  useEffect(() => {
    return () => {
      if (occupationTimeoutRef.current) {
        clearTimeout(occupationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (formData.dateOfBirth && formData.gender) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const isAdult =
        age > 18 || (age === 18 && monthDiff >= 0 && today.getDate() >= birthDate.getDate());
      setIsPersonAdult(isAdult);
      if (isAdult) {
        fetchEligibleSpouses();
      } else {
        setEligibleSpouses([]);
        setFormData((prev) => ({ ...prev, spouse_id: "" }));
      }
    } else {
      setIsPersonAdult(false);
      setEligibleSpouses([]);
      setFormData((prev) => ({ ...prev, spouse_id: "" }));
    }
  }, [formData.dateOfBirth, formData.gender]);

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

  const fetchEligibleSpouses = async () => {
    try {
      setIsLoadingSpouses(true);
      const response = await authenticatedFetch(
        `http://localhost:5000/api/persons/eligible-spouses?currentPersonAge=${formData.dateOfBirth}&currentPersonGender=${formData.gender}`
      );
      if (!response.ok) throw new Error("Failed to fetch eligible spouses");
      const data = await response.json();
      setEligibleSpouses(data.data || []);
    } catch (error) {
      console.error("Error fetching eligible spouses:", error);
      setEligibleSpouses([]);
    } finally {
      setIsLoadingSpouses(false);
    }
  };

  const fetchEligibleParents = async () => {
    try {
      setIsLoadingParents(true);
      const response = await authenticatedFetch("http://localhost:5000/api/persons/eligible-parents");
      if (!response.ok) throw new Error("Failed to fetch eligible parents");
      const data = await response.json();
      setEligibleParents(data.data || []);
    } catch (error) {
      console.error("Error fetching eligible parents:", error);
      setEligibleParents([]);
    } finally {
      setIsLoadingParents(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.gender || !formData.dateOfBirth || !formData.placeOfBirth) {
      setError("Please fill in all required fields.");
      return false;
    }
    if (formData.contactNumber && formData.contactNumber.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      return false;
    }
    return true;
  };

  const searchOccupations = async (query: string) => {
    if (query.length < 2) {
      setOccupationSuggestions([]);
      return;
    }

    try {
      setIsLoadingOccupations(true);
      
      // First, search in previously used occupations
      const response = await authenticatedFetch(
        `http://localhost:5000/api/persons/search-occupations?q=${encodeURIComponent(query)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const previousOccupations = (data.data || []).map((occ: string) => ({
          title: occ,
          source: "previous"
        }));
        
        // Then search external API
        const apiResponse = await fetch(
          `https://api.api-ninjas.com/v1/celebrity?name=${encodeURIComponent(query)}`,
          {
            headers: {
              'X-Api-Key': 'YOUR_API_KEY' // Replace with actual API key
            }
          }
        );
        
        let apiOccupations: Array<{title: string, source: string}> = [];
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          apiOccupations = apiData.slice(0, 3).map((celebrity: any) => ({
            title: celebrity.occupation || celebrity.name,
            source: "api"
          }));
        }
        
        // Combine and deduplicate
        const allOccupations = [...previousOccupations, ...apiOccupations];
        const uniqueOccupations = allOccupations.filter((occ, index, self) => 
          index === self.findIndex(t => t.title.toLowerCase() === occ.title.toLowerCase())
        );
        
        setOccupationSuggestions(uniqueOccupations.slice(0, 5));
      }
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
    setFormData(prev => ({ ...prev, occupation: value }));
    
    if (occupationTimeoutRef.current) {
      clearTimeout(occupationTimeoutRef.current);
    }
    
    occupationTimeoutRef.current = setTimeout(() => {
      searchOccupations(value);
    }, 300);
  };

  const selectOccupation = (occupation: string) => {
    setFormData(prev => ({ ...prev, occupation: occupation }));
    setOccupationSearchTerm(occupation);
    setShowOccupationDropdown(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    try {
      setIsUploading(true);
      const response = await authenticatedFetch("http://localhost:5000/api/upload/photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setUploadedPhotoUrl(data.url);
    } catch (error) {
      setError("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await authenticatedFetch("http://localhost:5000/api/persons", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          photo: uploadedPhotoUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add member");
      }

      setSuccess("Family member added successfully!");
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add member");
    } finally {
      setIsLoading(false);
    }
  };

  const getAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? age - 1
      : age;
  };

  if (!canEdit()) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to add new family members. Only admins and sub-admins can perform this action.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Add New Family Member</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill in the details below to add a new member to your family tree.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">{success}</p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setSuccess(null);
                  resetForm();
                }}
                className="px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800 border border-green-200 dark:border-green-700 rounded-md hover:bg-green-200 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Another
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/family-tree")}
                className="px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 border border-blue-200 dark:border-blue-700 rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                View Tree
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-lg font-medium text-card-foreground mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-foreground">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-foreground">
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="placeOfBirth" className="block text-sm font-medium text-foreground">
                Place of Birth
              </label>
              <input
                type="text"
                id="placeOfBirth"
                name="placeOfBirth"
                required
                value={formData.placeOfBirth}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-lg font-medium text-card-foreground mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="currentAddress" className="block text-sm font-medium text-foreground">
                Current Address
              </label>
              <input
                type="text"
                id="currentAddress"
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="countryCode" className="block text-sm font-medium text-foreground">
                Country Code
              </label>
              <select
                id="countryCode"
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                disabled={isLoadingCountries}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              >
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
            </div>
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-foreground">
                Mobile Number <span className="text-muted-foreground">(Optional)</span>
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  {formData.countryCode}
                </span>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number (optional)"
                  maxLength={10}
                  className="flex-1 block w-full rounded-none rounded-r-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              {formData.contactNumber && formData.contactNumber.length !== 10 && (
                <p className="mt-1 text-sm text-destructive">
                  Mobile number must be exactly 10 digits
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email <span className="text-muted-foreground">(Optional)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-lg font-medium text-card-foreground mb-4">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label htmlFor="occupation" className="block text-sm font-medium text-foreground">
                Occupation <span className="text-muted-foreground">(Optional)</span>
              </label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={occupationSearchTerm}
                onChange={handleOccupationInputChange}
                onFocus={() => setShowOccupationDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowOccupationDropdown(false), 150);
                }}
                placeholder="Start typing to search occupations..."
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {showOccupationDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                  {isLoadingOccupations && (
                    <div className="px-3 py-2 text-sm flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2 text-foreground"></div>
                      Searching occupations...
                    </div>
                  )}
                  {!isLoadingOccupations && occupationSuggestions.length === 0 && occupationSearchTerm.length >= 2 && (
                    <div className="px-3 py-2 text-sm text-foreground">
                      No suggestions found. You can still enter your custom occupation.
                    </div>
                  )}
                  {occupationSuggestions.map((occupation, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent focus:bg-accent focus:outline-none flex items-center justify-between text-foreground"
                      onClick={() => selectOccupation(occupation.title)}
                    >
                      <span>{occupation.title}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          occupation.source === "previous"
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : occupation.source === "api"
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {occupation.source === "previous"
                          ? "Used before"
                          : occupation.source === "api"
                          ? "Suggested"
                          : "Fallback"}
                      </span>
                    </button>
                  ))}
                  {occupationSearchTerm.length >= 2 &&
                    !occupationSuggestions.some((occ) =>
                      occ.title.toLowerCase() === occupationSearchTerm.toLowerCase()
                    ) && (
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent focus:bg-accent focus:outline-none border-t border-border"
                        onClick={() => selectOccupation(occupationSearchTerm)}
                      >
                        <span className="text-sm text-foreground">Add "{occupationSearchTerm}"</span>
                        <span className="text-xs text-muted-foreground ml-2">(Custom occupation)</span>
                      </button>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-lg font-medium text-card-foreground mb-4">Photo</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-foreground">
                Upload Photo
              </label>
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handleFileUpload}
                className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Accepted formats: JPG, JPEG, PNG, GIF. Maximum size: 5MB
              </p>
            </div>
            {isUploading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Uploading image...</span>
              </div>
            )}
            {uploadedPhotoUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-foreground mb-2">Uploaded Image:</p>
                <div className="relative inline-block">
                  <img
                    src={uploadedPhotoUrl}
                    alt="Uploaded photo"
                    className="w-32 h-32 object-cover rounded-lg border border-border"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-lg font-medium text-card-foreground mb-4">Family Relations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="Parents" className="block text-sm font-medium text-foreground">
                Parents
              </label>
              <select
                id="parent_ids"
                name="parent_ids"
                value={formData.parent_ids[0]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    parent_ids: e.target.value ? [e.target.value] : [],
                  }))
                }
                disabled={isLoadingParents}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select parent(s) (optional)</option>
                {isLoadingParents ? (
                  <option>Loading parents...</option>
                ) : eligibleParents.length === 0 ? (
                  <option>No eligible parents available</option>
                ) : (
                  eligibleParents.map((person) => (
                    <option key={person._id} value={person._id}>
                      {person.spouse_id
                        ? `${person.name} & ${person.spouse_id.name}`
                        : `${person.name} (Single, ${person.gender})`}
                    </option>
                  ))
                )}
              </select>
              {eligibleParents.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Select a married couple or a single person over 20 as parent(s).
                </p>
              )}
            </div>
            <div>
              <label htmlFor="spouse_id" className="block text-sm font-medium text-foreground">
                Spouse
              </label>
              {!isPersonAdult ? (
                <div className="mt-1 p-3 bg-muted border border-border rounded-md">
                  <p className="text-sm text-muted-foreground">Person must be 18+ to select a spouse</p>
                </div>
              ) : (
                <select
                  id="spouse_id"
                  name="spouse_id"
                  value={formData.spouse_id}
                  onChange={handleChange}
                  disabled={isLoadingSpouses}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select spouse (optional)</option>
                  {isLoadingSpouses ? (
                    <option>Loading eligible spouses...</option>
                  ) : eligibleSpouses.length === 0 ? (
                    <option>No eligible spouses available</option>
                  ) : (
                    eligibleSpouses.map((spouse) => (
                      <option key={spouse._id} value={spouse._id}>
                        {spouse.name}
                      </option>
                    ))
                  )}
                </select>
              )}
              {isPersonAdult && eligibleSpouses.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Shows{" "}
                  {formData.gender === "Male"
                    ? "female"
                    : formData.gender === "Female"
                    ? "male"
                    : "eligible"}{" "}
                  family members who are 18+ and don't have a spouse
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Member"}
          </button>
        </div>
      </form>
    </div>
  );
}