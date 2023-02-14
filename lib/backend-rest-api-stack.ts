import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface BackendRestAPIStackProps extends StackProps {}

export class BackendRestAPIStack extends Stack {
  constructor(scope: Construct, id: string, props: BackendRestAPIStackProps) {
    super(scope, id, props);
  }
}
