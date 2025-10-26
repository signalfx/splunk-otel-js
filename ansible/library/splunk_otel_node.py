#!/usr/bin/python3

# Copyright: (c) 2024, Splunk Inc.
# GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

from __future__ import (absolute_import, division, print_function)
__metaclass__ = type

DOCUMENTATION = r'''
---
module: splunk_otel_node

short_description: Manage Splunk OpenTelemetry Node.js agent using Go module

version_added: "1.0.0"

description: This module provides a wrapper around the Go-based Splunk OpenTelemetry Node.js agent manager, maintaining compatibility with the original Ansible role interface.

options:
    agent_action:
        description: Action to perform on the agent
        required: true
        type: str
        choices: ['install', 'uninstall', 'rollback', 'upgrade']
    agent_version:
        description: Version of the agent to install or upgrade to
        required: false
        type: str
        default: 'latest'
    splunk_dest_folder:
        description: Destination folder for agent installation
        required: false
        type: str
        default: '/opt/splunk-nodejs-agent'
    splunk_backup_folder:
        description: Backup folder for rollback functionality
        required: false
        type: str
    splunk_access_token:
        description: Splunk access token
        required: false
        type: str
    otel_exporter_otlp_endpoint:
        description: OTLP endpoint URL
        required: false
        type: str
    keep_backup:
        description: Keep backup files after uninstall
        required: false
        type: bool
        default: true
    npm_registry:
        description: NPM registry URL
        required: false
        type: str
        default: 'https://registry.npmjs.org'
    agent_node_name:
        description: Agent node name
        required: false
        type: str
    no_node_name_suffix:
        description: Don't add -0 suffix to node name
        required: false
        type: bool
        default: false
    go_binary_path:
        description: Path to the Go binary
        required: false
        type: str
        default: '/usr/local/bin/splunk-otel-manager'

author:
    - Splunk Inc.
'''

EXAMPLES = r'''
# Install the latest version
- name: Install Splunk Node.js Agent
  splunk_otel_node:
    agent_action: install
    agent_version: latest
    splunk_access_token: "{{ splunk_access_token }}"
    otel_exporter_otlp_endpoint: "{{ otel_exporter_otlp_endpoint }}"

# Uninstall the agent
- name: Uninstall Splunk Node.js Agent
  splunk_otel_node:
    agent_action: uninstall

# Rollback to previous version
- name: Rollback Splunk Node.js Agent
  splunk_otel_node:
    agent_action: rollback

# Upgrade to specific version
- name: Upgrade Splunk Node.js Agent
  splunk_otel_node:
    agent_action: upgrade
    agent_version: "2.0.0"
'''

RETURN = r'''
agent_result:
    description: Result of the agent operation
    type: dict
    returned: always
    sample: {
        "node": "my-node-0",
        "error": false,
        "install_path": "/opt/splunk-nodejs-agent",
        "agent_type": "node",
        "agent_version": "1.0.0",
        "action": "install",
        "message": "Splunk Node.js agent install was successful"
    }
'''

import json
import os
import subprocess
from ansible.module_utils.basic import AnsibleModule


def run_go_binary(module, action, params):
    """Run the Go binary with the specified action and parameters."""
    
    go_binary = params.get('go_binary_path', '/usr/local/bin/splunk-otel-manager')
    
    # Check if Go binary exists
    if not os.path.exists(go_binary):
        # Try to find it in the module's directory structure
        module_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        go_binary_alt = os.path.join(module_dir, '..', 'go-module', 'bin', 'splunk-otel-manager')
        if os.path.exists(go_binary_alt):
            go_binary = go_binary_alt
        else:
            module.fail_json(msg=f"Go binary not found at {go_binary} or {go_binary_alt}")
    
    # Build command
    cmd = [go_binary, action]
    
    # Add parameters as flags - with explicit checks and defaults
    if params.get('agent_version'):
        cmd.extend(['--version', str(params['agent_version'])])
    
    # CRITICAL FIX: Ensure dest-folder is always passed
    dest_folder = params.get('splunk_dest_folder', '/opt/splunk-nodejs-agent')
    cmd.extend(['--dest-folder', str(dest_folder)])
    
    if params.get('splunk_backup_folder'):
        cmd.extend(['--backup-folder', str(params['splunk_backup_folder'])])
    
    if params.get('splunk_access_token'):
        cmd.extend(['--access-token', str(params['splunk_access_token'])])
    
    if params.get('otel_exporter_otlp_endpoint'):
        cmd.extend(['--otlp-endpoint', str(params['otel_exporter_otlp_endpoint'])])
    
    if params.get('npm_registry'):
        cmd.extend(['--npm-registry', str(params['npm_registry'])])
    
    if params.get('agent_node_name'):
        cmd.extend(['--node-name', str(params['agent_node_name'])])
    
    if params.get('no_node_name_suffix'):
        cmd.append('--no-node-name-suffix')
    
    if not params.get('keep_backup', True):
        cmd.append('--keep-backup=false')
    
    # Add verbose flag for debugging
    cmd.append('--verbose')
    
    # Debug: print the exact command being executed to stderr for debugging
    import sys
    print(f"DEBUG: Parameters received: {params}", file=sys.stderr)
    print(f"DEBUG: Executing command: {' '.join(cmd)}", file=sys.stderr)
    
    try:
        # Run the command
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=False
        )
        
        # Debug: print the command output
        print(f"DEBUG: Command stdout: {result.stdout}", file=sys.stderr)
        print(f"DEBUG: Command stderr: {result.stderr}", file=sys.stderr)
        print(f"DEBUG: Command return code: {result.returncode}", file=sys.stderr)
        
        # Parse JSON output from Go binary
        if result.stdout.strip():
            try:
                agent_result = json.loads(result.stdout.strip())
            except json.JSONDecodeError:
                # If JSON parsing fails, create a basic result
                agent_result = {
                    "error": result.returncode != 0,
                    "action": action,
                    "message": result.stdout.strip() if result.stdout.strip() else result.stderr.strip()
                }
        else:
            agent_result = {
                "error": result.returncode != 0,
                "action": action,
                "message": result.stderr.strip() if result.stderr.strip() else "No output from command"
            }
        
        # If command failed, include error details
        if result.returncode != 0:
            agent_result["error"] = True
            if result.stderr.strip():
                agent_result["error_message"] = result.stderr.strip()
        
        return agent_result, result.returncode == 0
        
    except Exception as e:
        return {
            "error": True,
            "action": action,
            "message": f"Failed to execute Go binary: {str(e)}"
        }, False


def main():
    # Define module arguments
    module_args = dict(
        agent_action=dict(type='str', required=True, choices=['install', 'uninstall', 'rollback', 'upgrade']),
        agent_version=dict(type='str', required=False, default='latest'),
        splunk_dest_folder=dict(type='str', required=False, default='/opt/splunk-nodejs-agent'),
        splunk_backup_folder=dict(type='str', required=False),
        splunk_access_token=dict(type='str', required=False, no_log=True),
        otel_exporter_otlp_endpoint=dict(type='str', required=False),
        keep_backup=dict(type='bool', required=False, default=True),
        npm_registry=dict(type='str', required=False, default='https://registry.npmjs.org'),
        agent_node_name=dict(type='str', required=False),
        no_node_name_suffix=dict(type='bool', required=False, default=False),
        go_binary_path=dict(type='str', required=False, default='/usr/local/bin/splunk-otel-manager')
    )

    # Create module instance
    module = AnsibleModule(
        argument_spec=module_args,
        supports_check_mode=False
    )

    # Get parameters
    action = module.params['agent_action']
    params = module.params

    # Run the Go binary
    agent_result, success = run_go_binary(module, action, params)

    # Determine if this is a change operation
    changed = action in ['install', 'uninstall', 'rollback', 'upgrade'] and success

    # Return results
    if success:
        module.exit_json(
            changed=changed,
            agent_result=agent_result,
            msg=agent_result.get('message', f'Agent {action} completed successfully')
        )
    else:
        module.fail_json(
            msg=agent_result.get('message', f'Agent {action} failed'),
            agent_result=agent_result
        )


if __name__ == '__main__':
    main()
