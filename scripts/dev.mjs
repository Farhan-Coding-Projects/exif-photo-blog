// Runs `next dev` and tears down the whole server process tree when the
// terminal goes away. `next dev` doesn't handle SIGHUP, so closing the
// terminal kills the CLI but leaves `next-server` running on the port.
import { spawn } from 'node:child_process';

const child = spawn('next', ['dev', ...process.argv.slice(2)], {
  stdio: 'inherit',
  // Own process group, so we can signal the CLI and next-server together
  detached: true,
});

let stopping = false;
const stop = (signal = 'SIGTERM') => {
  if (stopping) return;
  stopping = true;
  try { process.kill(-child.pid, signal); } catch {}
  setTimeout(() => {
    try { process.kill(-child.pid, 'SIGKILL'); } catch {}
    process.exit(0);
  }, 3000).unref();
};

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
process.on('SIGHUP', () => stop('SIGTERM'));

// Backup for when the terminal dies without delivering SIGHUP:
// we get reparented, so stop once our original parent is gone.
const parentPid = process.ppid;
setInterval(() => {
  try { process.kill(parentPid, 0); } catch { stop(); }
}, 2000).unref();

child.on('exit', code => process.exit(code ?? 0));
