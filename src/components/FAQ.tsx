import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  productName: string;
}

export const FAQ = ({ productName }: FAQProps) => {
  const getProductFAQs = () => {
    if (productName === "InkFusion") {
      return [
        {
          question: "What is InkFusion™?",
          answer: "InkFusion™ Vinyl is WPWRestylePro's proprietary ink formula delivering automotive paint-quality finishes on premium vinyl wrap material (375 sq ft roll on Avery SW900 cast vinyl with DOL1360 Max Gloss laminate).",
        },
        {
          question: "What makes InkFusion™ different from standard printed wraps?",
          answer: "AI-calibrated color matching on Avery SW900, proprietary verification, paint-like depth and consistency.",
        },
        {
          question: "Why does InkFusion™ look like automotive paint instead of vinyl?",
          answer: "Proprietary color calibration system optimizing ink density, metallic particle alignment, and gloss level.",
        },
        {
          question: "Can I order less than a full roll?",
          answer: "No. Sold in complete rolls (~24 yards, 375 sq ft) to maintain consistency.",
        },
        {
          question: "What finish options are available?",
          answer: "Gloss or Luster (same price). Matte available but not recommended.",
        },
        {
          question: "How long does InkFusion™ vinyl last?",
          answer: "7-9 years outdoor durability (vertical exposure) on Avery SW900.",
        },
        {
          question: "What's the turnaround time?",
          answer: "1-2 business days from order confirmation.",
        },
        {
          question: "Do you offer color matching for custom paint codes?",
          answer: "Yes, contact for custom calibration quote.",
        },
        {
          question: "Is InkFusion™ suitable for full vehicle wraps?",
          answer: "Absolutely. 375 sq ft per roll with excellent conformability.",
        },
        {
          question: "What's included with each roll?",
          answer: "~24 yards (375 sq ft) UV-printed SW900, DOL1360 overlaminate, calibration report, installation recommendations.",
        },
        {
          question: "Can I see a physical sample?",
          answer: "Yes, samples available separately.",
        },
        {
          question: "How does InkFusion™ compare to actual automotive paint?",
          answer: "Visually indistinguishable with same depth and gloss, but reversible and lower cost.",
        },
      ];
    }
    
    // Default FAQs for other products
    return [
      {
        question: `How does ${productName} work?`,
        answer: `${productName} uses advanced visualization technology to help you preview and design car wraps before installation.`,
      },
      {
        question: "What vehicles are supported?",
        answer: "We support thousands of vehicle makes and models with regular updates to our database.",
      },
      {
        question: "Can I share designs with clients?",
        answer: "Yes! All our tools include client sharing features for easy collaboration and approval.",
      },
      {
        question: "Is there a free trial?",
        answer: "Yes! We offer a 7-day free trial with full access to all features. Just add your card to start - cancel anytime before the trial ends.",
      },
    ];
  };

  const faqs = getProductFAQs();

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Frequently Asked Questions
        </h2>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card border border-border rounded-lg px-6"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};