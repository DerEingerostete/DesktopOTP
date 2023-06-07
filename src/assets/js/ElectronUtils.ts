const { shell } = require('electron');

export function openGitHubPage(path: string | null): void {
    let url: string = "https://github.com/DerEingerostete/DesktopOTP";
    if (path !== null) url += '/' + path;

    shell.openExternal(url)
        .then((): void => {});
}