import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
// Import alert component instead of toast for simplicity
import * as React from "react";

const KontakPage = () => {
  const [formState, setFormState] = useState({
    nama: '',
    email: '',
    pesan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });
  const [formFocus, setFormFocus] = useState<string | null>(null);

  // Animation cleanup effect
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputFocus = (name: string) => {
    setFormFocus(name);
  };

  const handleInputBlur = () => {
    setFormFocus(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hide any existing notification
    setNotification({ ...notification, show: false });
    
    // Validate form (basic validation)
    if (!formState.nama || !formState.email || !formState.pesan) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Mohon isi semua field yang diperlukan.'
      });
      return;
    }

    // Set loading state
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/kirim-pesan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (data.success) {
        // Show success message
        setNotification({
          show: true,
          type: 'success',
          message: 'Terima kasih! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.'
        });
        
        // Reset form
        setFormState({
          nama: '',
          email: '',
          pesan: ''
        });
      } else {
        throw new Error(data.message || 'Terjadi kesalahan saat mengirim pesan');
      }
    } catch (error) {
      // Show error message
      setNotification({
        show: true,
        type: 'error',
        message: error instanceof Error 
          ? error.message 
          : "Terjadi kesalahan. Silakan coba lagi nanti."
      });
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleWhatsAppClick = () => {
    const phoneNumber = "6287775115850";
    const message = "Halo kak, saya ada pertanyaan, bolehkah saya meminta informasi lebih lengkap mengenai program Beasiswa Bersekolah?";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  }
  return (
    <>
      {/* Hero Section dengan animasi floating */}
      <section className="relative bg-gradient-to-br from-[#406386] via-[#2d4a67] to-[#1a3447] py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-12 h-12 rounded-full top-12 left-6 bg-white/10 animate-bounce sm:w-16 sm:h-16 sm:top-16 sm:left-8 lg:w-20 lg:h-20 lg:top-20 lg:left-10" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute w-10 h-10 rounded-full top-24 right-12 bg-blue-200/20 animate-bounce sm:w-12 sm:h-12 sm:top-32 sm:right-16 lg:w-16 lg:h-16 lg:top-40 lg:right-20" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute w-8 h-8 rounded-full bottom-20 left-1/4 bg-white/15 animate-bounce sm:w-10 sm:h-10 sm:bottom-24 lg:w-12 lg:h-12 lg:bottom-32" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
          <div className="absolute w-6 h-6 rounded-full top-1/3 right-1/3 bg-blue-100/25 animate-bounce sm:w-8 sm:h-8" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>
        </div>

        <div className="container relative px-4 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">

            <h1 className="mb-4 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl xl:text-5xl sm:mb-6">
              Terhubung
              <span className="block mt-1 text-transparent bg-gradient-to-r from-blue-200 to-white bg-clip-text sm:mt-2">
                Bersama Kami 
              </span>
            </h1>
            
            <p className="max-w-3xl px-2 mx-auto mb-6 text-sm leading-relaxed text-blue-100 sm:text-base lg:text-lg xl:text-xl sm:mb-8">
              Kontak kami untuk mendapatkan informasi lebih lanjut tentang program Beasiswa Bersekolah. Kami siap membantu Anda dengan segala pertanyaan dan kebutuhan informasi.
            </p>

            {/* CTA Button dengan efek hover menarik */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <button
                onClick={() => {
                  document.getElementById('contact-form-section')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
                className="group relative px-6 py-3 bg-white text-[#406386] rounded-full font-bold text-sm hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl sm:px-8 sm:py-4 sm:text-base lg:text-lg"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  <MessageCircle className="w-4 h-4 transition-transform group-hover:translate-x-1 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Hubungi Kami</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 sm:w-5 sm:h-5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form-section" className="py-12 bg-gradient-to-b from-gray-50 to-white sm:py-16 lg:py-20">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#406386] mb-3 sm:mb-4">
              Hubungi Kami
            </h2>
            <p className="max-w-2xl mx-auto text-sm text-gray-600 sm:text-base">
              Kami siap membantu menjawab pertanyaan Anda seputar program Beasiswa Bersekolah
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 rounded-2xl sm:rounded-3xl transition-all duration-300 hover:shadow-2xl">
              {/* Decorative background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-[#406386] w-full h-full" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm0 2v.511l-8 6.223-8-6.222V6h16zM4 18V9.044l7.386 5.745a.994.994 0 0 0 1.228 0L20 9.044 20.002 18H4z"/>
                  </svg>
                </div>
                <div className="absolute w-10 h-10 rounded-full bottom-6 left-6 bg-blue-200/20 animate-bounce sm:w-12 sm:h-12 sm:bottom-8 sm:left-8 lg:w-16 lg:h-16 lg:bottom-10 lg:left-10" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
              </div>
              
              <CardContent className="relative z-10 p-4 sm:p-6 lg:p-8 xl:p-10">            
                {/* Header with icon and title */}
                <div className="flex flex-col items-start gap-3 mb-6 sm:flex-row sm:items-center sm:gap-4 lg:gap-6 sm:mb-8">
                  <div className="bg-gradient-to-br from-[#406386] to-[#2d4a67] p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl shadow-md">
                    <svg className="text-white w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[#406386] leading-tight">
                      Kirim Pesan
                    </h2>
                    <p className="text-xs text-gray-600 mt-1 sm:text-sm sm:mt-2">
                      Ceritakan kepada kami bagaimana kami bisa membantu Anda
                    </p>
                  </div>
                </div>
                
                {/* Notification Alert */}
                {notification.show && (
                  <div className={`mb-6 p-3 rounded-lg sm:mb-8 sm:p-4 sm:rounded-xl ${
                    notification.type === 'success' 
                      ? 'bg-green-50 border-l-4 border-green-500 text-green-800' 
                      : 'bg-red-50 border-l-4 border-red-500 text-red-800'
                  }`}>
                    <div className="flex">
                      <div className="flex-shrink-0">                        
                        {notification.type === 'success' ? (
                          <svg className="w-4 h-4 text-green-500 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-500 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-2 sm:ml-3">
                        <p className="text-xs font-medium sm:text-sm">{notification.message}</p>
                      </div>
                      <div className="pl-2 ml-auto sm:pl-3">
                        <div className="-mx-1.5 -my-1.5">
                          <button
                            type="button"
                            className={`inline-flex rounded-md p-1.5 ${
                              notification.type === 'success' 
                                ? 'text-green-600 hover:bg-green-100' 
                                : 'text-red-600 hover:bg-red-100'
                            }`}
                            onClick={() => setNotification({ ...notification, show: false })}
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="relative z-10">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                      <div className="transition-all duration-200 group">
                        <label htmlFor="nama" className="block mb-1 text-xs font-medium text-gray-700 group-hover:text-[#406386] sm:mb-2 sm:text-sm">Nama</label>
                        <Input 
                          id="nama"
                          type="text" 
                          placeholder="Nama Lengkap" 
                          name="nama" 
                          value={formState.nama}
                          onChange={handleInputChange}
                          onFocus={() => handleInputFocus('nama')}
                          onBlur={handleInputBlur}
                          className={`border-gray-300 focus:ring-[#406386] focus:border-[#406386] transition-all duration-300 transform text-sm sm:text-base ${formFocus === 'nama' ? 'scale-102 shadow-md border-[#406386]/50' : ''}`}
                          required 
                        />
                      </div>
                      <div className="transition-all duration-200 group">
                        <label htmlFor="email" className="block mb-1 text-xs font-medium text-gray-700 group-hover:text-[#406386] sm:mb-2 sm:text-sm">Email</label>
                        <Input 
                          id="email"
                          type="email" 
                          placeholder="Email Aktif" 
                          name="email" 
                          value={formState.email}
                          onChange={handleInputChange}
                          onFocus={() => handleInputFocus('email')}
                          onBlur={handleInputBlur}
                          className={`border-gray-300 focus:ring-[#406386] focus:border-[#406386] transition-all duration-300 transform text-sm sm:text-base ${formFocus === 'email' ? 'scale-102 shadow-md border-[#406386]/50' : ''}`}
                          required 
                        />
                      </div>
                    </div>
                    <div className="transition-all duration-200 group">
                      <label htmlFor="pesan" className="block mb-1 text-xs font-medium text-gray-700 group-hover:text-[#406386] sm:mb-2 sm:text-sm">Pesan</label>
                      <Textarea 
                        id="pesan"
                        placeholder="Tulis pesan atau pertanyaan Anda di sini..." 
                        name="pesan" 
                        value={formState.pesan}
                        onChange={handleInputChange}
                        onFocus={() => handleInputFocus('pesan')}
                        onBlur={handleInputBlur}
                        className={`border-gray-300 focus:ring-[#406386] focus:border-[#406386] transition-all duration-300 transform text-sm sm:text-base ${formFocus === 'pesan' ? 'scale-102 shadow-md border-[#406386]/50' : ''}`}
                        rows={4} 
                        required 
                      />
                    </div>
                    
                    <div className="pt-2 sm:pt-4">
                      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row">
                        {/* Form Submit Button */}
                        <Button
                          type="submit"
                          className="flex-1 h-10 bg-gradient-to-r from-[#406386] to-[#365677] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg hover:-translate-y-1 text-sm sm:h-12 sm:text-base sm:rounded-xl"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center">
                              <svg className="w-4 h-4 mr-2 animate-spin sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Mengirim...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <svg className="w-4 h-4 mr-2 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                              </svg>
                              Kirim Pesan
                            </div>
                          )}
                        </Button>
                        
                        {/* WhatsApp Button */}
                        <Button
                          type="button"
                          onClick={handleWhatsAppClick}
                          className="flex-1 h-10 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm sm:h-12 sm:text-base sm:rounded-xl"
                        >
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                            </svg>
                            WhatsApp
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}

export default KontakPage
