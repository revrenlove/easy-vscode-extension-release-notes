# Easy VSCode Extension Release Notes

Want to show your extension's users a "What's New" type page in VSCode whenever you update your extension? Then this is the package for you!

This package checks the `globalState` for an existing version and if it is different from the _actual_ version of the extension, it will open up a new webview displaying the provided release notes file. `html` and `md` files are permitted.

## Install

`npm i easy-vscode-extension-release-notes`

## Usage

```ts
import * as vscode from 'vscode';
import useEasyReleaseNotes from 'easy-vscode-extension-release-notes';

export async function activate(context: vscode.ExtensionContext) {

    // All of your existing code...

    const options: EasyReleaseNotesOptions = {
        context: context,
        releaseNotesFileName: 'release-notes.html'
    };

    await useEasyReleaseNotes(options);
}
```

### `EasyReleaseNotesOptions`

- `context` - the `vscode.ExtensionContext` passed into the `activate` function.

- `releaseNotesFileName` - the `html` or `md` file you wish to display. This will need to live in the root of the `extension` folder of the `.visx` archive (same spot as the `package.json`).

- `title` - _Optional_. The title of the web view that shows up on the tab. If one is not provided, it will parse the title from either the `<title>` element (if `html`), or the contents of the first `#` heading (if `md`).

- `versionGlobalStateKey` - _Optional_. Unique key for storing the version in the global state. Default: `[publisher].[extension-name].version`

- `webViewOptions` - _Optional_. [`vscode.WebviewPanelOptions`](https://code.visualstudio.com/api/references/vscode-api#WebviewPanelOptions) & [`vscode.WebviewOptions`](https://code.visualstudio.com/api/references/vscode-api#WebviewOptions)

- `viewColumn` - _Optional_. [`vscode.ViewColumn`](https://code.visualstudio.com/api/references/vscode-api#ViewColumn). Default: `vscode.ViewColumn.One`
