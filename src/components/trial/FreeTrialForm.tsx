
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useStartFreeTrial } from "@/hooks/useStartFreeTrial";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";

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
  const { initiateStripeCheckout } = useStartFreeTrial();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      setIsSubmitting(true);
      
      // Generate a random password for the user
      const randomPassword = Math.random().toString(36).slice(-12);
      
      // Sign up the user first with metadata
      const { error } = await signUp(data.email, randomPassword, {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          company_name: data.companyName,
          is_trial_user: true
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account created successfully",
        description: "Redirecting to Stripe checkout...",
      });
      
      // Close the dialog
      onClose();
      
      // Important: Add a small delay to allow the authentication state to update
      setTimeout(async () => {
        try {
          // Start the Stripe checkout process
          await initiateStripeCheckout();
        } catch (checkoutError) {
          console.error("Error during checkout:", checkoutError);
          toast({
            title: "Checkout error",
            description: "There was a problem starting your free trial. Please try again.",
            variant: "destructive",
          });
        }
      }, 2000); // Increased delay to ensure auth state is fully updated
    } catch (error: any) {
      console.error("Error creating account:", error);
      
      // Handle specific error cases
      if (error.message?.includes("email already in use")) {
        toast({
          title: "Email already registered",
          description: "Please sign in with your existing account to start a free trial.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error creating account",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      }
      setIsSubmitting(false);
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
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Start Free Trial"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FreeTrialForm;
