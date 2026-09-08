import requests

BASE = "http://127.0.0.1:8000"

def run_tests():
    # 1. Login
    print("[TEST 1] Testing Auth Login...")
    login_res = requests.post(f"{BASE}/auth/login", json={"username_or_email": "testadmin_qa", "password": "Password123!"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    tokens = login_res.json()
    token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(" -> Login OK. Role:", tokens.get("role", "admin"))

    # 2. Invalid Login
    print("[TEST 2] Testing Invalid Login...")
    bad_res = requests.post(f"{BASE}/auth/login", json={"username_or_email": "testadmin_qa", "password": "WrongPassword!"})
    assert bad_res.status_code == 401, f"Expected 401, got {bad_res.status_code}"
    print(" -> Invalid login handled correctly with 401.")

    # 3. Dashboard Stats
    print("[TEST 3] Testing Dashboard Stats...")
    stats_res = requests.get(f"{BASE}/dashboard/stats", headers=headers)
    assert stats_res.status_code == 200, f"Stats failed: {stats_res.text}"
    stats = stats_res.json()
    print(" -> Dashboard Stats OK:", stats)

    # 4. Student List
    print("[TEST 4] Testing Student Directory...")
    students_res = requests.get(f"{BASE}/students", headers=headers)
    assert students_res.status_code == 200, f"Students failed: {students_res.text}"
    students = students_res.json()
    print(f" -> Found {len(students)} active students.")
    for s in students[:3]:
        print(f"    Student: {s['student_code']} ({s['name']}) - has_face: {s.get('has_face')}")

    # 5. Create Student Flow
    print("[TEST 5] Testing Create Student...")
    import uuid
    uid = uuid.uuid4().hex[:6].upper()
    code_test = f"STU-{uid}"
    email_test = f"qa_test_{uid.lower()}@example.com"

    payload = {
        "name": "QA Integration Student",
        "student_code": code_test,
        "email": email_test,
        "course": "Computer Science"
    }
    create_res = requests.post(f"{BASE}/students", json=payload, headers=headers)
    assert create_res.status_code == 201, f"Create student failed: {create_res.text}"
    new_student = create_res.json()
    new_id = new_student["id"]
    print(f" -> Created student id={new_id}, has_face={new_student.get('has_face')}")
    assert new_student.get("has_face") == False, "New student should start with has_face=False"

    # 6. Update Student Flow
    print("[TEST 6] Testing Update Student...")
    update_res = requests.put(
        f"{BASE}/students/{new_id}",
        json={"name": "QA Student Updated", "email": email_test, "course": "AI & ML"},
        headers=headers
    )
    assert update_res.status_code == 200, f"Update failed: {update_res.text}"
    print(" -> Updated student name:", update_res.json().get("name"))

    # 7. Student History Endpoint
    print("[TEST 7] Testing Student History Endpoint...")
    hist_res = requests.get(f"{BASE}/attendance?student_id={new_id}", headers=headers)
    assert hist_res.status_code == 200, f"History failed: {hist_res.text}"
    print(f" -> New student history records: {len(hist_res.json())} (Expected 0)")

    # 8. Soft-Delete Student
    print("[TEST 8] Testing Soft Delete Student...")
    del_res = requests.delete(f"{BASE}/students/{new_id}", headers=headers)
    assert del_res.status_code == 204, f"Delete failed: {del_res.status_code}"
    print(" -> Student soft-deleted successfully.")

    # Verify student is removed from active list
    refreshed_res = requests.get(f"{BASE}/students", headers=headers)
    active_ids = [s["id"] for s in refreshed_res.json()]
    assert new_id not in active_ids, "Soft-deleted student should not appear in active student list"
    print(" -> Verified soft-deleted student is not in active student list.")

    # 9. Attendance Report Endpoint
    print("[TEST 9] Testing Attendance Report Endpoint...")
    report_res = requests.get(
        f"{BASE}/attendance/report",
        params={"start_date": "2026-08-01", "end_date": "2026-09-30"},
        headers=headers
    )
    assert report_res.status_code == 200, f"Report failed: {report_res.text}"
    report = report_res.json()
    print(f" -> Report OK: {len(report)} records returned.")

    # 10. Attendance Mark - Missing Face Validation
    print("[TEST 10] Testing Attendance Mark Validation (Missing Image)...")
    mark_empty = requests.post(f"{BASE}/attendance/mark", json={"image_base64": ""}, headers=headers)
    assert mark_empty.status_code == 400, f"Expected 400, got {mark_empty.status_code}"
    print(" -> Missing image properly returned 400:", mark_empty.json())

    # 11. Teachers Directory Endpoint
    print("[TEST 11] Testing Teachers Directory Endpoint...")
    teachers_res = requests.get(f"{BASE}/teachers", headers=headers)
    assert teachers_res.status_code == 200, f"Teachers failed: {teachers_res.text}"
    teachers = teachers_res.json()
    print(f" -> Found {len(teachers)} teachers.")

    print("\n=======================================================")
    print(">>> ALL 11 END-TO-END INTEGRATION TESTS PASSED! <<<")
    print("=======================================================\n")

if __name__ == "__main__":
    run_tests()
