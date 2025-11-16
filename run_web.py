#!/usr/bin/env python3
"""
VisuoLingo Web Interface Launcher
This script launches the web-based frontend for the lip reading application.
"""

import os
import sys
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_SCRIPT = os.path.join(SCRIPT_DIR, "app.py")

if __name__ == "__main__":
    print("="*60)
    print("VisuoLingo Web Interface")
    print("="*60)
    print("\nStarting web server...")
    print("The application will be available at: http://localhost:5001")
    print("\nPress Ctrl+C to stop the server.")
    print("\nNote: Make sure you have Flask installed: pip3 install Flask\n")
    
    os.chdir(SCRIPT_DIR)
    try:
        subprocess.run([sys.executable, APP_SCRIPT], check=True)
    except KeyboardInterrupt:
        print("\n[INFO] Server stopped by user.")
    except subprocess.CalledProcessError as e:
        print(f"\n[ERROR] Server exited with error: {e}")
        sys.exit(1)

