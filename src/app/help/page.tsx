import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';

const faqs = [
    {
        category: 'General',
        question: 'Is EduSlide really free to use?',
        answer: 'Yes, EduSlide is completely free. We are committed to providing essential study tools to students without any cost.'
    },
    {
        category: 'General',
        question: 'Do I need to create an account or sign up?',
        answer: 'No, you do not need to sign up. You can start using EduSlide immediately by uploading your PDF.'
    },
    {
        category: 'Privacy',
        question: 'Are my uploaded files safe and private?',
        answer: 'Yes. Your files are processed securely in your browser. They are not uploaded to our servers and are deleted from memory after your session ends.'
    },
    {
        category: 'PDF Processing',
        question: 'What is N-Up layout?',
        answer: 'N-Up layout allows you to print multiple pages of a document on a single sheet of paper. For example, a 2x2 layout prints 4 pages on one sheet.'
    },
    {
        category: 'Technical',
        question: 'What file formats are supported?',
        answer: 'Currently, we only support PDF (.pdf) files. We plan to add support for more formats in the future.'
    },
    {
        category: 'Troubleshooting',
        question: 'Why is the generated PDF not downloading?',
        answer: 'Please ensure your browser does not have pop-up blockers enabled for this site. If the issue persists, try clearing your browser cache or using a different browser.'
    },
];

export default function HelpPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto max-w-4xl py-12 px-4 md:py-20">
          <div className="space-y-8">
              <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Help Center</h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                  Find answers to common questions about EduSlide.
              </p>
              </div>

              <Card className="glassmorphic">
                  <CardContent className="p-6">
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input type="search" placeholder="Search for answers..." className="pl-10" />
                      </div>
                  </CardContent>
              </Card>
              
              <Card className="glassmorphic">
                  <CardHeader>
                      <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                      {faqs.map((faq, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent>
                              <p className="text-muted-foreground">{faq.answer}</p>
                          </AccordionContent>
                          </AccordionItem>
                      ))}
                      </Accordion>
                  </CardContent>
              </Card>

              <Card className="glassmorphic">
                  <CardContent className="p-8 text-center">
                      <h3 className="text-xl font-semibold">Can't find your answer?</h3>
                      <p className="mt-2 text-muted-foreground">Our community and team are here to help.</p>
                      <Button className="mt-4" size="lg" asChild>
                      <a href="mailto:EduSlideAi.in@gmail.com">Contact Support</a>
                      </Button>
                  </CardContent>
              </Card>

          </div>
      </div>
    </>
  );
}
