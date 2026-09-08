@echo off
rem ================================================================
rem  ROTA guncelleme dugmesi
rem  Kullanim: Claude'un verdigi dosyalari Downloads'a indir,
rem  sonra bu dosyaya cift tikla. Gerisini bu betik halleder:
rem  dosyalari yerine kopyalar, commit eder, GitHub'a push'lar.
rem ================================================================
cd /d "%~dp0"
echo.
echo === ROTA guncelleme basliyor ===
echo.

rem --- Downloads'taki yeni dosyalari repoya kopyala ---
if exist "%USERPROFILE%\Downloads\rota.html" (
  copy /Y "%USERPROFILE%\Downloads\rota.html" "public\rota.html" >nul
  move /Y "%USERPROFILE%\Downloads\rota.html" "%USERPROFILE%\Downloads\rota-yuklendi.html" >nul
  echo [OK] rota.html kopyalandi.
) else (
  echo [--] Downloads icinde yeni rota.html yok, kopyalama atlandi.
)

if exist "%USERPROFILE%\Downloads\route.ts" (
  if not exist "app\api\kur" mkdir "app\api\kur"
  copy /Y "%USERPROFILE%\Downloads\route.ts" "app\api\kur\route.ts" >nul
  move /Y "%USERPROFILE%\Downloads\route.ts" "%USERPROFILE%\Downloads\route-yuklendi.ts" >nul
  echo [OK] route.ts kopyalandi.
)

rem --- Git kimligi (bir kere ayarlanir, zarari yok) ---
git config user.name "Seyit Can Karatepe"
git config user.email "seyitcan.karatepe@gmail.com"

echo.
echo --- GitHub'dan son durum aliniyor ---
git pull origin main --no-edit

echo.
echo --- Degisiklikler gonderiliyor ---
git add -A
git commit -m "ROTA guncellemesi"
git push origin main

echo.
echo === BITTI. Vercel 1-2 dakika icinde canliya alir. ===
echo Bu pencereyi kapatabilirsiniz.
pause
