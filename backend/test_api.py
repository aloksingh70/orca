import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("ORCA BACKEND & AUTHENTICATION TEST SUITE")
    print("==================================================")

    # 1. Health Check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    print(f"[PASS] Health Check: {health_data['status']} ({health_data['service']})")
    print(f"  Zones: {health_data['database']['zones_registered']}, Users: {health_data['database']['fleet_users']}")

    # 2. Zones List
    res = client.get("/api/zones")
    assert res.status_code == 200
    zones = res.json()
    assert len(zones) >= 6, f"Expected 6 zones, got {len(zones)}"
    print(f"[PASS] Zones API: Loaded {len(zones)} coastal sectors ({', '.join(z['name'] for z in zones)})")

    # 3. Test Demo User Login
    login_payload = {
        "email": "skipper@orca.gov.in",
        "password": "orca123"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200, f"Login failed: {res.text}"
    auth_data = res.json()
    token = auth_data["access_token"]
    user = auth_data["user"]
    assert token, "Token missing in response"
    assert user["email"] == "skipper@orca.gov.in"
    print(f"[PASS] Authentication: Demo Skipper login successful! Token generated. User: {user['full_name']}")

    # 4. Test Invalid Credentials
    bad_login = {
        "email": "skipper@orca.gov.in",
        "password": "wrongpassword99"
    }
    res = client.post("/api/auth/login", json=bad_login)
    assert res.status_code == 401
    print("[PASS] Security: Invalid password rejected with 401 Unauthorized.")

    # 5. Test Authenticated Profile Route
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    profile = res.json()
    assert profile["email"] == "skipper@orca.gov.in"
    print(f"[PASS] JWT Verification: Authenticated /api/auth/me retrieved {profile['full_name']} ({profile['vessel_name']})")

    # 6. Test User Registration
    new_user_email = "captain.das@bengalfleet.in"
    reg_payload = {
        "email": new_user_email,
        "password": "harborPassword2026",
        "full_name": "Capt. Soumen Das",
        "role": "skipper",
        "vessel_name": "MV Sagar Kanya",
        "registration_number": "IND-WB-24-05512",
        "harbor_base": "Kakdwip Steamerghat Port"
    }
    # Delete if already exists from prior run
    res = client.post("/api/auth/register", json=reg_payload)
    if res.status_code == 400:
        # Already registered, log in instead
        res = client.post("/api/auth/login", json={"email": new_user_email, "password": "harborPassword2026"})
    assert res.status_code in [200, 201]
    new_token = res.json()["access_token"]
    print(f"[PASS] Registration: New vessel registered & JWT token received for {new_user_email}")

    # 7. Test Multi-Agent Advisory Scan
    scan_payload = {
        "date": "2026-09-07"
    }
    res = client.post("/api/advisory/scan", json=scan_payload, headers=headers)
    assert res.status_code == 200, f"Scan failed: {res.text}"
    scanned_zones = res.json()
    assert len(scanned_zones) >= 6
    top = scanned_zones[0]
    print(f"[PASS] Multi-Agent Pipeline: Scan completed for 6 sectors on 2026-09-07.")
    print(f"  Top Sector: {top['zoneName']} (Score: {top['combinedScore']}/100, Verdict: '{top['verdict']}')")
    print(f"  Agents Evaluated: {[a['label'] + ': ' + str(a['score']) for a in top['agents']]}")

    # 8. Test Seasonal Ban Mandate Veto
    ban_scan = client.post("/api/advisory/scan", json={"date": "2026-05-15"})
    assert ban_scan.status_code == 200
    ban_results = ban_scan.json()
    for z in ban_results:
        assert z["verdict"] == "Seasonal Closure", f"Zone {z['zoneName']} should have had Seasonal Closure veto applied during ban window!"
    print(f"[PASS] Safety Veto: Verified East-Coast Trawling Ban veto correctly applied to all zones for 2026-05-15.")

    # 9. Test Bookmarking a Zone
    save_res = client.post("/api/user/saved-zones/sagar-island", headers=headers)
    assert save_res.status_code in [200, 201]
    saved_list = client.get("/api/user/saved-zones", headers=headers).json()
    assert any(s["zone_id"] == "sagar-island" for s in saved_list)
    print("[PASS] User Bookmarks: Successfully saved 'sagar-island' to user's fleet dispatch book.")

    print("\n==================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! (9/9)")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
