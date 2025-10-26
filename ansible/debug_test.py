#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, '/Users/abhinama/Documents/splunk/splunk-otel-js/ansible/library')

# Test the Ansible module directly
from splunk_otel_node import run_go_binary

class MockModule:
    def log(self, msg):
        print(f'LOG: {msg}')
    def fail_json(self, **kwargs):
        print(f'FAIL: {kwargs}')
        sys.exit(1)

# Test parameters - these should match what the playbook is passing
params = {
    'go_binary_path': '/Users/abhinama/Documents/splunk/splunk-otel-js/go-module/bin/splunk-otel-manager',
    'agent_version': 'latest',
    'splunk_dest_folder': '/tmp/splunk-nodejs-agent',
    'splunk_access_token': 'PeZlDQLdXr3zDMmm9vWW_g',
    'otel_exporter_otlp_endpoint': 'https://ingest.us1.signalfx.com/v2/trace'
}

print("Testing Ansible module with parameters:")
for key, value in params.items():
    print(f"  {key}: {value}")

mock_module = MockModule()
result, success = run_go_binary(mock_module, 'install', params)

print(f"\nResult: {result}")
print(f"Success: {success}")
