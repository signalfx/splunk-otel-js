package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"github.com/splunk/splunk-otel-js-manager/pkg/agent"
)

var (
	cfgFile      string
	destFolder   string
	backupFolder string
	version      string
	accessToken  string
	otlpEndpoint string
	keepBackup   bool
	npmRegistry  string
	nodeName     string
	noSuffix     bool
	verbose      bool
)

var rootCmd = &cobra.Command{
	Use:   "splunk-otel-manager",
	Short: "Splunk OpenTelemetry Node.js Agent Manager",
	Long: `A command-line tool to manage Splunk OpenTelemetry Node.js agent installation,
uninstallation, rollback, and upgrade operations.

This tool provides equivalent functionality to the Ansible role for managing
the @splunk/otel npm package.`,
}

var installCmd = &cobra.Command{
	Use:   "install",
	Short: "Install the Splunk OpenTelemetry Node.js agent",
	Long:  `Install the @splunk/otel npm package with the specified version and configuration.`,
	RunE:  runInstall,
}

var uninstallCmd = &cobra.Command{
	Use:   "uninstall",
	Short: "Uninstall the Splunk OpenTelemetry Node.js agent",
	Long:  `Remove the @splunk/otel npm package from the system.`,
	RunE:  runUninstall,
}

var rollbackCmd = &cobra.Command{
	Use:   "rollback",
	Short: "Rollback to the previous version of the agent",
	Long:  `Restore the previously installed version of the Splunk OpenTelemetry Node.js agent from backup.`,
	RunE:  runRollback,
}

var upgradeCmd = &cobra.Command{
	Use:   "upgrade",
	Short: "Upgrade the Splunk OpenTelemetry Node.js agent",
	Long:  `Upgrade the @splunk/otel npm package to the specified version, creating a backup first.`,
	RunE:  runUpgrade,
}

func init() {
	cobra.OnInitialize(initConfig)

	// Global flags
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.splunk-otel-manager.yaml)")
	rootCmd.PersistentFlags().StringVar(&destFolder, "dest-folder", "/opt/splunk-nodejs-agent", "destination folder for agent installation")
	rootCmd.PersistentFlags().StringVar(&backupFolder, "backup-folder", "", "backup folder (default: <dest-folder>/backup)")
	rootCmd.PersistentFlags().StringVar(&version, "version", "latest", "agent version to install/upgrade to")
	rootCmd.PersistentFlags().StringVar(&accessToken, "access-token", "", "Splunk access token")
	rootCmd.PersistentFlags().StringVar(&otlpEndpoint, "otlp-endpoint", "", "OTLP endpoint URL")
	rootCmd.PersistentFlags().BoolVar(&keepBackup, "keep-backup", true, "keep backup files after uninstall")
	rootCmd.PersistentFlags().StringVar(&npmRegistry, "npm-registry", "https://registry.npmjs.org", "npm registry URL")
	rootCmd.PersistentFlags().StringVar(&nodeName, "node-name", "", "agent node name")
	rootCmd.PersistentFlags().BoolVar(&noSuffix, "no-node-name-suffix", false, "don't add -0 suffix to node name")
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "verbose output")

	// Bind flags to viper
	viper.BindPFlag("dest_folder", rootCmd.PersistentFlags().Lookup("dest-folder"))
	viper.BindPFlag("backup_folder", rootCmd.PersistentFlags().Lookup("backup-folder"))
	viper.BindPFlag("agent_version", rootCmd.PersistentFlags().Lookup("version"))
	viper.BindPFlag("access_token", rootCmd.PersistentFlags().Lookup("access-token"))
	viper.BindPFlag("otlp_endpoint", rootCmd.PersistentFlags().Lookup("otlp-endpoint"))
	viper.BindPFlag("keep_backup", rootCmd.PersistentFlags().Lookup("keep-backup"))
	viper.BindPFlag("npm_registry", rootCmd.PersistentFlags().Lookup("npm-registry"))
	viper.BindPFlag("agent_node_name", rootCmd.PersistentFlags().Lookup("node-name"))
	viper.BindPFlag("no_node_name_suffix", rootCmd.PersistentFlags().Lookup("no-node-name-suffix"))

	// Add subcommands
	rootCmd.AddCommand(installCmd)
	rootCmd.AddCommand(uninstallCmd)
	rootCmd.AddCommand(rollbackCmd)
	rootCmd.AddCommand(upgradeCmd)
}

func initConfig() {
	if cfgFile != "" {
		viper.SetConfigFile(cfgFile)
	} else {
		home, err := os.UserHomeDir()
		cobra.CheckErr(err)

		viper.AddConfigPath(home)
		viper.SetConfigType("yaml")
		viper.SetConfigName(".splunk-otel-manager")
	}

	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err == nil {
		fmt.Fprintln(os.Stderr, "Using config file:", viper.ConfigFileUsed())
	}
}

func createLogger() *zap.Logger {
	var logger *zap.Logger
	var err error

	if verbose {
		logger, err = zap.NewDevelopment()
	} else {
		logger, err = zap.NewProduction()
	}

	if err != nil {
		panic(fmt.Sprintf("Failed to create logger: %v", err))
	}

	return logger
}

func createConfig() *agent.Config {
	return &agent.Config{
		DestFolder:       viper.GetString("dest_folder"),
		BackupFolder:     viper.GetString("backup_folder"),
		AgentVersion:     viper.GetString("agent_version"),
		AccessToken:      viper.GetString("access_token"),
		OTLPEndpoint:     viper.GetString("otlp_endpoint"),
		KeepBackup:       viper.GetBool("keep_backup"),
		NPMRegistry:      viper.GetString("npm_registry"),
		AgentNodeName:    viper.GetString("agent_node_name"),
		NoNodeNameSuffix: viper.GetBool("no_node_name_suffix"),
	}
}

func printResult(result *agent.Result) {
	jsonBytes, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error marshaling result: %v\n", err)
		return
	}
	fmt.Println(string(jsonBytes))
}

func runInstall(cmd *cobra.Command, args []string) error {
	logger := createLogger()
	defer logger.Sync()

	config := createConfig()
	manager := agent.NewManager(config, logger)

	result, err := manager.Install()
	printResult(result)

	if err != nil {
		logger.Error("Installation failed", zap.Error(err))
		return err
	}

	return nil
}

func runUninstall(cmd *cobra.Command, args []string) error {
	logger := createLogger()
	defer logger.Sync()

	config := createConfig()
	manager := agent.NewManager(config, logger)

	result, err := manager.Uninstall()
	printResult(result)

	if err != nil {
		logger.Error("Uninstallation failed", zap.Error(err))
		return err
	}

	return nil
}

func runRollback(cmd *cobra.Command, args []string) error {
	logger := createLogger()
	defer logger.Sync()

	config := createConfig()
	manager := agent.NewManager(config, logger)

	result, err := manager.Rollback()
	printResult(result)

	if err != nil {
		logger.Error("Rollback failed", zap.Error(err))
		return err
	}

	return nil
}

func runUpgrade(cmd *cobra.Command, args []string) error {
	logger := createLogger()
	defer logger.Sync()

	config := createConfig()
	manager := agent.NewManager(config, logger)

	result, err := manager.Upgrade()
	printResult(result)

	if err != nil {
		logger.Error("Upgrade failed", zap.Error(err))
		return err
	}

	return nil
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
