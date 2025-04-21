from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"
    TEACHER = "teacher"
    PARENT = "parent"
    STUDENT = "student"
