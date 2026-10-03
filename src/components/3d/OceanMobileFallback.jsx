import { Compass, Radio, ShieldCheck, Activity } from 'lucide-react'

export default function OceanMobileFallback() {
  return (
    <div className="relative w-full max-w-[380px] mx-auto aspect-square flex items-center justify-center p-4">
      {/* Outer Glow Halo */}
      <div className="absolute inset-4 rounded-full bg-[#17A398]/10 blur-2xl pointer-events-none" />

      {/* Glassmorphic Radar Housing */}
      <div className="relative w-full h-full rounded-full border border-teal-500/30 bg-[#071927]/80 backdrop-blur-xl shadow-[0_0_50px_rgba(23,163,152,0.15)] flex items-center justify-center overflow-hidden">
        
        {/* Concentric Depth Isobaths */}
        <div className="absolute w-[85%] h-[85%] rounded-full border border-teal-500/20 border-dashed" />
        <div className="absolute w-[60%] h-[60%] rounded-full border border-sky-400/20" />
        <div className="absolute w-[35%] h-[35%] rounded-full border border-teal-500/30" />

        {/* Crosshair Axis Lines */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-teal-500/30 to-transparent" />

        {/* 360-Degree Sonar Sweep Line */}
        <div className="absolute inset-0 rounded-full animate-spin [animation-duration:4s] pointer-events-none origin-center">
          <div className="w-1/2 h-1/2 bg-gradient-to-br from-teal-400/40 via-teal-500/10 to-transparent rounded-tl-full origin-bottom-right" />
        </div>

        {/* Center Oceanographic Sensor Buoy */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#17A398] to-[#0d5953] border-2 border-white/80 shadow-[0_0_20px_#17A398] flex items-center justify-center animate-pulse">
            <Radio size={20} className="text-white" />
          </div>
          <span className="mt-2 text-[10px] font-mono font-bold tracking-widest text-teal-300 uppercase px-2 py-0.5 rounded bg-black/40 border border-teal-500/30">
            ORCA SENSOR BUOY
          </span>
        </div>

        {/* Peripheral Telemetry Nodes */}
        <div className="absolute top-6 left-8 flex items-center gap-1 text-[9px] font-mono text-teal-300/80">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
          <span>SST 28.4°C</span>
        </div>

        <div className="absolute bottom-6 right-8 flex items-center gap-1 text-[9px] font-mono text-sky-300/80">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span>WAVE 1.1m</span>
        </div>

        <div className="absolute top-10 right-8 text-[9px] font-mono text-emerald-400/80 flex items-center gap-1">
          <ShieldCheck size={11} />
          <span>VETO: CLEAR</span>
        </div>

        <div className="absolute bottom-8 left-8 text-[9px] font-mono text-purple-300/80 flex items-center gap-1">
          <Activity size={11} />
          <span>CHL 1.7 mg/m³</span>
        </div>

      </div>
    </div>
  )
}
