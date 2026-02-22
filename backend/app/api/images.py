from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.services.image_service import upload_image, delete_image
from app.core.dependencies import get_current_user
from app.models.models import User

router = APIRouter(prefix="/images", tags=["images"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_MB = 10


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    # file type check
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400, detail="Дозволені формати: JPEG, PNG, WEBP, GIF"
        )

    file_bytes = await file.read()

    # size check
    if len(file_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400, detail=f"Файл не повинен перевищувати {MAX_SIZE_MB}MB"
        )

    result = await upload_image(file_bytes)
    return result


@router.delete("/{public_id:path}")
async def delete(
    public_id: str,
    current_user: User = Depends(get_current_user),
):
    await delete_image(public_id)
    return {"message": "Зображення видалено"}
