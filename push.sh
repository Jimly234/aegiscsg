#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# AEGIS CSG — GitHub Push Script
# Run this ONCE from inside the project directory to push
# the committed code to https://github.com/Jimly234/aegiscsg
#
# Prerequisites:
#   1. Generate a GitHub Personal Access Token (PAT) at:
#      https://github.com/settings/tokens/new
#      Scopes required: repo (full)
#   2. Paste your token when prompted below
# ─────────────────────────────────────────────────────────────

echo "Enter your GitHub Personal Access Token (PAT):"
read -rs GH_TOKEN

git remote set-url origin "https://${GH_TOKEN}@github.com/Jimly234/aegiscsg.git"
git push -u origin master --force

echo ""
echo "✅ Push complete! Visit: https://github.com/Jimly234/aegiscsg"
