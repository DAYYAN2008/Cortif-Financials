import os
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client
from supabase.client import ClientOptions  # <--- Secure Options Wrapper

# Load env vars from root .env.local
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

security = HTTPBearer()


def _require_supabase_config() -> None:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError(
            "Missing SUPABASE_URL or SUPABASE_KEY. "
            "Ensure .env.local is configured correctly."
        )


def get_supabase_client() -> Client:
    """Create an unauthenticated Supabase client (service-level ops only)."""
    _require_supabase_config()
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def get_authenticated_supabase(access_token: str) -> Client:
    """Supabase client safely scoped to the caller's JWT (RLS enforced)."""
    _require_supabase_config()
    
    # Inject token headers directly during the core construction lifecycle
    opts = ClientOptions(headers={"Authorization": f"Bearer {access_token}"})
    client = create_client(SUPABASE_URL, SUPABASE_KEY, options=opts)
    
    client.postgrest.auth(access_token)
    return client


def _validate_token(access_token: str) -> str:
    supabase = get_supabase_client()
    try:
        user_response = supabase.auth.get_user(access_token)
        if user_response and user_response.user:
            return user_response.user.id
    except Exception:
        pass
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
    )


def get_access_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    return credentials.credentials


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Validate JWT and return user_id."""
    return _validate_token(credentials.credentials)


def get_authenticated_context(
    access_token: Annotated[str, Depends(get_access_token)],
) -> tuple[str, Client]:
    """Validate JWT and return (user_id, RLS-scoped Supabase client)."""
    user_id = _validate_token(access_token)
    return user_id, get_authenticated_supabase(access_token)