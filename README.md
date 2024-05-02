# gitmoji-changelog

This action generates a `CHANGELOG` based on the git history using the [Gitmoji](https://gitmoji.dev/about) convention. If no CHANGELOG has been created yet, it will go ahead and create one based on the current version. Currently, only package.json is supported (feel free to request other tooling). If a `CHANGELOG.md` exists, it will append to it based on the commits between the last changelog entry and `HEAD`. This action will provide via outputs the place of the created/updated `CHANGELOG.md` so it can be committed or uploaded. For example, flows have a look at the [usage examples](#example-usage)

> Please be aware that this expects you to create Tags for the versions that may be prefixed with 'v' or 'V'. e.g. Version=1.0.0 => TAG=1.0.0 or TAG=v1.0.0 or TAG=V1.0.0

## Inputs

| Input Name              | Required | Default | Description                                                 |
| ----------------------- | -------- | ------- | ----------------------------------------------------------- |
| add-authors             | false    | 'true'    | This determines whether the Authors of the Commits should be added to the changelog. It should be a valid YAML boolean value (e.g. TRUE, FALSE, true, false).                            |
| override-project-path   | false    | ''      | This can be used to provide a relative path to the project root that should be used to collect history. Should not start with ".".                                                       |
| override-changelog-path | false    | ''      | This can be used to provide a relative path to the project root where the CHANGELOG should be stored. It should end on "CHANGELOG.md" and not start with ".". |

## Outputs

| Output         | Description                                                                               |
| -------------- | ----------------------------------------------------------------------------------------- |
| for-version    | Will be populated with the version for which the CHANGELOG was generated.                 |
| changelog-path | The absolute path on the runner where the CHANGELOG.md is located. |

## Example usage

<details>
  <summary>
  Generate Changelog and leverage peter-evans/create-pull-request@v6 to create a PR.
  </summary>

```yaml
name: Generate Changelog in PR
on:
  workflow_dispatch:
permissions:
  contents: write
  pull-requests: write
jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # This is required to fetch the whole history and tags, which are essential for the action
      - name: Generate Changelog
        uses: Templum/gitmoji-changelog@main
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v6
        with:
          branch: feature/changelog-update
          title: ":memo: Update Changelog for ${{ steps.outputs.for-version }}"
          commit-message: ":memo: Update Changelog for ${{ steps.outputs.for-version }}"
```
</details>
