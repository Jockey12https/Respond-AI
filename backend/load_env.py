"""
Load environment variables from .env.local for backend
"""
import os
from pathlib import Path

def load_env_local():
    """Load environment variables from .env.local in project root"""
    # Get project root (parent of backend folder)
    backend_dir = Path(__file__).parent
    project_root = backend_dir.parent
    
    # Load from .env.local in project root
    env_local_path = project_root / '.env.local'
    if env_local_path.exists():
        _load_env_file(env_local_path)
    
    # Also load from backend/.env
    backend_env_path = backend_dir / '.env'
    if backend_env_path.exists():
        _load_env_file(backend_env_path)

def _load_env_file(file_path):
    """Load environment variables from a file"""
    # Read and parse .env file
    with open(file_path, 'r') as f:
        for line in f:
            line = line.strip()
            # Skip comments and empty lines
            if not line or line.startswith('#'):
                continue
            
            # Parse KEY=VALUE
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                
                # Set in environment
                os.environ[key] = value
    
    print(f"✅ Loaded environment variables from {file_path.name}")

# Auto-load when imported
load_env_local()
