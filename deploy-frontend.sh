#!/bin/bash

# Deploy Frontend to Hostinger
# Usage: ./deploy-frontend.sh

set -e

echo "🚀 Starting Frontend Deployment to Hostinger..."

# Configuration
FTP_SERVER="ftp.bersekolah.com"
FTP_USERNAME="your_ftp_username"
FTP_PASSWORD="your_ftp_password"
REMOTE_DIR="/public_html/"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Building project...${NC}"

# Install dependencies
yarn install

# Build project
yarn build

echo -e "${YELLOW}📤 Uploading to Hostinger...${NC}"

# Upload to Hostinger using lftp
lftp -c "
set ftp:ssl-allow no
open -u $FTP_USERNAME,$FTP_PASSWORD $FTP_SERVER
lcd dist
cd $REMOTE_DIR
mirror -R --delete --verbose --exclude-glob=*.log --exclude-glob=*.tmp
quit
"

echo -e "${GREEN}✅ Frontend deployed successfully to bersekolah.com!${NC}"
echo -e "${GREEN}🔗 Website URL: https://bersekolah.com${NC}"
