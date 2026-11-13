"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Send,
  FileText,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  Home,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Video,
  Info,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import ApiConfig from "@/lib/config/api-config";

interface RequiredDocItem {
  code: string;
  name: string;
  status: "verified" | "pending" | "rejected" | "missing";
  document_id: number | null;
  file_url: string | null;
}

interface DocumentSummary {
  total_required: number;
  verified_count: number;
  pending_count: number;
  rejected_count: number;
  missing_count: number;
  required_docs: RequiredDocItem[];
}

interface BeswanItem {
  beswan_id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    created_at?: string;
  };
  nama_panggilan: string | null;
  jenis_kelamin: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  has_pribadi: boolean;
  has_keluarga: boolean;
  has_alamat: boolean;
  has_sekolah: boolean;
  document_summary: DocumentSummary;
  is_data_complete: boolean;
}

interface PeriodItem {
  id: number;
  tahun: number;
  nama_periode: string;
}

export default function AssistedSubmissionPage() {
  const [periods, setPeriods] = useState<PeriodItem[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [beswanList, setBeswanList] = useState<BeswanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [docFilter, setDocFilter] = useState<string>("all"); // all, verified_only, has_verified

  // Modal states
  const [selectedBeswan, setSelectedBeswan] = useState<BeswanItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [detailedData, setDetailedData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  // Submit Modal
  const [submitModalOpen, setSubmitModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [adminNote, setAdminNote] = useState<string>("");
  const [targetStatus, setTargetStatus] = useState<"pending" | "lolos_berkas">("pending");
  const [interviewDate, setInterviewDate] = useState<string>("");
  const [interviewTime, setInterviewTime] = useState<string>("");
  const [interviewLink, setInterviewLink] = useState<string>("");

  // Feedback state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alreadyAppliedNotice, setAlreadyAppliedNotice] = useState<any>(null);

  // Base URL & Token
  const getAuthToken = () => {
    if (typeof window === "undefined") return "";
    return (
      localStorage.getItem("bersekolah_auth_token") ||
      localStorage.getItem("bersekolah_token") ||
      localStorage.getItem("token") ||
      ""
    );
  };

  const getBaseURL = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bersekolah_api_url");
      if (stored) return stored;
    }
    return ApiConfig.baseURL;
  };

  // 1. Fetch Daftar Periode
  const fetchPeriods = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${getBaseURL()}/admin/applications/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Gagal mengambil data periode");

      const json = await res.json();
      if (json.success && json.data?.periods) {
        setPeriods(json.data.periods);
        if (json.data.periods.length > 0 && !selectedPeriodId) {
          setSelectedPeriodId(String(json.data.periods[0].id));
        }
      }
    } catch (err: any) {
      console.error("Error fetching periods:", err);
    }
  };

  // 2. Fetch Peserta Tanpa Aplikasi
  const fetchBeswans = async (periodId?: string, searchOverride?: string) => {
    const targetPeriod = periodId || selectedPeriodId;
    if (!targetPeriod) return;

    setLoading(true);
    setErrorMessage(null);
    setAlreadyAppliedNotice(null);

    try {
      const token = getAuthToken();
      const url = new URL(`${getBaseURL()}/admin/assisted-submission/beswan-without-application`);
      url.searchParams.set("period_id", targetPeriod);
      const querySearch = searchOverride !== undefined ? searchOverride : search;
      if (querySearch.trim()) url.searchParams.set("search", querySearch.trim());
      if (docFilter !== "all") url.searchParams.set("doc_filter", docFilter);
      url.searchParams.set("per_page", "100");

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const json = await res.json();
      if (json.success) {
        setBeswanList(json.data || []);
        if (json.already_applied) {
          setAlreadyAppliedNotice(json.already_applied);
        }
      } else {
        setErrorMessage(json.message || "Gagal memuat peserta");
      }
    } catch (err: any) {
      console.error("Error fetching beswan list:", err);
      setErrorMessage("Koneksi gagal ke server backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriodId) {
      fetchBeswans(selectedPeriodId);
    }
  }, [selectedPeriodId, docFilter]);

  // Handle Search Debounce / Trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBeswans(selectedPeriodId, search);
  };

  // 3. Open Detail Modal
  const openDetailModal = async (beswan: BeswanItem) => {
    setSelectedBeswan(beswan);
    setDetailModalOpen(true);
    setDetailLoading(true);
    setDetailedData(null);

    try {
      const token = getAuthToken();
      const res = await fetch(
        `${getBaseURL()}/admin/assisted-submission/beswan/${beswan.beswan_id}/detail?period_id=${selectedPeriodId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const json = await res.json();
      if (json.success) {
        setDetailedData(json.data);
      }
    } catch (err) {
      console.error("Error fetching detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // 4. Open Submit Modal
  const openSubmitModal = (beswan: BeswanItem) => {
    setSelectedBeswan(beswan);
    setAdminNote(
      "Peserta telah memenuhi persyaratan dan dibantu submit via Admin Assisted karena kendala akses pendaftaran."
    );
    setTargetStatus("pending");
    setInterviewDate("");
    setInterviewTime("");
    setInterviewLink("");
    setSubmitModalOpen(true);
  };

  // 5. Execute Submit
  const handleExecuteSubmit = async () => {
    if (!selectedBeswan || !selectedPeriodId) return;

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const token = getAuthToken();
      const body: any = {
        beswan_id: selectedBeswan.beswan_id,
        beasiswa_period_id: parseInt(selectedPeriodId, 10),
        admin_submission_note: adminNote,
        status: targetStatus,
      };

      if (targetStatus === "lolos_berkas") {
        if (interviewDate) body.interview_date = interviewDate;
        if (interviewTime) body.interview_time = interviewTime;
        if (interviewLink) body.interview_link = interviewLink;
      }

      const res = await fetch(`${getBaseURL()}/admin/assisted-submission`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMessage(
          `Aplikasi beasiswa berhasil dibuat untuk ${selectedBeswan.user.name}! Peserta sekarang dapat mengakses jadwal wawancara & status seleksi.`
        );
        setSubmitModalOpen(false);
        // Refresh list
        fetchBeswans(selectedPeriodId);
      } else {
        setErrorMessage(json.message || "Gagal melakukan submission");
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMessage("Terjadi kesalahan jaringan saat mengirim data");
    } finally {
      setSubmitting(false);
    }
  };

  // Real-time client-side filter
  const filteredBeswanList = useMemo(() => {
    if (!search.trim()) return beswanList;

    const term = search.trim().toLowerCase();
    const cleanIdTerm = term.replace(/^#/, "");

    return beswanList.filter((item) => {
      const name = (item.user?.name || "").toLowerCase();
      const email = (item.user?.email || "").toLowerCase();
      const phone = (item.user?.phone || "").toLowerCase();
      const nickname = (item.nama_panggilan || "").toLowerCase();
      const tempatLahir = (item.tempat_lahir || "").toLowerCase();
      const idStr = String(item.beswan_id);

      return (
        name.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        nickname.includes(term) ||
        tempatLahir.includes(term) ||
        idStr === cleanIdTerm ||
        idStr.includes(cleanIdTerm)
      );
    });
  }, [beswanList, search]);

  // Summary KPI Calculations
  const metrics = useMemo(() => {
    const total = beswanList.length;
    const fullyVerified = beswanList.filter(
      (b) => b.document_summary.verified_count === b.document_summary.total_required
    ).length;
    const partiallyVerified = beswanList.filter(
      (b) =>
        b.document_summary.verified_count > 0 &&
        b.document_summary.verified_count < b.document_summary.total_required
    ).length;
    const zeroVerified = beswanList.filter((b) => b.document_summary.verified_count === 0).length;

    return { total, fullyVerified, partiallyVerified, zeroVerified };
  }, [beswanList]);

  const selectedPeriodObj = periods.find((p) => String(p.id) === selectedPeriodId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-sm mb-2">
              <UserCheck className="w-4 h-4" />
              Fitur Administrasi Sistem
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Assisted Submission</h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Bantu kirimkan aplikasi beasiswa atas nama calon penerima yang mengalami kendala teknis atau gangguan
              website di masa penutupan, sehingga mereka dapat lanjut ke tahap wawancara & seleksi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBeswans()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Segarkan Data
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <Alert className="border-emerald-500 bg-emerald-50 text-emerald-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <AlertTitle className="font-semibold">Submission Berhasil!</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{successMessage}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = "/dashboard/seleksi")}
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-100 ml-4"
            >
              Lihat di Seleksi Aplikasi <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Peringatan</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {alreadyAppliedNotice && (
        <Alert className="border-blue-400 bg-blue-50 text-blue-900 shadow-sm">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle className="font-semibold text-blue-950">Peserta Sudah Memiliki Aplikasi</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1.5">
            <div className="text-sm text-blue-800">
              Peserta <strong className="text-blue-950">{alreadyAppliedNotice.name}</strong> (ID #{alreadyAppliedNotice.beswan_id}) sudah memiliki aplikasi pada periode ini dengan status{" "}
              <Badge variant="outline" className="font-mono text-xs uppercase bg-white border-blue-300 text-blue-900 mx-1">
                {alreadyAppliedNotice.status}
              </Badge>
              {alreadyAppliedNotice.submission_method === "admin_assisted" && (
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs border-0 font-medium mr-1">
                  Admin Assisted
                </Badge>
              )}
              . Oleh karena itu, peserta tidak lagi ditampilkan di daftar "Peserta Tanpa Aplikasi".
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => (window.location.href = "/dashboard/seleksi")}
              className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            >
              Cek di Seleksi Aplikasi <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-slate-500">
              Belum Memiliki Aplikasi
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">{metrics.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Peserta terdaftar di sistem tanpa record aplikasi</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-emerald-700">
              6 Dokumen Verified
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-700">{metrics.fullyVerified}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-600">Sangat siap untuk diproses ke wawancara</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-amber-700">
              Dokumen Sebagian
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-700">{metrics.partiallyVerified}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-amber-600">Memiliki minimal 1 dokumen terverifikasi</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-slate-500">
              Dokumen Kosong / Belum
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-700">{metrics.zeroVerified}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Perlu unggah dokumen terlebih dahulu</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Periode */}
            <div className="md:col-span-4 space-y-1.5">
              <Label htmlFor="period-select" className="text-xs font-semibold text-slate-700">
                Target Periode Beasiswa
              </Label>
              <Select value={selectedPeriodId} onValueChange={(val) => setSelectedPeriodId(val)}>
                <SelectTrigger id="period-select">
                  <SelectValue placeholder="Pilih Periode Beasiswa" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nama_periode} ({p.tahun})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Status Dokumen */}
            <div className="md:col-span-3 space-y-1.5">
              <Label htmlFor="doc-filter" className="text-xs font-semibold text-slate-700">
                Status Dokumen
              </Label>
              <Select value={docFilter} onValueChange={(val) => setDocFilter(val)}>
                <SelectTrigger id="doc-filter">
                  <SelectValue placeholder="Semua Dokumen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status Dokumen</SelectItem>
                  <SelectItem value="verified_only">Hanya 6 Dokumen Terverifikasi</SelectItem>
                  <SelectItem value="has_verified">Minimal 1 Dokumen Terverifikasi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="md:col-span-4 space-y-1.5">
              <Label htmlFor="search-input" className="text-xs font-semibold text-slate-700">
                Pencarian Peserta
              </Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="search-input"
                  placeholder="Cari ID (#1048), nama lengkap, email, atau telepon..."
                  className="pl-9 pr-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setAlreadyAppliedNotice(null);
                      fetchBeswans(selectedPeriodId, "");
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Hapus pencarian"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Button */}
            <div className="md:col-span-1">
              <Button type="submit" variant="default" className="w-full" disabled={loading}>
                Cari
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">
                Peserta Tanpa Aplikasi — {selectedPeriodObj ? selectedPeriodObj.nama_periode : "Semua Periode"}
              </CardTitle>
              <CardDescription>
                Daftar akun peserta yang belum mengirimkan aplikasi pada periode terpilih.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 font-mono text-xs">
                {filteredBeswanList.length} Peserta Ditampilkan
              </Badge>
              {filteredBeswanList.length !== beswanList.length && (
                <Badge variant="secondary" className="px-2 py-0.5 text-xs text-slate-500">
                  (dari total {beswanList.length})
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70">
                  <TableHead className="w-12 text-center">No</TableHead>
                  <TableHead>Peserta & Kontak</TableHead>
                  <TableHead>Data Profil</TableHead>
                  <TableHead>Kelengkapan Form</TableHead>
                  <TableHead>6 Dokumen Wajib</TableHead>
                  <TableHead className="text-right pr-6">Aksi Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                      Memuat daftar peserta...
                    </TableCell>
                  </TableRow>
                ) : filteredBeswanList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                      {search ? (
                        <div className="max-w-md mx-auto">
                          <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold text-slate-700">Tidak ada peserta yang cocok dengan "{search}"</p>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            Halaman ini hanya menampilkan peserta yang <strong>BELUM</strong> memiliki aplikasi pada periode terpilih.
                            Jika peserta sudah pernah dikirimkan aplikasinya, silakan cari di menu <strong>Seleksi Aplikasi</strong>.
                          </p>
                          <div className="mt-4 flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearch("");
                                setAlreadyAppliedNotice(null);
                                fetchBeswans(selectedPeriodId, "");
                              }}
                            >
                              Reset Pencarian
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => (window.location.href = "/dashboard/seleksi")}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              Cek Seleksi Aplikasi <ExternalLink className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                          <p className="font-semibold text-slate-700">Tidak ada peserta yang perlu dibantu</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Semua peserta terdaftar sudah memiliki aplikasi pada periode ini atau tidak ada data yang cocok
                            dengan filter.
                          </p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBeswanList.map((item, index) => {
                    const verifiedCount = item.document_summary.verified_count;
                    const totalRequired = item.document_summary.total_required; // 6
                    const isAllVerified = verifiedCount === totalRequired;

                    return (
                      <TableRow key={item.beswan_id} className="hover:bg-slate-50/60 transition-colors">
                        <TableCell className="text-center text-slate-400 font-mono text-xs">{index + 1}</TableCell>

                        {/* Nama & Kontak */}
                        <TableCell>
                          <div className="font-semibold text-slate-900">{item.user.name}</div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span>{item.user.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="w-3 h-3" />
                            <span>{item.user.phone || "-"}</span>
                          </div>
                        </TableCell>

                        {/* Profil */}
                        <TableCell>
                          <div className="text-xs">
                            <span className="text-slate-500">Panggilan: </span>
                            <span className="font-medium text-slate-700">{item.nama_panggilan || "-"}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.jenis_kelamin || "-"} • {item.tempat_lahir || "-"}
                          </div>
                        </TableCell>

                        {/* Kelengkapan Form */}
                        <TableCell>
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-1.5">
                              {item.has_keluarga ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-slate-300" />
                              )}
                              <span className={item.has_keluarga ? "text-slate-700" : "text-slate-400"}>
                                Keluarga
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {item.has_alamat ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-slate-300" />
                              )}
                              <span className={item.has_alamat ? "text-slate-700" : "text-slate-400"}>Alamat</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {item.has_sekolah ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-slate-300" />
                              )}
                              <span className={item.has_sekolah ? "text-slate-700" : "text-slate-400"}>Sekolah</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Progress 6 Dokumen */}
                        <TableCell>
                          <div className="space-y-1.5 min-w-[140px]">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-slate-700">
                                {verifiedCount}/{totalRequired} Verified
                              </span>
                              {isAllVerified ? (
                                <Badge className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0 border-0">
                                  Lengkap
                                </Badge>
                              ) : verifiedCount > 0 ? (
                                <Badge className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0 border-0">
                                  Sebagian
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-slate-500 text-[10px] px-1.5 py-0">
                                  Kosong
                                </Badge>
                              )}
                            </div>
                            <Progress value={(verifiedCount / totalRequired) * 100} className="h-1.5" />
                            {/* Visual pill badges for the 6 docs */}
                            <TooltipProvider>
                              <div className="flex items-center gap-1 pt-0.5">
                                {item.document_summary.required_docs.map((doc) => {
                                  const colorClass =
                                    doc.status === "verified"
                                      ? "bg-emerald-500"
                                      : doc.status === "pending"
                                      ? "bg-amber-400"
                                      : doc.status === "rejected"
                                      ? "bg-rose-500"
                                      : "bg-slate-200";

                                  return (
                                    <Tooltip key={doc.code}>
                                      <TooltipTrigger asChild>
                                        <div className={`w-2.5 h-2.5 rounded-full ${colorClass} cursor-pointer`} />
                                      </TooltipTrigger>
                                      <TooltipContent className="text-xs">
                                        <p className="font-semibold">{doc.name}</p>
                                        <p className="capitalize">Status: {doc.status}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                              </div>
                            </TooltipProvider>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetailModal(item)}
                              className="h-8 text-xs text-slate-600 hover:text-slate-900"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Detail
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openSubmitModal(item)}
                              className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5 mr-1" />
                              Bantu Submit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL 1: Detail Lengkap Peserta */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              Detail Calon Beswan: {selectedBeswan?.user.name}
            </DialogTitle>
            <DialogDescription>
              Tinjau informasi profil, keluarga, alamat, dan status dokumen sebelum submit.
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-12 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
              Memuat detail lengkap...
            </div>
          ) : detailedData ? (
            <Tabs defaultValue="dokumen" className="w-full mt-2">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="dokumen">Dokumen (6 Wajib)</TabsTrigger>
                <TabsTrigger value="pribadi">Profil & Sekolah</TabsTrigger>
                <TabsTrigger value="keluarga">Keluarga</TabsTrigger>
                <TabsTrigger value="alamat">Alamat Lengkap</TabsTrigger>
              </TabsList>

              {/* TAB 1: Dokumen Wajib */}
              <TabsContent value="dokumen" className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detailedData.document_summary?.required_docs?.map((doc: RequiredDocItem) => {
                    const statusColor =
                      doc.status === "verified"
                        ? "border-emerald-200 bg-emerald-50/50"
                        : doc.status === "pending"
                        ? "border-amber-200 bg-amber-50/50"
                        : doc.status === "rejected"
                        ? "border-rose-200 bg-rose-50/50"
                        : "border-slate-200 bg-slate-50/40";

                    return (
                      <div key={doc.code} className={`p-3 rounded-lg border ${statusColor} space-y-1.5`}>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-xs text-slate-800">{doc.name}</span>
                          <Badge
                            className={`text-[10px] capitalize ${
                              doc.status === "verified"
                                ? "bg-emerald-600 text-white"
                                : doc.status === "pending"
                                ? "bg-amber-500 text-white"
                                : doc.status === "rejected"
                                ? "bg-rose-600 text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        {doc.file_url ? (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 underline pt-1 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" /> Buka File Dokumen
                          </a>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">File belum diunggah</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* TAB 2: Profil & Sekolah */}
              <TabsContent value="pribadi" className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-xs text-slate-500">Nama Lengkap</Label>
                    <p className="font-medium text-slate-800">{detailedData.user?.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Email Akun</Label>
                    <p className="font-medium text-slate-800">{detailedData.user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Nomor Telepon</Label>
                    <p className="font-medium text-slate-800">{detailedData.user?.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Nama Panggilan</Label>
                    <p className="font-medium text-slate-800">{detailedData.beswan?.nama_panggilan || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Tempat, Tanggal Lahir</Label>
                    <p className="font-medium text-slate-800">
                      {detailedData.beswan?.tempat_lahir || "-"},{" "}
                      {detailedData.beswan?.tanggal_lahir || "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Jenis Kelamin / Agama</Label>
                    <p className="font-medium text-slate-800">
                      {detailedData.beswan?.jenis_kelamin || "-"} • {detailedData.beswan?.agama || "-"}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Data Pendidikan / Sekolah</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-xs text-slate-500">Asal Sekolah</Label>
                      <p className="font-medium text-slate-800">{detailedData.sekolah?.asal_sekolah || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Daerah Sekolah</Label>
                      <p className="font-medium text-slate-800">{detailedData.sekolah?.daerah_sekolah || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Jurusan</Label>
                      <p className="font-medium text-slate-800">{detailedData.sekolah?.jurusan || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Tingkat Kelas</Label>
                      <p className="font-medium text-slate-800">{detailedData.sekolah?.tingkat_kelas || "-"}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: Keluarga */}
              <TabsContent value="keluarga" className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                    <h5 className="font-semibold text-xs text-slate-700">Data Ayah</h5>
                    <div>
                      <Label className="text-xs text-slate-500">Nama Ayah</Label>
                      <p className="font-medium">{detailedData.keluarga?.nama_ayah || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Pekerjaan</Label>
                      <p className="font-medium">{detailedData.keluarga?.pekerjaan_ayah || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Penghasilan</Label>
                      <p className="font-medium">{detailedData.keluarga?.penghasilan_ayah || "-"}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                    <h5 className="font-semibold text-xs text-slate-700">Data Ibu</h5>
                    <div>
                      <Label className="text-xs text-slate-500">Nama Ibu</Label>
                      <p className="font-medium">{detailedData.keluarga?.nama_ibu || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Pekerjaan</Label>
                      <p className="font-medium">{detailedData.keluarga?.pekerjaan_ibu || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Penghasilan</Label>
                      <p className="font-medium">{detailedData.keluarga?.penghasilan_ibu || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm pt-2">
                  <div>
                    <Label className="text-xs text-slate-500">Jumlah Saudara Kandung</Label>
                    <p className="font-medium">{detailedData.keluarga?.jumlah_saudara_kandung || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Jumlah Tanggungan</Label>
                    <p className="font-medium">{detailedData.keluarga?.jumlah_tanggungan || "-"}</p>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 4: Alamat */}
              <TabsContent value="alamat" className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <Label className="text-xs text-slate-500">Alamat Lengkap</Label>
                    <p className="font-medium text-slate-800">{detailedData.alamat?.alamat_lengkap || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">RT / RW</Label>
                    <p className="font-medium">
                      {detailedData.alamat?.rt || "-"} / {detailedData.alamat?.rw || "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Kelurahan / Desa</Label>
                    <p className="font-medium">{detailedData.alamat?.kelurahan_desa || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Kecamatan</Label>
                    <p className="font-medium">{detailedData.alamat?.kecamatan || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Kota / Kabupaten</Label>
                    <p className="font-medium">{detailedData.alamat?.kota_kabupaten || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Provinsi</Label>
                    <p className="font-medium">{detailedData.alamat?.provinsi || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Kode Pos</Label>
                    <p className="font-medium">{detailedData.alamat?.kode_pos || "-"}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : null}

          <DialogFooter className="border-t pt-4 mt-2">
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Tutup
            </Button>
            {selectedBeswan && (
              <Button
                onClick={() => {
                  setDetailModalOpen(false);
                  openSubmitModal(selectedBeswan);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Send className="w-4 h-4 mr-1.5" /> Lanjut Bantu Submit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Konfirmasi Assisted Submission */}
      <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-700">
              <UserCheck className="w-5 h-5" /> Konfirmasi Assisted Submission
            </DialogTitle>
            <DialogDescription>
              Aplikasi beasiswa resmi akan dibuatkan atas nama peserta untuk periode{" "}
              <strong>{selectedPeriodObj?.nama_periode}</strong>.
            </DialogDescription>
          </DialogHeader>

          {selectedBeswan && (
            <div className="space-y-4 py-2">
              {/* Ringkasan Calon */}
              <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-indigo-900 font-semibold">{selectedBeswan.user.name}</span>
                  <Badge variant="outline" className="bg-white text-indigo-800 font-mono text-[10px]">
                    ID Beswan #{selectedBeswan.beswan_id}
                  </Badge>
                </div>
                <div className="text-slate-600">{selectedBeswan.user.email} • {selectedBeswan.user.phone}</div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-slate-500">Status 6 Dokumen:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedBeswan.document_summary.verified_count}/
                    {selectedBeswan.document_summary.total_required} Terverifikasi
                  </span>
                </div>
              </div>

              {/* Status Pilihan Awal */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Status Aplikasi Awal</Label>
                <Select
                  value={targetStatus}
                  onValueChange={(val: "pending" | "lolos_berkas") => setTargetStatus(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Pending (Menunggu Review Berkas)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="lolos_berkas">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Lolos Berkas & Siap Wawancara</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-400">
                  Pilih "Lolos Berkas" jika peserta ini sudah terkonfirmasi lulus berkas dan ingin langsung diatur jadwal
                  wawancaranya.
                </p>
              </div>

              {/* Jadwal Wawancara Opsional jika lolos_berkas */}
              {targetStatus === "lolos_berkas" && (
                <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 space-y-3">
                  <div className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-blue-600" />
                    Pengaturan Jadwal Wawancara (Opsional)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] text-blue-800">Tanggal Wawancara</Label>
                      <Input
                        type="date"
                        className="h-8 text-xs bg-white"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-blue-800">Jam Mulai (HH:MM)</Label>
                      <Input
                        type="time"
                        className="h-8 text-xs bg-white"
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] text-blue-800">Tautan Wawancara (Google Meet / Zoom)</Label>
                    <Input
                      type="url"
                      placeholder="https://meet.google.com/..."
                      className="h-8 text-xs bg-white"
                      value={interviewLink}
                      onChange={(e) => setInterviewLink(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Catatan Admin */}
              <div className="space-y-1.5">
                <Label htmlFor="admin-note" className="text-xs font-semibold text-slate-700">
                  Catatan Admin (Audit Trail)
                </Label>
                <Textarea
                  id="admin-note"
                  rows={2}
                  className="text-xs"
                  placeholder="Alasan dilakukan assisted submission..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>

              {/* Peringatan Audit */}
              <div className="flex items-start gap-2 p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Sistem akan mencatat identitas Admin Anda sebagai pengirim aplikasi (audit trail). Duplikasi aplikasi
                  pada periode yang sama otomatis dicegah.
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSubmitModalOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button
              onClick={handleExecuteSubmit}
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Mengirim...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Konfirmasi & Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

