import { App, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { aws_iam as iam } from 'aws-cdk-lib';

interface GitLabOidcProps extends StackProps {
  gitLabURI: string;
  gitLabProjectPath: string;
};

export class GitLabOidc extends Stack {
  constructor(scope: Construct, id: string, props: GitLabOidcProps) {
    super(scope, id, props);

    // Configure OIDC provider
    // See https://docs.gitlab.com/ee/ci/cloud_services/aws/#add-the-identity-provider
    const oidcProvider = new iam.OpenIdConnectProvider(this, 'Provider', {
      url: props.gitLabURI,
      clientIds: [ props.gitLabURI, ],
    });

    // Create the role
    const role = new iam.Role(this, 'Role', {
      assumedBy: new iam.OpenIdConnectPrincipal(oidcProvider).withConditions({
        'StringEquals': {
          [ props.gitLabURI.substring(8) + ':sub' ]: 'project_path:' + props.gitLabProjectPath,
        }
      }),
      description: 'GitLab pipeline role',
    });
    
    // Create the policy to attach to the role
    // Note: this is an example, needs 
    const policy = new iam.ManagedPolicy(this, 'Policy', {
      statements: [
        new iam.PolicyStatement({
          sid: 'GitLabPolicy',
          actions: [ 'sts:GetCallerIdentity', ],
          resources: [ '*', ],
        }),
      ],
    });
    role.addManagedPolicy(policy);
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

    new CfnOutput(this, 'pipelineRoleArn', {
      value: role.roleArn,
      description: 'Role ARN to assume by pipeline',
    });
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new GitLabOidc(app, 'MyGitLabIntegration', {
  env: devEnv,
  gitLabURI: 'https://gitlab.com',
  gitLabProjectPath: 'mygroup/myproject:ref_type:branch:ref:main',
});
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();