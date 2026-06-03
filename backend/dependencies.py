import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env vars from root .env.local
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

def get_supabase_client() -> Client:
    """Create and return a Supabase client instance."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError(
            "Missing SUPABASE_URL or SUPABASE_KEY. "
            "Ensure .env.local is configured correctly."
        )
    return create_client(SUPABASE_URL, SUPABASE_KEY)

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Validates the JWT token against Supabase.
    Returns the user_id if valid, raises 401 otherwise.
    """
    token = credentials.credentials
    supabase = get_supabase_client()
    try:
        # Validate the token using Supabase's auth api
        user_response = supabase.auth.get_user(token)
        if user_response and user_response.user:
            return user_response.user.id
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
        )
