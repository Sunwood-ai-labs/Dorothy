import * as fs from 'fs';

const WINDOWS_BASH_CANDIDATES = [
  process.env.DOROTHY_BASH_PATH,
  process.env.GIT_BASH_PATH,
  'C:\\Program Files\\Git\\bin\\bash.exe',
  'C:\\Program Files\\Git\\usr\\bin\\bash.exe',
];

export function isBashLikeShell(shellPath: string): boolean {
  return /(?:^|[\\/])(ba|z)?sh(?:\.exe)?$/i.test(shellPath);
}

export function getTerminalShell(): string {
  if (process.platform === 'win32') {
    for (const candidate of WINDOWS_BASH_CANDIDATES) {
      if (candidate && fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return process.env.COMSPEC || 'cmd.exe';
  }

  return process.env.SHELL || '/bin/bash';
}

export function getTerminalShellArgs(shellPath: string = getTerminalShell()): string[] {
  return isBashLikeShell(shellPath) ? ['-l'] : [];
}

export function getPtyShellConfig(): { shell: string; args: string[] } {
  const shell = getTerminalShell();
  return {
    shell,
    args: getTerminalShellArgs(shell),
  };
}
