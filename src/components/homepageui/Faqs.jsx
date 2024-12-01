import Image from 'next/image'
import { Container } from '@/components/common/Container'

const faqs = [
  [
    {
      question: 'How do I get matched with a tutor?',
      answer:
        'Our AI-powered matching system considers your learning style, academic goals, and schedule to pair you with the perfect tutor. You can also browse tutor profiles and choose one yourself.',
    },
    {
      question: 'What subjects do you offer tutoring in?',
      answer: 'We offer tutoring in a wide range of subjects including Mathematics, Sciences, Languages, Humanities, and Test Preparation (SAT, ACT, GRE, etc.).',
    },
    {
      question: 'How do the online sessions work?',
      answer:
        'Sessions take place in our virtual classroom equipped with video chat, interactive whiteboard, screen sharing, and document collaboration tools.',
    },
  ],
  [
    {
      question: 'What if I need to reschedule a session?',
      answer:
        'You can reschedule or cancel sessions up to 24 hours before the scheduled time without any penalty. Last-minute changes may incur a fee.',
    },
    {
      question: 'Are your tutors qualified?',
      answer:
        'All our tutors go through a rigorous vetting process including background checks, subject matter expertise verification, and teaching ability assessment.',
    },
    {
      question: 'Do you offer group sessions?',
      answer:
        'Yes, we offer both individual and group sessions. Group sessions are available at reduced rates and can be arranged for study groups or classmates.',
    },
  ],
  [
    {
      question: 'What is your refund policy?',
      answer:
        'If you\'re not satisfied with your first session, we offer a full refund. For ongoing subscriptions, you can cancel anytime and receive a prorated refund.',
    },
    {
      question: 'Can I switch tutors if needed?',
      answer:
        'Absolutely! If you feel your current tutor isn\'t the right fit, you can request a change at any time. We\'ll help you find a better match.',
    },
    {
      question: 'Do you offer any guarantees?',
      answer:
        'We guarantee improvement in your understanding and grades. If you don\'t see improvement after 10 sessions, we\'ll provide additional sessions at no cost.',
    },
  ],
]

export function Faqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
    >
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            Can't find what you're looking for? Reach out to our support team via chat or email, and we'll get back to you promptly.
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
        >
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-8">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="font-display text-lg leading-7 text-slate-900">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-sm text-slate-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}