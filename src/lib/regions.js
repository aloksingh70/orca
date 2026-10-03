/**
 * regions.js
 * -----------------------------------------------------------------------------
 * India's 4 Major Coastal Sea Regions for Maritime Advisory & Port Clustering:
 * 1. Bay of Bengal Corridor (East Coast: West Bengal, Odisha, Andhra Pradesh, Tamil Nadu)
 * 2. Arabian Sea Corridor (West Coast: Gujarat, Maharashtra, Goa, Karnataka, Kerala)
 * 3. Andaman & Nicobar Archipelago (Island Union Territory)
 * 4. Lakshadweep Sea & Coral Atolls (Island Union Territory)
 *
 * Each region carries statutory fisheries ban schedules notified by the Ministry
 * of Fisheries, Animal Husbandry and Dairying (MoFAHD) and coastal bathymetry envelopes.
 * -----------------------------------------------------------------------------
 */

export const REGIONS = [
  {
    id: 'bay-of-bengal',
    name: 'Bay of Bengal Corridor',
    shortName: 'Bay of Bengal',
    hindiName: 'बंगाल की खाड़ी',
    subtitle: 'West Bengal, Odisha, Andhra Pradesh & Tamil Nadu East Coast',
    coastlineKm: 2540,
    majorPortsCount: 6,
    activePorts: ['kolkata-haldia', 'paradip', 'visakhapatnam', 'chennai', 'kamarajar-ennore', 'voc-tuticorin'],
    defaultPortId: 'kolkata-haldia',
    banSchedule: {
      startDay: 15,
      startMonth: 4, // April (1-indexed)
      endDay: 14,
      endMonth: 6,   // June
      label: '15 Apr – 14 Jun (61 Days)',
      coast: 'East Coast Uniform Ban',
      gazetteRef: 'MoFAHD / Dept of Fisheries Notification No. 31035/01/2020-FY'
    },
    monsoonProfile: 'SW Monsoon (Jun–Sep) & Post-Monsoon Tropical Cyclones (Oct–Nov)',
    primaryFisheries: 'Hilsa (Tenualosa ilisha), Silver Pomfret, Tiger Prawn, Ribbonfish, Bombay Duck',
    mapCenter: { lat: 19.5, lng: 86.5, zoom: 6 },
    accent: {
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      border: 'border-teal-300 dark:border-teal-800',
      badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 border-teal-300',
      fill: '#007A78'
    },
    description: 'Encompasses India’s eastern littoral from the Ganges-Brahmaputra Sundarbans delta down to the Gulf of Mannar. Characterized by high riverine discharge, estuarine silt channels, and high biological productivity in seasonal thermal fronts.'
  },
  {
    id: 'arabian-sea',
    name: 'Arabian Sea Corridor',
    shortName: 'Arabian Sea',
    hindiName: 'अरब सागर',
    subtitle: 'Gujarat, Maharashtra, Goa, Karnataka & Kerala West Coast',
    coastlineKm: 3300,
    majorPortsCount: 6,
    activePorts: ['deendayal-kandla', 'mumbai', 'jnpt-nhava-sheva', 'mormugao', 'new-mangalore', 'cochin'],
    defaultPortId: 'mumbai',
    banSchedule: {
      startDay: 1,
      startMonth: 6, // June (1-indexed)
      endDay: 31,
      endMonth: 7,   // July
      label: '01 Jun – 31 Jul (61 Days)',
      coast: 'West Coast Uniform Ban',
      gazetteRef: 'MoFAHD / Dept of Fisheries West Coast Order'
    },
    monsoonProfile: 'Intense Southwest Monsoon (Jun–Aug) with persistent high swell (Hs > 3.5m)',
    primaryFisheries: 'Indian Oil Sardine, Indian Mackerel, Yellowfin Tuna, Cephalopods (Squid/Cuttlefish)',
    mapCenter: { lat: 16.5, lng: 72.8, zoom: 6 },
    accent: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/40',
      border: 'border-cyan-300 dark:border-cyan-800',
      badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200 border-cyan-300',
      fill: '#0284C7'
    },
    description: 'India’s western maritime trade spine connecting the Gulf of Kutch to Cape Comorin. Features deep container fairways (JNPA, Mundra), high-salinity upwelling zones, and the rich Malabar-Konkan pelagic fishing banks.'
  },
  {
    id: 'andaman-nicobar',
    name: 'Andaman & Nicobar Archipelago',
    shortName: 'Andaman & Nicobar',
    hindiName: 'अंडमान और निकोबार द्वीप समूह',
    subtitle: 'Port Blair & 572 Oceanic Islands in the Bay of Bengal & Andaman Sea',
    coastlineKm: 1962,
    majorPortsCount: 1,
    activePorts: ['port-blair'],
    defaultPortId: 'port-blair',
    banSchedule: {
      startDay: 15,
      startMonth: 4, // April
      endDay: 14,
      endMonth: 6,   // June
      label: '15 Apr – 14 Jun (61 Days)',
      coast: 'Island Marine Sanctuary Regulation',
      gazetteRef: 'A&N Marine Fisheries Regulation 2004'
    },
    monsoonProfile: 'Bi-modal Monsoon with squall clusters across Ten Degree Channel (May–Oct)',
    primaryFisheries: 'Oceanic Yellowfin & Skipjack Tuna, Snapper, Coral Reef Grouper, Flying Fish',
    mapCenter: { lat: 11.66, lng: 92.73, zoom: 7 },
    accent: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-300 dark:border-emerald-800',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300',
      fill: '#059669'
    },
    description: 'Strategic island chain dividing the Bay of Bengal from the Andaman Sea. Pristine coral atolls, deep pelagic drop-offs, and critical international sea lanes transiting the Malacca Strait western approaches.'
  },
  {
    id: 'lakshadweep',
    name: 'Lakshadweep Sea & Coral Atolls',
    shortName: 'Lakshadweep',
    hindiName: 'लक्षद्वीप',
    subtitle: 'Kavaratti, Agatti, Andrott & Minicoi Coral Atoll System',
    coastlineKm: 132,
    majorPortsCount: 1,
    activePorts: ['kavaratti'],
    defaultPortId: 'kavaratti',
    banSchedule: {
      startDay: 1,
      startMonth: 6, // June
      endDay: 31,
      endMonth: 7,   // July
      label: '01 Jun – 31 Jul (61 Days)',
      coast: 'Atoll Conservation Order',
      gazetteRef: 'Lakshadweep Fisheries Regulation'
    },
    monsoonProfile: 'Exposed SW oceanic swells, restricted lagoon navigation (Jun–Aug)',
    primaryFisheries: 'Pole-and-line Skipjack Tuna (Eco-certified MSC), Rainbow Runner, Barracuda',
    mapCenter: { lat: 10.57, lng: 72.64, zoom: 8 },
    accent: {
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      border: 'border-sky-300 dark:border-sky-800',
      badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 border-sky-300',
      fill: '#0284C7'
    },
    description: 'Union territory of 36 islands and submerged banks 200–440 km off the Malabar coast. Renowned for zero-bycatch traditional pole-and-line skipjack harvesting, fragile fringing coral reefs, and lagoon entrances.'
  }
]

export const getRegionById = (id) => REGIONS.find((r) => r.id === id) || REGIONS[0]
