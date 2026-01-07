#!/bin/bash

# Splunk OpenTelemetry Node.js Agent Manager - Usage Examples
# This script demonstrates various ways to use the Go module equivalent of the Ansible role

set -e

BINARY="./bin/splunk-otel-manager"
CONFIG_FILE="$HOME/.splunk-otel-manager.yaml"

echo "=== Splunk OpenTelemetry Node.js Agent Manager Examples ==="
echo

# Check if binary exists
if [ ! -f "$BINARY" ]; then
    echo "Binary not found. Building first..."
    make build
fi

echo "1. Basic Installation (equivalent to Ansible playbook with agent_action: install)"
echo "Command: $BINARY install --version latest"
echo "This installs the latest version of @splunk/otel package"
echo

echo "2. Install Specific Version"
echo "Command: $BINARY install --version 1.2.3"
echo "This installs version 1.2.3 of @splunk/otel package"
echo

echo "3. Install with Custom Configuration (equivalent to Ansible vars)"
echo "Command: $BINARY install \\"
echo "  --version \"latest\" \\"
echo "  --dest-folder \"/custom/path\" \\"
echo "  --access-token \"your-token-here\" \\"
echo "  --otlp-endpoint \"https://ingest.us1.signalfx.com/v2/trace\" \\"
echo "  --node-name \"production-server\" \\"
echo "  --verbose"
echo

echo "4. Uninstall (equivalent to Ansible playbook with agent_action: uninstall)"
echo "Command: $BINARY uninstall"
echo "This removes the @splunk/otel package"
echo

echo "5. Uninstall without keeping backup"
echo "Command: $BINARY uninstall --keep-backup=false"
echo "This removes the package and deletes backup files"
echo

echo "6. Rollback (equivalent to Ansible playbook with agent_action: rollback)"
echo "Command: $BINARY rollback"
echo "This restores the previous version from backup"
echo

echo "7. Upgrade (equivalent to Ansible playbook with agent_action: upgrade)"
echo "Command: $BINARY upgrade --version 2.0.0"
echo "This upgrades to version 2.0.0, creating a backup first"
echo

echo "8. Using Configuration File"
echo "First, create a config file at $CONFIG_FILE:"
cat << 'EOF'
dest_folder: "/opt/splunk-nodejs-agent"
agent_version: "latest"
access_token: "PeZlDQLdXr3zDMmm9vWW_g"
otlp_endpoint: "https://ingest.us1.signalfx.com/v2/trace"
agent_node_name: "my-server"
keep_backup: true
EOF
echo
echo "Then run: $BINARY install"
echo "This uses the configuration file settings"
echo

echo "9. Verbose Output for Debugging"
echo "Command: $BINARY install --verbose"
echo "This provides detailed logging during operation"
echo

echo "10. Help and Available Options"
echo "Command: $BINARY --help"
echo "Command: $BINARY install --help"
echo

echo "=== Ansible to Go Module Equivalents ==="
echo

echo "Ansible Playbook:"
cat << 'EOF'
---
- name: Install Splunk Node.js Agent
  hosts: localhost
  become: true
  vars:
    agent_action: install
    agent_version: "latest"
    splunk_access_token: "PeZlDQLdXr3zDMmm9vWW_g"
    otel_exporter_otlp_endpoint: "https://ingest.us1.signalfx.com/v2/trace"
  roles:
    - role: ansible/node
EOF
echo
echo "Go Module Equivalent:"
echo "sudo $BINARY install \\"
echo "  --version \"latest\" \\"
echo "  --access-token \"PeZlDQLdXr3zDMmm9vWW_g\" \\"
echo "  --otlp-endpoint \"https://ingest.us1.signalfx.com/v2/trace\""
echo

echo "=== Expected Output Format ==="
echo "All commands return structured JSON output:"
cat << 'EOF'
{
  "node": "my-node-0",
  "error": false,
  "install_path": "/opt/splunk-nodejs-agent",
  "agent_type": "node",
  "agent_version": "1.0.0",
  "action": "install",
  "message": "Splunk Node.js agent install was successful"
}
EOF
echo

echo "=== Running Examples (Uncomment to execute) ==="
echo

# Uncomment the following lines to actually run the examples
# echo "Running help command:"
# $BINARY --help

# echo "Running install with verbose output:"
# $BINARY install --version latest --verbose --dest-folder /tmp/splunk-test

echo "Examples completed. Uncomment the lines at the end of this script to run actual commands."
