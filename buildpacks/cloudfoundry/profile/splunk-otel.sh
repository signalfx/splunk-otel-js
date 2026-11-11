# The Node.js buildpack copies this script to the droplet's profile.d directory.
# Resolve the agent at launch; staging paths do not exist in the running app.
if [[ "${SPLUNK_OTEL_NODEJS_ENABLED:-true}" != false ]]; then
  splunk_otel_preload="--require=\"${DEPS_DIR:-${HOME%/app}/deps}/@INDEX@/splunk-otel/instrument.js\""
  case " ${NODE_OPTIONS:-} " in
    *" $splunk_otel_preload "*) ;;
    *) export NODE_OPTIONS="$splunk_otel_preload${NODE_OPTIONS:+ $NODE_OPTIONS}" ;;
  esac
  unset splunk_otel_preload
fi
