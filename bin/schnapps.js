#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import prompts from 'prompts';

const REPO_URL = 'https://github.com/Giant-Peach-Design/schnapps.git';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command !== 'new') {
    console.log(`Usage: schnapps new <site_name>`);
    process.exit(1);
  }

  const siteName = args[1];

  if (!siteName) {
    console.log(chalk.red('Please provide a site name: schnapps new <site_name>'));
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), siteName);

  if (existsSync(targetDir)) {
    console.log(chalk.red(`Directory "${siteName}" already exists.`));
    process.exit(1);
  }

  // Ask about GitHub repo creation
  const { createRepo } = await prompts({
    type: 'confirm',
    name: 'createRepo',
    message: 'Create a GitHub repository?',
    initial: true,
  });

  let repoName = null;

  if (createRepo) {
    const { repo } = await prompts({
      type: 'text',
      name: 'repo',
      message: 'Repo name (e.g. "my-site" or "org-name/my-site"):',
      initial: siteName,
    });

    repoName = repo;
  }

  // Clone the repo
  console.log(chalk.blue(`\nCloning schnapps into "${siteName}"...`));
  execSync(`git clone --depth 1 ${REPO_URL} ${siteName}`, { stdio: 'inherit' });

  // Remove the .git directory and reinitialise
  console.log(chalk.blue('Initialising fresh git repo...'));
  execSync(`rm -rf ${targetDir}/.git`);
  execSync(`git init`, { cwd: targetDir, stdio: 'inherit' });

  // Update .lando.yml
  const landoPath = path.join(targetDir, '.lando.yml');
  if (existsSync(landoPath)) {
    console.log(chalk.blue('Updating .lando.yml...'));
    let lando = readFileSync(landoPath, 'utf8');
    lando = lando.replace(/name:\s*wp-playground/, `name: ${siteName}`);
    writeFileSync(landoPath, lando);
  }

  // Create GitHub repo if requested
  if (createRepo && repoName) {
    console.log(chalk.blue(`\nCreating GitHub repo "${repoName}"...`));

    const isOrg = repoName.includes('/');
    const ghArgs = isOrg
      ? `gh repo create ${repoName} --private --source ${targetDir} --push`
      : `gh repo create ${repoName} --private --source ${targetDir} --push`;

    try {
      execSync(ghArgs, { stdio: 'inherit' });
      console.log(chalk.green(`GitHub repo created: ${repoName}`));
    } catch {
      console.log(chalk.yellow('Failed to create GitHub repo. Make sure `gh` is installed and authenticated.'));
      console.log(chalk.yellow('You can create it manually later.'));
    }
  }

  // Initial commit
  console.log(chalk.blue('Creating initial commit...'));
  execSync(`git add -A`, { cwd: targetDir, stdio: 'inherit' });
  execSync(`git commit -m "Initial commit from schnapps"`, { cwd: targetDir, stdio: 'inherit' });

  // Push if repo was created but we haven't pushed yet
  if (createRepo && repoName) {
    try {
      execSync(`git push -u origin main`, { cwd: targetDir, stdio: 'inherit' });
    } catch {
      // --source --push in gh repo create may have already handled this
    }
  }

  console.log(chalk.green(`\nDone! Your new schnapps project is ready in "./${siteName}"`));
  console.log(chalk.gray(`\nNext steps:\n  cd ${siteName}\n  lando start\n  composer install`));
}

main().catch((err) => {
  console.error(chalk.red(err.message));
  process.exit(1);
});
