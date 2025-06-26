#!/usr/bin/env node

/**
 * Task Completion Workflow Script
 * 
 * This script runs all quality checks and tests before creating a PR
 * It ensures code quality and functionality before submitting changes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}${colors.blue}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function runCommand(command, description, { suppressOutput = false, continueOnError = false } = {}) {
  try {
    logStep('RUNNING', description);
    
    const options = {
      stdio: suppressOutput ? 'pipe' : 'inherit',
      encoding: 'utf8'
    };
    
    const result = execSync(command, options);
    logSuccess(`${description} completed`);
    
    return { success: true, output: result };
  } catch (error) {
    logError(`${description} failed`);
    
    if (error.stdout) {
      log('STDOUT:', 'yellow');
      console.log(error.stdout);
    }
    
    if (error.stderr) {
      log('STDERR:', 'red');
      console.log(error.stderr);
    }
    
    if (!continueOnError) {
      process.exit(1);
    }
    
    return { success: false, error: error.message };
  }
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    logSuccess(`${description} exists`);
    return true;
  } else {
    logWarning(`${description} not found at ${filePath}`);
    return false;
  }
}

function generateCommitMessage() {
  try {
    // Get current branch name
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    
    // Get list of modified files
    const modifiedFiles = execSync('git diff --name-only --cached', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(file => file.length > 0);
    
    // Get list of untracked files that will be added
    const untrackedFiles = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(file => file.length > 0);
    
    // Determine commit type based on changes
    let commitType = 'chore';
    let scope = '';
    let description = 'update project files';
    
    // Analyze file changes to determine commit type
    const allFiles = [...modifiedFiles, ...untrackedFiles];
    
    if (allFiles.some(file => file.includes('test') || file.includes('spec'))) {
      commitType = 'test';
      description = 'add/update tests';
    }
    
    if (allFiles.some(file => file.includes('component') || file.includes('src/'))) {
      commitType = 'feat';
      description = 'implement new functionality';
    }
    
    if (allFiles.some(file => file.includes('fix') || file.includes('bug'))) {
      commitType = 'fix';
      description = 'resolve issues';
    }
    
    if (allFiles.some(file => file.includes('style') || file.includes('css'))) {
      commitType = 'style';
      description = 'update styling';
    }
    
    if (allFiles.some(file => file.includes('doc') || file.includes('README'))) {
      commitType = 'docs';
      description = 'update documentation';
    }
    
    // Determine scope
    if (allFiles.some(file => file.includes('pricing') || file.includes('Price'))) {
      scope = 'pricing';
    } else if (allFiles.some(file => file.includes('search') || file.includes('Search'))) {
      scope = 'search';
    } else if (allFiles.some(file => file.includes('test'))) {
      scope = 'testing';
    }
    
    // Build commit message
    const scopeStr = scope ? `(${scope})` : '';
    const message = `${commitType}${scopeStr}: ${description}`;
    
    return message;
  } catch (error) {
    logWarning('Could not generate automatic commit message, using default');
    return 'chore: update project files';
  }
}

function createTestReport() {
  const reportPath = path.join(process.cwd(), 'test-results.json');
  
  if (!fs.existsSync(reportPath)) {
    return 'No test results available';
  }
  
  try {
    const testResults = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    const summary = {
      total: testResults.stats?.total || 0,
      passed: testResults.stats?.expected || 0,
      failed: testResults.stats?.unexpected || 0,
      skipped: testResults.stats?.skipped || 0
    };
    
    return `
## Test Results Summary

- **Total Tests:** ${summary.total}
- **Passed:** ${summary.passed} ✅
- **Failed:** ${summary.failed} ❌
- **Skipped:** ${summary.skipped} ⏭️

**Test Success Rate:** ${summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0}%
    `.trim();
  } catch (error) {
    return 'Test results could not be parsed';
  }
}

async function main() {
  log(`${colors.bold}${colors.magenta}
🚀 Task Completion Workflow
=============================${colors.reset}
`);
  
  const startTime = Date.now();
  
  // Step 1: Check prerequisites
  logStep('1', 'Checking prerequisites');
  
  checkFileExists('package.json', 'Package.json');
  checkFileExists('tsconfig.json', 'TypeScript config');
  checkFileExists('playwright.config.ts', 'Playwright config');
  
  // Step 2: Install dependencies (if needed)
  logStep('2', 'Ensuring dependencies are installed');
  runCommand('npm ci', 'Install dependencies', { suppressOutput: true });
  
  // Step 3: Run TypeScript compilation check
  logStep('3', 'TypeScript compilation check');
  runCommand('npx tsc --noEmit', 'TypeScript compilation');
  
  // Step 4: Run ESLint
  logStep('4', 'Code linting');
  runCommand('npm run lint', 'ESLint check');
  
  // Step 5: Run tests
  logStep('5', 'Running test suite');
  const testResult = runCommand('npm run test', 'Playwright tests', { continueOnError: true });
  
  if (!testResult.success) {
    logError('Tests failed! Please fix failing tests before creating PR.');
    logStep('INFO', 'You can run "npm run test:headed" to debug failing tests');
    process.exit(1);
  }
  
  // Step 6: Build check
  logStep('6', 'Build verification');
  runCommand('npm run build', 'Production build', { suppressOutput: true });
  
  // Step 7: Generate test report
  logStep('7', 'Generating test report');
  const testReport = createTestReport();
  logSuccess('Test report generated');
  
  // Step 8: Check git status
  logStep('8', 'Checking git status');
  
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (gitStatus.trim() === '') {
      logWarning('No changes detected to commit');
      log('If you made changes, make sure they are saved and not ignored by .gitignore');
      process.exit(0);
    }
    
    logSuccess(`Found ${gitStatus.trim().split('\n').length} changes to commit`);
  } catch (error) {
    logError('Git status check failed');
    process.exit(1);
  }
  
  // Step 9: Ready for PR creation
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  log(`\n${colors.bold}${colors.green}
✅ All Quality Checks Passed!
=============================

Duration: ${duration} seconds

Next Steps:
-----------
1. Run "npm run workflow:pr" to create the pull request
2. Or run "npm run workflow:pr -- --force" to skip tests

Test Report Preview:
${testReport}
${colors.reset}`);
  
  // Store test report for PR creation
  fs.writeFileSync('.test-report.md', testReport);
  
  logStep('SUCCESS', 'Ready to create pull request! 🎉');
}

// Run the workflow
main().catch(error => {
  logError(`Workflow failed: ${error.message}`);
  process.exit(1);
});