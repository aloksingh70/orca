"""
ports.py
-----------------------------------------------------------------------------
India's Major Ports and Island Port Authorities under MoPSW / Sagarmala.
-----------------------------------------------------------------------------
"""

PORTS = [
    # Bay of Bengal
    {
        "id": "kolkata-haldia",
        "region_id": "bay-of-bengal",
        "name": "Syama Prasad Mookerjee Port (Kolkata & Haldia)",
        "short_name": "Kolkata / Haldia",
        "state": "West Bengal",
        "classification": "Major Port (MoPSW)",
        "coordinates": {"lat": 21.65, "lng": 87.85},
        "harbor_master": "Sagar Roads Anchorage & SMP Riverine Pilot Station",
        "sub_zone_ids": ["digha", "shankarpur", "junput", "sagar-island", "frazerganj", "kakdwip"]
    },
    {
        "id": "paradip",
        "region_id": "bay-of-bengal",
        "name": "Paradip Port Authority",
        "short_name": "Paradip",
        "state": "Odisha",
        "classification": "Major Port (MoPSW)",
        "coordinates": {"lat": 20.26, "lng": 86.67},
        "harbor_master": "Paradip Port Marine Traffic Control",
        "sub_zone_ids": ["paradip-outer", "mahanadi-mouth", "jatadhari-estuary"]
    },
    {
        "id": "visakhapatnam",
        "region_id": "bay-of-bengal",
        "name": "Visakhapatnam Port Authority",
        "short_name": "Visakhapatnam",
        "state": "Andhra Pradesh",
        "classification": "Major Port (MoPSW)",
        "coordinates": {"lat": 17.68, "lng": 83.29},
        "harbor_master": "Dolphin’s Nose Signal Station (VPA)",
        "sub_zone_ids": ["vizag-dolphins-nose", "gangavaram-roads", "rishikonda-bank"]
    },
    {
        "id": "chennai",
        "region_id": "bay-of-bengal",
        "name": "Chennai Port Authority",
        "short_name": "Chennai",
        "state": "Tamil Nadu",
        "classification": "Major Port (MoPSW)",
        "coordinates": {"lat": 13.08, "lng": 80.29},
        "harbor_master": "Chennai Port Trust Marine Operations",
        "sub_zone_ids": ["chennai-kasimedu", "ennore-shoals", "marina-outer-bank"]
    },
    {
        "id": "kamarajar-ennore",
        "region_id": "bay-of-bengal",
        "name": "Kamarajar Port Limited (Ennore)",
        "short_name": "Kamarajar (Ennore)",
        "state": "Tamil Nadu",
        "classification": "Major Port (MoPSW / Corporatized)",
        "coordinates": {"lat": 13.26, "lng": 80.33},
        "harbor_master": "Ennore Marine Operations Center",
        "sub_zone_ids": ["ennore-fairway", "pulicat-lake-mouth"]
    },
    {
        "id": "voc-tuticorin",
        "region_id": "bay-of-bengal",
        "name": "V.O. Chidambaranar Port Authority (Tuticorin)",
        "short_name": "V.O.C. Tuticorin",
        "state": "Tamil Nadu",
        "classification": "Major Port (MoPSW)",
        "coordinates": {"lat": 8.75, "lng": 78.19},
        "harbor_master": "VOC Port Navigation Tower",
        "sub_zone_ids": ["tuticorin-outer-roads", "gulf-of-mannar-shelf"]
    },

    # Arabian Sea
    {
        "id": "mumbai",
        "region_id": "arabian-sea",
        "name": "Mumbai Port Authority (MbPA)",
        "short_name": "Mumbai Port",
        "state": "Maharashtra",
        "classification": "Major Port (MoPSW)",
        "coordinates": {"lat": 18.93, "lng": 72.84},
        "harbor_master": "Prongs Reef Lighthouse & MbPA Control",
        "sub_zone_ids": ["sassoon-dock-offshore", "mumbai-floating-light", "alibaug-shoals"]
    },
    {
        "id": "jnpt-nhava-sheva",
        "region_id": "arabian-sea",
        "name": "Jawaharlal Nehru Port Authority (JNPA)",
        "short_name": "JNPT / Nhava Sheva",
        "state": "Maharashtra",
        "classification": "Major Port (MoPSW)",
        "coordinates": {"lat": 18.95, "lng": 72.95},
        "harbor_master": "JNPA Vessel Traffic Management System",
        "sub_zone_ids": ["nhava-sheva-fairway", "karanja-creek-outer"]
    },
    {
        "id": "deendayal-kandla",
        "region_id": "arabian-sea",
        "name": "Deendayal Port Authority (Kandla)",
        "short_name": "Deendayal (Kandla)",
        "state": "Gujarat",
        "classification": "Major Port (MoPSW)",
        "coordinates": {"lat": 23.01, "lng": 70.22},
        "harbor_master": "Kandla VTMS & Gulf of Kutch Pilotage",
        "sub_zone_ids": ["kandla-fairway-buoy", "tuna-creek-shoals", "mandvi-bank"]
    },
    {
        "id": "mormugao",
        "region_id": "arabian-sea",
        "name": "Mormugao Port Authority",
        "short_name": "Mormugao",
        "state": "Goa",
        "classification": "Major Port (MoPSW)",
        "coordinates": {"lat": 15.41, "lng": 73.80},
        "harbor_master": "Mormugao Port Signal Station",
        "sub_zone_ids": ["zuari-estuary-shelf", "baina-reef-outer"]
    },
    {
        "id": "new-mangalore",
        "region_id": "arabian-sea",
        "name": "New Mangalore Port Authority",
        "short_name": "New Mangalore",
        "state": "Karnataka",
        "classification": "Major Port (MoPSW)",
        "coordinates": {"lat": 12.92, "lng": 74.82},
        "harbor_master": "Panambur Marine Dispatch",
        "sub_zone_ids": ["panambur-fairway", "bunder-fishing-grounds"]
    },
    {
        "id": "cochin",
        "region_id": "arabian-sea",
        "name": "Cochin Port Authority",
        "short_name": "Cochin",
        "state": "Kerala",
        "classification": "Major Port (MoPSW)",
        "coordinates": {"lat": 9.96, "lng": 76.26},
        "harbor_master": "Willingdon Island Port Signal Station",
        "sub_zone_ids": ["willingdon-fairway", "vypeen-grounds", "munambam-estuary"]
    },

    # Island Authorities
    {
        "id": "port-blair",
        "region_id": "andaman-nicobar",
        "name": "Port Blair Port (Andaman Port Management Board)",
        "short_name": "Port Blair",
        "state": "Andaman & Nicobar Islands",
        "classification": "Major Island Port Authority",
        "coordinates": {"lat": 11.67, "lng": 92.75},
        "harbor_master": "Haddo Wharf Signal Station & Coast Guard MRCC",
        "sub_zone_ids": ["port-blair-haddo", "ross-island-roads", "ten-degree-channel-bank"]
    },
    {
        "id": "kavaratti",
        "region_id": "lakshadweep",
        "name": "Kavaratti Port & Harbor Management",
        "short_name": "Kavaratti",
        "state": "Lakshadweep",
        "classification": "Major Island Port Authority",
        "coordinates": {"lat": 10.57, "lng": 72.64},
        "harbor_master": "Kavaratti Lagoon Control Station",
        "sub_zone_ids": ["kavaratti-lagoon-reef", "suheli-par-bank", "andrott-passage"]
    }
]

def get_all_ports():
    return PORTS

def get_ports_by_region(region_id: str):
    return [p for p in PORTS if p["region_id"] == region_id]

def get_port_by_id(port_id: str):
    for p in PORTS:
        if p["id"] == port_id:
            return p
    return PORTS[0]
