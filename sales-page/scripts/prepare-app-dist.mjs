// Copy the website build and make the tracker the app's start page.
// The Vercel site keeps dist/index.html as the sales page.
import { cpSync, rmSync } from 'node:fs';

rmSync('app-dist', { recursive: true, force: true });
cpSync('dist', 'app-dist', { recursive: true });
cpSync('app-dist/cycle.html', 'app-dist/index.html');
console.log('app-dist/index.html is the cycle tracker.');
