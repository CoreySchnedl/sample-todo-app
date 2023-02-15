import "./App.css";
import { Amplify } from "aws-amplify";
import { Router } from "./Router";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

// const amplifyConfiguration = {
//   Auth: {
//     region: backendExports.StatefulStack.CognitoUserPoolRegion,
//     userPoolId: backendExports.StatefulStack.CognitoUserPoolId,
//     userPoolWebClientId:
//       backendExports.StatefulStack.CognitoUserPoolWebClientId,
//   },
//   API: {
//     endpoints: [
//       {
//         name: "default",
//         endpoint: backendExports.StatefulStack.ApiUrl.slice(0, -1),
//       },
//     ],
//   },
// };

// Amplify.configure(amplifyConfiguration);

function App() {
  return <Router></Router>;
}

export default withAuthenticator(App);
