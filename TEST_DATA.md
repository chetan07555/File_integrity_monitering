# Test Data Generation Script

This script helps you create test files to demonstrate the File Integrity Monitoring system.

## Quick Test Files

### Windows PowerShell Commands

```powershell
# Navigate to the watched directory
cd backend\watched_files

# Create initial test files
"Hello, World!" | Out-File -FilePath "test1.txt"
"const greeting = 'Hello FIM';" | Out-File -FilePath "app.js"
"# FIM Test`n`nThis is a test document." | Out-File -FilePath "README.md"
"body { margin: 0; padding: 0; }" | Out-File -FilePath "style.css"

# Wait and modify files
Start-Sleep -Seconds 5
"Hello, World! Modified" | Out-File -FilePath "test1.txt"
"const greeting = 'Hello FIM System'; console.log(greeting);" | Out-File -FilePath "app.js"

# Create more complex files
@"
function calculate(a, b) {
  return a + b;
}

const result = calculate(5, 10);
console.log(result);
"@ | Out-File -FilePath "calculator.js"

@"
{
  "name": "test-project",
  "version": "1.0.0",
  "description": "Test data for FIM"
}
"@ | Out-File -FilePath "package.json"

# Delete a file
Remove-Item "test1.txt"

# Create log files
"[INFO] Application started" | Out-File -FilePath "app.log"
Start-Sleep -Seconds 3
"[INFO] Application started`n[WARN] Low memory" | Out-File -FilePath "app.log"
```

## Test Scenarios

### Scenario 1: New Project Setup
```powershell
# Create a new project structure
mkdir myproject
cd myproject

"# My Project" | Out-File -FilePath "README.md"
"node_modules/`ndist/`n.env" | Out-File -FilePath ".gitignore"
"const app = 'Hello';" | Out-File -FilePath "index.js"
```

### Scenario 2: Code Modifications
```powershell
# Initial code
@"
function add(a, b) {
  return a + b;
}
"@ | Out-File -FilePath "math.js"

# Wait for detection
Start-Sleep -Seconds 5

# Modified code (shows diff)
@"
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}
"@ | Out-File -FilePath "math.js"
```

### Scenario 3: Configuration Changes
```powershell
# Initial config
@"
{
  "port": 3000,
  "debug": false
}
"@ | Out-File -FilePath "config.json"

Start-Sleep -Seconds 5

# Security-sensitive change
@"
{
  "port": 8080,
  "debug": true,
  "apiKey": "secret123"
}
"@ | Out-File -FilePath "config.json"
```

### Scenario 4: Rapid Changes
```powershell
# Simulate rapid development
for ($i = 1; $i -le 10; $i++) {
  "Version $i of the file" | Out-File -FilePath "rapid-test.txt"
  Start-Sleep -Seconds 2
}
```

### Scenario 5: Multiple File Types
```powershell
# HTML
"<!DOCTYPE html><html><body><h1>Test</h1></body></html>" | Out-File -FilePath "index.html"

# CSS
".container { width: 100%; }" | Out-File -FilePath "styles.css"

# Python
"def hello():`n    print('Hello')" | Out-File -FilePath "script.py"

# SQL
"CREATE TABLE users (id INT, name VARCHAR(100));" | Out-File -FilePath "schema.sql"

# Markdown
"# Documentation`n`n## Features`n- Feature 1`n- Feature 2" | Out-File -FilePath "DOCS.md"
```

## Expected Results

After running these commands, you should see in the dashboard:

1. **CREATE events** for new files (Green/Blue status)
2. **MODIFY events** for changed files (Red status)
3. **DELETE events** for removed files (Yellow status)
4. **Diff summaries** showing line-by-line changes
5. **Email alerts** for critical modifications (if enabled)
6. **Real-time updates** without page refresh

## Verification Checklist

- [ ] Files appear in dashboard immediately
- [ ] Event type is correctly identified
- [ ] Hash values are different for modifications
- [ ] Diff summary shows accurate changes
- [ ] Timestamps are correct
- [ ] Filters work properly
- [ ] Modal shows complete details
- [ ] Statistics update in real-time
- [ ] Email alerts received (if enabled)

## Clean Up Test Data

To remove all test files:

```powershell
# Navigate to watched directory
cd backend\watched_files

# Remove all test files
Remove-Item * -Force

# Or remove specific files
Remove-Item test*.txt, *.js, *.json -Force
```

## Continuous Testing

For ongoing testing, you can use this loop:

```powershell
# Continuous file creation and modification
while ($true) {
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "Log entry at: $timestamp" | Out-File -FilePath "activity.log" -Append
  Start-Sleep -Seconds 10
}

# Press Ctrl+C to stop
```

## Notes

- All files are created in the `backend/watched_files` directory
- Changes are detected almost instantly
- Text files show detailed diffs
- Binary files show hash changes only
- Large files may take longer to process
