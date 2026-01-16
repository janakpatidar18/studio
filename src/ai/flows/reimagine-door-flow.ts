'use server';
/**
 * @fileOverview A door reimagining AI flow.
 *
 * - reimagineDoor - A function that handles the door reimagining process.
 * - ReimagineDoorInput - The input type for the reimagineDoor function.
 * - ReimagineDoorOutput - The return type for the reimagineDoor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReimagineDoorInputSchema = z.object({
  doorImage: z
    .string()
    .describe(
      "A photo of a door, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  backgroundImage: z.string().describe(
      "A photo of a background, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ReimagineDoorInput = z.infer<typeof ReimagineDoorInputSchema>;

const ReimagineDoorOutputSchema = z.object({
    generatedImage: z.string().describe('The generated image as a data URI string.')
});
export type ReimagineDoorOutput = z.infer<typeof ReimagineDoorOutputSchema>;


const reimagineDoorFlow = ai.defineFlow(
  {
    name: 'reimagineDoorFlow',
    inputSchema: ReimagineDoorInputSchema,
    outputSchema: ReimagineDoorOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: [
            { media: { url: input.doorImage } },
            { media: { url: input.backgroundImage } },
            { text: `
                You are a master photorealistic image editor. Your task is to combine a door from the first input image with a background from the second input image. Create a new, hyper-realistic final image following these exact instructions:

                **Instructions:**

                1.  **Isolate the Door:** From the first image, perfectly isolate the carved door.

                2.  **Transform the Door:**
                    *   Change the door's material to **raw, unfinished teak wood**.
                    *   The finish must be **matte** with **clearly visible wood grains**.
                    *   Keep the original carving, design, and shape **identical**.
                    *   Correct any minor geometric misalignments, but preserve the door's authentic design.

                3.  **Add a Hand:**
                    *   Introduce a realistic adult **man's hand** holding the door from the side or top edge. The grip must look natural.
                    *   Show only the hand and a small part of the wrist.
                    *   The hand must have realistic skin texture and be clean, with no rings, watches, or accessories.

                4.  **Use the Provided Background:**
                    *   You **must** use the background from the second image. Do not change, alter, or generate a new background.
                    *   Seamlessly and realistically blend the door and hand into this background.

                5.  **Lighting and Shadows:**
                    *   The lighting on the door and hand must **perfectly match the lighting direction, temperature, and style** of the background image.
                    *   Generate soft, realistic shadows for the door and hand that are consistent with the background's light source, making them look grounded in the scene. The shadow opacity should be between 35% and 70%.

                6.  **Add Watermark:**
                    *   **Text:** "SVLSM"
                    *   **Style:** Add it as a flat, semi-transparent overlay (not engraved). The text must be **uppercase, bold**, and in a font like **Poppins**.
                    *   **Placement:** Position it at the **bottom center** of the door.
                    *   **Appearance:** Opacity must be between **35% and 55%**. The color should be white or a light warm tone, visible but not distracting.

                7.  **Final Image Specifications:**
                    *   **Render Style:** Hyper-realistic photograph.
                    *   **Camera:** Straight, front-on angle with the door centered. Simulate a 35mm-50mm lens.
                    *   **Quality:** 4K ultra-detailed.
                    *   **Aspect Ratio:** **1080x1920 (portrait)**.
                    *   **Tone:** The mood should be a clean, premium presentation of a handcrafted raw teak product.
            `},
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_NONE',
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_NONE',
                },
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_NONE',
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_NONE',
                },
            ],
        },
    });

    if (!media || !media.url) {
        throw new Error('Image generation failed.');
    }

    return {
        generatedImage: media.url,
    }
  }
);

export async function reimagineDoor(
  input: ReimagineDoorInput
): Promise<ReimagineDoorOutput> {
  return reimagineDoorFlow(input);
}
