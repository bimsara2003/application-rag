import asyncio
from app.database.database import get_supabase

def run_seed():
    sb = get_supabase()
    print("Updating specific user passwords explicitly...")
    valid_hash = "$2b$12$11Y0VXfOgETiBJvaC3Zs3u2.u2V/Sey2Qj1sIIHDPwarZ1aaDZjsV2"
    
    emails = [
        "super@sliit.lk", "admin.it@sliit.lk", "admin.finance@sliit.lk",
        "staff.exams@sliit.lk", "staff.library@sliit.lk",
        "it22000001@my.sliit.lk", "bm21000002@my.sliit.lk", "en23000003@my.sliit.lk"
    ]
    
    success_count = 0
    for email in emails:
        try:
            res = sb.table("users").update({"hashed_password": valid_hash}).eq("email", email).execute()
            if res.data:
                success_count += len(res.data)
        except Exception as e:
            print(f"Error updating {email}:", e)
            
    print(f"Successfully updated passwords for {success_count} users.")

if __name__ == "__main__":
    run_seed()

if __name__ == "__main__":
    run_seed()
