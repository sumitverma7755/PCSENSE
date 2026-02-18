@echo off
echo ========================================
echo PCSensei LLM Analysis Helper
echo ========================================
echo.
echo This script will help you analyze the DesktopBuildEngine.java issues
echo using your local LLM.
echo.
echo STEP 1: The input prompt has been prepared in:
echo    LLM_INPUT_WITH_CODE.md
echo.
echo STEP 2: Copy the contents of that file to your local LLM
echo.
echo Opening the file now...
echo.
pause

start notepad.exe LLM_INPUT_WITH_CODE.md

echo.
echo ========================================
echo INSTRUCTIONS:
echo ========================================
echo 1. Copy ALL content from the opened file
echo 2. Paste it into your local LLM chat
echo 3. Wait for the LLM to analyze all 4 issues
echo 4. Save the LLM's response to: LLM_SOLUTIONS.md
echo 5. Review the solutions before applying them
echo ========================================
echo.
echo Press any key to exit...
pause > nul

