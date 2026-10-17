@echo off
REM Taximeter CLI — Windows entry point
REM Usage: taximeter <command>
cd /d "%~dp0"
python taximeter.py %*
