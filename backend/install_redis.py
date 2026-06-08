import urllib.request
import zipfile
import subprocess
import os

url = "https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip"
zip_path = "Redis-x64.zip"
extract_dir = "Redis"

print("Downloading Redis...")
urllib.request.urlretrieve(url, zip_path)

print("Extracting Redis...")
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(extract_dir)

print("Starting Redis server...")
# Start redis-server in the background
redis_exe = os.path.join(extract_dir, "redis-server.exe")
subprocess.Popen([redis_exe], creationflags=subprocess.CREATE_NO_WINDOW)
print("Redis server started!")
