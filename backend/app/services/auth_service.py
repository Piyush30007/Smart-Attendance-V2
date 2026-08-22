"""Authentication service placeholder."""
"""
Logic for Authentication 
Resposibilities :
-Signup
Login
Google Login
-Refresh Token
-Authenticate User
No SQL queries
No HTTP endpoints
"""

import secrets 
from sqlalchemy.orm import Session
from app.models.admin import Admin
from app.models.student import Student
from app.models.teacher import Teacher
from google.oauth2 import id_token
from google.auth.transport import requests
from app.repositories.admin_repository import AdminRepository
from app.repositories.student_repository import StudentRepository
from app.repositories.teacher_repository import TeacherRepository
from app.schemas.auth import SignupRequest, TokenPair, RefreshRequest, TokenData
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.config import get_settings

class AuthService:
    @staticmethod
    def _check_global_uniqueness(db:Session , username : str , email : str):
        if AdminRepository.get_by_username(db, username) or TeacherRepository.get_by_username(db, username) or StudentRepository.get_by_username(db, username):
            raise ValueError("Username already exists")
        if AdminRepository.get_by_email(db, email) or TeacherRepository.get_by_email(db, email) or StudentRepository.get_by_email(db, email):
            raise ValueError("Email already exists")
        if StudentRepository.get_by_email(db, email):
            raise ValueError("Email already exists")
        if StudentRepository.get_by_username(db, username):
            raise ValueError("Username already exists")

        if TeacherRepository.get_by_email(db, email):
            raise ValueError("Email already exists")
        if TeacherRepository.get_by_username(db, username):
            raise ValueError("Username already exists")

    @staticmethod
    def _generate_unique_username(db : Session  , email : str )->str:
        base_username = email.split("@")[0]
        username = base_username
        if AdminRepository.get_by_username(db, username) or TeacherRepository.get_by_username(db, username) or StudentRepository.get_by_username(db, username):
            username = base_username+"-"+secrets.token_hex(2).upper()

        # if AdminRepository.get_by_email(db, email) or TeacherRepository.get_by_email(db, email) or StudentRepository.get_by_email(db, email):
        #     raise ValueError("Email already exists")

        return username 

    @staticmethod 
    def signup(
        db: Session, payload: SignupRequest
    ):
        """Create a new user account in database"""
        settings = get_settings()

        # Validate Role 
        allowed_roles = {"student", "teacher", "admin"}

        if payload.role not in allowed_roles:
            raise ValueError("Invalid Role")

        AuthService._check_global_uniqueness(db, payload.username, payload.email)

        # ------------------------------------------
        # STUDENT SIGNUP
        # ------------------------------------------

        if payload.role == "student":
            if StudentRepository.get_by_email(db, payload.email):
                raise ValueError("Email already exists")
            if StudentRepository.get_by_username(db, payload.username):
                raise ValueError("Username already exists")

            student_code = "STU-" + secrets.token_hex(4).upper()
            student = Student(
                student_code=student_code,
                username=payload.username,
                hashed_password=hash_password(payload.password),
                name=payload.full_name or payload.username,
                email=payload.email,
                course="General",
                role="student",
                is_active=True,
                profile_completed=False
            )
            return StudentRepository.create(db, student)

        # ------------------------------------------
        # TEACHER SIGNUP
        # ------------------------------------------

        if payload.role == "teacher":
            if payload.invite_code != settings.TEACHER_INVITE_CODE:
                raise ValueError("Invalid teacher invitation code")
            if TeacherRepository.get_by_username(db, payload.username):
                raise ValueError("Username already exists") 
                
            if TeacherRepository.get_by_email(db, payload.email):
                raise ValueError("Email already exists")

            teacher_code = "TCH-" + secrets.token_hex(4).upper()
            teacher = Teacher(
                teacher_code=teacher_code,
                username=payload.username,
                hashed_password=hash_password(payload.password),
                name=payload.full_name or payload.username,
                email=payload.email,
                department="General",
                role="teacher",
                is_active=True,
                profile_completed=False
            )
            return TeacherRepository.create(db, teacher)

        # ------------------------------------------
        # ADMIN SIGNUP
        # ------------------------------------------

        if payload.role == "admin":
            if payload.invite_code != settings.ADMIN_INVITE_CODE:
                raise ValueError("Invalid admin invitation code")

            if AdminRepository.get_by_username(db, payload.username):
                raise ValueError("Username already exists")

            if AdminRepository.get_by_email(db, payload.email):
                raise ValueError("Email already exists")

            admin = Admin(
                username=payload.username,
                full_name=payload.full_name or payload.username,
                email=payload.email,
                hashed_password=hash_password(payload.password),
                role="admin"
            )
            return AdminRepository.create(db, admin)

    @staticmethod
    def authenticate_user(db: Session, username_or_email: str, password: str):
        """Authenticate user by verifying username/email and password"""

        admin = AdminRepository.get_by_username(db, username_or_email)
        if admin is None:
            admin = AdminRepository.get_by_email(db, username_or_email)

        if admin is not None:
            if not admin.is_active:
                return None

            if admin.hashed_password is None:
                return None

            if verify_password(password, admin.hashed_password):
                return admin, admin.role
                
        teacher = TeacherRepository.get_by_username(db, username_or_email)

        if teacher is None:
            teacher = TeacherRepository.get_by_email(db, username_or_email)

        if teacher is not None:
            if not teacher.is_active:
                return None

            if teacher.hashed_password and verify_password(
                password,
                teacher.hashed_password
            ):
                return teacher, teacher.role
        
        student = StudentRepository.get_by_username(db, username_or_email)

        if student is None:
            student = StudentRepository.get_by_email(db, username_or_email)

        if student is not None:
            if not student.is_active:
                return None

            if student.hashed_password and verify_password(
                password,
                student.hashed_password
            ):
                return student, student.role

    @staticmethod
    def login(db: Session, username_or_email: str, password: str) -> TokenPair:
        """Login user and return JWT tokens"""

        user = AuthService.authenticate_user(
            db,
            username_or_email=username_or_email,
            password=password
        )

        if user is None:
            raise ValueError("Invalid username/email or password")

        account, role = user

        username = getattr(account, "username", getattr(account, "name", getattr(account, "email", "user")))

        return AuthService._create_token_pair(
            account.id,
            username,
            role
        )

    @staticmethod
    def google_login(db: Session, credential: str, role: str | None, invite_code: str, mode: str) -> TokenPair:
        """Authenticate using Google Id Token
        Mode : login -> existing account only 
               signup -> create account if allowed 
        """
        settings = get_settings()
        try:
            google_data = id_token.verify_oauth2_token(credential, requests.Request(), settings.GOOGLE_CLIENT_ID)
        except ValueError:
            raise ValueError("Invalid Google Credential")
        email = google_data.get("email")
        name = google_data.get("name", "Google User")
        email_verified = google_data.get("email_verified", False)
        if not email:
            raise ValueError("Google Account email not found")
        if not email_verified:
            raise ValueError("Google Email is not verified")
        
        allowed_modes = {"login", "signup"}
        if mode not in allowed_modes:
            raise ValueError("Invalid authentication mode")

        # ----------------------------------------------
        # LOGIN
        # ----------------------------------------------
        if mode == "login":
            admin = AdminRepository.get_by_email(db, email)
            if admin is not None:
                if not admin.is_active:
                    raise ValueError("Account is inactive")

                return AuthService._create_token_pair(
                    admin.id,
                    admin.username,
                    admin.role
                )

            teacher = TeacherRepository.get_by_email(db, email)

            if teacher is not None:
                if not teacher.is_active:
                    raise ValueError("Account is inactive")

                return AuthService._create_token_pair(
                    teacher.id,
                    teacher.username or teacher.name,
                    teacher.role
                )

            student = StudentRepository.get_by_email(db, email)

            if student is not None:

                if not student.is_active:
                    raise ValueError("Account is inactive")

                return AuthService._create_token_pair(
                    student.id,
                    student.username or student.name,
                    student.role
                )
            raise ValueError("Account not found. Please Sign Up First.")

        # ----------------------------------------------
        # SIGNUP
        # ----------------------------------------------
        if mode == "signup":
            allowed_roles = {"student", "teacher", "admin"}
            if role not in allowed_roles:
                raise ValueError("Invalid Role")

            # Check if email exists in any table
            if AdminRepository.get_by_email(db, email) or \
               TeacherRepository.get_by_email(db, email) or \
               StudentRepository.get_by_email(db, email):
                raise ValueError("Email already exists")
            username = AuthService._generate_unique_username(db, email)
            # ------------------------------------------
            # STUDENT SIGNUP
            # ------------------------------------------
            if role == "student":
                student_code = "STU-" + secrets.token_hex(4).upper()
                # username = email.split("@")[0]

                if StudentRepository.get_by_username(db, username):
                        username = username + "-" + secrets.token_hex(2).upper()

                student = Student(
                        student_code=student_code,
                        username=username,
                        hashed_password=None,
                        name=name,
                        email=email,
                        course="General",
                        role="student",
                        is_active=True,
                        profile_completed=False
                    )
                student = StudentRepository.create(db, student)

                return AuthService._create_token_pair(
                    student.id,
                    student.username,
                    student.role
                )

            # ------------------------------------------
            # TEACHER SIGNUP
            # ------------------------------------------
            if role == "teacher":
                if invite_code != settings.TEACHER_INVITE_CODE:
                    raise ValueError("Invalid teacher invitation code")

                teacher_code = "TCH-" + secrets.token_hex(4).upper()
                # username = email.split("@")[0]

                if TeacherRepository.get_by_username(db, username):
                    username = username + "-" + secrets.token_hex(2).upper()

                teacher = Teacher(
                    teacher_code=teacher_code,
                    username=username,
                    hashed_password=None,
                    name=name,
                    email=email,
                    department="General",
                    role="teacher",
                    is_active=True,
                    profile_completed=False
                )
                teacher = TeacherRepository.create(db, teacher)

                return AuthService._create_token_pair(
                    teacher.id,
                    teacher.username,
                    teacher.role
                )

            # ------------------------------------------
            # ADMIN SIGNUP
            # ------------------------------------------
            if role == "admin":
                if invite_code != settings.ADMIN_INVITE_CODE:
                    raise ValueError("Invalid admin invitation code")

                # username = email.split("@")[0]
                if AdminRepository.get_by_username(db, username):
                    username = username + "-" + secrets.token_hex(2).upper()

                admin = Admin(
                    username=username,
                    full_name=name,
                    email=email,
                    hashed_password=None,
                    role="admin",
                    is_active=True
                )
                admin = AdminRepository.create(db, admin)

                return AuthService._create_token_pair(
                    admin.id,
                    admin.username,
                    admin.role
                )

        raise ValueError("Unable to process authentication")

    @staticmethod
    def _create_token_pair(user_id , username , role ) -> TokenPair:
        token_payload = {
            "sub": str(user_id),
            "username": username,
            "role": role,
        }
        access_token = create_access_token(token_payload)
        refresh_token = create_refresh_token(token_payload)
        return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
        )