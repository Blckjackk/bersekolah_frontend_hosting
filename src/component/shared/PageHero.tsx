import React from "react";

interface PageHeroProps {
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaScrollTarget?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  badge?: string;
  minHeight?: string;
}

const PageHero: React.FC<PageHeroProps> = ({
  title,
  titleHighlight,
  subtitle,
  description,
  backgroundImage,
  ctaText,
  ctaScrollTarget,
  ctaHref,
  onCtaClick,
  badge,
  minHeight = "min-h-[70vh]",
}) => {
  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
      return;
    }
    if (ctaScrollTarget) {
      document.getElementById(ctaScrollTarget)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section
      className={`relative flex items-center justify-center ${minHeight} overflow-hidden`}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#2d4a66] to-[#406386]" />

      {/* Background Image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover opacity-20"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
      )}

      {/* Decorative Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-72 h-72 rounded-full top-[-5%] right-[-5%] bg-[#406386]/30 blur-3xl"
          style={{ animation: "pulse 4s ease-in-out infinite" }}
        />
        <div
          className="absolute w-96 h-96 rounded-full bottom-[-10%] left-[-10%] bg-cyan-500/10 blur-3xl"
          style={{
            animation: "pulse 6s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute w-48 h-48 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-400/10 blur-2xl"
          style={{
            animation: "pulse 5s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />
        {/* Floating dots */}
        <div
          className="absolute w-3 h-3 rounded-full top-1/4 left-1/4 bg-white/20"
          style={{ animation: "bounce 3s ease-in-out infinite" }}
        />
        <div
          className="absolute w-2 h-2 rounded-full top-3/4 right-1/4 bg-cyan-300/30"
          style={{
            animation: "bounce 4s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute w-4 h-4 rounded-full top-1/3 right-1/3 bg-white/10"
          style={{
            animation: "bounce 5s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="container relative z-10 px-4 mx-auto text-center sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <div className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
              <span className="text-sm font-medium text-white/90">{badge}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl sm:mb-5">
            {title}
            {titleHighlight && (
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-white">
                {titleHighlight}
              </span>
            )}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="mb-2 text-lg font-semibold text-cyan-200 sm:text-xl">
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="max-w-3xl mx-auto mb-8 text-sm font-light leading-relaxed text-white/80 sm:text-base md:text-lg">
              {description}
            </p>
          )}

          {/* CTA Button */}
          {ctaText && (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {ctaHref ? (
                <a
                  href={ctaHref}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-[#406386] rounded-full font-bold text-sm hover:bg-cyan-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg sm:text-base"
                >
                  <span>{ctaText}</span>
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              ) : (
                <button
                  onClick={handleCtaClick}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-[#406386] rounded-full font-bold text-sm hover:bg-cyan-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg sm:text-base"
                >
                  <span>{ctaText}</span>
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default PageHero;
