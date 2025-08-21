#!/bin/bash

# Test script for Ansible playbook with Go module backend

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GO_MODULE_DIR="$SCRIPT_DIR/../go-module"
PLAYBOOK_DIR="$SCRIPT_DIR/playbooks"

echo "=== Testing Ansible Playbook with Go Module Backend ==="
echo

# Step 1: Build the Go module if not already built
echo "1. Ensuring Go module is built..."
if [ ! -f "$GO_MODULE_DIR/bin/splunk-otel-manager" ]; then
    echo "Building Go module..."
    cd "$GO_MODULE_DIR"
    make build
    cd "$SCRIPT_DIR"
else
    echo "Go binary already exists at $GO_MODULE_DIR/bin/splunk-otel-manager"
fi
echo

# Step 2: Verify the Go binary works
echo "2. Testing Go binary functionality..."
"$GO_MODULE_DIR/bin/splunk-otel-manager" --help > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Go binary is functional"
else
    echo "❌ Go binary test failed"
    exit 1
fi
echo

# Step 3: Check Ansible installation
echo "3. Checking Ansible installation..."
if command -v ansible-playbook &> /dev/null; then
    echo "✅ Ansible is installed: $(ansible-playbook --version | head -n1)"
else
    echo "❌ Ansible is not installed. Please install Ansible first."
    echo "   pip install ansible"
    exit 1
fi
echo

# Step 4: Validate playbook syntax
echo "4. Validating playbook syntax..."
cd "$SCRIPT_DIR"
ansible-playbook --syntax-check playbooks/splunk.yml
if [ $? -eq 0 ]; then
    echo "✅ Playbook syntax is valid"
else
    echo "❌ Playbook syntax validation failed"
    exit 1
fi
echo

# Step 5: Test dry run (check mode would be ideal, but our module doesn't support it yet)
echo "5. Testing playbook structure..."
echo "Playbook content:"
cat playbooks/splunk.yml
echo

# Step 6: Show available actions
echo "6. Available playbook actions:"
echo "   Install:   ansible-playbook playbooks/splunk.yml"
echo "   Uninstall: ansible-playbook playbooks/splunk.yml -e 'agent_action=uninstall'"
echo "   Rollback:  ansible-playbook playbooks/splunk.yml -e 'agent_action=rollback'"
echo "   Upgrade:   ansible-playbook playbooks/splunk.yml -e 'agent_version=2.0.0 agent_action=upgrade'"
echo

echo "7. Example with custom variables:"
echo "   ansible-playbook playbooks/splunk.yml \\"
echo "     -e 'agent_action=install' \\"
echo "     -e 'agent_version=1.5.0' \\"
echo "     -e 'splunk_dest_folder=/tmp/test-splunk' \\"
echo "     -e 'splunk_access_token=your-token'"
echo

echo "=== Test completed successfully! ==="
echo
echo "To run the playbook:"
echo "cd $SCRIPT_DIR"
echo "ansible-playbook playbooks/splunk.yml"
echo
echo "The playbook will now use the Go module backend while maintaining"
echo "the same Ansible interface as the original role."
