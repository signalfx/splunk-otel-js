# Ansible Playbook for Splunk OpenTelemetry Node.js Agent

This directory contains an Ansible playbook that wraps the Go-based agent manager for easy deployment.

## Overview

The playbook provides a simple way to manage the Splunk OpenTelemetry Node.js agent across systems using Ansible, while leveraging the Go binary for the actual agent operations.

## Features

- Creates a dedicated user (`splunk-agent`) for agent operations
- Sets up the installation directory at `/opt/splunk-nodejs-agent` with proper permissions
- Supports all agent operations: install, uninstall, rollback, upgrade
- Returns structured JSON output from the Go binary

## Prerequisites

- Ansible 2.9 or later
- Go binary built at `../go-module/bin/splunk-otel-manager`
- Node.js and npm on target systems
- sudo/root access on target systems

## Usage

### Example Playbook

Use `example-playbook.yml` (default: `/opt/splunk-nodejs-agent`, requires sudo):

```bash
# Install
ansible-playbook playbooks/example-playbook.yml -K -e "agent_action=install"

# Uninstall
ansible-playbook playbooks/example-playbook.yml -K -e "agent_action=uninstall"

# Upgrade
ansible-playbook playbooks/example-playbook.yml -K -e "agent_action=upgrade" -e "agent_version=4.0.0"

# Rollback
ansible-playbook playbooks/example-playbook.yml -K -e "agent_action=rollback"
```

**Note:** The `-K` flag prompts for sudo password. You can omit it if running as root or using passwordless sudo.

### Production Playbook

Use `install.yml` for production (requires sudo, uses `/opt/splunk-nodejs-agent`):

```bash
ansible-playbook playbooks/install.yml -K -e "agent_action=install" -e "splunk_access_token=YOUR_TOKEN"
```

### Available Operations

Change the `agent_action` variable to perform different operations:

- `install` - Install the agent
- `uninstall` - Remove the agent
- `rollback` - Restore previous version
- `upgrade` - Upgrade to a new version

### Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `agent_action` | `install` | Operation to perform |
| `agent_version` | `latest` | Agent version to install |
| `splunk_access_token` | `YOUR_ACCESS_TOKEN_HERE` | Splunk access token |
| `otel_exporter_otlp_endpoint` | `https://ingest.us1.signalfx.com/v2/trace` | OTLP endpoint |
| `splunk_dest_folder` | `/opt/splunk-nodejs-agent` | Installation directory |
| `ansible_user` | `splunk-agent` | User for running agent operations |

## Example

```yaml
---
- name: Manage Splunk Node.js Agent
  hosts: localhost
  become: true
  vars:
    agent_action: install
    agent_version: "latest"
    splunk_access_token: "YOUR_ACCESS_TOKEN_HERE"
    otel_exporter_otlp_endpoint: "https://ingest.us1.signalfx.com/v2/trace"
    splunk_dest_folder: "/opt/splunk-nodejs-agent"
    ansible_user: "splunk-agent"
```

## Output

The playbook displays the JSON output from the Go binary, which includes:

```json
{
  "node": "splunk-agent-0",
  "error": false,
  "install_path": "/opt/splunk-nodejs-agent",
  "agent_type": "node",
  "agent_version": "latest",
  "action": "install",
  "message": "Splunk Node.js agent install was successful"
}
```
