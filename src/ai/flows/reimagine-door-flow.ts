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
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            { media: { url: input.doorImage } },
            { media: { url: input.backgroundImage } },
            { text: `
                You are a creative assistant that transforms images. Your task is to integrate the subject from the first image (a door) into the second image (a background).

                Follow these detailed instructions:

                1.  **Subject (Door):**
                    *   Identify the carved door in the first image.
                    *   Convert its material to a **raw, unfinished teak wood door** with a **matte finish** and **visible grains**.
                    *   **Preserve the original design, carving, and shape perfectly.**
                    *   Correct any misaligned or imbalanced areas in the door's geometry while maintaining its authentic design.

                2.  **Hand Interaction:**
                    *   Introduce a realistic adult **man's hand** holding the door naturally from the side or top edge.
                    *   The hand should have a natural grip and realistic skin texture. Only the hand and a small part of the wrist should be visible. No accessories on the hand.

                3.  **Background Integration:**
                    *   Use the **exact background provided in the second image**. Do not alter or replace it.
                    *   Blend the door and the hand seamlessly into this background.

                4.  **Watermark:**
                    *   Overlay a semi-transparent watermark with the text "SVLSM".
                    *   **Placement:** Bottom center of the door surface.
                    *   **Style:** Uppercase, bold, using a font similar to Poppins. The opacity should be between 35% and 55%. The color should be white or a light warm tone that is visible but not distracting. This should be a flat overlay, not look engraved.

                5.  **Lighting and Shadows:**
                    *   The lighting on the door and hand must **match the lighting direction, style, and temperature of the provided background image.**
                    *   Generate realistic, soft shadows for both the door and the hand that are consistent with the background's light source. The door should look physically grounded.

                6.  **Final Composition:**
                    *   **Render Style:** Hyper-realistic photograph.
                    *   **Camera:** Maintain a straight, front-on angle.
                    *   **Quality:** 4K ultra-detailed.
                    *   **Aspect Ratio:** 1080x1920 (portrait).
                    *   Ensure the final output is a clean, premium, and realistic presentation.
            `},
        ],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
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
