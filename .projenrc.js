const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.35.0',
  cdkVersionPinning: true,
  defaultReleaseBranch: 'main',
  name: 'gitlab-aws-oidc',
  vscode: true,
  gitignore: [ '.vscode/' ],
  github: false,
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
