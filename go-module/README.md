# Splunk OpenTelemetry Node.js Agent Manager

A Go-based command-line tool that provides equivalent functionality to the Ansible role for managing Splunk OpenTelemetry Node.js agent installation via npm.

## Features

- **Install**: Install the `@splunk/otel` npm package
- **Uninstall**: Remove the `@splunk/otel` npm package
- **Rollback**: Restore the previous version from backup
- **Upgrade**: Upgrade to a new version with automatic backup

## Installation

### Prerequisites

- Go 1.21 or later
- Node.js and npm installed on the target system
- Appropriate permissions for the installation directory (default: `/opt/splunk-nodejs-agent`)

### Build from Source

```bash
git clone <repository-url>
cd go-module
go mod tidy
go build -o bin/splunk-otel-manager ./cmd/splunk-otel-manager
```

### Install Binary

```bash
go install ./cmd/splunk-otel-manager
```

## Usage

### Basic Commands

```bash
# Install the latest version
splunk-otel-manager install

# Install a specific version
splunk-otel-manager install --version "1.0.0"

# Uninstall the agent
splunk-otel-manager uninstall

# Rollback to previous version
splunk-otel-manager rollback

# Upgrade to latest version
splunk-otel-manager upgrade --version "2.0.0"
```

### Configuration Options

#### Command Line Flags

```bash
# Global flags (available for all commands)
--dest-folder string         Destination folder for agent installation (default "/opt/splunk-nodejs-agent")
--backup-folder string       Backup folder (default: <dest-folder>/backup)
--version string             Agent version to install/upgrade to (default "latest")
--access-token string        Splunk access token
--otlp-endpoint string       OTLP endpoint URL
--keep-backup               Keep backup files after uninstall (default true)
--npm-registry string       NPM registry URL (default "https://registry.npmjs.org")
--node-name string          Agent node name
--no-node-name-suffix       Don't add -0 suffix to node name
--verbose, -v               Verbose output
--config string             Config file (default is $HOME/.splunk-otel-manager.yaml)
```

#### Configuration File

Create a configuration file at `~/.splunk-otel-manager.yaml`:

```yaml
dest_folder: "/opt/splunk-nodejs-agent"
backup_folder: "/opt/splunk-nodejs-agent/backup"
agent_version: "latest"
access_token: "YOUR_SPLUNK_ACCESS_TOKEN_HERE"
otlp_endpoint: "https://ingest.us1.signalfx.com/v2/trace"
npm_registry: "https://registry.npmjs.org"
agent_node_name: "my-node"
no_node_name_suffix: false
keep_backup: true
```

### Examples

#### Install with Custom Configuration

```bash
splunk-otel-manager install \
  --version "1.2.3" \
  --dest-folder "/custom/path" \
  --access-token "your-token-here" \
  --otlp-endpoint "https://ingest.us1.signalfx.com/v2/trace" \
  --node-name "production-server" \
  --verbose
```

#### Equivalent to Ansible Playbook

The original Ansible playbook:

```yaml
---
- name: Install and configure Splunk Node.js Agent on localhost
  hosts: localhost
  become: true
  vars:
    agent_action: install
    agent_version: "latest"
    splunk_access_token: "PeZlDQLdXr3zDMmm9vWW_g"
    otel_exporter_otlp_endpoint: "https://ingest.us1.signalfx.com/v2/trace"
  roles:
    - role: ansible/node
```

Equivalent Go command:

```bash
sudo splunk-otel-manager install \
  --version "latest" \
  --access-token "PeZlDQLdXr3zDMmm9vWW_g" \
  --otlp-endpoint "https://ingest.us1.signalfx.com/v2/trace"
```

## Output Format

All commands return structured JSON output with operation results:

```json
{
  "node": "my-node-0",
  "error": false,
  "install_path": "/opt/splunk-nodejs-agent",
  "agent_type": "node",
  "agent_version": "1.0.0",
  "action": "install",
  "message": "Splunk Node.js agent install was successful"
}
```

## Architecture

### Package Structure

```
pkg/agent/
├── agent.go       # Core agent management functionality
└── agent_test.go  # Unit tests

cmd/splunk-otel-manager/
└── main.go        # CLI interface

config/
└── example.yaml   # Example configuration file
```

### Key Components

- **Manager**: Core component that handles all agent operations
- **Config**: Configuration structure for agent settings
- **Result**: Standardized result format for all operations
- **CLI**: Cobra-based command-line interface

## Development

### Running Tests

```bash
go test ./pkg/agent/
```

### Building

```bash
go build -o bin/splunk-otel-manager ./cmd/splunk-otel-manager
```

### Adding New Features

1. Add functionality to `pkg/agent/agent.go`
2. Add corresponding tests to `pkg/agent/agent_test.go`
3. Update CLI commands in `cmd/splunk-otel-manager/main.go` if needed
4. Update documentation

## Comparison with Ansible Role

| Feature | Ansible Role | Go Module |
|---------|-------------|-----------|
| Install | ✅ | ✅ |
| Uninstall | ✅ | ✅ |
| Rollback | ✅ | ✅ |
| Upgrade | ✅ | ✅ |
| Backup/Restore | ✅ | ✅ |
| Configuration | YAML vars | YAML config file + CLI flags |
| Output Format | Ansible facts | Structured JSON |
| Dependencies | Ansible + Python | Go binary (self-contained) |
| Execution | Playbook | Direct CLI commands |

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure you have write permissions to the destination folder
   ```bash
   sudo chown -R $USER:$USER /opt/splunk-nodejs-agent
   # or run with sudo
   sudo splunk-otel-manager install
   ```

2. **NPM Not Found**: Ensure Node.js and npm are installed and in PATH
   ```bash
   node --version
   npm --version
   ```

3. **Backup Not Found**: For rollback operations, ensure a previous installation created a backup
   ```bash
   ls -la /opt/splunk-nodejs-agent/backup/
   ```

### Verbose Logging

Use the `--verbose` flag for detailed operation logs:

```bash
splunk-otel-manager install --verbose
```

## License

This project follows the same licensing as the original Splunk OpenTelemetry repositories.
