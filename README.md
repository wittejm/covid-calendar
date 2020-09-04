# covid-calendar

This project is a collaboration between [Code for PDX](codeforpdx.org) and the Multnomah County Emergency Operations Center.

Please read our [code of conduct](http://www.codeforpdx.org/about/conduct).

To join as a developer, contact jordan.witte@codeforpdx.org, kent@kentshikama.com, or hugh@codeforpdx.org for an invite to our [Github organization](https://github.com/codeforpdx/) and to our Slack channel.

The latest dev version of the app is live at our temporary server here: https://codeforpdx.neocities.org/

## Installation

1. **[Fork](https://help.github.com/articles/fork-a-repo/#fork-an-example-repository)** the repo to create a copy for your own github account,
  and **[clone](https://help.github.com/articles/fork-a-repo/#step-2-create-a-local-clone-of-your-fork)** your own copy. (Read [CONTRIBUTING.md](https://github.com/codeforpdx/recordexpungPDX/blob/master/CONTRIBUTING.md) for important info about syncing code your on github)

3. Install [npm](https://www.npmjs.com/)

2. In the project directory, install npm dependencies with

```
npm install
```

3. Launch the local dev server with

```
npm start
```

## Live dev server

Merging a pull request into master triggers a production build to our temporary server at: https://codeforpdx.neocities.org/

## Manual Production build

To build and deploy the app anywhere, run:

```
npm build
```

which places the production-ready files in the `build/` directory. You may then copy those files onto your own site.
