import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the 14-day free trial work?",
    answer: "You get full access to all Professional plan features for 14 days. No credit card required. At the end of your trial, you can choose a plan that fits your needs or continue with our free Starter plan."
  },
  {
    question: "Can I change plans later?",
    answer: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges accordingly."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise customers. All payments are processed securely through our payment partners."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. All data is encrypted in transit and at rest using industry-standard SSL/TLS encryption. We're SOC 2 Type II certified and GDPR compliant."
  },
  {
    question: "Do I need technical skills to use the platform?",
    answer: "Not at all! Our platform is designed to be user-friendly. We offer comprehensive documentation, video tutorials, and 24/7 support to help you get started."
  },
  {
    question: "Can I integrate with my existing tools?",
    answer: "Yes! Professional and Enterprise plans include API access and support for popular integrations like Shopify, WooCommerce, Magento, and major payment gateways. Custom integrations available for Enterprise."
  },
  {
    question: "What kind of support do you offer?",
    answer: "Starter plans include email support with 48-hour response time. Professional plans get priority email and chat support with 24-hour response. Enterprise plans have dedicated support with 4-hour response time and phone support."
  },
  {
    question: "Is there a limit on the number of products?",
    answer: "Starter plans support up to 100 products. Professional plans support up to 1,000 products. Enterprise plans have unlimited products. Need more? Contact us for custom solutions."
  },
  {
    question: "How does the AI-powered analytics work?",
    answer: "Our AI analyzes your sales data, customer behavior, and market trends to provide actionable insights. It helps you predict demand, optimize pricing, identify trending products, and personalize customer experiences."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time with no cancellation fees. You'll continue to have access until the end of your billing period."
  }
];

export default function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left text-lg font-semibold hover:text-blue-600 dark:hover:text-blue-400">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
