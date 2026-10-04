import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Compass, TableProperties, ShieldCheck, Radio, Ship } from 'lucide-react'
import BathymetricSounder from './BathymetricSounder.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Hero() {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const [chartInfo, setChartInfo] = useState({
    chartTitle: 'Chart IN-351: Northern Bengal Shelf & Canyon Head',
    chartMeta: "Scale 1:150,000 · Mercator Projection · LAT 20°40'N – 21°55'N · LONG 86°50'E – 89°20'E",
    beaconStatus: 'Acoustic Beacon 74 Online'
  })

  return (
    <section id="home" className="relative w-full max-w-full overflow-x-hidden pt-28 pb-16 px-4 sm:px-6 bg-[#EAF4F8] border-b border-[#CCE4EC]">
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full min-w-0">
          
          {/* Left Column (5 cols): Authoritative Hydrographic Dispatch */}
          <div className="w-full min-w-0 lg:col-span-5 flex flex-col items-start pt-2">
            
            {/* Hydrographics Eyebrow Tag */}
            <div className="flex items-center gap-2 mb-3 text-xs">
              <span className="text-[#007A78] font-bold uppercase tracking-wider">
                {t('hero', 'eyebrow')}
              </span>
              <span className="text-[#809BAA]">•</span>
              <span className="text-[#5C7788] font-semibold">
                ISRO SIH26176
              </span>
            </div>

            {/* Main Serif Headline */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#0A1B27] leading-[1.18] mb-4 break-words">
              {t('hero', 'title')}
            </h1>

            {/* Subtext Paragraph */}
            <p className="text-sm sm:text-base text-[#2D4454] leading-relaxed mb-7 max-w-xl">
              {t('hero', 'subtext')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-8 w-full sm:w-auto">
              <Link
                to={isAuthenticated ? "/advisory" : "/login"}
                state={{ from: '/advisory', reason: 'action_required' }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#061219] hover:bg-[#0E2332] text-white px-6 py-3.5 font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98] rounded-xs"
              >
                <Compass size={14} className="text-[#007A78]" />
                <span>{t('hero', 'openAdvisory')}</span>
              </Link>
              <Link
                to={isAuthenticated ? "/regions" : "/login"}
                state={{ from: '/regions', reason: 'action_required' }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E2F0F5] hover:bg-[#D3E8EF] text-[#0A1B27] border border-[#BCDCE6] px-5 py-3.5 font-sans font-semibold text-xs uppercase tracking-wider transition-colors rounded-xs"
              >
                <Ship size={14} className="text-[#007A78]" />
                <span>Select Sea Basin</span>
              </Link>
            </div>

            {/* Open Station Facts separated by subtle rules */}
            <div className="w-full flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 pt-5 border-t border-[#CCE4EC] text-xs">
              <div>
                <span className="block text-[10px] text-[#5C7788] uppercase tracking-wider font-semibold">
                  {t('hero', 'extentLabel')}
                </span>
                <span className="font-serif text-[#0A1B27] font-bold text-base">
                  {t('hero', 'extentValue')}
                </span>
                <span className="block text-[11px] text-[#007A78] mt-0.5">
                  {t('hero', 'extentSub')}
                </span>
              </div>
              <div className="h-9 w-px bg-[#CCE4EC] hidden sm:block" />
              <div>
                <span className="block text-[10px] text-[#5C7788] uppercase tracking-wider font-semibold">
                  {t('hero', 'obsLabel')}
                </span>
                <span className="font-serif text-[#0A1B27] font-bold text-base">
                  {t('hero', 'obsValue')}
                </span>
                <span className="block text-[11px] text-[#007A78] mt-0.5">
                  {t('hero', 'obsSub')}
                </span>
              </div>
            </div>

          </div>

          {/* Right Column (7 cols): Hydrographic Chart IN-351 Frame */}
          <div className="w-full min-w-0 lg:col-span-7 flex flex-col">
            <div className="bg-white border border-[#CCE4EC] shadow-sm p-3.5 sm:p-5 w-full min-w-0 overflow-hidden rounded-xl">
              
              {/* Chart Masthead */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#E0EEF3] text-xs">
                <div>
                  <h3 className="font-serif font-bold text-[#0A1B27] text-base sm:text-lg">
                    {chartInfo.chartTitle}
                  </h3>
                  <div className="text-[11px] text-[#5C7788] tabular-nums mt-0.5">
                    {chartInfo.chartMeta}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#E1F3F5] text-[#007A78] border border-[#B9E4E8] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                  <Radio size={11} className="animate-pulse" />
                  <span>{chartInfo.beaconStatus}</span>
                </div>
              </div>

              {/* Bathymetric Sounder Instrument */}
              <BathymetricSounder
                interactive={true}
                onCorridorChange={(info) => {
                  setChartInfo({
                    chartTitle: info.chartTitle,
                    chartMeta: info.chartMeta,
                    beaconStatus: info.beaconStatus
                  })
                }}
              />

              <div className="mt-3 flex items-center justify-between text-xs text-[#5C7788] pt-2 border-t border-[#E0EEF3]">
                <span className="flex items-center gap-1.5 text-[#007A78] font-medium text-[11px]">
                  <ShieldCheck size={13} />
                  <span>{t('hero', 'chartFooter')}</span>
                </span>
                <span className="hidden sm:inline italic text-[11px]">
                  {t('hero', 'chartHint')}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
