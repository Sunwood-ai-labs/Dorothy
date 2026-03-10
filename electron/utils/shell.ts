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

function toGitBashPath(targetPath: string): string {
  const normalized = targetPath.replace(/\\/g, '/');
  const driveMatch = normalized.match(/^([A-Za-z]):\/(.*)$/);
  const slashDriveMatch = normalized.match(/^\/([A-Za-z])\/(.*)$/);

  if (!driveMatch) {
    if (!slashDriveMatch) {
      return normalized;
    }

    const [, driveLetter, rest] = slashDriveMatch;
    return `/${driveLetter.toLowerCase()}/${rest}`;
  }

  const [, driveLetter, rest] = driveMatch;
  return `/${driveLetter.toLowerCase()}/${rest}`;
}

export function escapeShellSingleQuotes(value: string): string {
  return value.replace(/'/g, "'\\''");
}

export function normalizePathForShell(targetPath: string, shellPath: string = getTerminalShell()): string {
  if (process.platform === 'win32' && isBashLikeShell(shellPath)) {
    return toGitBashPath(targetPath);
  }

  return targetPath;
}

export function buildCdCommand(targetPath: string, command: string, shellPath: string = getTerminalShell()): string {
  const shellPathValue = escapeShellSingleQuotes(normalizePathForShell(targetPath, shellPath));
  return `cd '${shellPathValue}' && ${command}`;
}

export function buildHookCommand(targetPath: string, shellPath: string = getTerminalShell()): string {
  const shellPathValue = escapeShellSingleQuotes(normalizePathForShell(targetPath, shellPath));
  return `'${shellPathValue}'`;
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
