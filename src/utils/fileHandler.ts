import { unzipSync } from 'fflate';

export async function extractChatTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.zip')) {
    const arrayBuffer = await file.arrayBuffer();
    const unzipped = unzipSync(new Uint8Array(arrayBuffer));

    // Look for _chat.txt or any .txt file in the archive
    let chatFileKey = Object.keys(unzipped).find(name => name.toLowerCase().endsWith('_chat.txt'));
    if (!chatFileKey) {
      chatFileKey = Object.keys(unzipped).find(name => name.toLowerCase().endsWith('.txt'));
    }

    if (!chatFileKey) {
      throw new Error('No .txt chat file found inside the WhatsApp .zip export.');
    }

    const decoder = new TextDecoder('utf-8');
    return decoder.decode(unzipped[chatFileKey]);
  }

  if (fileName.endsWith('.txt')) {
    return await file.text();
  }

  throw new Error('Unsupported file format. Please drop a WhatsApp exported .txt or .zip file.');
}
