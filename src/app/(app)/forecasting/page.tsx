'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { forecastInventory, type InventoryForecastingOutput } from '@/ai/flows/inventory-forecasting';
import { Skeleton } from '@/components/ui/skeleton';

const FormSchema = z.object({
  historicalSalesData: z.string().min(10, {
    message: 'Please provide some historical sales data.',
  }),
  seasonalTrends: z.string().optional(),
});

const exampleData = `Date,Product SKU,Quantity Sold
2023-01-05,WM-1023,10
2023-01-12,WM-1023,12
2023-01-19,WM-1023,15
2023-02-03,EK-4590,5
2023-02-10,EK-4590,7
2023-12-15,WM-1023,50
2023-12-20,EK-4590,25`;

export default function ForecastingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InventoryForecastingOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      historicalSalesData: '',
      seasonalTrends: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const forecastResult = await forecastInventory(data);
      setResult(forecastResult);
    } catch (error) {
      console.error('Forecasting error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate forecast. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Inventory Forecasting"
        description="Predict future demand to optimize your stock levels."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Forecasting Input</CardTitle>
            <CardDescription>
              Provide historical sales data to generate a forecast.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="historicalSalesData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Historical Sales Data (CSV format)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={exampleData}
                          className="min-h-[200px] font-mono text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seasonalTrends"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seasonal Trends (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 50% sales increase in December"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="mr-2 h-4 w-4" />
                  )}
                  Generate Forecast
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forecast Results</CardTitle>
            <CardDescription>
              AI-powered predictions and analysis will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-20 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            ) : result ? (
              <>
                <div className="space-y-2">
                  <h3 className="font-semibold">Predicted Demand</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {result.predictedDemand}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Analysis Summary</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {result.analysisSummary}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-center">
                <Bot className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Your forecast results will be displayed here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
