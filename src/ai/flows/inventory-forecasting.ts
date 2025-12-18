'use server';

/**
 * @fileOverview This file defines a Genkit flow for inventory forecasting.
 *
 * - `forecastInventory` - An asynchronous function that takes historical sales data and predicts future demand.
 * - `InventoryForecastingInput` - The input type for the `forecastInventory` function.
 * - `InventoryForecastingOutput` - The output type for the `forecastInventory` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InventoryForecastingInputSchema = z.object({
  historicalSalesData: z
    .string()
    .describe(
      'Historical sales data in a format that can be parsed (e.g., CSV or JSON stringified).  Include date, product SKU, and quantity sold.'
    ),
  seasonalTrends: z
    .string()
    .optional()
    .describe(
      'Optional description of any seasonal trends affecting sales, such as increased demand during holidays.'
    ),
});
export type InventoryForecastingInput = z.infer<typeof InventoryForecastingInputSchema>;

const InventoryForecastingOutputSchema = z.object({
  predictedDemand: z
    .string()
    .describe(
      'Predicted future demand for each product, including suggested reorder quantities and dates.'
    ),
  analysisSummary: z
    .string()
    .describe('A summary of the analysis performed to generate the forecast.'),
});
export type InventoryForecastingOutput = z.infer<typeof InventoryForecastingOutputSchema>;

export async function forecastInventory(input: InventoryForecastingInput): Promise<InventoryForecastingOutput> {
  return forecastInventoryFlow(input);
}

const forecastInventoryPrompt = ai.definePrompt({
  name: 'forecastInventoryPrompt',
  input: {schema: InventoryForecastingInputSchema},
  output: {schema: InventoryForecastingOutputSchema},
  prompt: `You are an AI assistant that helps inventory managers forecast future demand.

  Analyze the provided historical sales data, taking into account any specified seasonal trends, and predict future demand for each product.

  Provide a suggested reorder quantity and date for each product.

  Historical Sales Data: {{{historicalSalesData}}}
  Seasonal Trends: {{{seasonalTrends}}}

  Include an analysis summary explaining how you arrived at the predicted demand.
  `,
});

const forecastInventoryFlow = ai.defineFlow(
  {
    name: 'forecastInventoryFlow',
    inputSchema: InventoryForecastingInputSchema,
    outputSchema: InventoryForecastingOutputSchema,
  },
  async input => {
    const {output} = await forecastInventoryPrompt(input);
    return output!;
  }
);
