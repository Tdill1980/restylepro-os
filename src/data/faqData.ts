export type FAQCategory = 'general' | 'tools' | 'pricing' | 'technical' | 'business';

export interface FAQItem {
  question: string;
  answer: string;
  category: FAQCategory;
}

export const faqCategories: { id: FAQCategory; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Overview & basics' },
  { id: 'tools', label: 'Tools', description: 'Visualizer tools' },
  { id: 'pricing', label: 'Pricing & Plans', description: 'Subscriptions & billing' },
  { id: 'technical', label: 'Technical', description: 'Features & formats' },
  { id: 'business', label: 'Business', description: 'Client & shop tools' },
];

export const faqData: FAQItem[] = [
  // GENERAL - 10 questions
  {
    question: "What is RestylePro Visualizer Suite™?",
    answer: "RestylePro Visualizer Suite™ is a professional vehicle wrap visualization platform that helps wrap shops, designers, and installers show clients photorealistic previews of any vinyl wrap on any vehicle. It's built specifically for the automotive restyling industry.",
    category: 'general',
  },
  {
    question: "Who is RestylePro built for?",
    answer: "RestylePro is designed for wrap shops, PPF installers, tint shops, car dealerships, automotive designers, fleet managers, and car enthusiasts who want to visualize vehicle modifications before committing to installation.",
    category: 'general',
  },
  {
    question: "What tools are included in the suite?",
    answer: "The suite includes 6 professional tools: ColorPro™ for solid color wraps, DesignPanelPro™ for custom panel designs, FadeWraps™ for gradient effects, PatternPro™ for pattern applications, ApprovePro™ for client approvals, and MaterialMode™ for material comparisons.",
    category: 'general',
  },
  {
    question: "How accurate are the visualizations?",
    answer: "Our visualizations are designed to represent real-world vinyl materials as accurately as possible. We work directly with manufacturer color data to ensure what you see on screen closely matches physical materials from brands like 3M, Avery Dennison, KPMF, and Inozetek.",
    category: 'general',
  },
  {
    question: "What vehicles are supported?",
    answer: "RestylePro supports a wide range of popular vehicles including cars, trucks, SUVs, and specialty vehicles. Our library is continuously expanding with new makes and models added regularly based on user demand.",
    category: 'general',
  },
  {
    question: "How fast are renders generated?",
    answer: "Most renders are generated in seconds, allowing you to show clients multiple options quickly during consultations. Complex designs or high-resolution outputs may take slightly longer.",
    category: 'general',
  },
  {
    question: "What's included with every render?",
    answer: "Every render includes 6 professional views (front, rear, side, 3/4 angles), downloadable high-resolution images, and shareable links. Pro plans also include approval proof sheets and film documentation.",
    category: 'general',
  },
  {
    question: "Do renders include watermarks?",
    answer: "Free tier renders may include subtle watermarks. Paid plans provide watermark-free renders suitable for client presentations and marketing materials.",
    category: 'general',
  },
  {
    question: "Is there a mobile app?",
    answer: "RestylePro is a web-based platform that works on any device with a modern browser. This means you can access all tools from your phone, tablet, or computer without downloading anything.",
    category: 'general',
  },
  {
    question: "Can I use RestylePro offline?",
    answer: "RestylePro requires an internet connection to generate renders and access the color library. However, you can save and download your renders for offline viewing and sharing.",
    category: 'general',
  },

  // TOOLS - 8 questions
  {
    question: "What is ColorPro™?",
    answer: "ColorPro™ is our flagship solid color visualization tool. It lets you apply any vinyl wrap color to a vehicle and see photorealistic results instantly. Features include manufacturer color matching, finish selection (gloss, matte, satin), and multi-angle previews.",
    category: 'tools',
  },
  {
    question: "What is DesignPanelPro™?",
    answer: "DesignPanelPro™ allows you to create custom panel designs and accent wraps. Apply different colors or finishes to specific vehicle panels like roofs, hoods, mirrors, and spoilers to create unique two-tone or multi-color designs.",
    category: 'tools',
  },
  {
    question: "What is FadeWraps™?",
    answer: "FadeWraps™ is our gradient and fade effect tool. Create stunning color transitions, racing stripes, and custom fade patterns that flow seamlessly across vehicle surfaces. Perfect for creating eye-catching custom designs.",
    category: 'tools',
  },
  {
    question: "What is PatternPro™?",
    answer: "PatternPro™ (also known as WBTY - Wrap Before They're Yours) lets you apply patterns like carbon fiber, brushed metal, camo, and custom graphics to vehicles. Preview how textured and patterned wraps will look before ordering materials.",
    category: 'tools',
  },
  {
    question: "What is ApprovePro™?",
    answer: "ApprovePro™ is our client approval and presentation tool. Generate professional proof sheets, create before/after comparisons, and send approval requests to clients. Streamlines the approval process and reduces miscommunication.",
    category: 'tools',
  },
  {
    question: "What is MaterialMode™?",
    answer: "MaterialMode™ helps you compare different materials and finishes side-by-side. See how the same color looks in gloss vs matte vs satin, or compare options from different manufacturers to find the perfect match for your client.",
    category: 'tools',
  },
  {
    question: "Can I switch between tools easily?",
    answer: "Yes! All tools are integrated into a seamless workflow. You can start with ColorPro™ to pick a base color, then jump to DesignPanelPro™ for accents, and finish with ApprovePro™ for client presentation—all without losing your work.",
    category: 'tools',
  },
  {
    question: "Do all tools use the same color library?",
    answer: "Yes, our comprehensive color library is shared across all tools. This ensures consistency whether you're doing solid wraps, accents, fades, or patterns. The library includes colors from major manufacturers worldwide.",
    category: 'tools',
  },

  // PRICING - 9 questions
  {
    question: "How much does RestylePro cost?",
    answer: "RestylePro offers flexible pricing tiers: Restyle Starter for individual users, Restyle Professional for active shops, and Pro Shop for high-volume businesses. Visit our pricing page for current rates and features included in each plan.",
    category: 'pricing',
  },
  {
    question: "What's included in the Restyle Starter plan?",
    answer: "Restyle Starter includes access to core visualization tools, a monthly render allowance, standard resolution outputs, and email support. It's perfect for getting started or occasional use.",
    category: 'pricing',
  },
  {
    question: "What's included in the Restyle Professional plan?",
    answer: "Restyle Professional includes higher render limits, all visualization tools, high-resolution outputs, priority support, approval proof sheets, and shop branding options. Ideal for active wrap shops.",
    category: 'pricing',
  },
  {
    question: "What's included in the Pro Shop plan?",
    answer: "Pro Shop is our premium tier with unlimited renders, all tools and features, team access, white-label options, dedicated support, and advanced business tools. Built for high-volume professional operations.",
    category: 'pricing',
  },
  {
    question: "Do I get free renders to try?",
    answer: "Yes! New users receive complimentary renders to explore the platform and see the quality firsthand. This lets you experience RestylePro before committing to a paid plan.",
    category: 'pricing',
  },
  {
    question: "What happens after I use my free renders?",
    answer: "After using your free renders, you can upgrade to any paid plan to continue creating visualizations. Your saved designs and account data are preserved when you upgrade.",
    category: 'pricing',
  },
  {
    question: "Can I buy additional renders?",
    answer: "Yes, all plans include the option to purchase additional render packs if you exceed your monthly allowance. Extra renders never expire and can be used anytime.",
    category: 'pricing',
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Absolutely! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the start of your next billing cycle. No long-term contracts required.",
    category: 'pricing',
  },
  {
    question: "Is there a contract or commitment?",
    answer: "No long-term contracts. All plans are month-to-month with the flexibility to cancel anytime. We also offer annual plans at a discounted rate for those who prefer to pay yearly.",
    category: 'pricing',
  },

  // TECHNICAL - 8 questions
  {
    question: "What is InkFusion™?",
    answer: "InkFusion™ is our exclusive color-matching system that ensures the colors you see on screen accurately represent real-world vinyl materials. It incorporates manufacturer specifications to deliver true-to-life color accuracy.",
    category: 'technical',
  },
  {
    question: "What vinyl brands are supported?",
    answer: "RestylePro includes colors from leading manufacturers including 3M, Avery Dennison, KPMF, Inozetek, Hexis, Oracal, TeckWrap, and more. Our library is continuously updated with new releases.",
    category: 'technical',
  },
  {
    question: "What are LAB color values and why do they matter?",
    answer: "LAB color values are a device-independent color space that describes colors as humans perceive them. We use LAB values to ensure accurate color representation across different screens and devices.",
    category: 'technical',
  },
  {
    question: "Can I upload my own swatches or patterns?",
    answer: "Pro and Pro Shop plans include the ability to upload custom swatches, patterns, and graphics. This is perfect for shops that work with specialty materials or want to preview custom printed wraps.",
    category: 'technical',
  },
  {
    question: "What image formats are supported for downloads?",
    answer: "Renders can be downloaded in high-resolution PNG and JPEG formats. Pro plans also include PDF export for proof sheets and presentation materials.",
    category: 'technical',
  },
  {
    question: "How do I download my renders?",
    answer: "After generating a render, click the download button to save high-resolution images to your device. You can also share renders via link or email directly from the platform.",
    category: 'technical',
  },
  {
    question: "What browsers are supported?",
    answer: "RestylePro works best on modern browsers including Chrome, Firefox, Safari, and Edge. For optimal performance, we recommend keeping your browser updated to the latest version.",
    category: 'technical',
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take data security seriously. All data is encrypted in transit and at rest. Your designs and client information are private and never shared with third parties.",
    category: 'technical',
  },

  // BUSINESS - 7 questions
  {
    question: "Can I use renders for client presentations?",
    answer: "Absolutely! RestylePro renders are designed for professional client presentations. Paid plans include high-resolution, watermark-free images perfect for showing clients exactly what their vehicle will look like.",
    category: 'business',
  },
  {
    question: "What is the Approval Proof Sheet?",
    answer: "The Approval Proof Sheet is a professional document that includes all vehicle views, color/material specifications, and a signature area for client approval. It helps prevent misunderstandings and protects both you and your client.",
    category: 'business',
  },
  {
    question: "Can I add my logo and branding to renders?",
    answer: "Pro and Pro Shop plans include shop branding options. Add your logo to renders and proof sheets to maintain a professional, branded experience for your clients.",
    category: 'business',
  },
  {
    question: "Can I export renders as PDFs?",
    answer: "Yes, Pro plans include PDF export functionality for proof sheets, quotes, and presentation materials. Generate professional documents ready for client review and approval.",
    category: 'business',
  },
  {
    question: "Do you offer team or enterprise plans?",
    answer: "Yes! Our Pro Shop plan includes team features with multiple user seats. For larger organizations or custom enterprise needs, contact our sales team for tailored solutions.",
    category: 'business',
  },
  {
    question: "Can I share designs with clients remotely?",
    answer: "Yes, every render includes a shareable link that clients can view on any device. This is perfect for remote consultations, follow-ups, and getting approvals from clients who can't visit your shop.",
    category: 'business',
  },
  {
    question: "How can RestylePro help me close more sales?",
    answer: "By showing clients exactly what their vehicle will look like before ordering materials, RestylePro builds confidence, reduces hesitation, and helps close sales faster. Clients are more likely to commit when they can visualize the end result.",
    category: 'business',
  },
];
