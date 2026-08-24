"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RootState } from "@/libs/store";
import { Gender } from "@/interfaces";
import { ErrorToast } from "@/components/custom/ErrorToast";
import { successToast } from "@/components/custom/SuccessToast";
import { Search, User, Save, Loader2 } from "lucide-react";

// Shape returned by /api/user/manage (USER_SELECT).
interface ManagedUser {
  id: string; // employee id
  role: string;
  joiningDate: string | null;
  reportManagerId: string | null;
  user: {
    id: string;
    username: string;
    email: string;
    dateOfBirth: string | null;
    gender: Gender | null;
  };
}

interface FormState {
  username: string;
  email: string;
  dateOfBirth: string;
  joiningDate: string;
  gender: string;
}

const toDateInput = (d: string | null): string =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

const UserDetails = () => {
  const userId = useSelector((state: RootState) => state.dataSlice.userInfo.id);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ManagedUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const search = async () => {
    try {
      setSearching(true);
      const res = await axios.get(`/api/user/manage`, {
        params: { userId, q: query.trim() || undefined },
      });
      const { success, message, data } = res.data;
      if (!success) {
        ErrorToast(message || "Failed to search users");
        return;
      }
      setResults(data as ManagedUser[]);
    } catch (error: any) {
      ErrorToast(error?.response?.data?.message || "Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const selectMember = async (employeeId: string) => {
    try {
      // Re-fetch through the authorized endpoint so we never trust the list.
      const res = await axios.get(`/api/user/manage`, {
        params: { userId, employeeId },
      });
      const { success, message, data } = res.data;
      if (!success) {
        ErrorToast(message || "Failed to load user");
        return;
      }
      const m = data as ManagedUser;
      setSelected(m);
      setForm({
        username: m.user.username ?? "",
        email: m.user.email ?? "",
        dateOfBirth: toDateInput(m.user.dateOfBirth),
        joiningDate: toDateInput(m.joiningDate),
        gender: m.user.gender ?? "",
      });
    } catch (error: any) {
      ErrorToast(error?.response?.data?.message || "Failed to load user");
    }
  };

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  // Frontend validation mirrors the backend rules.
  const validate = (f: FormState): string | null => {
    if (f.username.trim().length < 2)
      return "Name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      return "Please enter a valid email address";
    if (f.dateOfBirth && isNaN(Date.parse(f.dateOfBirth)))
      return "Date of birth must be a valid date";
    if (f.joiningDate && isNaN(Date.parse(f.joiningDate)))
      return "Joining date must be a valid date";
    return null;
  };

  const save = async () => {
    if (!selected || !form) return;
    const err = validate(form);
    if (err) {
      ErrorToast(err);
      return;
    }
    try {
      setSaving(true);
      const res = await axios.patch(
        `/api/user/manage`,
        {
          username: form.username.trim(),
          email: form.email.trim(),
          dateOfBirth: form.dateOfBirth || undefined,
          joiningDate: form.joiningDate || undefined,
          gender: form.gender || undefined,
        },
        { params: { userId, employeeId: selected.id } },
      );
      const { success, message, data } = res.data;
      if (!success) {
        ErrorToast(message || "Failed to update user");
        return;
      }
      successToast(message || "User details updated");
      // Refresh selection + reflect changes in the list.
      const updated = data as ManagedUser;
      setSelected(updated);
      setResults((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
    } catch (error: any) {
      ErrorToast(error?.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="py-2">
      <header className="mb-6">
        <h1 className="font-gilSemiBold text-xl sm:text-2xl text-gray-900">
          User Details
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm font-gilRegular">
          Search and edit member details you're authorized to manage
        </p>
      </header>

      {/* Search bar */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search by email or username"
            className="pl-9"
          />
        </div>
        <button
          onClick={search}
          disabled={searching}
          className="flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-gilMedium text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
        >
          {searching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Results list */}
        <div className="space-y-2">
          {results.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="py-10 text-center text-gray-400 text-sm">
                Search to find members to edit.
              </CardContent>
            </Card>
          ) : (
            results.map((m) => (
              <button
                key={m.id}
                onClick={() => selectMember(m.id)}
                className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
                  selected?.id === m.id
                    ? "border-sky-400 bg-sky-50"
                    : "border-gray-200 hover:border-sky-200 hover:bg-sky-50/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center">
                    <span className="font-gilSemiBold text-black text-sm">
                      {m.user.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-gilSemiBold text-gray-900 truncate">
                      {m.user.username || "Unnamed User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {m.user.email}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Edit form */}
        <div>
          {!selected || !form ? (
            <Card className="border-2 border-dashed border-gray-200 h-full">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-50 flex items-center justify-center">
                  <User className="w-7 h-7 text-sky-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  Select a member to edit their details.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-gray-200">
              <CardContent className="py-6 space-y-4">
                <div>
                  <Label className="text-xs text-gray-600">Username</Label>
                  <Input
                    value={form.username}
                    onChange={(e) => setField("username", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">
                      Date of Birth
                    </Label>
                    <Input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setField("dateOfBirth", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">
                      Date of Joining
                    </Label>
                    <Input
                      type="date"
                      value={form.joiningDate}
                      onChange={(e) => setField("joiningDate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Gender</Label>
                  <Select
                    value={form.gender}
                    onValueChange={(v) => setField("gender", v)}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={Gender.Male}>Male</SelectItem>
                        <SelectItem value={Gender.Female}>Female</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <button
                  onClick={save}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-gilMedium text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default UserDetails;
