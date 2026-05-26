#!/bin/bash
# TODO: Replace with actual DHP build script once template is received from IT
# Likely contents based on the dhp-node-example pattern:
echo "Building LeadLab for DHP"
npm ci
npm run build
# The build should produce a dist directory containing the deployable artifact
# TODO: Confirm with IT whether additional steps (e.g. asset copying, env file generation) are needed
