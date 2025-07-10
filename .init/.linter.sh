#!/bin/bash
cd /home/kavia/workspace/code-generation/modern-tic-tac-toe-19a4c431/frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

