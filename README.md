# Schnapps CLI

A CLI tool to scaffold new [Schnapps](https://github.com/Giant-Peach-Design/schnapps) projects.

## Installation

```bash
npm install -g Giant-Peach-Design/schnapps-cli
```

## Usage

```bash
schnapps new <site_name>
```

This will:

1. Clone the Schnapps starter into a new `<site_name>` directory
2. Initialise a fresh git repo
3. Update `.lando.yml` with the site name
4. Optionally create a GitHub repository (supports `repo-name` or `org/repo-name` format)
5. Create an initial commit and push

## Requirements

- [Node.js](https://nodejs.org/) >= 18
- [GitHub CLI (`gh`)](https://cli.github.com/) — required for repo creation
