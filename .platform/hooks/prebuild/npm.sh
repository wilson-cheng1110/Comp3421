#!/bin/bash
# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install dependencies
cd /var/app/staging
npm install 