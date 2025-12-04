#!/usr/bin/env bash

# ============================================
# MINTCOIN SERVICE MANAGER
# ============================================
# Professional service orchestration script
# Full lifecycle management: start, stop, status, health
# ============================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Get service port
get_port() {
  case "$1" in
    "auth-service") echo "3001" ;;
    "user-service") echo "3002" ;;
    "kyc-service") echo "3003" ;;
    "wallet-service") echo "3004" ;;
    "ledger-service") echo "3005" ;;
    "payment-service") echo "3006" ;;
    "room-service") echo "3007" ;;
    "call-billing-service") echo "3008" ;;
    "chat-service") echo "3009" ;;
    "gift-service") echo "3010" ;;
    "referral-service") echo "3011" ;;
    "discovery-service") echo "3012" ;;
    "social-graph-service") echo "3013" ;;
    "notification-service") echo "3014" ;;
    "moderation-service") echo "3015" ;;
    "fraud-service") echo "3016" ;;
    "admin-service") echo "3017" ;;
    "analytics-service") echo "3018" ;;
    *) echo "N/A" ;;
  esac
}

# All services array
ALL_SERVICES_ARRAY=("auth-service" "user-service" "kyc-service" "wallet-service" "ledger-service" "payment-service" "room-service" "call-billing-service" "chat-service" "gift-service" "referral-service" "discovery-service" "social-graph-service" "notification-service" "moderation-service" "fraud-service" "admin-service" "analytics-service")

# Service groups
CORE_SERVICES=("auth-service" "user-service")
FINANCIAL_SERVICES=("kyc-service" "wallet-service" "ledger-service" "payment-service")
COMMUNICATION_SERVICES=("room-service" "call-billing-service" "chat-service")
FEATURE_SERVICES=("gift-service" "referral-service" "discovery-service" "social-graph-service")
PLATFORM_SERVICES=("notification-service" "moderation-service" "fraud-service" "admin-service" "analytics-service")

# Print banner
print_banner() {
  echo -e "${CYAN}"
  echo "╔════════════════════════════════════════════════╗"
  echo "║     MINTCOIN MICROSERVICES MANAGER            ║"
  echo "║     Professional Service Orchestration        ║"
  echo "╚════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

# Print service status
print_service_info() {
  local service=$1
  local port=$(get_port "$service")
  echo -e "${GREEN}  ✓ ${service}${NC} → Port ${BLUE}${port}${NC}"
}

# Check if a service is running on a port
is_service_running() {
  local port=$1
  lsof -i ":${port}" > /dev/null 2>&1
  return $?
}

# Get PID of service running on port
get_service_pid() {
  local port=$1
  lsof -ti ":${port}" 2>/dev/null
}

# Stop a service by port
stop_service_by_port() {
  local port=$1
  local pid=$(get_service_pid "$port")

  if [ -z "$pid" ]; then
    echo -e "${YELLOW}  ⚠ No service running on port ${port}${NC}"
    return 1
  fi

  echo -e "${YELLOW}  ⏹ Stopping service on port ${port} (PID: ${pid})${NC}"
  kill "$pid" 2>/dev/null
  sleep 1

  # Force kill if still running
  if kill -0 "$pid" 2>/dev/null; then
    echo -e "${RED}  ⚠ Force killing service (PID: ${pid})${NC}"
    kill -9 "$pid" 2>/dev/null
  fi

  echo -e "${GREEN}  ✓ Service stopped${NC}"
}

# Stop services in a group
stop_services() {
  local group=$1
  local services_to_stop=()

  case "$group" in
    core)
      services_to_stop=("${CORE_SERVICES[@]}")
      echo -e "${YELLOW}Stopping Core Services...${NC}\n"
      ;;
    financial)
      services_to_stop=("${FINANCIAL_SERVICES[@]}")
      echo -e "${YELLOW}Stopping Financial Services...${NC}\n"
      ;;
    communication)
      services_to_stop=("${COMMUNICATION_SERVICES[@]}")
      echo -e "${YELLOW}Stopping Communication Services...${NC}\n"
      ;;
    feature)
      services_to_stop=("${FEATURE_SERVICES[@]}")
      echo -e "${YELLOW}Stopping Feature Services...${NC}\n"
      ;;
    platform)
      services_to_stop=("${PLATFORM_SERVICES[@]}")
      echo -e "${YELLOW}Stopping Platform Services...${NC}\n"
      ;;
    all)
      services_to_stop=("${ALL_SERVICES_ARRAY[@]}")
      echo -e "${YELLOW}Stopping All Services...${NC}\n"
      ;;
    *)
      # Check if it's a specific port number
      if [[ "$group" =~ ^[0-9]+$ ]]; then
        stop_service_by_port "$group"
        return
      fi
      echo -e "${RED}Error: Invalid service group '$group'${NC}\n"
      return 1
      ;;
  esac

  for service in "${services_to_stop[@]}"; do
    local port=$(get_port "$service")
    if is_service_running "$port"; then
      echo -e "${BLUE}${service}${NC} (Port ${port})"
      stop_service_by_port "$port"
    else
      echo -e "${YELLOW}  ⚠ ${service}${NC} (Port ${port}) - Not running"
    fi
  done
}

# Check status of all services
check_status() {
  echo -e "\n${YELLOW}Service Status Report:${NC}\n"

  local running_count=0
  local stopped_count=0

  for service in "${ALL_SERVICES_ARRAY[@]}"; do
    local port=$(get_port "$service")

    if is_service_running "$port"; then
      local pid=$(get_service_pid "$port")
      echo -e "${GREEN}  ✓ ${service}${NC} → Port ${BLUE}${port}${NC} → PID ${MAGENTA}${pid}${NC}"
      ((running_count++))
    else
      echo -e "${RED}  ✗ ${service}${NC} → Port ${BLUE}${port}${NC} → ${RED}Not running${NC}"
      ((stopped_count++))
    fi
  done

  echo -e "\n${CYAN}Summary:${NC}"
  echo -e "  ${GREEN}Running: ${running_count}${NC}"
  echo -e "  ${RED}Stopped: ${stopped_count}${NC}"
  echo -e "  ${WHITE}Total: ${#ALL_SERVICES_ARRAY[@]}${NC}\n"
}

# Check health of a service
check_service_health() {
  local service=$1
  local port=$(get_port "$service")

  if ! is_service_running "$port"; then
    echo -e "${RED}  ✗ ${service}${NC} → ${RED}Not running${NC}"
    return 1
  fi

  # Try to connect to the service endpoint
  local endpoint=""
  case "$service" in
    auth-service) endpoint="auth" ;;
    user-service) endpoint="users" ;;
    kyc-service) endpoint="kyc" ;;
    wallet-service) endpoint="wallet" ;;
    ledger-service) endpoint="ledger" ;;
    payment-service) endpoint="payment" ;;
    room-service) endpoint="rooms" ;;
    call-billing-service) endpoint="call-billing" ;;
    chat-service) endpoint="chat" ;;
    gift-service) endpoint="gifts" ;;
    referral-service) endpoint="referrals" ;;
    discovery-service) endpoint="discovery" ;;
    social-graph-service) endpoint="social" ;;
    notification-service) endpoint="notifications" ;;
    moderation-service) endpoint="moderation" ;;
    fraud-service) endpoint="fraud" ;;
    admin-service) endpoint="admin" ;;
    analytics-service) endpoint="analytics" ;;
  esac

  local url="http://localhost:${port}/${endpoint}"
  local http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

  if [ "$http_code" = "000" ]; then
    echo -e "${YELLOW}  ⚠ ${service}${NC} → Port ${BLUE}${port}${NC} → ${YELLOW}Running but not responding${NC}"
    return 2
  elif [ "$http_code" = "200" ] || [ "$http_code" = "404" ]; then
    echo -e "${GREEN}  ✓ ${service}${NC} → Port ${BLUE}${port}${NC} → ${GREEN}Healthy (HTTP ${http_code})${NC}"
    return 0
  else
    echo -e "${YELLOW}  ⚠ ${service}${NC} → Port ${BLUE}${port}${NC} → ${YELLOW}HTTP ${http_code}${NC}"
    return 2
  fi
}

# Check health of all running services
check_health() {
  echo -e "\n${YELLOW}Service Health Check:${NC}\n"

  local healthy_count=0
  local unhealthy_count=0
  local stopped_count=0

  for service in "${ALL_SERVICES_ARRAY[@]}"; do
    check_service_health "$service"
    local result=$?

    if [ $result -eq 0 ]; then
      ((healthy_count++))
    elif [ $result -eq 1 ]; then
      ((stopped_count++))
    else
      ((unhealthy_count++))
    fi
  done

  echo -e "\n${CYAN}Health Summary:${NC}"
  echo -e "  ${GREEN}Healthy: ${healthy_count}${NC}"
  echo -e "  ${YELLOW}Unhealthy: ${unhealthy_count}${NC}"
  echo -e "  ${RED}Stopped: ${stopped_count}${NC}\n"
}

# Detect services with issues
detect_issues() {
  echo -e "\n${YELLOW}Detecting Service Issues...${NC}\n"

  local issues_found=0

  for service in "${ALL_SERVICES_ARRAY[@]}"; do
    local port=$(get_port "$service")

    if is_service_running "$port"; then
      # Service is running, check if it responds
      check_service_health "$service" > /dev/null 2>&1
      local health_result=$?

      if [ $health_result -eq 2 ]; then
        echo -e "${RED}  ⚠ ISSUE: ${service}${NC} (Port ${port}) - Running but not responding properly"
        ((issues_found++))
      fi
    fi
  done

  if [ $issues_found -eq 0 ]; then
    echo -e "${GREEN}  ✓ No issues detected. All running services are healthy!${NC}\n"
  else
    echo -e "\n${RED}Total issues found: ${issues_found}${NC}\n"
  fi
}

# List all services
list_services() {
  echo -e "\n${YELLOW}Available Services:${NC}\n"

  echo -e "${CYAN}Core Services:${NC}"
  for service in "${CORE_SERVICES[@]}"; do
    print_service_info "$service"
  done

  echo -e "\n${CYAN}Financial Services:${NC}"
  for service in "${FINANCIAL_SERVICES[@]}"; do
    print_service_info "$service"
  done

  echo -e "\n${CYAN}Communication Services:${NC}"
  for service in "${COMMUNICATION_SERVICES[@]}"; do
    print_service_info "$service"
  done

  echo -e "\n${CYAN}Feature Services:${NC}"
  for service in "${FEATURE_SERVICES[@]}"; do
    print_service_info "$service"
  done

  echo -e "\n${CYAN}Platform Services:${NC}"
  for service in "${PLATFORM_SERVICES[@]}"; do
    print_service_info "$service"
  done
}

# Show usage
show_usage() {
  echo -e "\n${YELLOW}Usage:${NC}"
  echo "  ./scripts/manage-services.sh [command] [options]"
  echo ""
  echo "Commands:"
  echo -e "  ${CYAN}Start Services:${NC}"
  echo "    core          - Run core services (auth, user)"
  echo "    financial     - Run financial services (kyc, wallet, ledger, payment)"
  echo "    communication - Run communication services (room, call, chat)"
  echo "    feature       - Run feature services (gift, referral, discovery, social)"
  echo "    platform      - Run platform services (notification, moderation, fraud, admin, analytics)"
  echo "    all           - Run all services"
  echo ""
  echo -e "  ${CYAN}Stop Services:${NC}"
  echo "    stop [group]  - Stop service group (core, financial, communication, feature, platform, all)"
  echo "    stop [port]   - Stop service on specific port (e.g., stop 3001)"
  echo ""
  echo -e "  ${CYAN}Monitor Services:${NC}"
  echo "    status        - Show status of all services (running/stopped)"
  echo "    health        - Check health of all running services"
  echo "    issues        - Detect services with problems"
  echo ""
  echo -e "  ${CYAN}Information:${NC}"
  echo "    list          - List all available services and their ports"
  echo "    help          - Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./scripts/manage-services.sh core              # Start core services"
  echo "  ./scripts/manage-services.sh stop core         # Stop core services"
  echo "  ./scripts/manage-services.sh stop 3001         # Stop service on port 3001"
  echo "  ./scripts/manage-services.sh status            # Check all service status"
  echo "  ./scripts/manage-services.sh health            # Check service health"
  echo "  ./scripts/manage-services.sh issues            # Detect issues"
}

# Main script
main() {
  print_banner

  case "$1" in
    core)
      echo -e "${GREEN}Starting Core Services...${NC}\n"
      for service in "${CORE_SERVICES[@]}"; do
        print_service_info "$service"
      done
      echo ""
      yarn services:core
      ;;
    financial)
      echo -e "${GREEN}Starting Financial Services...${NC}\n"
      for service in "${FINANCIAL_SERVICES[@]}"; do
        print_service_info "$service"
      done
      echo ""
      yarn services:financial
      ;;
    communication)
      echo -e "${GREEN}Starting Communication Services...${NC}\n"
      for service in "${COMMUNICATION_SERVICES[@]}"; do
        print_service_info "$service"
      done
      echo ""
      yarn services:communication
      ;;
    feature)
      echo -e "${GREEN}Starting Feature Services...${NC}\n"
      for service in "${FEATURE_SERVICES[@]}"; do
        print_service_info "$service"
      done
      echo ""
      yarn services:feature
      ;;
    platform)
      echo -e "${GREEN}Starting Platform Services...${NC}\n"
      for service in "${PLATFORM_SERVICES[@]}"; do
        print_service_info "$service"
      done
      echo ""
      yarn services:platform
      ;;
    all)
      echo -e "${GREEN}Starting All Services...${NC}\n"
      echo -e "${YELLOW}Total services: ${#ALL_SERVICES_ARRAY[@]}${NC}\n"
      yarn services:all
      ;;
    stop)
      if [ -z "$2" ]; then
        echo -e "${RED}Error: Please specify what to stop (core, financial, communication, feature, platform, all, or port number)${NC}\n"
        show_usage
        exit 1
      fi
      stop_services "$2"
      ;;
    status)
      check_status
      ;;
    health)
      check_health
      ;;
    issues)
      detect_issues
      ;;
    list)
      list_services
      ;;
    help|--help|-h|"")
      show_usage
      ;;
    *)
      echo -e "${RED}Error: Invalid command '$1'${NC}\n"
      show_usage
      exit 1
      ;;
  esac
}

# Run main function
main "$@"
