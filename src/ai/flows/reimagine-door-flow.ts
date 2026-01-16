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
                You are an expert photorealistic image editor. Your task is to combine a door from a primary image with a background from a secondary image, following these exact specifications to create a hyper-realistic final image.

                **Primary Subject: The Door**
                1.  **Isolate:** Isolate the carved door from the first image.
                2.  **Material Transformation:** Convert the door's material to **raw, unfinished teak wood**. It must have a **matte finish** with clearly **visible wood grains**.
                3.  **Preserve Design:** The original design, carving, and shape of the door must be kept **identical**.
                4.  **Correction:** Correct any misaligned or imbalanced geometric areas in the door, but preserve its authentic design.

                **Secondary Subject: Hand Interaction**
                1.  **Introduction:** Add a realistic adult **man's hand** holding the door. The grip should look natural, holding it from the side or top edge.
                2.  **Appearance:** Only the hand and a small part of the wrist should be visible. The hand must have realistic skin texture and be clean, with no accessories (rings, watches, etc.).

                **Background and Integration**
                1.  **Use Provided Background:** You **must** use the exact background provided in the second image. Do not alter, replace, or generate a new one.
                2.  **Seamless Blend:** The door and hand must be seamlessly and realistically integrated into the provided background.

                **Lighting and Shadows (Crucial for Realism)**
                1.  **Adaptive Lighting:** The lighting on the door and hand must **perfectly match the lighting direction, temperature, and style** of the background image.
                2.  **Realistic Shadows:** Generate soft, realistic shadows for both the door and the hand that are consistent with the background's light source. The shadows must make the door look physically grounded in the scene. The shadow opacity should be between 35% and 70% depending on the lighting strength.

                **Mandatory Watermark**
                1.  **Text:** "SVLSM"
                2.  **Style:** Add it as a flat, semi-transparent overlay (not engraved). The text should be **uppercase, bold**, and in a font similar to **Poppins**.
                3.  **Placement:** Position it at the **bottom center** of the door's surface.
                4.  **Appearance:** Opacity must be between **35% and 55%**. The color should be white or a light warm tone that is visible but not distracting.

                **Final Output Specifications**
                1.  **Render Style:** Hyper-realistic photograph.
                2.  **Camera & Framing:** Use a straight, front-on camera angle. The door should be centered. The final image should look like it was taken with a 35mm-50mm lens.
                3.  **Quality:** 4K ultra-detailed.
                4.  **Aspect Ratio:** **1080x1920 (portrait)**.
                5.  **Tone:** The overall mood should be that of a clean, premium, handcrafted raw teak product presentation.
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
