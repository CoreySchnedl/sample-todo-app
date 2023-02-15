import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import "./App.css";
import { Router } from "./Router";
import backendRestAPIExports from "./backendRestAPIExports.json";

const amplifyConfiguration = {
  Auth: {
    region: backendRestAPIExports.BackendRestAPIStack.CognitoUserPoolRegion,
    userPoolId: backendRestAPIExports.BackendRestAPIStack.CognitoUserPoolId,
    userPoolWebClientId:
      backendRestAPIExports.BackendRestAPIStack.CognitoUserPoolWebClientId,
  },
  API: {
    endpoints: [
      {
        name: "default",
        endpoint: backendRestAPIExports.BackendRestAPIStack.ApiUrl.slice(0, -1),
      },
    ],
  },
};

Amplify.configure(amplifyConfiguration);

function App() {
  return <Router></Router>;
}

export default withAuthenticator(App);
