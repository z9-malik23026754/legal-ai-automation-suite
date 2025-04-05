
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useStartFreeTrial } from "@/hooks/useStartFreeTrial";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

// Form validation schema
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  companyName: z.string().min(2, "Company name must be at least 2 characters."),
});

type FormValues = z.infer<typeof formSchema>;

interface FreeTrialFormProps {
  onClose: () => void;
}

const FreeTrialForm: React.FC<FreeTrialFormProps> = ({ onClose }) => {
  const { startTrial, isProcessing } = useStartFreeTrial();
  const { signUp } = useAuth();
  const { toast } = useToast();
  
  // Default form values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      companyName: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Generate a random password for the user
      const randomPassword = Math.random().toString(36).slice(-12);
      
      // Sign up the user first
      await signUp(data.email, randomPassword, {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          company_name: data.companyName,
          is_trial_user: true
        }
      });
      
      toast({
        title: "Account created successfully",
        description: "Starting your free trial...",
      });
      
      // Close the dialog
      onClose();
      
      // Important: Add a small delay to allow the authentication state to update
      setTimeout(() => {
        // Start the free trial process
        startTrial();
      }, 1000);
    } catch (error) {
      console.error("Error creating account:", error);
      toast({
        title: "Error creating account",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Start Free Trial"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FreeTrialForm;
