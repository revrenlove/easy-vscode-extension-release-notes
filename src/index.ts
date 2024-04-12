import { marked } from 'marked';
import * as vscode from 'vscode';
import * as semver from 'semver';
import * as cheerio from 'cheerio';
import * as path from 'path';
import * as fs from 'fs/promises';

async function useEasyReleaseNotes(options: EasyReleaseNotesOptions) {

    if (!tryUpdateGlobalState(options)) {
        return;
    }

    const supportedFileTypes = ['.md', '.html'];

    const fileTypeMatches = options.releaseNotesFileName.match(/(?<=\.)[^.]+$/i);

    if (!fileTypeMatches || !supportedFileTypes.includes(fileTypeMatches[0])) {
        throw new Error(`Only markdown and html files are supported. Invalid filename supplied: ${options.releaseNotesFileName}`);
    }

    const isMarkdown = fileTypeMatches[0] === '.md';
    const fileContents = await parseFile(options.releaseNotesFileName);

    const title = options.title || resolveTitle(isMarkdown, fileContents);
    const html = isMarkdown ? await marked.parse(fileContents) : fileContents;

    const viewColumn = options.viewColumn || vscode.ViewColumn.One;
    const webViewOptions = options.webViewOptions || {};

    const panel = vscode.window.createWebviewPanel(`${options.context.extension.id}.webView`, title, viewColumn, webViewOptions);
    panel.webview.html = html;
}

function tryUpdateGlobalState(options: EasyReleaseNotesOptions): boolean {

    const versionGlobalStateKey = options.versionGlobalStateKey || `${options.context.extension.id}.version`;

    const currentStoredVersion = options.context.globalState.get<string>(versionGlobalStateKey);
    const currentExtensionVersion = options.context.extension.packageJSON.version as string;

    if (currentStoredVersion && semver.eq(currentExtensionVersion, currentStoredVersion)) {
        return false;
    }

    options.context.globalState.update(versionGlobalStateKey, currentExtensionVersion);

    return true;
}

function resolveTitle(isMarkdown: boolean, fileContents: string) {

    let title: string;

    if (isMarkdown) {
        title = getTitleFromMarkdown(fileContents);
    }
    else {
        title = getTitleFromHtml(fileContents);
    }

    return title;
}

function getTitleFromHtml(html: string): string {

    const $ = cheerio.load(html);

    const title = $('title').text().trim();

    return title;
}

function getTitleFromMarkdown(markdown: string): string {

    const titleRgx = /^# (.+)/i;
    const matches = markdown.match(titleRgx);

    if (!matches || matches.length < 2) {
        return "";
    }

    return matches[1].trim();
}

interface EasyReleaseNotesOptions {
    context: vscode.ExtensionContext,
    releaseNotesFileName: string,
    versionGlobalStateKey?: string,
    title?: string,
    webViewOptions?: vscode.WebviewPanelOptions & vscode.WebviewOptions,
    viewColumn?: vscode.ViewColumn,
}

async function parseFile(filename: string) {

    const uri = vscode.Uri.file(path.join(__dirname, '..', filename));

    const fileContents = (await fs.readFile(uri.fsPath)).toString();

    return fileContents;
}

export default useEasyReleaseNotes;
