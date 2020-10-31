// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { ContestsProvider } from "./Component/Contests/contests";
import { Explorer } from "./Container/explorer";
import {setStatusBarItem} from "./Component/LoginStatus/loginStatus";
import { resetCookie, setConfiguration, setUser } from "./helper/data/data";
import { createContestFolders } from "./helper/createContestFolder/createContestFolder";


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  console.log('Congratulations, your extension "codeforcesbot-ext" is now active!');


  setUser(context.globalState.get('userHandle'), context.globalState.get('password'));

  updateConfiguration();

  const loginStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
  setStatusBarItem(loginStatusBarItem);

  const contestProvider = new ContestsProvider(
    vscode.workspace.rootPath ? vscode.workspace.rootPath : "/"
  );

  vscode.window.registerTreeDataProvider("contests", contestProvider);

  vscode.workspace.onDidChangeConfiguration(() => {
    updateConfiguration();
  });

  vscode.commands.registerCommand("contests.refresh", (node: Explorer) => {
	  console.log("REFRESH.....");
    console.log(node);
    contestProvider.refresh();
  });

  vscode.commands.registerCommand("contest.createContestFolders", (node: Explorer) => {
      console.log("Explorer.....");
      console.log(node);
      vscode.window.showInformationMessage("Click create contest folder");
      if(node.explorerId) {
        createContestFolders(node.explorerId, node.label);
      }
    }
  );

  let loginCommand = vscode.commands.registerCommand("codeforcesbot-ext.login", async () => {
      const userHandle = await vscode.window.showInputBox({
        placeHolder: 'Enter user',
        prompt:'Enter user name of Codeforces account',
        validateInput:userHandle => {
          return userHandle !== null && userHandle !== undefined && userHandle !== '' ? null : 'User name can not be empty';
        }
      });
      const password = await vscode.window.showInputBox({
        placeHolder: 'Enter password',
        prompt: 'Enter password of Codeforces account',
      });

      console.log(userHandle, password);

      context.globalState.update('userHandle', userHandle);
      context.globalState.update('password', password); 

      setUser(userHandle, password);
      resetCookie();
      contestProvider.refresh();
    }
  );

  context.subscriptions.push(loginCommand);
}

function updateConfiguration() {
  const configuration = vscode.workspace.getConfiguration('codeforcesBot');
  console.log("Configuration: ");
  const compileCommand = configuration.compile.command;
  const templateFile = configuration.template.templateFile;
  const templateLineNo = configuration.template.templateLineNumber;
  setConfiguration(compileCommand,templateFile,templateLineNo);
}



// this method is called when your extension is deactivated
export function deactivate() {}
