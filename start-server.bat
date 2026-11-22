@echo off
setlocal
title LUXE INTIMO - Local Server
cd /d "%~dp0"

set "PORT=8080"

echo.
echo   ==================================================
echo    LUXE INTIMO  -  starting local server
echo   ==================================================
echo.
echo    Folder : %~dp0
echo    Port   : %PORT%
echo.

rem ---- try Python (py launcher first) -------------------------------
where py >nul 2>&1 && (py -3 "%~dp0tools\serve.py" %PORT% & goto :done)
where python >nul 2>&1 && (python "%~dp0tools\serve.py" %PORT% & goto :done)
where python3 >nul 2>&1 && (python3 "%~dp0tools\serve.py" %PORT% & goto :done)

rem ---- try Node.js --------------------------------------------------
where node >nul 2>&1 && (node "%~dp0tools\serve.js" %PORT% & goto :done)

rem ---- nothing available -------------------------------------------
echo   [!]  Neither Python nor Node.js was found on this computer.
echo.
echo        Recommended - install Python 3 (free):
echo          https://www.python.org/downloads/
echo          Tick "Add python.exe to PATH" during setup.
echo.
echo        Opening index.html directly instead. The site still works,
echo        but password hashing and saved data are more reliable when
echo        the site is served over http://localhost.
echo.
start "" "%~dp0index.html"

:done
echo.
echo   ==================================================
echo    LUXE INTIMO - server stopped
echo   ==================================================
echo.
pause
endlocal