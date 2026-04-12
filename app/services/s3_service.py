"""
AWS S3 file upload helper.
"""
import os
import boto3
from uuid import uuid4
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_S3_REGION", "ap-south-1"),
        )
    return _client


def get_bucket():
    bucket = os.getenv("AWS_S3_BUCKET_NAME")
    if not bucket:
        raise HTTPException(status_code=500, detail="AWS_S3_BUCKET_NAME not configured")
    return bucket


def upload_file(file_bytes: bytes, original_filename: str, content_type: str, folder: str = "kb-articles") -> dict:
    """Upload a file to S3 and return its URL and metadata."""
    client = _get_client()
    bucket = get_bucket()
    region = os.getenv("AWS_S3_REGION", "ap-south-1")

    # Create a unique key to avoid name collisions
    file_id = str(uuid4())
    key = f"{folder}/{file_id}/{original_filename}"

    client.put_object(
        Bucket=bucket,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )

    url = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"

    return {
        "file_url": url,
        "file_name": original_filename,
        "file_size": len(file_bytes),
        "content_type": content_type,
        "s3_key": key,
    }


def delete_file(s3_key: str) -> bool:
    """Delete a file from S3 by its key."""
    try:
        client = _get_client()
        bucket = get_bucket()
        client.delete_object(Bucket=bucket, Key=s3_key)
        return True
    except Exception:
        return False
