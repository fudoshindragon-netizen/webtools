// Copy the website build and make the tracker the app's start page.
// The Vercel site keeps dist/index.html as the sales page.
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

rmSync('app-dist', { recursive: true, force: true });
cpSync('dist', 'app-dist', { recursive: true });
cpSync('app-dist/cycle.html', 'app-dist/index.html');

if (process.env.VITE_LUNA_EDITION === 'lite') {
  const file = 'app-dist/index.html';
  const html = readFileSync(file, 'utf8')
    .replace('<title>Cycle and birth-control tracker | MicroVenture Labs</title>', '<title>Luna Cycle</title>')
    .replace(
      '<meta name="description" content="A private, on-device period and birth-control tracker with cited effectiveness, missed-dose guidance, medication flags, lab trends, and a symptom explainer. Educational information, not medical advice." />',
      '<meta name="description" content="A private period calendar. Your log stays on this phone." />',
    )
    .replace('<meta property="og:title" content="Cycle and birth-control tracker" />', '<meta property="og:title" content="Luna Cycle" />')
    .replace(
      '<meta property="og:description" content="Log a cycle, read cited birth-control guidance, and keep medications and labs on your device. Educational information, not medical advice." />',
      '<meta property="og:description" content="A private period calendar. Your log stays on this phone." />',
    )
    .replace(
      '<p class="cy-disclaimer">Educational information compiled from public sources, including CDC, FDA labels, and peer-reviewed summaries. This is not medical advice, not a diagnosis, and not a substitute for your clinician or pharmacist.</p>',
      '<p class="cy-disclaimer">Not medical advice and not birth control. Your log stays on this phone.</p>',
    );
  writeFileSync(file, html);
  console.log('app-dist/index.html is the lite period tracker.');
} else {
  console.log('app-dist/index.html is the cycle tracker.');
}
