
import React from "react";

const FaqSection: React.FC = () => {
  return (
    <div className="mt-24 text-center">
      <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
      <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
        <div className="bg-card shadow-sm rounded-lg p-6 text-left border">
          <h3 className="text-lg font-semibold mb-3">Can I switch plans later?</h3>
          <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
        </div>
        <div className="bg-card shadow-sm rounded-lg p-6 text-left border">
          <h3 className="text-lg font-semibold mb-3">Is there a free trial?</h3>
          <p className="text-muted-foreground">We offer a 14-day free trial for all plans. No credit card required to start your trial.</p>
        </div>
        <div className="bg-card shadow-sm rounded-lg p-6 text-left border">
          <h3 className="text-lg font-semibold mb-3">How does billing work?</h3>
          <p className="text-muted-foreground">We use Stripe for secure payments. You'll be billed either monthly or annually, depending on your chosen plan.</p>
        </div>
        <div className="bg-card shadow-sm rounded-lg p-6 text-left border">
          <h3 className="text-lg font-semibold mb-3">What kind of support is included?</h3>
          <p className="text-muted-foreground">All plans include standard email support. The All-in-One Suite includes priority support with faster response times.</p>
        </div>
      </div>
    </div>
  );
};

export default FaqSection;
