package agent

import (
	"os"
	"path/filepath"
	"testing"

	"go.uber.org/zap"
)

func TestNewManager(t *testing.T) {
	logger, _ := zap.NewDevelopment()
	config := &Config{}
	
	manager := NewManager(config, logger)
	
	// Test default values
	if manager.config.DestFolder != "/opt/splunk-nodejs-agent" {
		t.Errorf("Expected default dest folder to be '/opt/splunk-nodejs-agent', got '%s'", manager.config.DestFolder)
	}
	
	if manager.config.NPMRegistry != "https://registry.npmjs.org" {
		t.Errorf("Expected default npm registry to be 'https://registry.npmjs.org', got '%s'", manager.config.NPMRegistry)
	}
	
	if manager.config.AgentVersion != "latest" {
		t.Errorf("Expected default agent version to be 'latest', got '%s'", manager.config.AgentVersion)
	}
}

func TestCreateSuccessResult(t *testing.T) {
	logger, _ := zap.NewDevelopment()
	config := &Config{
		DestFolder:    "/test/path",
		AgentVersion:  "1.0.0",
		AgentNodeName: "test-node",
	}
	
	manager := NewManager(config, logger)
	result := manager.createSuccessResult("install", "Test message")
	
	if result.Error {
		t.Error("Expected success result to have Error=false")
	}
	
	if result.Action != "install" {
		t.Errorf("Expected action to be 'install', got '%s'", result.Action)
	}
	
	if result.Message != "Test message" {
		t.Errorf("Expected message to be 'Test message', got '%s'", result.Message)
	}
	
	if result.InstallPath != "/test/path" {
		t.Errorf("Expected install path to be '/test/path', got '%s'", result.InstallPath)
	}
	
	if result.Node != "test-node-0" {
		t.Errorf("Expected node name to be 'test-node-0', got '%s'", result.Node)
	}
}

func TestCreateErrorResult(t *testing.T) {
	logger, _ := zap.NewDevelopment()
	config := &Config{}
	
	manager := NewManager(config, logger)
	result := manager.createErrorResult("install", "Test error")
	
	if !result.Error {
		t.Error("Expected error result to have Error=true")
	}
	
	if result.Action != "install" {
		t.Errorf("Expected action to be 'install', got '%s'", result.Action)
	}
	
	if result.Message != "Test error" {
		t.Errorf("Expected message to be 'Test error', got '%s'", result.Message)
	}
}

func TestIsAgentInstalled(t *testing.T) {
	logger, _ := zap.NewDevelopment()
	
	// Create temporary directory for testing
	tempDir, err := os.MkdirTemp("", "splunk-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)
	
	config := &Config{
		DestFolder: tempDir,
	}
	
	manager := NewManager(config, logger)
	
	// Test when package.json doesn't exist
	installed, err := manager.isAgentInstalled()
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if installed {
		t.Error("Expected agent to not be installed when package.json doesn't exist")
	}
	
	// Test when package.json exists but doesn't contain @splunk/otel
	packageJSON := `{
		"name": "test-app",
		"dependencies": {
			"express": "^4.18.0"
		}
	}`
	
	packageJSONPath := filepath.Join(tempDir, "package.json")
	err = os.WriteFile(packageJSONPath, []byte(packageJSON), 0644)
	if err != nil {
		t.Fatalf("Failed to write package.json: %v", err)
	}
	
	installed, err = manager.isAgentInstalled()
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if installed {
		t.Error("Expected agent to not be installed when @splunk/otel is not in dependencies")
	}
	
	// Test when package.json contains @splunk/otel
	packageJSONWithSplunk := `{
		"name": "test-app",
		"dependencies": {
			"@splunk/otel": "^1.0.0",
			"express": "^4.18.0"
		}
	}`
	
	err = os.WriteFile(packageJSONPath, []byte(packageJSONWithSplunk), 0644)
	if err != nil {
		t.Fatalf("Failed to write package.json: %v", err)
	}
	
	installed, err = manager.isAgentInstalled()
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if !installed {
		t.Error("Expected agent to be installed when @splunk/otel is in dependencies")
	}
}

func TestCopyFile(t *testing.T) {
	logger, _ := zap.NewDevelopment()
	config := &Config{}
	manager := NewManager(config, logger)
	
	// Create temporary directory for testing
	tempDir, err := os.MkdirTemp("", "splunk-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)
	
	// Create source file
	srcPath := filepath.Join(tempDir, "source.txt")
	srcContent := "test content"
	err = os.WriteFile(srcPath, []byte(srcContent), 0644)
	if err != nil {
		t.Fatalf("Failed to create source file: %v", err)
	}
	
	// Copy file
	dstPath := filepath.Join(tempDir, "destination.txt")
	err = manager.copyFile(srcPath, dstPath)
	if err != nil {
		t.Errorf("Copy file failed: %v", err)
	}
	
	// Verify destination file exists and has correct content
	dstContent, err := os.ReadFile(dstPath)
	if err != nil {
		t.Errorf("Failed to read destination file: %v", err)
	}
	
	if string(dstContent) != srcContent {
		t.Errorf("Expected destination content to be '%s', got '%s'", srcContent, string(dstContent))
	}
}
