import cloudinary
import cloudinary.uploader
from PIL import Image
import io
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

MAX_WIDTH = 1280
MAX_HEIGHT = 960
QUALITY = 75


def compress_to_webp(file_bytes: bytes) -> bytes:
    image = Image.open(io.BytesIO(file_bytes))

    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")

    # reduce the size if it is too large
    image.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.LANCZOS)

    output = io.BytesIO()
    image.save(output, format="WEBP", quality=QUALITY, method=6)
    output.seek(0)
    return output.read()


async def upload_image(file_bytes: bytes, folder: str = "quiz-images") -> dict:
    webp_bytes = compress_to_webp(file_bytes)

    result = cloudinary.uploader.upload(
        webp_bytes,
        folder=folder,
        resource_type="image",
        format="webp",
    )

    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
        "width": result["width"],
        "height": result["height"],
    }


async def delete_image(public_id: str) -> None:
    cloudinary.uploader.destroy(public_id)
