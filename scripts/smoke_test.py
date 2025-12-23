#!/usr/bin/env python3
"""Simple smoke test for local dev stack: checks HTTP /health endpoints and TCP services.
Exit codes:
 0 - all critical services healthy
 2 - one or more critical services failed

Run: python scripts/smoke_test.py
"""
import sys
import socket
import time
from urllib.parse import urlparse

try:
    import requests
except Exception:
    print('The `requests` library is required. Install with: pip install requests')
    sys.exit(2)

services = [
    {'name': 'gateway', 'check': 'http', 'live': 'http://localhost:4000/live', 'ready': 'http://localhost:4000/ready', 'critical': True},
    {'name': 'project-service', 'check': 'http', 'live': 'http://localhost:5000/live', 'ready': 'http://localhost:5000/ready', 'critical': True},
    {'name': 'ai-service', 'check': 'http', 'live': 'http://localhost:8000/live', 'ready': 'http://localhost:8000/ready', 'critical': True},
    {'name': 'auth-service', 'check': 'http', 'live': 'http://localhost:5100/live', 'ready': 'http://localhost:5100/ready', 'critical': True},
    {'name': 'blueprint-agent', 'check': 'http', 'live': 'http://localhost:8100/live', 'ready': 'http://localhost:8100/ready', 'critical': False},
    {'name': 'payment-service', 'check': 'http', 'live': 'http://localhost:5200/live', 'ready': 'http://localhost:5200/ready', 'critical': False},
    {'name': 'minio', 'check': 'http', 'url': 'http://localhost:9000/minio/health/live', 'critical': True},
    {'name': 'mongo', 'check': 'tcp', 'host': 'localhost', 'port': 27017, 'critical': True},
    {'name': 'redis', 'check': 'tcp', 'host': 'localhost', 'port': 6379, 'critical': True},
    {'name': 'qdrant', 'check': 'http', 'url': 'http://localhost:6333/health', 'critical': False},
]

def check_http(url, timeout=3):
    try:
        r = requests.get(url, timeout=timeout)
        return r.status_code < 400, f'{r.status_code}'
    except Exception as e:
        return False, str(e)

def check_tcp(host, port, timeout=3):
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True, 'open'
    except Exception as e:
        return False, str(e)

def main():
    print('Running BuildBrain smoke test...')
    time.sleep(1)
    failures = []
    for s in services:
        name = s['name']
        critical = s.get('critical', False)
        if s['check'] == 'http':
            # prefer explicit live/ready checks when present
            live_url = s.get('live') or s.get('url')
            ok_live, info_live = check_http(live_url)
            ok_ready, info_ready = True, 'no-ready-check'
            if s.get('ready'):
                ok_ready, info_ready = check_http(s['ready'])
            ok = ok_live and ok_ready
            info = f'live={info_live} ready={info_ready}'
        else:
            ok, info = check_tcp(s['host'], s['port'])
        status = 'OK' if ok else 'FAIL'
        print(f'- {name:16} : {status:7} (critical={critical}) -> {info}')
        if not ok and critical:
            failures.append((name, info))

    if failures:
        print('\nCRITICAL FAILURES:')
        for n, info in failures:
            print(f' - {n}: {info}')
        print('\nPlease start the stack with:')
        print('  docker compose up -d --build')
        sys.exit(2)
    else:
        print('\nAll critical services are reachable.')
        sys.exit(0)

if __name__ == '__main__':
    main()
