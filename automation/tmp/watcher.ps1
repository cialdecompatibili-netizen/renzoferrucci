Set-Location C:\Users\mirco\Desktop\repository\renzoferrucci
while (Get-CimInstance Win32_Process | ? { $_.CommandLine -match 'traduci_lingua' -and $_.Name -match 'python' }) { Start-Sleep 20 }
$f = git diff --name-only -- en/_posts | ? { Select-String -Path $_ -Pattern '^tr: tradotto' -Quiet }
if ($f) { git add -- $f; git commit -m "EN: tradotti gli articoli rimanenti (automatico)"; git pull --rebase --autostash; git push }
"FINITO $(Get-Date) file=$($f.Count)" | Out-File automation\tmp\watcher_done.txt
