import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { TikTokAccount } from "@/types";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const formSchema = z.object({
  profileUrl: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (url) => url.includes("tiktok.com/"),
      "Please enter a valid TikTok profile URL"
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface TikTokFormProps {
  onAccountAdded?: (account: TikTokAccount) => void;
}

export function TikTokForm({ onAccountAdded }: TikTokFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileUrl: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/tiktok/accounts", data);
      const account = await res.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/tiktok/accounts"] });
      
      toast({
        title: "Success",
        description: `TikTok account @${account.username} has been added`,
      });
      
      form.reset();
      
      if (onAccountAdded) {
        onAccountAdded(account);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add TikTok account",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white shadow-card rounded-lg mb-8 overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-text-primary">Connect your TikTok account</CardTitle>
        <CardDescription className="text-sm text-text-secondary">
          Enter your TikTok profile link to analyze your account performance
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <FormField
                control={form.control}
                name="profileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        </div>
                        <Input
                          placeholder="https://www.tiktok.com/@username"
                          className="pl-10 py-3"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Button 
                type="submit" 
                className="w-full sm:w-auto inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Analyzing..." : "Analyze Account"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
