from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from typing_extensions import Annotated

class ClassSectionBase(BaseModel):
    class_name: Annotated[str, Field(min_length=1, max_length=50)]
    section: Annotated[str, Field(min_length=1, max_length=10)]
    subjects: List[str]
    academic_year: Annotated[str, Field(pattern=r'^\d{4}-\d{4}$')]  # Format: 2024-2025

class ClassSectionCreate(ClassSectionBase):
    pass

class ClassSectionUpdate(ClassSectionBase):
    pass

class ClassSectionResponse(ClassSectionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ClassSectionList(BaseModel):
    total: int
    items: List[ClassSectionResponse]

    class Config:
        from_attributes = True
