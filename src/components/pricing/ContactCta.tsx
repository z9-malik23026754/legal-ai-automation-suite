
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ContactCta: React.FC = () => {
  return (
    <div className="mt-16 bg-card bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-lg py-12 px-6 text-center shadow-sm border">
      <h2 className="text-3xl font-bold mb-3">Need a custom solution?</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
        Contact our team for a tailored package that meets your specific requirements.
      </p>
      <Link to="/contact">
        <Button variant="outline" size="lg" className="font-medium">Contact Sales</Button>
      </Link>
    </div>
  );
};

export default ContactCta;
