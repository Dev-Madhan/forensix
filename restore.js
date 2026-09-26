const fs = require('fs');
const readline = require('readline');

async function restore() {
  const fileStream = fs.createReadStream('C:\\Users\\Madhan Kumar\\.gemini\\antigravity-ide\\brain\\67a0241f-7350-4eca-941a-478ecf603aa0\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('criminal-new-form.tsx') && line.includes('write_to_file')) {
      try {
        const data = JSON.parse(line);
        if (data.tool_calls) {
          for (const tc of data.tool_calls) {
            if (tc.name === 'write_to_file' && tc.args.TargetFile && tc.args.TargetFile.includes('criminal-new-form.tsx')) {
              fs.writeFileSync('src/components/criminals/criminal-new-form.tsx', tc.args.CodeContent, 'utf-8');
              console.log('Restored successfully!');
              return;
            }
          }
        }
      } catch (e) {
        // ignore parse error on partial match
      }
    }
  }
}

restore();
