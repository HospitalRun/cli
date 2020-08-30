# HospitalRun CLI

<div align="center">

![Status](https://img.shields.io/badge/Status-developing-brightgree) [![Version](https://img.shields.io/github/v/release/hospitalrun/cli)](https://github.com/HospitalRun/cli/releases) [![GitHub CI](https://github.com/HospitalRun/cli/workflows/GitHub%20CI/badge.svg?branch=master)](https://github.com/HospitalRun/cli/actions) [![Coverage Status](https://coveralls.io/repos/github/HospitalRun/cli/badge.svg?branch=master)](https://coveralls.io/github/HospitalRun/cli?branch=master) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/HospitalRun/cli.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/HospitalRun/cli/context:javascript) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) ![dependabot](https://api.dependabot.com/badges/status?host=github&repo=HospitalRun/cli) [![Slack](https://hospitalrun-slackin.herokuapp.com/badge.svg)](https://hospitalrun-slackin.herokuapp.com)

</div>

This repository will host Command Line Interface for the HospitalRun project. The CLI is written in Typescript and uses sade, chalk and glob. The purpose of this CLI is to start the project and migrate the CouchDB database from version 1.0.0-beta to v2.

Main features:
- Build CouchDB design documents from TypeScript code
- Extract and convert to `.json` `.ts` `.js` design documents from CouchDB backups

TODO list:
- [ ]  Allow backups directly from HR cli
- [ ] Add command to run HospitalRun frontend/server inside Docker

## CLI commands

| Command | Description |
| -- | --|
| `hospitalrun ddoc extract` |Extract design document(s) from database exported backup file into TypeScript files.|
| `hospitalrun ddoc build` |Build design document(s) from TypeScript files. Files can be imported directly into CouchDB.|


More information and examples can be found with `hospitalrun --help` command

# License

Released under the [MIT license](LICENSE).
