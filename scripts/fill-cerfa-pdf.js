#!/usr/bin/env node
// Script standalone (hors Next.js/Turbopack) — appellé via child_process.execFile
// Usage : node fill-cerfa-pdf.js '{"answers":[false,true,...]}'
// Sortie : PDF rempli encodé en base64 sur stdout

const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function main() {
  const args = JSON.parse(process.argv[2]);
  const { answers, flatten = false } = args;

  if (!Array.isArray(answers) || answers.length !== 9) {
    process.stderr.write('answers invalides\n');
    process.exit(1);
  }

  const pdfPath = path.join(__dirname, '..', 'public', 'documents', 'cerfa_qs_sport.pdf');
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdf = await PDFDocument.load(pdfBytes);
  const form = pdf.getForm();

  for (let i = 0; i < 9; i++) {
    const isOui = answers[i] === true;
    try {
      const ouiField = form.getCheckBox(`CheckBoxFormField ${2 + i * 2}`);
      const nonField = form.getCheckBox(`CheckBoxFormField ${2 + i * 2 + 1}`);
      if (isOui) { ouiField.check(); nonField.uncheck(); }
      else       { ouiField.uncheck(); nonField.check(); }
      // Rendre en lecture seule (pas de flatten : les cases cochées restent visibles)
      ouiField.enableReadOnly();
      nonField.enableReadOnly();
    } catch {
      // champ introuvable — ignorer
    }
  }
  const filledBytes = await pdf.save();
  process.stdout.write(Buffer.from(filledBytes).toString('base64'));
}

main().catch(e => {
  process.stderr.write(e.message + '\n');
  process.exit(1);
});
