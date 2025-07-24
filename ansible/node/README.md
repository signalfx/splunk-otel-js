# Splunk OpenTelemetry Node.js Agent Ansible Role

This Ansible role manages the installation, upgrade, rollback, and uninstall of the Splunk OpenTelemetry Node.js agent (`@splunk/otel`).

## Features

- **Install**: Fresh installation of the Splunk OTEL agent
- **Upgrade**: Upgrade to a newer version with automatic backup
- **Rollback**: Restore from backup to previous version
- **Uninstall**: Complete removal of the agent
- **Backup**: Automatic backup before operations

## Requirements

- Ansible 2.9+
- Node.js and npm installed on target hosts
- `community.general` collection for npm module
- Appropriate permissions for `/opt/splunk-node-agent` directory

## Role Variables

### Required Variables
```yaml
agent_action: install|upgrade|rollback|uninstall
agent_version: "latest"  # or specific version like "1.2.3"
```

### Optional Variables
```yaml
splunk_dest_folder: /opt/splunk-node-agent
splunk_backup_folder: /opt/splunk-node-agent/backup
splunk_user: splunk
splunk_group: splunk
keep_backup: true
```

### Security Variables (Use Ansible Vault)
```yaml
# Store these in ansible-vault encrypted files
vault_splunk_access_token: "your-access-token"
vault_otel_exporter_otlp_endpoint: "https://ingest.us1.signalfx.com/v2/trace"
```

## Usage Examples

### Install Agent
```yaml
- hosts: servers
  become: true
  vars:
    agent_action: install
    agent_version: "latest"
  roles:
    - ansible/node
```

### Upgrade Agent
```yaml
- hosts: servers
  become: true
  vars:
    agent_action: upgrade
    agent_version: "1.2.3"
  roles:
    - ansible/node
```

### Rollback Agent
```yaml
- hosts: servers
  become: true
  vars:
    agent_action: rollback
  roles:
    - ansible/node
```

### Uninstall Agent
```yaml
- hosts: servers
  become: true
  vars:
    agent_action: uninstall
    keep_backup: false  # Optional: remove backups too
  roles:
    - ansible/node
```

## Security Best Practices

1. **Never hardcode sensitive tokens** in playbooks
2. Use `ansible-vault` to encrypt sensitive variables:
   ```bash
   ansible-vault create group_vars/all/vault.yml
   ```
3. Reference encrypted variables in playbooks:
   ```yaml
   splunk_access_token: "{{ vault_splunk_access_token }}"
   ```

## Directory Structure

```
ansible/node/
├── README.md
├── defaults/main.yml      # Default variables
├── vars/main.yml          # Role variables
├── tasks/
│   ├── main.yml          # Main task orchestration
│   ├── setup-npm.yml     # Node.js/npm setup
│   ├── agent-install.yml # Installation tasks
│   ├── agent-upgrade.yml # Upgrade tasks
│   ├── agent-rollback.yml# Rollback tasks
│   ├── agent-uninstall.yml# Uninstall tasks
│   └── backup.yml        # Backup tasks
└── meta/main.yml         # Role metadata
```

## Error Handling

All operations include comprehensive error handling with:
- Rescue blocks for failed operations
- Detailed error messages
- Structured JSON output for integration
- Rollback capabilities on upgrade failures

## Testing

Test the role with different scenarios:

```bash
# Test installation
ansible-playbook -i inventory playbooks/splunk.yml -e "agent_action=install"

# Test upgrade
ansible-playbook -i inventory playbooks/splunk.yml -e "agent_action=upgrade agent_version=1.2.3"

# Test rollback
ansible-playbook -i inventory playbooks/splunk.yml -e "agent_action=rollback"

# Test uninstall
ansible-playbook -i inventory playbooks/splunk.yml -e "agent_action=uninstall"
```

## Troubleshooting

### Common Issues

1. **Permission denied on /opt directory**
   - Ensure the user has sudo privileges
   - Check directory ownership and permissions

2. **npm package not found**
   - Verify internet connectivity
   - Check npm registry accessibility

3. **Backup not found during rollback**
   - Ensure a previous installation/upgrade created backups
   - Check backup directory permissions

### Logs and Output

The role provides structured JSON output for each operation:
```json
{
  "error": false,
  "install_path": "/opt/splunk-node-agent",
  "agent_type": "node",
  "agent_version": "1.2.3",
  "action": "install"
}
```