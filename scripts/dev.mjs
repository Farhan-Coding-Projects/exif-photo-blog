// Runs `next dev` and tears down the whole server process tree when the
// terminal goes away. `next dev` doesn't handle SIGHUP, so closing the
// terminal kills the CLI but leaves `next-server` running on the port.
// Any dev server already running for this project is stopped first.
import { execFileSync, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const isAlive = pid => {
  try { process.kill(pid, 0); return true; } catch { return false; }
};

// `next dev` refuses to start while another one holds .next/dev/lock
const stopExistingServer = async () => {
  let pid;
  try {
    ({ pid } = JSON.parse(readFileSync('.next/dev/lock', 'utf8')));
  } catch { return; }
  if (!pid || !isAlive(pid)) return;

  const ps = (...args) => execFileSync('ps', args, { encoding: 'utf8' }).trim();
  let pgid, command;
  try {
    [, pgid, command] = ps('-o', 'pgid=,command=', '-p', String(pid)).match(/^(\d+)\s+(.*)$/);
    pgid = Number(pgid);
  } catch { return; }
  // Guard against PID reuse by an unrelated process
  if (!command.includes('next')) return;

  console.log(`Stopping existing dev server (PID ${pid})…`);
  // Take down the old CLI along with next-server, but never our own group
  const ownPgid = Number(ps('-o', 'pgid=', '-p', String(process.pid)));
  const targets = pgid && pgid !== ownPgid ? [-pgid, pid] : [pid];
  const signal = sig => targets.forEach(t => { try { process.kill(t, sig); } catch {} });

  signal('SIGTERM');
  for (let i = 0; i < 50 && isAlive(pid); i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (isAlive(pid)) signal('SIGKILL');
};

await stopExistingServer();

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
