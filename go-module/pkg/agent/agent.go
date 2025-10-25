package agent

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"go.uber.org/zap"
)

// Config represents the configuration for the Splunk OpenTelemetry agent
type Config struct {
	DestFolder       string `json:"dest_folder"`
	BackupFolder     string `json:"backup_folder"`
	AgentVersion     string `json:"agent_version"`
	AccessToken      string `json:"access_token"`
	OTLPEndpoint     string `json:"otlp_endpoint"`
	KeepBackup       bool   `json:"keep_backup"`
	NPMRegistry      string `json:"npm_registry"`
	AgentNodeName    string `json:"agent_node_name"`
	NoNodeNameSuffix bool   `json:"no_node_name_suffix"`
}

// Result represents the result of an agent operation
type Result struct {
	Node         string `json:"node"`
	Error        bool   `json:"error"`
	InstallPath  string `json:"install_path"`
	AgentType    string `json:"agent_type"`
	AgentVersion string `json:"agent_version"`
	Action       string `json:"action"`
	Message      string `json:"message,omitempty"`
}

// Manager handles Splunk OpenTelemetry agent operations
type Manager struct {
	config *Config
	logger *zap.Logger
}

// NewManager creates a new agent manager with the given configuration
func NewManager(config *Config, logger *zap.Logger) *Manager {
	if config.DestFolder == "" {
		config.DestFolder = "/opt/splunk-nodejs-agent"
	}
	if config.BackupFolder == "" {
		config.BackupFolder = filepath.Join(config.DestFolder, "backup")
	}
	if config.NPMRegistry == "" {
		config.NPMRegistry = "https://registry.npmjs.org"
	}
	if config.AgentVersion == "" {
		config.AgentVersion = "latest"
	}

	return &Manager{
		config: config,
		logger: logger,
	}
}

// Install installs the Splunk OpenTelemetry agent
func (m *Manager) Install() (*Result, error) {
	m.logger.Info("Starting Splunk Node.js agent installation")

	// Create backup before installation
	if err := m.createBackup(); err != nil {
		m.logger.Error("Failed to create backup", zap.Error(err))
		return m.createErrorResult("install", fmt.Sprintf("Backup failed: %v", err)), err
	}

	// Create destination directory
	if err := os.MkdirAll(m.config.DestFolder, 0775); err != nil {
		m.logger.Error("Failed to create destination directory", zap.Error(err))
		return m.createErrorResult("install", fmt.Sprintf("Directory creation failed: %v", err)), err
	}

	// Check if already installed
	isInstalled, err := m.isAgentInstalled()
	if err != nil {
		m.logger.Error("Failed to check installation status", zap.Error(err))
		return m.createErrorResult("install", fmt.Sprintf("Installation check failed: %v", err)), err
	}

	if isInstalled {
		m.logger.Info("Agent already installed, skipping installation")
		return m.createSuccessResult("install", "Agent already installed"), nil
	}

	// Install the package
	if err := m.installPackage(); err != nil {
		m.logger.Error("Failed to install package", zap.Error(err))
		return m.createErrorResult("install", fmt.Sprintf("Package installation failed: %v", err)), err
	}

	m.logger.Info("Splunk Node.js agent installation completed successfully")
	return m.createSuccessResult("install", "Splunk Node.js agent install was successful"), nil
}

// Uninstall removes the Splunk OpenTelemetry agent
func (m *Manager) Uninstall() (*Result, error) {
	m.logger.Info("Starting Splunk Node.js agent uninstallation")

	// Remove the package
	if err := m.uninstallPackage(); err != nil {
		m.logger.Error("Failed to uninstall package", zap.Error(err))
		return m.createErrorResult("uninstall", fmt.Sprintf("Package uninstallation failed: %v", err)), err
	}

	// Remove backup folder if not keeping backups
	if !m.config.KeepBackup {
		if err := os.RemoveAll(m.config.BackupFolder); err != nil {
			m.logger.Warn("Failed to remove backup folder", zap.Error(err))
		}
	}

	m.logger.Info("Splunk Node.js agent uninstallation completed successfully")
	return m.createSuccessResult("uninstall", "Splunk Node.js agent was successfully removed"), nil
}

// Rollback restores the previous version of the agent
func (m *Manager) Rollback() (*Result, error) {
	m.logger.Info("Starting Splunk Node.js agent rollback")

	// Check if backup exists
	backupVersionFile := filepath.Join(m.config.BackupFolder, "splunk-agent-version.txt")
	if _, err := os.Stat(backupVersionFile); os.IsNotExist(err) {
		m.logger.Error("No backup version found for rollback")
		return m.createErrorResult("rollback", "No backup version found for rollback"), fmt.Errorf("no backup version found")
	}

	// Read backup version
	versionBytes, err := os.ReadFile(backupVersionFile)
	if err != nil {
		m.logger.Error("Failed to read backup version", zap.Error(err))
		return m.createErrorResult("rollback", fmt.Sprintf("Failed to read backup version: %v", err)), err
	}

	backupVersion := strings.TrimSpace(string(versionBytes))

	// Restore config if exists
	backupConfigFile := filepath.Join(m.config.BackupFolder, "splunk-config.js")
	destConfigFile := filepath.Join(m.config.DestFolder, "splunk-config.js")
	if _, err := os.Stat(backupConfigFile); err == nil {
		if err := m.copyFile(backupConfigFile, destConfigFile); err != nil {
			m.logger.Warn("Failed to restore config file", zap.Error(err))
		}
	}

	// Install the backup version
	oldVersion := m.config.AgentVersion
	m.config.AgentVersion = backupVersion
	if err := m.installPackage(); err != nil {
		m.config.AgentVersion = oldVersion // Restore original version on failure
		m.logger.Error("Failed to install backup version", zap.Error(err))
		return m.createErrorResult("rollback", fmt.Sprintf("Failed to install backup version: %v", err)), err
	}

	m.logger.Info("Splunk Node.js agent rollback completed successfully")
	return m.createSuccessResult("rollback", "Splunk Node.js agent was restored successfully"), nil
}

// Upgrade upgrades the agent to a new version
func (m *Manager) Upgrade() (*Result, error) {
	m.logger.Info("Starting Splunk Node.js agent upgrade")

	// Create backup before upgrade
	if err := m.createBackup(); err != nil {
		m.logger.Error("Failed to create backup before upgrade", zap.Error(err))
		return m.createErrorResult("upgrade", fmt.Sprintf("Backup failed: %v", err)), err
	}

	// Install the new version (same as install)
	if err := m.installPackage(); err != nil {
		m.logger.Error("Failed to upgrade package", zap.Error(err))
		return m.createErrorResult("upgrade", fmt.Sprintf("Package upgrade failed: %v", err)), err
	}

	m.logger.Info("Splunk Node.js agent upgrade completed successfully")
	return m.createSuccessResult("upgrade", "Splunk Node.js agent upgrade was successful"), nil
}

// Helper methods

func (m *Manager) isAgentInstalled() (bool, error) {
	packageJSONPath := filepath.Join(m.config.DestFolder, "package.json")
	if _, err := os.Stat(packageJSONPath); os.IsNotExist(err) {
		return false, nil
	}

	content, err := os.ReadFile(packageJSONPath)
	if err != nil {
		return false, err
	}

	return strings.Contains(string(content), "@splunk/otel"), nil
}

func (m *Manager) installPackage() error {
	version := strings.TrimPrefix(m.config.AgentVersion, "^")
	version = strings.TrimPrefix(version, "~")

	cmd := exec.Command("npm", "install", fmt.Sprintf("@splunk/otel@%s", version), "--registry", m.config.NPMRegistry)
	cmd.Dir = m.config.DestFolder
	cmd.Env = append(os.Environ(), "CXXFLAGS=-std=c++17")

	output, err := cmd.CombinedOutput()
	if err != nil {
		m.logger.Error("npm install failed", zap.String("output", string(output)), zap.Error(err))
		return fmt.Errorf("npm install failed: %v, output: %s", err, string(output))
	}

	m.logger.Info("Package installed successfully", zap.String("output", string(output)))
	return nil
}

func (m *Manager) uninstallPackage() error {
	cmd := exec.Command("npm", "uninstall", "@splunk/otel")
	cmd.Dir = m.config.DestFolder

	output, err := cmd.CombinedOutput()
	if err != nil {
		m.logger.Error("npm uninstall failed", zap.String("output", string(output)), zap.Error(err))
		return fmt.Errorf("npm uninstall failed: %v, output: %s", err, string(output))
	}

	m.logger.Info("Package uninstalled successfully", zap.String("output", string(output)))
	return nil
}

func (m *Manager) createBackup() error {
	// Create backup directory
	if err := os.MkdirAll(m.config.BackupFolder, 0775); err != nil {
		return err
	}

	// Check if package.json exists
	packageJSONPath := filepath.Join(m.config.DestFolder, "package.json")
	if _, err := os.Stat(packageJSONPath); os.IsNotExist(err) {
		m.logger.Info("No existing installation found, skipping backup")
		return nil
	}

	// Read current version
	content, err := os.ReadFile(packageJSONPath)
	if err != nil {
		return err
	}

	// Parse package.json to get current version
	var packageJSON map[string]interface{}
	if err := json.Unmarshal(content, &packageJSON); err != nil {
		return err
	}

	dependencies, ok := packageJSON["dependencies"].(map[string]interface{})
	if !ok {
		dependencies = make(map[string]interface{})
	}

	if splunkVersion, exists := dependencies["@splunk/otel"]; exists {
		versionFile := filepath.Join(m.config.BackupFolder, "splunk-agent-version.txt")
		if err := os.WriteFile(versionFile, []byte(fmt.Sprintf("%v", splunkVersion)), 0644); err != nil {
			return err
		}
		m.logger.Info("Backed up version", zap.String("version", fmt.Sprintf("%v", splunkVersion)))
	}

	// Backup config file if exists
	configFile := filepath.Join(m.config.DestFolder, "splunk-config.js")
	if _, err := os.Stat(configFile); err == nil {
		backupConfigFile := filepath.Join(m.config.BackupFolder, "splunk-config.js")
		if err := m.copyFile(configFile, backupConfigFile); err != nil {
			m.logger.Warn("Failed to backup config file", zap.Error(err))
		}
	}

	return nil
}

func (m *Manager) copyFile(src, dst string) error {
	input, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	return os.WriteFile(dst, input, 0644)
}

func (m *Manager) createSuccessResult(action, message string) *Result {
	nodeName := m.config.AgentNodeName
	if !m.config.NoNodeNameSuffix && !strings.HasSuffix(nodeName, "-0") {
		nodeName += "-0"
	}

	return &Result{
		Node:         nodeName,
		Error:        false,
		InstallPath:  m.config.DestFolder,
		AgentType:    "node",
		AgentVersion: m.config.AgentVersion,
		Action:       action,
		Message:      message,
	}
}

func (m *Manager) createErrorResult(action, message string) *Result {
	return &Result{
		Node:         "",
		Error:        true,
		InstallPath:  "",
		AgentType:    "node",
		AgentVersion: "",
		Action:       action,
		Message:      message,
	}
}
