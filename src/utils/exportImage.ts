import { toPng } from 'html-to-image';

export async function exportStoryCard(element: HTMLElement, filename: string): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      quality: 0.95,
      pixelRatio: 2, // Crisp high-res rendering
      cacheBust: true,
      backgroundColor: '#080c14',
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
