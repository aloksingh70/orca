import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("ORCA FULL SYSTEM & LIVE TELEMETRY TEST SUITE")
    print("==================================================")

    # 1. Health Check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    print(f"[PASS] 1. Health Check: {health_data['status']} ({health_data['service']})")
    print(f"  Zones: {health_data['database']['zones_registered']}, Users: {health_data['database']['fleet_users']}")

    # 2. Zones List
    res = client.get("/api/zones")
    assert res.status_code == 200
    zones = res.json()
    assert len(zones) >= 6, f"Expected 6 zones, got {len(zones)}"
    print(f"[PASS] 2. Zones API: Loaded {len(zones)} coastal sectors ({', '.join(z['name'] for z in zones)})")

    # 3. Test Demo User Logins across all 4 roles
    roles = [
        ("skipper", "skipper@orca.gov.in", "Capt. Rajesh Mondal"),
        ("officer", "officer.coastguard@orca.gov.in", "Cmdr. Vikram Rathore"),
        ("scientist", "researcher@incois.res.in", "Dr. Priya Sharma"),
        ("port_operator", "portmaster@sagar.port.gov.in", "Capt. B. K. Halder")
    ]
    tokens = {}
    for role_name, email, expected_name in roles:
        r = client.post("/api/auth/login", json={"email": email, "password": "orca123"})
        assert r.status_code == 200, f"Login failed for {role_name}: {r.text}"
        data = r.json()
        tokens[role_name] = data["access_token"]
        assert data["user"]["email"] == email
        print(f"[PASS] 3. Login ({role_name}): Logged in as {data['user']['full_name']} (role: {data['user']['role']})")

    skipper_header = {"Authorization": f"Bearer {tokens['skipper']}"}
    officer_header = {"Authorization": f"Bearer {tokens['officer']}"}
    scientist_header = {"Authorization": f"Bearer {tokens['scientist']}"}
    port_header = {"Authorization": f"Bearer {tokens['port_operator']}"}

    # 4. Security Check: Invalid password rejection
    bad_login = client.post("/api/auth/login", json={"email": "skipper@orca.gov.in", "password": "wrongpassword99"})
    assert bad_login.status_code == 401
    print("[PASS] 4. Security: Invalid password rejected with 401 Unauthorized.")

    # 5. Multi-Agent Advisory Scan with Live Data
    scan_res = client.post("/api/advisory/scan", json={"date": "2026-09-09"}, headers=skipper_header)
    assert scan_res.status_code == 200, f"Scan failed: {scan_res.text}"
    scanned = scan_res.json()
    assert len(scanned) >= 6
    top = scanned[0]
    print(f"[PASS] 5. Live Multi-Agent Pipeline: Scan completed for 6 sectors.")
    print(f"  Top Zone: {top['zoneName']} (Score: {top['combinedScore']}/100, Verdict: '{top['verdict']}')")
    print(f"  Live Telemetry Active: {top.get('isLive')} | Data Source: {top.get('dataSource')}")

    # 6. Seasonal Ban Veto Check
    ban_scan = client.post("/api/advisory/scan", json={"date": "2026-05-15"})
    assert ban_scan.status_code == 200
    for z in ban_scan.json():
        assert z["verdict"] == "Seasonal Closure"
    print("[PASS] 6. Safety Veto: Verified Uniform East-Coast Breeding Ban veto applies to all sectors during May 15 window.")

    # 7. Official Live Telemetry Match Verification Report
    verify_res = client.get("/api/telemetry/live-verify")
    assert verify_res.status_code == 200
    v_report = verify_res.json()
    assert v_report["status"] == "success"
    assert v_report["sectors_audited"] >= 6
    sample_v = v_report["results"][0]["verification"]
    print(f"[PASS] 7. Official Telemetry Match Verification: {v_report['sectors_audited']} sectors audited.")
    print(f"  Status: {sample_v['verification_status']} ({sample_v['confidence_pct']}% confidence)")
    print(f"  Live readings: {sample_v['live_readings']}")

    # 8. Bay of Bengal Live AIS Vessel Tracking (Cargo, Cruise, Tanker, Fishing, Patrol)
    vessels_res = client.get("/api/vessels/live")
    assert vessels_res.status_code == 200
    vessels = vessels_res.json()
    assert len(vessels) >= 10, f"Expected at least 10 vessels, got {len(vessels)}"
    
    cargo_vessels = client.get("/api/vessels/live?category=cargo").json()
    cruise_vessels = client.get("/api/vessels/live?category=cruise").json()
    tanker_vessels = client.get("/api/vessels/live?category=tanker").json()
    fishing_vessels = client.get("/api/vessels/live?category=fishing").json()
    patrol_vessels = client.get("/api/vessels/live?category=patrol").json()

    print(f"[PASS] 8. Live AIS Vessel Tracking: {len(vessels)} ships active in Bay of Bengal & Sandheads fairway.")
    print(f"  - Cargo & Containers: {len(cargo_vessels)} ships (e.g. {cargo_vessels[0]['name']})")
    print(f"  - Passenger Cruises: {len(cruise_vessels)} ships (e.g. {cruise_vessels[0]['name']})")
    print(f"  - Tankers: {len(tanker_vessels)} ships (e.g. {tanker_vessels[0]['name']})")
    print(f"  - Mechanized Fishing: {len(fishing_vessels)} craft (e.g. {fishing_vessels[0]['name']})")
    print(f"  - Coast Guard Patrols: {len(patrol_vessels)} craft (e.g. {patrol_vessels[0]['name']})")

    # 9. Skipper Catch Log Submission & Fetch
    post_catch = client.post("/api/catch-log", json={
        "zone_id": "shankarpur",
        "zone_name": "Shankarpur",
        "trip_date": "2026-09-09",
        "estimated_kg": 275.5,
        "species": "Hilsa (Tenualosa ilisha)",
        "notes": "Logged from automated test suite"
    }, headers=skipper_header)
    assert post_catch.status_code == 201
    catches = client.get("/api/catch-log", headers=skipper_header).json()
    assert len(catches) >= 1
    print(f"[PASS] 9. Skipper Catch Log: Entry submitted & retrieved (ID: {post_catch.json()['id']}).")

    # 10. Officer Violations & Enforcement Log
    viol_res = client.get("/api/violations", headers=officer_header)
    assert viol_res.status_code == 200
    violations = viol_res.json()
    print(f"[PASS] 10. Officer Violations Report: Retrieved {len(violations)} recorded MFRA / border alerts.")

    # 11. Scientist Scan Audit Log Export
    audit_res = client.get("/api/scan-log/export?format=json", headers=scientist_header)
    assert audit_res.status_code == 200
    print(f"[PASS] 11. Scientist Audit Log Export: Exported {len(audit_res.json())} historical sounding records.")

    # 12. Port Operator Landing Log Submission
    post_land = client.post("/api/landing-log", json={
        "zone_id": "shankarpur",
        "zone_name": "Shankarpur Principal Fishing Harbour",
        "landing_date": "2026-09-09",
        "actual_kg": 260.0,
        "species": "Hilsa, Silver Pomfret",
        "notes": "Quayside weight verified"
    }, headers=port_header)
    assert post_land.status_code == 201
    landings = client.get("/api/landing-log", headers=port_header).json()
    assert len(landings) >= 1
    print(f"[PASS] 12. Port Operator Landing Log: Entry logged (ID: {post_land.json()['id']}).")

    print("\n==================================================")
    print("ALL 12 SYSTEM & LIVE TELEMETRY TESTS PASSED! (12/12)")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
