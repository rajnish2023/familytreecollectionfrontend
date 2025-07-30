"use client";

import React, { useState, useEffect } from "react";
import { authenticatedFetch, canManageUsers, getAuthData } from "@/app/utils/auth";
import { API_ENDPOINTS } from "@/app/config/api";
import InviteFamilyMemberForm from "@/components/InviteFamilyMemberForm";
import { useTheme } from "@/context/ThemeContext";

interface FamilyMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function ManageUsersPage() {
  const { theme } = useTheme();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const currentUser = getAuthData();
  const [allPersons, setAllPersons] = useState<any[]>([]);
  const [loadingPersons, setLoadingPersons] = useState(true);

  // Check if user can manage users
  if (!canManageUsers()) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to manage users. Only admins can perform this action.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchFamilyMembers();
    fetchAllPersons();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(API_ENDPOINTS.users.familyMembers);
      if (!response.ok) throw new Error("Failed to fetch family members");
      
      const data = await response.json();
      setFamilyMembers(data.data || []);
    } catch (error) {
      setError("Failed to load family members");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPersons = async () => {
    try {
      setLoadingPersons(true);
      const response = await authenticatedFetch(API_ENDPOINTS.persons.all);
      if (!response.ok) throw new Error('Failed to fetch family members');
      const data = await response.json();
      setAllPersons(data.data || []);
    } catch (error) {
      setError('Failed to load all family members');
      console.error('Error:', error);
    } finally {
      setLoadingPersons(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    const userToUpdate = familyMembers.find(member => member._id === userId);
    const adminCount = familyMembers.filter(member => member.role === 'admin').length;
    
    if (userToUpdate?.role === 'admin' && newRole !== 'admin' && adminCount <= 1) {
      setError("Cannot demote the last admin. Please promote another user to admin first.");
      return;
    }
    
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.users.updateRole(userId), {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update role");
      }

      setSuccess("User role updated successfully");
      fetchFamilyMembers(); // Refresh the list
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update role");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    const userToRemove = familyMembers.find(member => member._id === userId);
    const adminCount = familyMembers.filter(member => member.role === 'admin').length;
    
    // Prevent current user from removing themselves
    if (userId === currentUser?._id) {
      setError("Cannot remove yourself from the family. Your role can only be changed by another admin.");
      return;
    }
    
    if (userToRemove?.role === 'admin' && adminCount <= 1) {
      setError("Cannot remove the last admin. Please promote another user to admin first.");
      return;
    }
    
    if (!confirm("Are you sure you want to remove this user from the family?")) {
      return;
    }

    try {
      const response = await authenticatedFetch(API_ENDPOINTS.users.removeUser(userId), {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove user");
      }

      setSuccess("User removed from family successfully");
      fetchFamilyMembers(); // Refresh the list
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to remove user");
    }
  };

  const handleDeletePerson = async (personId: string, name: string) => {
    // Check if this person has an email that matches the current user
    const personToDelete = allPersons.find(person => person._id === personId);
    
    if (personToDelete?.email === currentUser?.email) {
      setError("Cannot delete yourself from the family tree. This can only be done by another admin.");
      return;
    }
    
    if (!confirm(`Are you sure you want to permanently delete ${name} from the family tree? This will remove all their relations as well.`)) {
      return;
    }
    try {
      const response = await authenticatedFetch(API_ENDPOINTS.persons.delete(personId), {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete person');
      }
      setSuccess('Family member deleted from tree and relations cleaned up.');
      fetchAllPersons();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete person');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading family members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Manage Access</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Invite new family members and manage their roles.
            </p>
            {currentUser && (
              <p className="mt-1 text-xs text-muted-foreground">
                Your role: <span className="font-medium text-primary">
                  {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'sub-admin' ? 'Sub-Admin' : 'Viewer'}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={() => setShowInviteForm(true)}
            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Invite Member
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">{success}</p>
        </div>
      )}

      {inviteSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">{inviteSuccess}</p>
        </div>
      )}

      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium text-card-foreground">Family Members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {familyMembers.map((member) => (
                <tr key={member._id} className="hover:bg-accent">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.role === 'admin' 
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' 
                        : member.role === 'sub-admin'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}>
                      {member.role === 'admin' ? 'Admin' : member.role === 'sub-admin' ? 'Sub-Admin' : 'Viewer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <div className="flex space-x-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleUpdate(member._id, e.target.value)}
                        disabled={member._id === currentUser?._id}
                        className="text-xs border border-input bg-background rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="sub-admin">Sub-Admin</option>
                        <option value="admin">Admin</option>
                      </select>
                      {member._id !== currentUser?._id && (
                        <button
                          onClick={() => handleRemoveUser(member._id)}
                          className="text-xs text-destructive hover:text-destructive/80"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 bg-card rounded-lg border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium text-card-foreground">Family Tree Members</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage family members in the tree (this will also remove them from the tree)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {loadingPersons ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-muted-foreground">
                    Loading family members...
                  </td>
                </tr>
              ) : allPersons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-muted-foreground">
                    No family members found
                  </td>
                </tr>
              ) : (
                allPersons.map((person) => (
                  <tr key={person._id} className="hover:bg-accent">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {person.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {person.email || 'No email'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {person.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {person.email !== currentUser?.email && (
                        <button
                          onClick={() => handleDeletePerson(person._id, person.name)}
                          className="text-xs text-destructive hover:text-destructive/80"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showInviteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-card-foreground">Invite Family Member</h2>
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <InviteFamilyMemberForm
                onSuccess={(message) => {
                  setInviteSuccess(message);
                  setShowInviteForm(false);
                  fetchFamilyMembers();
                }}
                hideTitle
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 