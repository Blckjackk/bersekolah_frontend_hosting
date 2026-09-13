"use client"

import React, { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  AlertCircle,
  CalendarCheck,
  Link as LinkIcon,
  ExternalLink,
  Info,
  CheckCircle,
  Loader2,
  RefreshCw,
  Lock,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

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
}

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

export default function KalenderWawancara() {
  const { toast } = useToast()
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLocked, setIsLocked] = useState(false)

  const fetchSchedules = async (showToast = false) => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("bersekolah_auth_token")
      if (!token) {
        setIsLocked(true)
        return
      }

      const baseURL = import.meta.env.PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/interview-schedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (res.status === 401) {
        setIsLocked(true)
        return
      }

      if (!res.ok) throw new Error("Gagal mengambil data jadwal")

      const data = await res.json()
      setSchedules(data.data || [])

      if (showToast) {
        toast({ title: "Data Diperbarui", description: "Jadwal wawancara berhasil diperbarui." })
      }
    } catch (error) {
      console.error("Error fetching interview schedules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  // ==================== CALENDAR HELPERS ====================
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const formatDateKey = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  const getScheduleForDate = (dateKey: string) =>
    schedules.filter((s) => s.tanggal_wawancara === dateKey)

  const getScheduleStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-500"
      case "done": return "bg-green-500"
      case "cancelled": return "bg-red-500"
      case "rescheduled": return "bg-yellow-500"
      default: return "bg-gray-400"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled": return "Terjadwal"
      case "done": return "Selesai"
      case "cancelled": return "Dibatalkan"
      case "rescheduled": return "Dijadwal Ulang"
      default: return status
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "scheduled": return "default"
      case "done": return "secondary"
      case "cancelled": return "destructive"
      default: return "outline"
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    })
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "-"
    const [hour, minute] = timeStr.split(":")
    return `${hour}:${minute} WIB`
  }

  const isOnlineLink = (str: string | null) => {
    if (!str) return false
    return str.startsWith("http://") || str.startsWith("https://")
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    setSelectedDate(null)
  }

  const today = new Date()
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth)
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Get all schedule dates in this month for highlighting
  const scheduleDatesInMonth = new Set(
    schedules
      .filter((s) => {
        const d = new Date(s.tanggal_wawancara + "T00:00:00")
        return d.getFullYear() === year && d.getMonth() === month
      })
      .map((s) => s.tanggal_wawancara)
  )

  // Upcoming schedules (all, not just this month)
  const upcomingSchedules = schedules
    .filter((s) => s.tanggal_wawancara >= todayKey && s.status === "scheduled")
    .sort((a, b) => a.tanggal_wawancara.localeCompare(b.tanggal_wawancara))

  // Selected date schedules
  const selectedSchedules = selectedDate ? getScheduleForDate(selectedDate) : []

  // ==================== RENDER ====================
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Lock className="w-12 h-12 mb-4 opacity-40" />
        <p className="text-lg font-medium">Akses Terbatas</p>
        <p className="text-sm">Silakan login untuk melihat jadwal wawancara.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kalender Jadwal Wawancara</h2>
          <p className="text-sm text-gray-500">Lihat jadwal wawancara beasiswa Anda</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchSchedules(true)} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#406386" }} />
        </div>
      ) : schedules.length === 0 ? (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertTitle>Belum Ada Jadwal Wawancara</AlertTitle>
          <AlertDescription>
            Jadwal wawancara akan ditampilkan di sini setelah admin menetapkan waktu wawancara untuk Anda.
            Pastikan Anda sudah menyelesaikan semua tahapan pendaftaran dan upload dokumen.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* CALENDAR */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {MONTHS[month]} {year}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells before first day */}
                {Array(firstDay).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Days */}
                {Array(daysInMonth).fill(null).map((_, i) => {
                  const day = i + 1
                  const dateKey = formatDateKey(year, month, day)
                  const hasSchedule = scheduleDatesInMonth.has(dateKey)
                  const isToday = dateKey === todayKey
                  const isSelected = dateKey === selectedDate
                  const daySchedules = hasSchedule ? getScheduleForDate(dateKey) : []
                  const hasCancelled = daySchedules.some(s => s.status === "cancelled")
                  const hasDone = daySchedules.some(s => s.status === "done")
                  const hasScheduled = daySchedules.some(s => s.status === "scheduled")

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                      className={`
                        relative flex flex-col items-center justify-center rounded-lg
                        h-10 w-full text-sm transition-all duration-200
                        ${isSelected
                          ? "text-white font-bold shadow-md"
                          : isToday
                          ? "font-bold ring-2"
                          : "hover:bg-gray-100"}
                        ${hasSchedule ? "cursor-pointer" : "cursor-default"}
                      `}
                      style={
                        isSelected
                          ? { background: "linear-gradient(135deg, #406386, #2d4a66)" }
                          : isToday
                          ? { color: "#406386", ringColor: "#406386" }
                          : {}
                      }
                    >
                      {day}
                      {hasSchedule && (
                        <span
                          className={`absolute bottom-1 w-1.5 h-1.5 rounded-full
                            ${hasScheduled ? "bg-blue-500" : hasDone ? "bg-green-500" : hasCancelled ? "bg-red-400" : "bg-gray-400"}
                            ${isSelected ? "bg-white" : ""}
                          `}
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-3 border-t flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Terjadwal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Selesai</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Dibatalkan</span>
              </div>
            </CardContent>
          </Card>

          {/* SCHEDULE DETAIL PANEL */}
          <div className="space-y-4">
            {/* Selected date detail */}
            {selectedDate && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: "#406386" }} />
                    {formatDate(selectedDate)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSchedules.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Tidak ada jadwal pada tanggal ini</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedSchedules.map((s) => (
                        <div
                          key={s.id}
                          className="p-3 rounded-xl border"
                          style={{ borderLeft: `4px solid ${s.status === "scheduled" ? "#406386" : s.status === "done" ? "#22c55e" : "#ef4444"}` }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={getStatusVariant(s.status)} className="text-xs">
                              {getStatusLabel(s.status)}
                            </Badge>
                          </div>
                          <div className="space-y-1.5 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span>
                                {formatTime(s.jam_mulai)}
                                {s.jam_selesai && ` – ${formatTime(s.jam_selesai)}`}
                              </span>
                            </div>
                            {s.lokasi_atau_link && (
                              <div className="flex items-start gap-2 text-gray-700">
                                {isOnlineLink(s.lokasi_atau_link) ? (
                                  <Video className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                )}
                                {isOnlineLink(s.lokasi_atau_link) ? (
                                  <a
                                    href={s.lokasi_atau_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center gap-1 break-all"
                                  >
                                    Link Wawancara <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  </a>
                                ) : (
                                  <span className="break-all">{s.lokasi_atau_link}</span>
                                )}
                              </div>
                            )}
                            {s.catatan && (
                              <div className="flex items-start gap-2 text-gray-600 bg-yellow-50 p-2 rounded-lg">
                                <Info className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <span className="text-xs">{s.catatan}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upcoming schedules */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4" style={{ color: "#406386" }} />
                  Jadwal Mendatang
                </CardTitle>
                <CardDescription className="text-xs">Wawancara yang sudah dijadwalkan</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSchedules.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-gray-400">
                    <CalendarCheck className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-sm">Tidak ada jadwal wawancara mendatang</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingSchedules.map((s) => {
                      const isToday = s.tanggal_wawancara === todayKey
                      return (
                        <div
                          key={s.id}
                          className="flex gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                          style={{ background: isToday ? "rgba(64, 99, 134, 0.06)" : "#f9fafb" }}
                          onClick={() => {
                            setSelectedDate(s.tanggal_wawancara)
                            // Navigate to correct month if needed
                            const d = new Date(s.tanggal_wawancara + "T00:00:00")
                            setCurrentMonth(new Date(d.getFullYear(), d.getMonth()))
                          }}
                        >
                          {/* Date badge */}
                          <div
                            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 text-white"
                            style={{ background: "linear-gradient(135deg, #406386, #2d4a66)" }}
                          >
                            <span className="text-xs font-medium">
                              {MONTHS[new Date(s.tanggal_wawancara + "T00:00:00").getMonth()].substring(0, 3)}
                            </span>
                            <span className="text-lg font-bold leading-tight">
                              {new Date(s.tanggal_wawancara + "T00:00:00").getDate()}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-800">Wawancara Beasiswa</span>
                              {isToday && <Badge className="text-xs py-0">Hari Ini</Badge>}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatTime(s.jam_mulai)}
                              {s.jam_selesai && ` – ${formatTime(s.jam_selesai)}`}
                            </div>
                            {s.lokasi_atau_link && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 truncate">
                                {isOnlineLink(s.lokasi_atau_link) ? <Video className="w-3 h-3 flex-shrink-0" /> : <MapPin className="w-3 h-3 flex-shrink-0" />}
                                <span className="truncate">{isOnlineLink(s.lokasi_atau_link) ? "Wawancara Online" : s.lokasi_atau_link}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All schedules history */}
            {schedules.some(s => s.status !== "scheduled" || s.tanggal_wawancara < todayKey) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Riwayat Jadwal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {schedules
                      .filter((s) => s.status !== "scheduled" || s.tanggal_wawancara < todayKey)
                      .map((s) => (
                        <div key={s.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${getScheduleStatusColor(s.status)}`}
                            />
                            <span className="text-gray-700">{formatDate(s.tanggal_wawancara)}</span>
                          </div>
                          <Badge variant={getStatusVariant(s.status)} className="text-xs">
                            {getStatusLabel(s.status)}
                          </Badge>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
