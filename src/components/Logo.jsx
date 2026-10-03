export default function Logo({ className = 'h-8 w-auto', light = false }) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Indian Space & Marine Insignia */}
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 shrink-0"
        aria-hidden="true"
      >
        {/* Ashoka blue outer compass ring */}
        <circle cx="18" cy="18" r="16" stroke="#E86014" strokeWidth="1.2" strokeOpacity="0.8" />
        <circle cx="18" cy="18" r="13" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.8" strokeDasharray="2 3" />
        
        {/* Cardinal tick marks in Saffron & Emerald */}
        <line x1="18" y1="2" x2="18" y2="5" stroke="#E86014" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="31" x2="18" y2="34" stroke="#106644" strokeWidth="2" strokeLinecap="round" />
        <line x1="2" y1="18" x2="5" y2="18" stroke="#106644" strokeWidth="2" strokeLinecap="round" />
        <line x1="31" y1="18" x2="34" y2="18" stroke="#106644" strokeWidth="2" strokeLinecap="round" />

        {/* Marine bathymetric wave profile */}
        <path
          d="M6 21 C11 16, 15 24, 21 19 C26 15, 29 18, 30 20"
          stroke="#0A1B27"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8 25 C12 21, 16 27, 22 23 C25 21, 27 22, 28 23"
          stroke="#007A78"
          strokeWidth="1.3"
          strokeLinecap="round"
        />

        {/* Center Sounding Ping Node in Saffron */}
        <circle cx="18" cy="18" r="2.5" fill="#E86014" />
      </svg>

      {/* Typography with Indian Bilingual Title */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className="font-serif text-xl font-bold tracking-tight text-[#0A1B27]">
            ORCA
          </span>
          <span className="text-[10px] font-sans font-bold text-[#E86014] uppercase tracking-wider">
            सागर मित्र
          </span>
        </div>
        <span className="font-sans text-[9px] font-bold tracking-wide uppercase mt-0.5 text-[#476577] hidden xs:block">
          ISRO • INCOIS Marine Advisory
        </span>
      </div>
    </div>
  )
}


