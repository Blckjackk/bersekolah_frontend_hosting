import React from "react";

const Hero = () => {
  return (
    <section className="relative mx-2 my-2 overflow-hidden rounded-xl sm:mx-4 sm:my-4 sm:rounded-2xl lg:mx-6 lg:my-6 lg:rounded-3xl xl:mx-8 xl:my-8 xl:rounded-4xl shadow-md">
      <img
        src="/assets/image/static/hero/header-hero-section.jpeg"
        alt="Informasi Terbaru Seleksi Penerimaan Beasiswa Bersekolah 2027"
        className="w-full h-auto object-cover block"
        loading="eager"
      />
    </section>
  );
};

export default Hero;
