import { Button, Link } from '@heroui/react'
import React from 'react'

const Hero = () => {
  return (
    <section className="relative mx-2 my-2 overflow-hidden rounded-xl sm:mx-4 sm:my-4 sm:rounded-2xl lg:mx-6 lg:my-6 lg:rounded-3xl xl:mx-8 xl:my-8 xl:rounded-4xl">
      {/* Background Image */}
      <img 
        src="assets/image/hero/hero.png"
        alt="Siswa bersemangat belajar"
        className="absolute inset-0 object-cover w-full h-full brightness-75"
      />

      {/* Overlay */}
      <div className="relative z-10 px-3 py-8 text-white bg-[#406386]/70 backdrop-blur-md sm:px-6 sm:py-12 lg:px-12 lg:py-16 xl:py-20">
        <div className="flex flex-col items-center justify-center gap-3 text-center sm:gap-4 lg:gap-6 xl:gap-8">
          <h1 className="w-full max-w-[280px] text-xl font-semibold tracking-tight leading-tight sm:max-w-xs sm:text-2xl lg:max-w-lg lg:text-3xl xl:max-w-2xl xl:text-4xl 2xl:text-6xl">
            Mari Nyalakan Semangat Pendidikan bersama Kami
          </h1>
          <p className="w-full max-w-[260px] text-xs leading-relaxed sm:max-w-sm sm:text-sm lg:max-w-md lg:text-base xl:max-w-xl xl:text-lg">
            Beasiswa untuk pelajar yang memiliki semangat dalam menempuh pendidikan. Setiap kontribusi membukakan jalan ke masa depan.
          </p>
          <Button className="px-3 py-2 text-xs transition-all bg-white rounded-lg shadow-md w-fit sm:px-4 sm:py-2 sm:text-sm sm:rounded-xl lg:px-6 lg:py-3 lg:text-base xl:px-8 xl:text-lg">
            <Link href="/company-profile/donasi" className="text-[#406386] font-medium">
              Berikan Donasi!
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Hero
