from app.models.student import Student


def test_create_student(db_session):
    student = Student(student_code="101", name="John Doe")
    db_session.add(student)
    db_session.commit()

    fetched = db_session.query(Student).filter_by(student_code="101").first()
    assert fetched is not None
    assert fetched.name == "John Doe"
