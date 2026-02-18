"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "@/components/ui";

const faqs = [
  {
    question: "Is NoteNest completely free?",
    answer: "Yes! NoteNest is open-source and free to self-host. We also offer a managed cloud version for teams who don't want to manage their own infrastructure."
  },
  {
    question: "Can I import from Notion/Obsidian?",
    answer: "Currently we support Markdown import. Direct Notion and Obsidian importers are on our roadmap for Q3 2024."
  },
  {
    question: "How does the real-time collaboration work?",
    answer: "We use a CRDT (Conflict-free Replicated Data Type) based engine (Yjs) to ensure that all changes are merged instantly without conflicts, even if you go offline."
  },
  {
    question: "Is my data encrypted?",
    answer: "Yes. All data is encrypted at rest and in transit. For the self-hosted version, you have full control over your encryption keys."
  },
  {
    question: "Do you offer an API?",
    answer: "Absolutely. NoteNest is API-first. Anything you can do in the UI, you can do via our REST API."
  }
];

const FAQ = () => {
  return (
    <Section
      spacing="large"
      background="bg-white"
      className="mt-[5vh]"
    >
      {/* Grid: gap 100px */}
      <div
        className="grid lg:grid-cols-12 items-start gap-16 lg:gap-[100px]"
      >
        {/* Header — leftX: 20, leftY: 20, leftScale: 1.12 */}
        <div className="lg:col-span-4 md:transform-gpu lg:translate-x-[20px] lg:translate-y-[20px] lg:scale-[1.12] origin-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="sticky top-32"
            >
              {/* Badge — badgeX: 20, badgeY: 0 */}
              <div
                className="inline-block px-4 py-1.5 rounded-full border border-black/10 bg-brand-beige/50 text-sm font-bold uppercase tracking-wider mb-6 lg:translate-x-[20px]"
              >
                Support
              </div>
              {/* Heading — headingX: 20, headingY: 0 */}
              <h2
                className="text-4xl md:text-5xl font-serif font-black text-brand-dark mb-6 lg:translate-x-[20px]"
              >
                Frequently Asked Questions
              </h2>
              {/* Subtitle — subtitleX: 20, subtitleY: 0 */}
              <p
                className="text-brand-dark/60 text-lg font-medium mb-8 lg:translate-x-[20px]"
              >
                Can't find the answer you're looking for? Join our <a href="#" className="text-brand-dark underline decoration-2 underline-offset-4 hover:opacity-70 transition-opacity">Discord community</a>.
              </p>
            </motion.div>
          </div>
        </div>

        {/* List — rightX: 17 */}
        <div className="lg:col-span-8 md:transform-gpu lg:translate-x-[17px]">
          <div>
            {/* FAQ Card — faqCardPadding: 48 */}
            <div
              className="bg-[#F9F9F9] rounded-3xl border border-black/5 p-8 lg:p-[48px]"
            >
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border border-black/5 bg-white rounded-2xl px-6 data-[state=open]:pb-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <AccordionTrigger className="text-lg font-bold text-brand-dark hover:no-underline hover:text-brand-accent py-6 text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-brand-dark/70 leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default FAQ;
