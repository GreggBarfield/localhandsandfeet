# First-time server setup (one time only)

Run in PowerShell on the Windows Server. After this, every update is just `deploy\deploy.ps1`.
Port 4400 is free as of 2026-11-12 (4300 is the Trainers Portal). Check again with
`Get-NetTCPConnection -State Listen -LocalPort 4400 -ErrorAction SilentlyContinue` before step 4.

Compare step 4 with how the Trainers Portal service is set up: `nssm dump TrainersPortal`.
Match its settings (account, log files, restart behaviour) if they differ from below.

1. Get the code (separate from the old site in D:\handsandfeet):

       git clone https://github.com/GreggBarfield/localhandsandfeet.git D:\localhandsandfeet-app
       cd D:\localhandsandfeet-app
       mkdir logs

2. Create the database:

       psql -U postgres -c "CREATE DATABASE localhandsandfeet;"

3. Create `.env` (copy `.env.example`, then fill in the real values; PORT must be 4400):

       Copy-Item .env.example .env
       notepad .env

4. Install the Windows service (NSSM):

       nssm install LocalHandsAndFeet "C:\Program Files\nodejs\node.exe" "node_modules\next\dist\bin\next" start
       nssm set LocalHandsAndFeet AppDirectory D:\localhandsandfeet-app
       nssm set LocalHandsAndFeet AppStdout D:\localhandsandfeet-app\logs\out.log
       nssm set LocalHandsAndFeet AppStderr D:\localhandsandfeet-app\logs\err.log
       nssm set LocalHandsAndFeet Start SERVICE_AUTO_START

5. First deploy (installs, builds, creates the tables, starts the service):

       D:\localhandsandfeet-app\deploy\deploy.ps1

   If the restart step errors, run `nssm start LocalHandsAndFeet`, then look at `logs\err.log`.

6. Test site in IIS (the real localhandsandfeet.org stays on the old site until cutover):
   create an IIS site named `lhf-new.blocktrustnetwork.com`, physical path
   `D:\localhandsandfeet-app\deploy\iis`, host name `lhf-new.blocktrustnetwork.com`, plus the DNS record and certificate
   the same way you did for the other blocktrustnetwork.com sites.

## Cutover (later)

Point the `localhandsandfeet.org` IIS site's physical path at `D:\localhandsandfeet-app\deploy\iis`.
The old files stay in `D:\handsandfeet`, untouched, so switching back is one setting.
