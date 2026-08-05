"""
Repsoiory layer for admin

Responsibilities:
-Perform all database operations related to admin
-No buisneess logic 
-No Password hashing 
-No JWT handling    
    """
    
from sqlalchemy.orm import Session
from app.models.admin import Admin

class AdminRepository:
    @staticmethod
    def get_by_id(db: Session, admin_id: int) -> Admin | None:
        #get an admin by id from the database
        return db.query(Admin).filter(Admin.id == admin_id).first()
    
    @staticmethod
    def get_by_username(db: Session, username: str) -> Admin | None:
        #get an admin by username from the database
        return db.query(Admin).filter(Admin.username == username).first()
    
    @staticmethod
    def get_by_email(db: Session, email: str) -> Admin | None:
        #get an admin by email from the database
        return db.query(Admin).filter(Admin.email == email).first()
    
    @staticmethod
    def create(db: Session, admin: Admin) -> Admin:
        #create a new admin in the database
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin
    
    @staticmethod
    def update(db: Session, admin: Admin) -> Admin:
        #update an existing admin in the database
        db.commit()
        db.refresh(admin)
        return admin
    
    @staticmethod
    def delete(db: Session, admin: Admin) -> None:
        #delete an existing admin from the database
        db.delete(admin)
        db.commit()
        
        
    