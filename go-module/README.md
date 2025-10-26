# Splunk OpenTelemetry Node.js Agent Manager

A Go-based command-line tool for managing Splunk OpenTelemetry Node.js agent installation via npm package `@splunk/otel`.

## Features

- **Install**: Install the `@splunk/otel` npm package
- **Uninstall**: Remove the `@splunk/otel` npm package
- **Rollback**: Restore the previous version from backup
- **Upgrade**: Upgrade to a new version with automatic backup

## Prerequisites

- Go 1.21 or later
- Node.js and npm installed on the target system
- Appropriate permissions for the installation directory (default: `/opt/splunk-nodejs-agent`)

## Build

```bash
cd go-module
make build
```

Or manually:

```bash
go mod tidy
go build -o bin/splunk-otel-manager ./cmd/splunk-otel-manager
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

### Command Line Flags

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

#### Using with Ansible

The Go binary can be invoked from Ansible playbooks. See `ansible/playbooks/install.yml` for an example that:
- Creates a dedicated user (`splunk-agent`) for running the agent
- Sets up the installation directory with proper permissions
- Executes the Go binary with the specified operation (install/uninstall/rollback/upgrade)

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
└── main.go        # CLI interface with Cobra framework
```

### Key Components

- **Manager**: Core component that handles all agent operations
- **Config**: Configuration structure for agent settings via CLI flags
- **Result**: Standardized JSON result format for all operations
- **CLI**: Cobra-based command-line interface

## Development

### Building

```bash
make build
# or
go build -o bin/splunk-otel-manager ./cmd/splunk-otel-manager
```

### Running Tests

```bash
make test
# or
go test ./pkg/agent/ -v
```

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
