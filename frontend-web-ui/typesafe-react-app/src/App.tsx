import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify, Auth } from "aws-amplify";
import "./App.css";
import backendRestAPIExports from "./backendRestAPIExports.json";
import { Router } from "./Router";

export const API_NAME_BACKEND_REST_API = "API_NAME_BACKEND_REST_API";

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
        name: API_NAME_BACKEND_REST_API,
        endpoint: backendRestAPIExports.BackendRestAPIStack.ApiUrl.slice(0, -1),
        custom_header: async () => {
          return {
            Authorization: `Bearer ${(await Auth.currentSession())
              .getIdToken()
              .getJwtToken()}`,
            "Content-Type": "application/json",
          };
        },
      },
    ],
  },
};

Amplify.configure(amplifyConfiguration);

function App() {
  return <Router></Router>;
}

export default withAuthenticator(App);
