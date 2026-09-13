"use client";
import { useEffect, useState, useCallback } from "react";
import { getEnvironmentUrls } from "@/lib/utils/url-helper";

interface GalleryPhoto {
  id: number;
  file_path: string;
  file_name: string;
  caption: string | null;
  urutan: number;
  photo_url: string;
}

interface Gallery {
  id: number;
  nama_kegiatan: string;
  deskripsi: string | null;
  tanggal_kegiatan: string | null;
  cover_image: string | null;
  cover_image_url: string | null;
  status: string;
  photos_count: number;
  photos?: GalleryPhoto[];
}

const GaleriPage = () => {
  const { apiUrl } = getEnvironmentUrls();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchGalleries = useCallback(
    async (pageNum = 1, search = "") => {
      try {
        if (pageNum === 1) setIsLoading(true);
        else setLoadingMore(true);

        let url = `${apiUrl}/gallery?page=${pageNum}&per_page=12`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          if (pageNum === 1) {
            setGalleries(data.data || []);
          } else {
            setGalleries((prev) => [...prev, ...(data.data || [])]);
          }
          setHasMore(
            data.meta && data.meta.current_page < data.meta.last_page
          );
        }
      } catch (error) {
        console.error("Error fetching galleries:", error);
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [apiUrl]
  );

  useEffect(() => {
    fetchGalleries(1, searchQuery);
  }, [apiUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGalleries(1, searchQuery);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchGalleries(nextPage, searchQuery);
  };

  const openGallery = async (gallery: Gallery) => {
    setIsLoadingDetail(true);
    setSelectedGallery(gallery);
    try {
      const res = await fetch(`${apiUrl}/gallery/${gallery.id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedGallery(data.data);
      }
    } catch (error) {
      console.error("Error fetching gallery detail:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeGallery = () => {
    setSelectedGallery(null);
    setLightboxPhoto(null);
  };

  const openLightbox = (photo: GalleryPhoto, index: number) => {
    setLightboxPhoto(photo);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxPhoto(null);
  };

  const prevPhoto = () => {
    if (!selectedGallery?.photos) return;
    const newIndex =
      (lightboxIndex - 1 + selectedGallery.photos.length) %
      selectedGallery.photos.length;
    setLightboxIndex(newIndex);
    setLightboxPhoto(selectedGallery.photos[newIndex]);
  };

  const nextPhoto = () => {
    if (!selectedGallery?.photos) return;
    const newIndex = (lightboxIndex + 1) % selectedGallery.photos.length;
    setLightboxIndex(newIndex);
    setLightboxPhoto(selectedGallery.photos[newIndex]);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxPhoto) return;
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxPhoto, lightboxIndex]);

  return (
    <>
      <style>{`
        .gallery-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .gallery-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(64, 99, 134, 0.15);
        }
        .photo-grid-item {
          overflow: hidden;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          aspect-ratio: 1;
          background: #f3f4f6;
        }
        .photo-grid-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .photo-grid-item:hover img {
          transform: scale(1.08);
        }
        .photo-grid-item .overlay {
          position: absolute;
          inset: 0;
          background: rgba(64, 99, 134, 0);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }
        .photo-grid-item:hover .overlay {
          background: rgba(64, 99, 134, 0.4);
        }
        .photo-grid-item .overlay svg {
          opacity: 0;
          transition: opacity 0.3s ease;
          color: white;
        }
        .photo-grid-item:hover .overlay svg {
          opacity: 1;
        }
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.93);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .gallery-detail-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 500;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cover-placeholder {
          background: linear-gradient(135deg, #406386 0%, #2d4a66 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      {/* HERO SECTION */}
      <section
        className="relative flex items-center justify-center min-h-[40vh] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a2f45 0%, #406386 50%, #2d4a66 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.3)",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 px-4 text-center text-white">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium rounded-full"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Momen Berharga Kami
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            Galeri{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #93c5fd, #c4b5fd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Kegiatan
            </span>
          </h1>
          <p className="max-w-xl mx-auto text-lg opacity-80">
            Dokumentasi kegiatan dan momen berharga bersama beswan Bersekolah
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kegiatan..."
                className="w-full px-5 py-3 pl-12 text-sm bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#406386] focus:border-transparent"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute w-5 h-5 text-gray-400 left-4 top-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                type="submit"
                className="absolute right-2 top-1.5 px-4 py-1.5 text-sm font-medium text-white rounded-full"
                style={{ background: "linear-gradient(135deg, #406386, #2d4a66)" }}
              >
                Cari
              </button>
            </div>
          </form>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                  style={{ borderColor: "#406386", borderTopColor: "transparent" }}
                />
                <p className="text-gray-500">Memuat galeri...</p>
              </div>
            </div>
          ) : galleries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium">Belum ada galeri tersedia</p>
              <p className="text-sm">Galeri kegiatan akan segera hadir</p>
            </div>
          ) : (
            <>
              {/* Gallery Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {galleries.map((gallery) => (
                  <div
                    key={gallery.id}
                    className="gallery-card bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer"
                    onClick={() => openGallery(gallery)}
                  >
                    {/* Cover Image */}
                    <div className="relative overflow-hidden" style={{ height: "200px" }}>
                      {gallery.cover_image_url || gallery.cover_image ? (
                        <img
                          src={gallery.cover_image_url || gallery.cover_image || ""}
                          alt={gallery.nama_kegiatan}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="cover-placeholder w-full h-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {/* Photos count badge */}
                      <div
                        className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {gallery.photos_count} foto
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="mb-1 text-base font-semibold text-gray-900 line-clamp-2">
                        {gallery.nama_kegiatan}
                      </h3>
                      {gallery.tanggal_kegiatan && (
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(gallery.tanggal_kegiatan)}
                        </p>
                      )}
                      {gallery.deskripsi && (
                        <p className="mt-2 text-xs text-gray-500 line-clamp-2">{gallery.deskripsi}</p>
                      )}
                      <button
                        className="mt-3 flex items-center gap-1 text-xs font-semibold transition-colors"
                        style={{ color: "#406386" }}
                      >
                        Lihat Foto
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 font-medium text-white rounded-full shadow-md transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #406386, #2d4a66)" }}
                  >
                    {loadingMore ? "Memuat..." : "Muat Lebih Banyak"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* GALLERY DETAIL MODAL */}
      {selectedGallery && (
        <div className="gallery-detail-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) closeGallery();
        }}>
          <div
            className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
              style={{ background: "linear-gradient(135deg, #406386, #2d4a66)" }}
            >
              <div>
                <h2 className="text-xl font-bold text-white">{selectedGallery.nama_kegiatan}</h2>
                {selectedGallery.tanggal_kegiatan && (
                  <p className="text-sm text-blue-200">{formatDate(selectedGallery.tanggal_kegiatan)}</p>
                )}
              </div>
              <button
                onClick={closeGallery}
                className="flex items-center justify-center w-9 h-9 text-white bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Description */}
            {selectedGallery.deskripsi && (
              <div className="px-6 py-4 bg-gray-50 border-b">
                <p className="text-sm text-gray-600">{selectedGallery.deskripsi}</p>
              </div>
            )}

            {/* Photos Grid */}
            <div className="p-6">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div
                    className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                    style={{ borderColor: "#406386", borderTopColor: "transparent" }}
                  />
                </div>
              ) : !selectedGallery.photos || selectedGallery.photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Belum ada foto dalam album ini</p>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-sm text-gray-500 font-medium">
                    {selectedGallery.photos.length} foto
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {selectedGallery.photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="photo-grid-item"
                        onClick={() => openLightbox(photo, index)}
                      >
                        <img
                          src={photo.photo_url}
                          alt={photo.caption || `Foto ${index + 1}`}
                          loading="lazy"
                        />
                        <div className="overlay">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxPhoto && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          {/* Navigation Buttons */}
          {selectedGallery?.photos && selectedGallery.photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          <div
            className="relative max-w-4xl w-full mx-4 max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto.photo_url}
              alt={lightboxPhoto.caption || ""}
              className="w-full max-h-[75vh] object-contain rounded-lg"
            />
            {lightboxPhoto.caption && (
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 text-center text-white text-sm rounded-b-lg"
                style={{ background: "rgba(0,0,0,0.6)" }}>
                {lightboxPhoto.caption}
              </div>
            )}
            {selectedGallery?.photos && (
              <div className="mt-2 text-center text-white/60 text-xs">
                {lightboxIndex + 1} / {selectedGallery.photos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GaleriPage;
