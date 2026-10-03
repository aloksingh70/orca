"""
regions.py
-----------------------------------------------------------------------------
India's 4 Major Coastal Sea Regions for ORCA Maritime Advisory:
1. Bay of Bengal Corridor
2. Arabian Sea Corridor
3. Andaman & Nicobar Archipelago
4. Lakshadweep Sea & Coral Atolls
-----------------------------------------------------------------------------
"""

REGIONS = [
    {
        "id": "bay-of-bengal",
        "name": "Bay of Bengal Corridor",
        "short_name": "Bay of Bengal",
        "hindi_name": "बंगाल की खाड़ी",
        "subtitle": "West Bengal, Odisha, Andhra Pradesh & Tamil Nadu East Coast",
        "coastline_km": 2540,
        "major_ports_count": 6,
        "default_port_id": "kolkata-haldia",
        "ban_schedule": {
            "start_day": 15,
            "start_month": 4,
            "end_day": 14,
            "end_month": 6,
            "label": "15 Apr – 14 Jun (61 Days)",
            "coast": "East Coast Uniform Ban"
        },
        "map_center": {"lat": 19.5, "lng": 86.5, "zoom": 6}
    },
    {
        "id": "arabian-sea",
        "name": "Arabian Sea Corridor",
        "short_name": "Arabian Sea",
        "hindi_name": "अरब सागर",
        "subtitle": "Gujarat, Maharashtra, Goa, Karnataka & Kerala West Coast",
        "coastline_km": 3300,
        "major_ports_count": 6,
        "default_port_id": "mumbai",
        "ban_schedule": {
            "start_day": 1,
            "start_month": 6,
            "end_day": 31,
            "end_month": 7,
            "label": "01 Jun – 31 Jul (61 Days)",
            "coast": "West Coast Uniform Ban"
        },
        "map_center": {"lat": 16.5, "lng": 72.8, "zoom": 6}
    },
    {
        "id": "andaman-nicobar",
        "name": "Andaman & Nicobar Archipelago",
        "short_name": "Andaman & Nicobar",
        "hindi_name": "अंडमान और निकोबार द्वीप समूह",
        "subtitle": "Port Blair & 572 Oceanic Islands in the Bay of Bengal & Andaman Sea",
        "coastline_km": 1962,
        "major_ports_count": 1,
        "default_port_id": "port-blair",
        "ban_schedule": {
            "start_day": 15,
            "start_month": 4,
            "end_day": 14,
            "end_month": 6,
            "label": "15 Apr – 14 Jun (61 Days)",
            "coast": "Island Marine Sanctuary Regulation"
        },
        "map_center": {"lat": 11.66, "lng": 92.73, "zoom": 7}
    },
    {
        "id": "lakshadweep",
        "name": "Lakshadweep Sea & Coral Atolls",
        "short_name": "Lakshadweep",
        "hindi_name": "लक्षद्वीप",
        "subtitle": "Kavaratti, Agatti, Andrott & Minicoi Coral Atoll System",
        "coastline_km": 132,
        "major_ports_count": 1,
        "default_port_id": "kavaratti",
        "ban_schedule": {
            "start_day": 1,
            "start_month": 6,
            "end_day": 31,
            "end_month": 7,
            "label": "01 Jun – 31 Jul (61 Days)",
            "coast": "Atoll Conservation Order"
        },
        "map_center": {"lat": 10.57, "lng": 72.64, "zoom": 8}
    }
]

def get_all_regions():
    return REGIONS

def get_region_by_id(region_id: str):
    for r in REGIONS:
        if r["id"] == region_id:
            return r
    return REGIONS[0]
