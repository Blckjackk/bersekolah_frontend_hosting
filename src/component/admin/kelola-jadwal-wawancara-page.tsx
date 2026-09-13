"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  Link as LinkIcon,
  RefreshCw,
  FileText,
  Users
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

// ============================================================
// Types
// ============================================================

interface Beswan {
  id: number
  nama_panggilan: string
  user?: { id: number; name: string; email: string }
}

interface ScheduleItem {
  id: number
  beswan_id: number
  application_id: number | null
  tanggal_wawancara: string
  jam_mulai: string
  jam_selesai: string | null
  lokasi_atau_link: string | null
  catatan: string | null
  status: "scheduled" | "done" | "cancelled" | "rescheduled"
  beswan?: { id: number; nama_panggilan: string; user?: { id: number; name: string; email: string } }
  application?: { id: number; status: string } | null
}

const API_BASE = import.meta.env.PUBLIC_API_BASE_URL

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("bersekolah_auth_token")}`,
  Accept: "application/json",
  "Content-Type": "application/json",
})

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
]

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Terjadwal", color: "bg-blue-100 text-blue-800" },
  { value: "done", label: "Selesai", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Dibatalkan", color: "bg-red-100 text-red-800" },
  { value: "rescheduled", label: "Dijadwalkan Ulang", color: "bg-yellow-100 text-yellow-800" },
]

const getStatusBadge = (status: string) => {
  const opt = STATUS_OPTIONS.find(s => s.value === status)
  if (!opt) return <Badge variant="outline">{status}</Badge>
  return <Badge className={`${opt.color} border-0 font-medium`}>{opt.label}</Badge>
}

// ============================================================
// Main Component
// ============================================================

export default function KelolaJadwalWawancaraPage() {
  const { toast } = useToast()

  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [beswanList, setBeswanList] = useState<Beswan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingBeswan, setIsLoadingBeswan] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [view, setView] = useState<"list" | "calendar">("list")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [showDialog, setShowDialog] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [beswanSearch, setBeswanSearch] = useState("")
  const [showBeswanDropdown, setShowBeswanDropdown] = useState(false)
  const [selectedBeswan, setSelectedBeswan] = useState<Beswan | null>(null)

  const emptyForm = {
    beswan_id: "", tanggal_wawancara: "", jam_mulai: "",
    jam_selesai: "", lokasi_atau_link: "", catatan: "", status: "scheduled",
  }
  const [form, setForm] = useState(emptyForm)

  // ─── Fetch ─────────────────────────────────────────────────
  const fetchSchedules = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (filterStatus !== "all") params.append("status", filterStatus)
      const res = await fetch(`${API_BASE}/admin/interview-schedules?${params}`, { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.success) setSchedules(data.data || [])
    } catch {
      toast({ title: "Error", description: "Gagal memuat data jadwal wawancara", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, filterStatus])

  const fetchBeswanList = useCallback(async (q = "") => {
    try {
      setIsLoadingBeswan(true)
      const res = await fetch(`${API_BASE}/beswan?search=${encodeURIComponent(q)}&per_page=30`, { headers: getAuthHeaders() })
      const data = await res.json()
      // handle both {data: [...]} and plain array
      if (data.data && Array.isArray(data.data)) setBeswanList(data.data)
      else if (Array.isArray(data)) setBeswanList(data)
    } catch {
      console.error("Error fetching beswan list")
    } finally {
      setIsLoadingBeswan(false)
    }
  }, [])

  useEffect(() => { fetchSchedules() }, [fetchSchedules])
  useEffect(() => { fetchBeswanList() }, [fetchBeswanList])

  // ─── Calendar helpers ──────────────────────────────────────
  const getSchedulesForDate = (dateStr: string) =>
    schedules.filter(s => (s.tanggal_wawancara || "").startsWith(dateStr))

  const buildCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: { date: Date | null; dateStr: string }[] = []
    for (let i = 0; i < firstDay; i++) days.push({ date: null, dateStr: "" })
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      days.push({ date, dateStr })
    }
    return days
  }

  // ─── Dialog ────────────────────────────────────────────────
  const openCreate = () => {
    setEditingSchedule(null)
    setForm(emptyForm)
    setSelectedBeswan(null)
    setBeswanSearch("")
    setShowDialog(true)
  }

  const openEdit = (s: ScheduleItem) => {
    setEditingSchedule(s)
    setForm({
      beswan_id: String(s.beswan_id),
      tanggal_wawancara: (s.tanggal_wawancara || "").split("T")[0],
      jam_mulai: (s.jam_mulai || "").substring(0, 5),
      jam_selesai: (s.jam_selesai || "").substring(0, 5),
      lokasi_atau_link: s.lokasi_atau_link || "",
      catatan: s.catatan || "",
      status: s.status,
    })
    setSelectedBeswan(s.beswan || null)
    setBeswanSearch(s.beswan?.user?.name || s.beswan?.nama_panggilan || "")
    setShowDialog(true)
  }

  const handleBeswanSelect = (b: Beswan) => {
    setSelectedBeswan(b)
    setForm(p => ({ ...p, beswan_id: String(b.id) }))
    setBeswanSearch(b.user?.name || b.nama_panggilan)
    setShowBeswanDropdown(false)
  }

  // ─── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.beswan_id) {
      toast({ title: "Validasi", description: "Pilih peserta terlebih dahulu", variant: "destructive" })
      return
    }
    if (!form.tanggal_wawancara || !form.jam_mulai) {
      toast({ title: "Validasi", description: "Tanggal dan jam mulai wajib diisi", variant: "destructive" })
      return
    }
    setIsSaving(true)
    try {
      const body: Record<string, any> = {
        beswan_id: Number(form.beswan_id),
        tanggal_wawancara: form.tanggal_wawancara,
        jam_mulai: form.jam_mulai,
        jam_selesai: form.jam_selesai || null,
        lokasi_atau_link: form.lokasi_atau_link || null,
        catatan: form.catatan || null,
        status: form.status,
      }
      const url = editingSchedule
        ? `${API_BASE}/admin/interview-schedules/${editingSchedule.id}`
        : `${API_BASE}/admin/interview-schedules`
      const method = editingSchedule ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(body) })
      const data = await res.json()
      if (data.success) {
        toast({ title: "✅ Berhasil", description: editingSchedule ? "Jadwal diperbarui" : "Jadwal baru dibuat" })
        setShowDialog(false)
        fetchSchedules()
      } else {
        const errMsg = data.errors
          ? Object.values(data.errors).flat().join(", ")
          : data.message || "Gagal menyimpan jadwal"
        throw new Error(errMsg)
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Gagal menyimpan jadwal", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Delete ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`${API_BASE}/admin/interview-schedules/${deleteId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "✅ Dihapus", description: "Jadwal berhasil dihapus" })
        setDeleteId(null)
        fetchSchedules()
      }
    } catch {
      toast({ title: "Error", description: "Gagal menghapus jadwal", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  // ─── Helpers ───────────────────────────────────────────────
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    const d = new Date(dateStr.split("T")[0] + "T00:00:00")
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  }
  const fmtTime = (t: string | null) => (t ? t.substring(0, 5) : "")
  const pesertaName = (s: ScheduleItem) =>
    s.beswan?.user?.name || s.beswan?.nama_panggilan || `Peserta #${s.beswan_id}`

  const filteredBeswan = beswanList.filter(b => {
    const q = beswanSearch.toLowerCase()
    return (
      b.nama_panggilan.toLowerCase().includes(q) ||
      (b.user?.name || "").toLowerCase().includes(q) ||
      (b.user?.email || "").toLowerCase().includes(q)
    )
  })

  const todayStr = new Date().toISOString().split("T")[0]

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="container py-6 mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jadwal Wawancara</h1>
          <p className="text-muted-foreground">Kelola jadwal wawancara seleksi beasiswa peserta</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Jadwal
        </Button>
      </div>

      {/* Toolbar */}
      <Card className="mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 flex-1 flex-wrap">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari peserta..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && fetchSchedules()}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchSchedules} title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>
                <FileText className="w-4 h-4 mr-1" /> List
              </Button>
              <Button variant={view === "calendar" ? "default" : "outline"} size="sm" onClick={() => setView("calendar")}>
                <Calendar className="w-4 h-4 mr-1" /> Kalender
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
        {STATUS_OPTIONS.map(s => (
          <Card key={s.value}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="text-2xl font-bold">{schedules.filter(sc => sc.status === s.value).length}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* LIST VIEW */}
      {view === "list" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Daftar Jadwal
              <Badge variant="outline" className="ml-auto">{schedules.length} jadwal</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
              </div>
            ) : schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-3">
                <Calendar className="w-10 h-10 opacity-40" />
                <p>Belum ada jadwal wawancara</p>
                <Button variant="outline" size="sm" onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-1" /> Tambah Jadwal
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Peserta</th>
                      <th className="text-left py-3 px-4 font-medium">Tanggal</th>
                      <th className="text-left py-3 px-4 font-medium">Waktu</th>
                      <th className="text-left py-3 px-4 font-medium">Lokasi/Link</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-center py-3 px-4 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(s => (
                      <tr key={s.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium">{pesertaName(s)}</div>
                          <div className="text-xs text-muted-foreground">{s.beswan?.user?.email || ""}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm">{formatDate(s.tanggal_wawancara)}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {fmtTime(s.jam_mulai)}
                            {s.jam_selesai && ` – ${fmtTime(s.jam_selesai)}`}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-[180px]">
                          {s.lokasi_atau_link ? (
                            s.lokasi_atau_link.startsWith("http") ? (
                              <a
                                href={s.lokasi_atau_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline truncate block"
                                title={s.lokasi_atau_link}
                              >
                                {s.lokasi_atau_link}
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground truncate block">{s.lokasi_atau_link}</span>
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">–</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(s.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)} title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost" size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(s.id)}
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CALENDAR VIEW */}
      {view === "calendar" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Kalender Jadwal
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => {
                  const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); setCurrentMonth(d)
                }}><ChevronLeft className="w-4 h-4" /></Button>
                <span className="font-semibold min-w-[140px] text-center">
                  {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <Button variant="outline" size="icon" onClick={() => {
                  const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); setCurrentMonth(d)
                }}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {buildCalendarDays().map(({ date, dateStr }, idx) => {
                if (!date) return <div key={idx} />
                const daySchedules = getSchedulesForDate(dateStr)
                const isToday = dateStr === todayStr
                return (
                  <div key={idx} className={`min-h-[80px] p-1 rounded-lg border text-sm ${isToday ? "border-primary bg-primary/5" : "border-border hover:bg-muted/20"}`}>
                    <div className={`font-semibold text-xs mb-1 ${isToday ? "text-primary" : ""}`}>{date.getDate()}</div>
                    <div className="space-y-0.5">
                      {daySchedules.slice(0, 3).map(s => (
                        <div
                          key={s.id}
                          className="text-[10px] bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate cursor-pointer hover:bg-blue-200 transition-colors"
                          title={`${fmtTime(s.jam_mulai)} - ${pesertaName(s)}`}
                          onClick={() => openEdit(s)}
                        >
                          {fmtTime(s.jam_mulai)} {pesertaName(s)}
                        </div>
                      ))}
                      {daySchedules.length > 3 && (
                        <div className="text-[10px] text-muted-foreground pl-1">+{daySchedules.length - 3} lainnya</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={showDialog} onOpenChange={open => { if (!open) setShowDialog(false) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? "Edit Jadwal Wawancara" : "Tambah Jadwal Wawancara"}</DialogTitle>
            <DialogDescription>
              {editingSchedule ? "Perbarui informasi jadwal wawancara peserta" : "Buat jadwal wawancara baru"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Peserta */}
            <div className="space-y-1.5">
              <Label>Peserta <span className="text-destructive">*</span></Label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama / email peserta..."
                    className="pl-9"
                    value={beswanSearch}
                    onChange={e => { setBeswanSearch(e.target.value); setShowBeswanDropdown(true); fetchBeswanList(e.target.value) }}
                    onFocus={() => setShowBeswanDropdown(true)}
                    onBlur={() => setTimeout(() => setShowBeswanDropdown(false), 150)}
                  />
                </div>
                {showBeswanDropdown && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {isLoadingBeswan ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> Mencari...
                      </div>
                    ) : filteredBeswan.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Tidak ditemukan</div>
                    ) : (
                      filteredBeswan.map(b => (
                        <button
                          key={b.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                          onMouseDown={() => handleBeswanSelect(b)}
                        >
                          <div className="font-medium">{b.user?.name || b.nama_panggilan}</div>
                          <div className="text-xs text-muted-foreground">{b.user?.email || ""}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedBeswan && (
                <Alert className="py-2 border-green-200 bg-green-50">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-700 text-sm">
                    Peserta: <strong>{selectedBeswan.user?.name || selectedBeswan.nama_panggilan}</strong>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Tanggal + Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tgl">Tanggal Wawancara <span className="text-destructive">*</span></Label>
                <Input id="tgl" type="date" value={form.tanggal_wawancara}
                  onChange={e => setForm(p => ({ ...p, tanggal_wawancara: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Jam */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="jam-mulai">Jam Mulai <span className="text-destructive">*</span></Label>
                <Input id="jam-mulai" type="time" value={form.jam_mulai}
                  onChange={e => setForm(p => ({ ...p, jam_mulai: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jam-selesai">Jam Selesai <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                <Input id="jam-selesai" type="time" value={form.jam_selesai}
                  onChange={e => setForm(p => ({ ...p, jam_selesai: e.target.value }))} />
              </div>
            </div>

            {/* Lokasi/Link */}
            <div className="space-y-1.5">
              <Label htmlFor="lokasi">Lokasi / Link Wawancara <span className="text-muted-foreground text-xs">(opsional)</span></Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="lokasi" className="pl-9"
                  placeholder="https://meet.google.com/... atau nama lokasi"
                  value={form.lokasi_atau_link}
                  onChange={e => setForm(p => ({ ...p, lokasi_atau_link: e.target.value }))} />
              </div>
              <p className="text-xs text-muted-foreground">Link Google Meet/Zoom untuk online, atau nama tempat untuk offline.</p>
            </div>

            {/* Catatan */}
            <div className="space-y-1.5">
              <Label htmlFor="catatan">Catatan untuk Peserta <span className="text-muted-foreground text-xs">(opsional)</span></Label>
              <Textarea id="catatan" rows={3}
                placeholder="Pesan atau instruksi untuk peserta..."
                value={form.catatan}
                onChange={e => setForm(p => ({ ...p, catatan: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isSaving}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                : <>{editingSchedule ? "Perbarui" : "Simpan"} Jadwal</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" /> Hapus Jadwal
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus...</>
                : <><Trash2 className="w-4 h-4 mr-2" /> Hapus</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
