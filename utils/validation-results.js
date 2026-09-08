import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const reportPath = path.resolve('../reports', 'validation-results.xml');
const emptyReport = '<?xml version="1.0" encoding="UTF-8"?><VALIDATION_RESULTS></VALIDATION_RESULTS>';

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function addValidationResult(result, scenario, elapsedMs) {
  if (!['PASS', 'FAIL', 'TIMEOUT'].includes(result)) {
    throw new Error(`Unsupported validation result: ${result}`);
  }
  if (typeof scenario !== 'string' || scenario.trim() === '') {
    throw new Error('A scenario name is required.');
  }

  await mkdir(path.dirname(reportPath), { recursive: true });

  let xml;
  try {
    xml = await readFile(reportPath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    xml = emptyReport;
  }

  const entry = [
    '  <VALIDATION>',
    `    <RESUTL>${escapeXml(result)}</RESUTL>`,
    `    <SCENARIO>${escapeXml(scenario)}</SCENARIO>`,
    `    <TIMELAPS>${escapeXml(`${elapsedMs} ms`)}</TIMELAPS>`,
    '  </VALIDATION>'
  ].join('\n');

  xml = xml.replace('</VALIDATION_RESULTS>', `${entry}\n</VALIDATION_RESULTS>`);
  await writeFile(reportPath, xml, 'utf8');
}

export async function resetValidationResults() {
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, emptyReport, 'utf8');
}
