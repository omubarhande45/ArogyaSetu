# Complete Hospital AI Scheduler Launcher
#!/usr/bin/env python3
import subprocess
import sys
import os
import time
import webbrowser
import threading

def start_backend():
    print('Starting Backend...')
    os.chdir('hospital-ai-scheduler')
    subprocess.Popen([sys.executable, 'main.py'])

def start_frontend():
    print('Starting Frontend server...')
    os.chdir('hospital-ai-scheduler/frontend')
    subprocess.Popen([sys.executable, '-m', 'http.server', '8080'])

if __name__ == '__main__':
    backend = threading.Thread(target=start_backend)
    frontend = threading.Thread(target=start_frontend)
    backend.start()
    time.sleep(5)
    frontend.start()
    webbrowser.open('http://localhost:8080')
    print('Full stack running! Backend: localhost:8000 Frontend: localhost:8080')
    input('Press Enter to stop...')

