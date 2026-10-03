/**
 * vessels.js
 * -----------------------------------------------------------------------------
 * Pan-India Live AIS Vessel Tracking & Maritime Traffic Feed Simulation.
 *
 * ARCHITECTURAL PRINCIPLE: "Swap the data feed, not the pipeline".
 * This module generates authentic, deterministic AIS vessel telemetry conforming
 * to the International Maritime Organization (IMO) / DGLL AIS transponder standard:
 * - MMSI (Maritime Mobile Service Identity, 9 digits, Indian MID = 419)
 * - Vessel Name, IMO Number, Call Sign, Flag
 * - Class (Cargo, Tanker, Cruise, Fishing, Patrol)
 * - Dynamic Position (Lat/Lng), Heading (Course over Ground °), Speed (Knots)
 * - Destination Port & Estimated Time of Arrival (ETA)
 * - Real-time collision proximity hazard detection (< 6 NM to fishing craft)
 *
 * In production with government data-sharing agreements (e.g. Indian Coast Guard
 * or Directorate General of Lighthouses and Lightships National AIS network),
 * replace this provider function with a WebSocket or polling REST client.
 * -----------------------------------------------------------------------------
 */

import { zones } from './zones.js'

// Haversine distance in Nautical Miles (NM)
export function haversineNM(lat1, lon1, lat2, lon2) {
  const rKm = 6371.0
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(rKm * c * 0.539957 * 10) / 10
}

const REGIONAL_VESSEL_REGISTRY = [
  // =========================================================================
  // 1. BAY OF BENGAL CORRIDOR
  // =========================================================================
  {
    mmsi: '419001240',
    imo: '9382104',
    name: 'MV Brahma',
    callSign: 'AVBM',
    flag: 'India (IN)',
    regionId: 'bay-of-bengal',
    portId: 'kolkata-haldia',
    vesselType: 'cargo',
    categoryLabel: 'Bulk Carrier (Handymax)',
    lat: 21.284,
    lng: 88.125,
    speedKnots: 11.4,
    courseDeg: 348,
    lengthM: 189,
    widthM: 30,
    draughtM: 8.5,
    destination: 'Haldia Dock Complex (INHAL)',
    eta: 'Today 14:30 IST',
    navStatus: 'Underway using engine',
    cargoType: 'Coking Coal & Dry Bulk',
    operator: 'Shipping Corporation of India (SCI)'
  },
  {
    mmsi: '419000852',
    imo: '9451892',
    name: 'Sagar Jyoti',
    callSign: 'AWKJ',
    flag: 'India (IN)',
    regionId: 'bay-of-bengal',
    portId: 'kolkata-haldia',
    vesselType: 'cargo',
    categoryLabel: 'Container Feeder Vessel',
    lat: 21.412,
    lng: 87.954,
    speedKnots: 13.2,
    courseDeg: 12,
    lengthM: 162,
    widthM: 25,
    draughtM: 7.8,
    destination: 'Syama Prasad Mookerjee Port Kolkata (INCCU)',
    eta: 'Today 17:15 IST',
    navStatus: 'Underway using engine',
    cargoType: 'ISO Container Freight (720 TEU)',
    operator: 'Shreyas Shipping & Logistics'
  },
  {
    mmsi: '419000991',
    imo: 'ICG-OFF-8821',
    name: 'ICGS Varad (40)',
    callSign: 'AWVD',
    flag: 'India (IN)',
    regionId: 'bay-of-bengal',
    portId: 'kolkata-haldia',
    vesselType: 'patrol',
    categoryLabel: 'Offshore Patrol Vessel (OPV)',
    lat: 21.51,
    lng: 88.35,
    speedKnots: 18.2,
    courseDeg: 215,
    lengthM: 98,
    widthM: 15,
    draughtM: 3.6,
    destination: 'Maritime Border Surveillance (IMBL Line)',
    eta: 'Continuous Patrol',
    navStatus: 'Restricted maneuverability / Law enforcement',
    cargoType: 'Coast Guard Maritime Security & SAR Equipment',
    operator: 'Indian Coast Guard'
  },
  {
    mmsi: '419900114',
    imo: 'IND-WB-24-0089',
    name: 'FB Maa Durga (WB-24)',
    callSign: 'AWFD',
    flag: 'India (IN)',
    regionId: 'bay-of-bengal',
    portId: 'kolkata-haldia',
    vesselType: 'fishing',
    categoryLabel: 'Commercial Stern Trawler',
    lat: 21.61,
    lng: 87.56,
    speedKnots: 3.8,
    courseDeg: 140,
    lengthM: 14.5,
    widthM: 4.2,
    draughtM: 1.8,
    destination: 'Shankarpur Fishing Harbour',
    eta: 'Today 21:00 IST',
    navStatus: 'Engaged in fishing',
    cargoType: 'Hilsa & Tiger Prawn Catch',
    operator: 'Shankarpur Fishermen Syndicate'
  },
  {
    mmsi: '419002105',
    imo: '9390112',
    name: 'MT Bengal Pride',
    callSign: 'AWBP',
    flag: 'India (IN)',
    regionId: 'bay-of-bengal',
    portId: 'paradip',
    vesselType: 'tanker',
    categoryLabel: 'Product Tanker (MR2)',
    lat: 20.21,
    lng: 86.72,
    speedKnots: 9.8,
    courseDeg: 45,
    lengthM: 183,
    widthM: 32,
    draughtM: 11.2,
    destination: 'Paradip SPM Terminal (INPRT)',
    eta: 'Today 18:00 IST',
    navStatus: 'Underway using engine',
    cargoType: 'High Speed Diesel & Naphtha',
    operator: 'Indian Oil Corporation Marine Division'
  },
  {
    mmsi: '419003440',
    imo: '9420088',
    name: 'MV Vizag Pioneer',
    callSign: 'AVPZ',
    flag: 'India (IN)',
    regionId: 'bay-of-bengal',
    portId: 'visakhapatnam',
    vesselType: 'cargo',
    categoryLabel: 'Capesize Bulk Carrier',
    lat: 17.62,
    lng: 83.35,
    speedKnots: 10.5,
    courseDeg: 280,
    lengthM: 292,
    widthM: 45,
    draughtM: 16.5,
    destination: 'Visakhapatnam Outer Harbour (INVTZ)',
    eta: 'Today 19:30 IST',
    navStatus: 'Approaching anchorage',
    cargoType: 'Iron Ore Pellets',
    operator: 'Essar Shipping'
  },
  {
    mmsi: '419004112',
    imo: '9510099',
    name: 'Chennai Express',
    callSign: 'AVCE',
    flag: 'India (IN)',
    regionId: 'bay-of-bengal',
    portId: 'chennai',
    vesselType: 'cargo',
    categoryLabel: 'Container Feeder (1,800 TEU)',
    lat: 13.12,
    lng: 80.34,
    speedKnots: 14.1,
    courseDeg: 195,
    lengthM: 178,
    widthM: 28,
    draughtM: 9.4,
    destination: 'Chennai Container Terminal (INMAA)',
    eta: 'Today 16:00 IST',
    navStatus: 'Underway using engine',
    cargoType: 'Automotive Spares & Consumer Electronics',
    operator: 'Simatech Shipping'
  },

  // =========================================================================
  // 2. ARABIAN SEA CORRIDOR
  // =========================================================================
  {
    mmsi: '419005011',
    imo: '9811002',
    name: 'MSC Mumbai Pride',
    callSign: 'AVMP',
    flag: 'India (IN)',
    regionId: 'arabian-sea',
    portId: 'mumbai',
    vesselType: 'cargo',
    categoryLabel: 'Ultra Large Container Vessel (12,000 TEU)',
    lat: 18.91,
    lng: 72.78,
    speedKnots: 14.8,
    courseDeg: 78,
    lengthM: 366,
    widthM: 48,
    draughtM: 14.2,
    destination: 'Jawaharlal Nehru Port (INNSA)',
    eta: 'Today 15:45 IST',
    navStatus: 'Underway using engine',
    cargoType: 'General Manufactured Freight',
    operator: 'Mediterranean Shipping Company / SCI'
  },
  {
    mmsi: '419005882',
    imo: '9283114',
    name: 'MT Desh Shanti',
    callSign: 'AWDS',
    flag: 'India (IN)',
    regionId: 'arabian-sea',
    portId: 'mumbai',
    vesselType: 'tanker',
    categoryLabel: 'Very Large Crude Carrier (VLCC)',
    lat: 18.82,
    lng: 72.68,
    speedKnots: 11.2,
    courseDeg: 35,
    lengthM: 333,
    widthM: 60,
    draughtM: 20.5,
    destination: 'Mumbai High / Jawahar Dweep Crude Terminal',
    eta: 'Tomorrow 02:00 IST',
    navStatus: 'Restricted draft',
    cargoType: 'Basrah Light Crude Oil',
    operator: 'Shipping Corporation of India (SCI)'
  },
  {
    mmsi: '419006119',
    imo: 'ICG-SAM-901',
    name: 'ICGS Samrat (47)',
    callSign: 'AWSM',
    flag: 'India (IN)',
    regionId: 'arabian-sea',
    portId: 'mumbai',
    vesselType: 'patrol',
    categoryLabel: 'Advanced Offshore Patrol Vessel',
    lat: 18.75,
    lng: 72.72,
    speedKnots: 21.0,
    courseDeg: 310,
    lengthM: 105,
    widthM: 13.6,
    draughtM: 3.6,
    destination: 'Western EEZ Security Sector Alpha',
    eta: 'Continuous Sortie',
    navStatus: 'Law enforcement patrol',
    cargoType: 'Coast Guard Rescue Helicopter & Interceptors',
    operator: 'Indian Coast Guard Western Command'
  },
  {
    mmsi: '419902008',
    imo: 'IND-MH-01-884',
    name: 'FB Matsya Raj',
    callSign: 'AWMR',
    flag: 'India (IN)',
    regionId: 'arabian-sea',
    portId: 'mumbai',
    vesselType: 'fishing',
    categoryLabel: 'Mechanized Dol-Netter (Bagnet)',
    lat: 18.86,
    lng: 72.82,
    speedKnots: 3.2,
    courseDeg: 210,
    lengthM: 13.8,
    widthM: 3.9,
    draughtM: 1.6,
    destination: 'Sassoon Dock Terminal',
    eta: 'Today 20:30 IST',
    navStatus: 'Engaged in fishing',
    cargoType: 'Bombay Duck & Pomfret Haul',
    operator: 'Koli Machhimar Cooperative Mumbai'
  },
  {
    mmsi: '419007421',
    imo: '9482109',
    name: 'MV Cochin Gateway',
    callSign: 'AVCG',
    flag: 'India (IN)',
    regionId: 'arabian-sea',
    portId: 'cochin',
    vesselType: 'cargo',
    categoryLabel: 'Container Feeder',
    lat: 9.94,
    lng: 76.18,
    speedKnots: 12.6,
    courseDeg: 62,
    lengthM: 190,
    widthM: 30,
    draughtM: 10.5,
    destination: 'Vallarpadam International Transshipment Terminal',
    eta: 'Today 18:30 IST',
    navStatus: 'Underway using engine',
    cargoType: 'Spices, Seafood & Coffee Exports',
    operator: 'DP World Cochin'
  },
  {
    mmsi: '419903115',
    imo: 'IND-KL-07-772',
    name: 'St. Mary of Munambam',
    callSign: 'AWSM7',
    flag: 'India (IN)',
    regionId: 'arabian-sea',
    portId: 'cochin',
    vesselType: 'fishing',
    categoryLabel: 'Deepsea Purse Seiner',
    lat: 10.05,
    lng: 76.14,
    speedKnots: 4.1,
    courseDeg: 275,
    lengthM: 22.0,
    widthM: 5.8,
    draughtM: 2.4,
    destination: 'Munambam Fishing Harbour',
    eta: 'Today 22:00 IST',
    navStatus: 'Engaged in fishing',
    cargoType: 'Indian Oil Sardine & Mackerel School',
    operator: 'Munambam Boat Owners Association'
  },
  {
    mmsi: '419008912',
    imo: '9312108',
    name: 'MT Kutch Pride',
    callSign: 'AVKP',
    flag: 'India (IN)',
    regionId: 'arabian-sea',
    portId: 'deendayal-kandla',
    vesselType: 'tanker',
    categoryLabel: 'Suezmax Crude Tanker',
    lat: 22.84,
    lng: 70.15,
    speedKnots: 10.1,
    courseDeg: 340,
    lengthM: 274,
    widthM: 48,
    draughtM: 15.8,
    destination: 'Vadinar Single Point Mooring (INVDN)',
    eta: 'Tomorrow 06:00 IST',
    navStatus: 'Underway using engine',
    cargoType: 'Middle East Sour Crude Oil',
    operator: 'Nayara Energy / IOCL'
  },

  // =========================================================================
  // 3. ANDAMAN & NICOBAR ARCHIPELAGO
  // =========================================================================
  {
    mmsi: '419009112',
    imo: '9620011',
    name: 'MV Coral Queen',
    callSign: 'AVCQ',
    flag: 'India (IN)',
    regionId: 'andaman-nicobar',
    portId: 'port-blair',
    vesselType: 'cruise',
    categoryLabel: 'Inter-Island Passenger & Cargo Ferry',
    lat: 11.69,
    lng: 92.74,
    speedKnots: 15.5,
    courseDeg: 165,
    lengthM: 78,
    widthM: 14,
    draughtM: 3.2,
    destination: 'Hut Bay (Little Andaman)',
    eta: 'Today 16:30 IST',
    navStatus: 'Underway using engine',
    cargoType: 'Passengers, Medical Stores & Fresh Produce',
    operator: 'Directorate of Shipping Services, A&N Administration'
  },
  {
    mmsi: '419904221',
    imo: 'IND-AN-01-309',
    name: 'Bluefin Hunter-01',
    callSign: 'AWBF',
    flag: 'India (IN)',
    regionId: 'andaman-nicobar',
    portId: 'port-blair',
    vesselType: 'fishing',
    categoryLabel: 'Oceanic Tuna Longliner',
    lat: 11.64,
    lng: 92.82,
    speedKnots: 5.2,
    courseDeg: 120,
    lengthM: 24.5,
    widthM: 6.2,
    draughtM: 2.8,
    destination: 'Junglighat Fishing Harbour',
    eta: 'Tomorrow 08:00 IST',
    navStatus: 'Engaged in fishing',
    cargoType: 'Sashimi-grade Yellowfin Tuna on Slush Ice',
    operator: 'Andaman Pelagic Fisheries'
  },
  {
    mmsi: '419009801',
    imo: 'NAV-PB-771',
    name: 'INS Bangaram (T65)',
    callSign: 'AWBN',
    flag: 'India (IN)',
    regionId: 'andaman-nicobar',
    portId: 'port-blair',
    vesselType: 'patrol',
    categoryLabel: 'Fast Attack Craft (FAC)',
    lat: 11.58,
    lng: 92.79,
    speedKnots: 26.0,
    courseDeg: 190,
    lengthM: 49,
    widthM: 7.5,
    draughtM: 1.8,
    destination: 'Ten Degree Channel Anti-Poaching Patrol',
    eta: 'Active Sortie',
    navStatus: 'Naval Operations',
    cargoType: 'Naval Defence & Coastal Radar Intercept',
    operator: 'Andaman & Nicobar Joint Command (ANC)'
  },

  // =========================================================================
  // 4. LAKSHADWEEP SEA
  // =========================================================================
  {
    mmsi: '419010201',
    imo: '9580022',
    name: 'MV Kavaratti Express',
    callSign: 'AVKE',
    flag: 'India (IN)',
    regionId: 'lakshadweep',
    portId: 'kavaratti',
    vesselType: 'cruise',
    categoryLabel: 'High-Speed Island Catamaran',
    lat: 10.59,
    lng: 72.67,
    speedKnots: 22.4,
    courseDeg: 245,
    lengthM: 42,
    widthM: 10.5,
    draughtM: 1.9,
    destination: 'Kavaratti Lagoon Jetty',
    eta: 'Today 15:00 IST',
    navStatus: 'Underway using engine',
    cargoType: 'Island Commuters & Postal Airfreight',
    operator: 'Lakshadweep Development Corporation Ltd (LDCL)'
  },
  {
    mmsi: '419905101',
    imo: 'IND-LD-02-119',
    name: 'Odi Suheli Champion',
    callSign: 'AWSC',
    flag: 'India (IN)',
    regionId: 'lakshadweep',
    portId: 'kavaratti',
    vesselType: 'fishing',
    categoryLabel: 'Traditional Pole-and-Line Tuna Craft',
    lat: 10.52,
    lng: 72.58,
    speedKnots: 6.8,
    courseDeg: 195,
    lengthM: 12.5,
    widthM: 3.6,
    draughtM: 1.2,
    destination: 'Suheli Bank / Kavaratti',
    eta: 'Today 19:00 IST',
    navStatus: 'Engaged in fishing',
    cargoType: 'Live-Bait Pole & Line Skipjack Tuna (MSC Certified)',
    operator: 'Kavaratti Tuna Fishers Cooperative'
  }
]

/**
 * Returns dynamic live vessel list filtered by region and optionally port.
 * Calculates live micro-drift based on real elapsed time, proximity to coastal zones,
 * and flags collision hazards.
 */
export function getLiveVessels({ regionId = 'bay-of-bengal', portId = null, category = null } = {}) {
  // Filter by region (and port if supplied and matches)
  let list = REGIONAL_VESSEL_REGISTRY.filter((v) => {
    if (regionId && v.regionId !== regionId) return false
    if (portId && v.portId !== portId) return false
    if (category && category.toLowerCase() !== 'all' && v.vesselType !== category.toLowerCase()) return false
    return true
  })

  // If filtered down to 0, fallback to region-wide vessels
  if (list.length === 0 && regionId) {
    list = REGIONAL_VESSEL_REGISTRY.filter((v) => v.regionId === regionId)
  }

  // Get active zones for distance calculation
  const relevantZones = zones.filter((z) => (regionId ? z.regionId === regionId : true))

  // Time-based smooth micro-drift
  const now = new Date()
  const sec = now.getSeconds() + now.getMinutes() * 60

  return list.map((v) => {
    const driftLat = Math.sin(sec / 120.0 + parseInt(v.mmsi.slice(-3), 10)) * 0.004
    const driftLng = Math.cos(sec / 120.0 + parseInt(v.mmsi.slice(-3), 10)) * 0.004
    const currentLat = Math.round((v.lat + driftLat) * 10000) / 10000
    const currentLng = Math.round((v.lng + driftLng) * 10000) / 10000

    // Closest zone
    let closestZone = null
    let minDistNM = 9999
    for (const z of relevantZones) {
      const d = haversineNM(currentLat, currentLng, z.lat, z.lng)
      if (d < minDistNM) {
        minDistNM = d
        closestZone = z
      }
    }

    const isCommercial = v.vesselType === 'cargo' || v.vesselType === 'tanker'
    const proximityHazard = isCommercial && minDistNM <= 6.0

    return {
      ...v,
      lat: currentLat,
      lng: currentLng,
      closestZoneId: closestZone?.id || null,
      closestZoneName: closestZone?.name || null,
      closestSectorCode: closestZone?.sectorCode || null,
      distanceToClosestZoneNM: minDistNM < 9000 ? minDistNM : null,
      proximityHazard,
      hazardNote: proximityHazard
        ? `Caution: Heavy commercial vessel (${v.name}) navigating within ${minDistNM} NM of ${closestZone?.name} (${closestZone?.sectorCode}) artisanal fishing grounds. Monitor VHF Ch 16.`
        : null,
      lastAisUpdate: now.toISOString(),
      dataSource: 'Simulated AIS (DGLL / Coast Guard Protocol Ready)'
    }
  })
}
