"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Image, Plus, Trash2, Edit, Upload, X, Eye, ChevronLeft, Loader2, CheckCircle2, ImagePlus, AlertCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface GalleryPhoto {
  id: number
  gallery_id: number
  file_path: string
  file_name: string
  caption: string | null
  urutan: number
  photo_url: string
}

interface Gallery {
  id: number
  nama_kegiatan: string
  deskripsi: string | null
  tanggal_kegiatan: string | null
  cover_image: string | null
  cover_image_url: string | null
  status: "draft" | "published"
  photos_count: number
  photos?: GalleryPhoto[]
}

const API_BASE = import.meta.env.PUBLIC_API_BASE_URL

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("bersekolah_auth_token")}`,
  Accept: "application/json",
})

export default function KelolaGaleriPage() {
  const { toast } = useToast()
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null)
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([])
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false)
  const [view, setView] = useState<"list" | "detail">("list")

  // Create / Edit album dialog
  const [showAlbumDialog, setShowAlbumDialog] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Gallery | null>(null)
  const [albumForm, setAlbumForm] = useState({
    nama_kegiatan: "",
    deskripsi: "",
    tanggal_kegiatan: "",
    status: "draft" as "draft" | "published",
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isSavingAlbum, setIsSavingAlbum] = useState(false)

  // Upload photos dialog
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Delete confirmation
  const [deleteAlbumId, setDeleteAlbumId] = useState<number | null>(null)
  const [deletePhotoId, setDeletePhotoId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")

  // ==================== FETCH ====================
  const fetchGalleries = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({ per_page: "30" })
      if (searchQuery) params.append("search", searchQuery)

      const res = await fetch(`${API_BASE}/admin/gallery?${params}`, { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.success) setGalleries(data.data || [])
    } catch (error) {
      console.error("Error fetching galleries:", error)
      toast({ title: "Error", description: "Gagal memuat data galeri", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

  const fetchGalleryPhotos = async (galleryId: number) => {
    try {
      setIsLoadingPhotos(true)
      const res = await fetch(`${API_BASE}/admin/gallery/${galleryId}/photos`, { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.success) setGalleryPhotos(data.data || [])
    } catch (error) {
      console.error("Error fetching photos:", error)
    } finally {
      setIsLoadingPhotos(false)
    }
  }

  useEffect(() => {
    fetchGalleries()
  }, [])

  // ==================== ALBUM CRUD ====================
  const openCreateAlbum = () => {
    setEditingAlbum(null)
    setAlbumForm({ nama_kegiatan: "", deskripsi: "", tanggal_kegiatan: "", status: "draft" })
    setCoverFile(null)
    setCoverPreview(null)
    setShowAlbumDialog(true)
  }

  const openEditAlbum = (gallery: Gallery) => {
    setEditingAlbum(gallery)
    setAlbumForm({
      nama_kegiatan: gallery.nama_kegiatan,
      deskripsi: gallery.deskripsi || "",
      tanggal_kegiatan: gallery.tanggal_kegiatan || "",
      status: gallery.status,
    })
    setCoverFile(null)
    setCoverPreview(gallery.cover_image_url || gallery.cover_image || null)
    setShowAlbumDialog(true)
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const saveAlbum = async () => {
    if (!albumForm.nama_kegiatan.trim()) {
      toast({ title: "Error", description: "Nama kegiatan wajib diisi", variant: "destructive" })
      return
    }

    setIsSavingAlbum(true)
    try {
      const formData = new FormData()
      formData.append("nama_kegiatan", albumForm.nama_kegiatan)
      if (albumForm.deskripsi) formData.append("deskripsi", albumForm.deskripsi)
      if (albumForm.tanggal_kegiatan) formData.append("tanggal_kegiatan", albumForm.tanggal_kegiatan)
      formData.append("status", albumForm.status)
      if (coverFile) formData.append("cover_image", coverFile)

      const url = editingAlbum
        ? `${API_BASE}/admin/gallery/${editingAlbum.id}`
        : `${API_BASE}/admin/gallery`

      // For PUT/update with FormData, we use POST + _method if needed
      if (editingAlbum) {
        formData.append("_method", "PUT")
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("bersekolah_auth_token")}`, Accept: "application/json" },
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: "✅ Berhasil", description: editingAlbum ? "Album diperbarui" : "Album baru dibuat" })
        setShowAlbumDialog(false)
        fetchGalleries()
        if (selectedGallery && editingAlbum?.id === selectedGallery.id) {
          setSelectedGallery(data.data)
        }
      } else {
        throw new Error(data.message || "Gagal menyimpan album")
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Gagal menyimpan album", variant: "destructive" })
    } finally {
      setIsSavingAlbum(false)
    }
  }

  const deleteAlbum = async (id: number) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`${API_BASE}/admin/gallery/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "✅ Album Dihapus", description: "Album dan semua foto berhasil dihapus" })
        setDeleteAlbumId(null)
        fetchGalleries()
        if (view === "detail" && selectedGallery?.id === id) {
          setView("list")
          setSelectedGallery(null)
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus album", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  // ==================== PHOTO UPLOAD ====================
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setUploadFiles(files)
    const previews: string[] = []
    let loaded = 0

    files.forEach((file, idx) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        previews[idx] = ev.target?.result as string
        loaded++
        if (loaded === files.length) {
          setUploadPreviews([...previews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const uploadPhotos = async () => {
    if (!selectedGallery || !uploadFiles.length) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      uploadFiles.forEach((file) => formData.append("photos[]", file))

      const res = await fetch(`${API_BASE}/admin/gallery/${selectedGallery.id}/photos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("bersekolah_auth_token")}`, Accept: "application/json" },
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: "✅ Upload Berhasil", description: `${uploadFiles.length} foto berhasil diupload` })
        setShowUploadDialog(false)
        setUploadFiles([])
        setUploadPreviews([])
        fetchGalleryPhotos(selectedGallery.id)
        fetchGalleries()
      } else {
        throw new Error(data.message || "Gagal upload foto")
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Gagal upload foto", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  const deletePhoto = async (photoId: number) => {
    setIsDeleting(true)
    try {
      const res = await fetch(`${API_BASE}/admin/gallery/photos/${photoId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "✅ Foto Dihapus" })
        setDeletePhotoId(null)
        if (selectedGallery) fetchGalleryPhotos(selectedGallery.id)
        fetchGalleries()
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus foto", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  // ==================== VIEWS ====================
  const openGalleryDetail = async (gallery: Gallery) => {
    setSelectedGallery(gallery)
    setView("detail")
    await fetchGalleryPhotos(gallery.id)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  }

  // ==================== RENDER ====================
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {view === "detail" && selectedGallery ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => { setView("list"); setSelectedGallery(null); setGalleryPhotos([]) }}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedGallery.nama_kegiatan}</h1>
                <p className="text-sm text-gray-500">{formatDate(selectedGallery.tanggal_kegiatan)}</p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kelola Galeri</h1>
              <p className="text-sm text-gray-500">Kelola album kegiatan dan foto-foto</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {view === "detail" && selectedGallery ? (
            <>
              <Button variant="outline" size="sm" onClick={() => openEditAlbum(selectedGallery)}>
                <Edit className="w-4 h-4 mr-1" /> Edit Album
              </Button>
              <Button size="sm" onClick={() => setShowUploadDialog(true)} style={{ background: "linear-gradient(135deg, #406386, #2d4a66)" }}>
                <ImagePlus className="w-4 h-4 mr-1" /> Upload Foto
              </Button>
            </>
          ) : (
            <Button onClick={openCreateAlbum} style={{ background: "linear-gradient(135deg, #406386, #2d4a66)" }}>
              <Plus className="w-4 h-4 mr-2" /> Buat Album
            </Button>
          )}
        </div>
      </div>

      {/* LIST VIEW */}
      {view === "list" && (
        <>
          {/* Search */}
          <div className="flex gap-2">
            <Input
              placeholder="Cari album kegiatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") fetchGalleries() }}
              className="max-w-xs"
            />
            <Button variant="outline" onClick={fetchGalleries}>Cari</Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#406386]" />
            </div>
          ) : galleries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Image className="w-16 h-16 mb-4 opacity-40" />
              <p className="text-lg font-medium">Belum ada album galeri</p>
              <p className="text-sm mb-4">Buat album pertama untuk mulai mengisi galeri</p>
              <Button onClick={openCreateAlbum} style={{ background: "linear-gradient(135deg, #406386, #2d4a66)" }}>
                <Plus className="w-4 h-4 mr-2" /> Buat Album Pertama
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {galleries.map((gallery) => (
                <Card key={gallery.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Cover */}
                  <div
                    className="relative cursor-pointer"
                    style={{ height: "180px", background: "linear-gradient(135deg, #406386, #2d4a66)" }}
                    onClick={() => openGalleryDetail(gallery)}
                  >
                    {gallery.cover_image_url || gallery.cover_image ? (
                      <img
                        src={gallery.cover_image_url || gallery.cover_image || ""}
                        alt={gallery.nama_kegiatan}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Image className="w-14 h-14 text-white opacity-40" />
                      </div>
                    )}
                    <Badge
                      className="absolute top-2 right-2"
                      variant={gallery.status === "published" ? "default" : "secondary"}
                    >
                      {gallery.status === "published" ? "Dipublikasikan" : "Draft"}
                    </Badge>
                    <div
                      className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
                      style={{ background: "rgba(0,0,0,0.55)" }}
                    >
                      <Image className="w-3 h-3" /> {gallery.photos_count} foto
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{gallery.nama_kegiatan}</h3>
                    <p className="text-xs text-gray-500 mb-3">{formatDate(gallery.tanggal_kegiatan)}</p>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={() => openGalleryDetail(gallery)}>
                        <Eye className="w-3 h-3 mr-1" /> Kelola
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => openEditAlbum(gallery)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => setDeleteAlbumId(gallery.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* DETAIL VIEW */}
      {view === "detail" && selectedGallery && (
        <div>
          {/* Album Info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  {selectedGallery.deskripsi && (
                    <p className="text-sm text-gray-600 mb-2">{selectedGallery.deskripsi}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{galleryPhotos.length} foto</span>
                    <Badge variant={selectedGallery.status === "published" ? "default" : "secondary"} className="text-xs">
                      {selectedGallery.status === "published" ? "Dipublikasikan" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photos Grid */}
          {isLoadingPhotos ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#406386]" />
            </div>
          ) : galleryPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
              <ImagePlus className="w-14 h-14 mb-3 opacity-40" />
              <p className="font-medium">Belum ada foto</p>
              <p className="text-sm mb-4">Klik tombol Upload Foto untuk mulai mengisi album</p>
              <Button onClick={() => setShowUploadDialog(true)} style={{ background: "linear-gradient(135deg, #406386, #2d4a66)" }}>
                <ImagePlus className="w-4 h-4 mr-2" /> Upload Foto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {galleryPhotos.map((photo) => (
                <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || photo.file_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setDeletePhotoId(photo.id)}
                      className="flex items-center justify-center w-9 h-9 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1 text-xs text-white text-center truncate"
                      style={{ background: "rgba(0,0,0,0.6)" }}>
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT ALBUM DIALOG */}
      <Dialog open={showAlbumDialog} onOpenChange={setShowAlbumDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAlbum ? "Edit Album" : "Buat Album Baru"}</DialogTitle>
            <DialogDescription>
              {editingAlbum ? "Perbarui informasi album kegiatan" : "Isi informasi untuk album kegiatan baru"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nama_kegiatan">Nama Kegiatan *</Label>
              <Input
                id="nama_kegiatan"
                value={albumForm.nama_kegiatan}
                onChange={(e) => setAlbumForm({ ...albumForm, nama_kegiatan: e.target.value })}
                placeholder="Contoh: Bermain 2026"
              />
            </div>
            <div>
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={albumForm.deskripsi}
                onChange={(e) => setAlbumForm({ ...albumForm, deskripsi: e.target.value })}
                placeholder="Deskripsi singkat tentang kegiatan..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="tanggal_kegiatan">Tanggal Kegiatan</Label>
              <Input
                id="tanggal_kegiatan"
                type="date"
                value={albumForm.tanggal_kegiatan}
                onChange={(e) => setAlbumForm({ ...albumForm, tanggal_kegiatan: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={albumForm.status} onValueChange={(v) => setAlbumForm({ ...albumForm, status: v as "draft" | "published" })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft (tidak terlihat publik)</SelectItem>
                  <SelectItem value="published">Dipublikasikan (terlihat publik)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cover Image</Label>
              {coverPreview && (
                <div className="relative mb-2 rounded-lg overflow-hidden" style={{ height: "120px" }}>
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{coverPreview ? "Ganti cover" : "Pilih cover image"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlbumDialog(false)}>Batal</Button>
            <Button onClick={saveAlbum} disabled={isSavingAlbum} style={{ background: "linear-gradient(135deg, #406386, #2d4a66)" }}>
              {isSavingAlbum ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Simpan</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UPLOAD PHOTOS DIALOG */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Foto ke Album</DialogTitle>
            <DialogDescription>Pilih satu atau beberapa foto untuk diupload ke album ini (max 20 foto)</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Klik untuk pilih foto atau drag & drop</span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP – maks 10MB per foto</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoFileChange} />
            </label>

            {uploadPreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {uploadPreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        const newFiles = uploadFiles.filter((_, i) => i !== idx)
                        const newPreviews = uploadPreviews.filter((_, i) => i !== idx)
                        setUploadFiles(newFiles)
                        setUploadPreviews(newPreviews)
                      }}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadFiles.length > 0 && (
              <p className="text-sm text-gray-600 font-medium">{uploadFiles.length} foto dipilih</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowUploadDialog(false); setUploadFiles([]); setUploadPreviews([]) }}>
              Batal
            </Button>
            <Button onClick={uploadPhotos} disabled={!uploadFiles.length || isUploading} style={{ background: "linear-gradient(135deg, #406386, #2d4a66)" }}>
              {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengupload...</> : <><Upload className="w-4 h-4 mr-2" /> Upload {uploadFiles.length > 0 ? `${uploadFiles.length} Foto` : "Foto"}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE ALBUM CONFIRMATION */}
      <Dialog open={!!deleteAlbumId} onOpenChange={() => setDeleteAlbumId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Album?</DialogTitle>
            <DialogDescription>
              Album dan semua foto di dalamnya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>Semua foto dalam album akan ikut terhapus.</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAlbumId(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => deleteAlbumId && deleteAlbum(deleteAlbumId)} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Ya, Hapus Album
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE PHOTO CONFIRMATION */}
      <Dialog open={!!deletePhotoId} onOpenChange={() => setDeletePhotoId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Foto?</DialogTitle>
            <DialogDescription>Foto ini akan dihapus permanen dari album.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePhotoId(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => deletePhotoId && deletePhoto(deletePhotoId)} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Ya, Hapus Foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
