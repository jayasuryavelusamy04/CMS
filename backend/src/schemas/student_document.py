from typing import Optional
from datetime import datetime
from pydantic import BaseModel, constr, conint

class StudentDocumentBase(BaseModel):
    document_type: str
    description: Optional[str] = None

class StudentDocumentCreate(StudentDocumentBase):
    file_name: str
    mime_type: str
    file_size: conint(gt=0)  # Must be greater than 0
    file_path: str

class StudentDocumentUpdate(StudentDocumentBase):
    description: Optional[str] = None

class StudentDocumentResponse(StudentDocumentBase):
    id: int
    student_id: int
    file_name: str
    file_path: str
    mime_type: str
    file_size: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True

class StudentDocumentList(BaseModel):
    total: int
    items: list[StudentDocumentResponse]

    class Config:
        orm_mode = True
