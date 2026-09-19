import { toPng, toBlob } from 'html-to-image';

export async function getCardBlob(element: HTMLElement): Promise<Blob> {
  const blob = await toBlob(element, {
    quality: 0.95,
    pixelRatio: 2,
    cacheBust: true,
    skipFonts: true,
  });
  if (!blob) throw new Error('Failed to generate image blob');
  return blob;
}

export async function exportStoryCard(element: HTMLElement, filename: string): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      quality: 0.95,
      pixelRatio: 2, // Crisp high-res rendering
      cacheBust: true,
      skipFonts: true,
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export story card:', error);
    throw new Error('Failed to generate image. Please try again.');
  }
}

export async function copyCardToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const blob = await getCardBlob(element);
    if (!navigator.clipboard || !window.ClipboardItem) {
      return false;
    }
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    return true;
  } catch (error) {
    console.error('Failed to copy card to clipboard:', error);
    return false;
  }
}

export async function shareStoryCard(element: HTMLElement, title: string): Promise<boolean> {
  try {
    const blob = await getCardBlob(element);
    const file = new File([blob], `${title.toLowerCase().replace(/\s+/g, '-')}.png`, {
      type: 'image/png',
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text: 'Check out our WhatsApp Chat Wrapped & Dossier!',
        files: [file],
      });
      return true;
    }
    return false;
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      return false;
    }
    console.warn('Native share failed:', error);
    return false;
  }
}
