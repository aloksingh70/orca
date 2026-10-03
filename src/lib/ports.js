/**
 * ports.js
 * -----------------------------------------------------------------------------
 * Directory of Indian Maritime Ports organized by Coastal Sea Region.
 * Features all 12 Major Ports of India under the Ministry of Ports,
 * Shipping and Waterways (MoPSW / Sagarmala), plus Island Port Authorities.
 *
 * Official classifications verified against Sagarmala / shipmin.gov.in.
 * -----------------------------------------------------------------------------
 */

export const PORTS = [
  // =========================================================================
  // 1. BAY OF BENGAL CORRIDOR
  // =========================================================================
  {
    id: 'kolkata-haldia',
    regionId: 'bay-of-bengal',
    name: 'Syama Prasad Mookerjee Port (Kolkata & Haldia)',
    shortName: 'Kolkata / Haldia',
    state: 'West Bengal',
    classification: 'Major Port (MoPSW)',
    coordinates: { lat: 21.65, lng: 87.85 },
    harborMaster: 'Sagar Roads Anchorage & SMP Riverine Pilot Station',
    navigationalDepth: '8.5m – 12.0m (Tidal)',
    fleetProfile: 'River-sea container vessels, coking coal bulk carriers, mechanized trawlers & motorized nauka',
    subZoneIds: ['digha', 'shankarpur', 'junput', 'sagar-island', 'frazerganj', 'kakdwip']
  },
  {
    id: 'paradip',
    regionId: 'bay-of-bengal',
    name: 'Paradip Port Authority',
    shortName: 'Paradip',
    state: 'Odisha',
    classification: 'Major Port (MoPSW)',
    coordinates: { lat: 20.26, lng: 86.67 },
    harborMaster: 'Paradip Port Marine Traffic Control',
    navigationalDepth: '14.5m – 17.1m (Deepwater)',
    fleetProfile: 'Iron ore capesize carriers, crude oil tankers, mechanized gillnetters (Mahanadi mouth)',
    subZoneIds: ['paradip-outer', 'mahanadi-mouth', 'jatadhari-estuary']
  },
  {
    id: 'visakhapatnam',
    regionId: 'bay-of-bengal',
    name: 'Visakhapatnam Port Authority',
    shortName: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    classification: 'Major Port (MoPSW)',
    coordinates: { lat: 17.68, lng: 83.29 },
    harborMaster: 'Dolphin’s Nose Signal Station (VPA)',
    navigationalDepth: '16.5m – 18.1m (Natural Deepwater)',
    fleetProfile: 'Naval defence craft, container liners, mechanized multiday tuna longliners',
    subZoneIds: ['vizag-dolphins-nose', 'gangavaram-roads', 'rishikonda-bank']
  },
  {
    id: 'chennai',
    regionId: 'bay-of-bengal',
    name: 'Chennai Port Authority',
    shortName: 'Chennai',
    state: 'Tamil Nadu',
    classification: 'Major Port (MoPSW)',
    coordinates: { lat: 13.08, lng: 80.29 },
    harborMaster: 'Chennai Port Trust Marine Operations',
    navigationalDepth: '14.0m – 16.5m',
    fleetProfile: 'Automobile Ro-Ro carriers, container feeder liners, Kasimedu mechanized trawlers',
    subZoneIds: ['chennai-kasimedu', 'ennore-shoals', 'marina-outer-bank']
  },
  {
    id: 'kamarajar-ennore',
    regionId: 'bay-of-bengal',
    name: 'Kamarajar Port Limited (Ennore)',
    shortName: 'Kamarajar (Ennore)',
    state: 'Tamil Nadu',
    classification: 'Major Port (MoPSW / Corporatized)',
    coordinates: { lat: 13.26, lng: 80.33 },
    harborMaster: 'Ennore Marine Operations Center',
    navigationalDepth: '16.0m',
    fleetProfile: 'Thermal coal carriers, LNG supertankers, coastal artisanal skiffs',
    subZoneIds: ['ennore-fairway', 'pulicat-lake-mouth']
  },
  {
    id: 'voc-tuticorin',
    regionId: 'bay-of-bengal',
    name: 'V.O. Chidambaranar Port Authority (Tuticorin)',
    shortName: 'V.O.C. Tuticorin',
    state: 'Tamil Nadu',
    classification: 'Major Port (MoPSW)',
    coordinates: { lat: 8.75, lng: 78.19 },
    harborMaster: 'VOC Port Navigation Tower',
    navigationalDepth: '14.2m',
    fleetProfile: 'Gulf of Mannar container feederships, pearl oyster reef survey boats, deepsea trawlers',
    subZoneIds: ['tuticorin-outer-roads', 'gulf-of-mannar-shelf']
  },

  // =========================================================================
  // 2. ARABIAN SEA CORRIDOR
  // =========================================================================
  {
    id: 'mumbai',
    regionId: 'arabian-sea',
    name: 'Mumbai Port Authority (MbPA)',
    shortName: 'Mumbai Port',
    state: 'Maharashtra',
    classification: 'Major Port (MoPSW)',
    coordinates: { lat: 18.93, lng: 72.84 },
    harborMaster: 'Prongs Reef Lighthouse & MbPA Control',
    navigationalDepth: '11.0m – 13.5m',
    fleetProfile: 'Cruise liners, oil refinery shuttles, Sassoon Dock mechanized trawler fleet',
    subZoneIds: ['sassoon-dock-offshore', 'mumbai-floating-light', 'alibaug-shoals']
  },
  {
    id: 'jnpt-nhava-sheva',
    regionId: 'arabian-sea',
    name: 'Jawaharlal Nehru Port Authority (JNPA)',
    shortName: 'JNPT / Nhava Sheva',
    state: 'Maharashtra',
    classification: 'Major Port (MoPSW)',
    coordinates: { lat: 18.95, lng: 72.95 },
    harborMaster: 'JNPA Vessel Traffic Management System (VTMS)',
    navigationalDepth: '15.0m',
    fleetProfile: 'Ultra-large container vessels (14,000+ TEU), tugs, Karanja creek artisanal dinghies',
    subZoneIds: ['nhava-sheva-fairway', 'karanja-creek-outer']
  },
  {
    id: 'deendayal-kandla',
    regionId: 'arabian-sea',
    name: 'Deendayal Port Authority (Kandla)',
    shortName: 'Deendayal (Kandla)',
    state: 'Gujarat',
    classification: 'Major Port (MoPSW)',
    coordinates: { lat: 23.01, lng: 70.22 },
    harborMaster: 'Kandla VTMS & Gulf of Kutch Pilotage',
    navigationalDepth: '13.0m (Tidal)',
    fleetProfile: 'Crude oil tankers (Vadinar SPM), grain bulk carriers, mechanized fishing dhows',
    subZoneIds: ['kandla-fairway-buoy', 'tuna-creek-shoals', 'mandvi-bank']
  },
  {
    id: 'mormugao',
    regionId: 'arabian-sea',
    name: 'Mormugao Port Authority',
    shortName: 'Mormugao',
    state: 'Goa',
    classification: 'Major Port (MoPSW)',
    coordinates: { lat: 15.41, lng: 73.80 },
    harborMaster: 'Mormugao Port Signal Station',
    navigationalDepth: '14.1m',
    fleetProfile: 'Iron ore bulk carriers, passenger cruise liners, Zuari river purse seiners',
    subZoneIds: ['zuari-estuary-shelf', 'baina-reef-outer']
  },
  {
    id: 'new-mangalore',
    regionId: 'arabian-sea',
    name: 'New Mangalore Port Authority',
    shortName: 'New Mangalore',
    state: 'Karnataka',
    classification: 'Major Port (MoPSW)',
    coordinates: { lat: 12.92, lng: 74.82 },
    harborMaster: 'Panambur Marine Dispatch',
    navigationalDepth: '14.0m',
    fleetProfile: 'LPG/LNG gas carriers, petroleum products, Old Mangalore Bunder purse seiners',
    subZoneIds: ['panambur-fairway', 'bunder-fishing-grounds']
  },
  {
    id: 'cochin',
    regionId: 'arabian-sea',
    name: 'Cochin Port Authority',
    shortName: 'Cochin',
    state: 'Kerala',
    classification: 'Major Port (MoPSW)',
    coordinates: { lat: 9.96, lng: 76.26 },
    harborMaster: 'Willingdon Island Port Signal Station',
    navigationalDepth: '14.5m',
    fleetProfile: 'International transshipment container ships, navy frigates, Munambam & Vypeen mechanized fleets',
    subZoneIds: ['willingdon-fairway', 'vypeen-grounds', 'munambam-estuary']
  },

  // =========================================================================
  // 3. ANDAMAN & NICOBAR ARCHIPELAGO
  // =========================================================================
  {
    id: 'port-blair',
    regionId: 'andaman-nicobar',
    name: 'Port Blair Port (Andaman Port Management Board)',
    shortName: 'Port Blair',
    state: 'Andaman & Nicobar Islands',
    classification: 'Major Island Port Authority',
    coordinates: { lat: 11.67, lng: 92.75 },
    harborMaster: 'Haddo Wharf Signal Station & Coast Guard MRCC',
    navigationalDepth: '10.5m – 15.0m',
    fleetProfile: 'Inter-island passenger catamarans, deep-sea tuna longliners, Indian Navy/Coast Guard vessels',
    subZoneIds: ['port-blair-haddo', 'ross-island-roads', 'ten-degree-channel-bank']
  },

  // =========================================================================
  // 4. LAKSHADWEEP SEA
  // =========================================================================
  {
    id: 'kavaratti',
    regionId: 'lakshadweep',
    name: 'Kavaratti Port & Harbor Management',
    shortName: 'Kavaratti',
    state: 'Lakshadweep',
    classification: 'Major Island Port Authority',
    coordinates: { lat: 10.57, lng: 72.64 },
    harborMaster: 'Kavaratti Lagoon Control Station',
    navigationalDepth: '4.0m (Lagoon) / 100m+ (Drop-off)',
    fleetProfile: 'High-speed passenger catamarans, traditional pole-and-line tuna boats, outrigger skiffs',
    subZoneIds: ['kavaratti-lagoon-reef', 'suheli-par-bank', 'andrott-passage']
  }
]

export const getPortsByRegion = (regionId) => PORTS.filter((p) => p.regionId === regionId)
export const getPortById = (portId) => PORTS.find((p) => p.id === portId) || PORTS[0]
