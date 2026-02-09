import { useState } from "react";
import type { ReactNode } from "react";
import "./FAQs.css";

type FaqItem = {
  question: string;
  answers: ReactNode[];
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is The Dumbphone I?",
    answers: [
      "A ready-2-use flip phone that comes with a SIM, phone number, and phone plan.",
      "Our DumbOS and Dumb Down app connect ur Dumbphone 2 ur smartphone. Easily sync txts, calls, and contacts. No need 2 swap around SIM cards.",
      "The Dumbphone I can replace ur smartphone or work alongside it. Go fully offline or go hybrid. U choose!",
    ],
  },
  {
    question: "How should I use it?",
    answers: [
      "100% dumb: ur only phone, totally distraction and interruption-free",
      "Companion device: don't feel like going full dumb? No worries. The Dumbphone I can also be used as a complement 2 ur existing smartphone, 4 when u need a quieter pocket, less distractions, more IRL vibes. Perfect 4 date nights, deeper connections with family and friends.. and urself!",
    ],
  },
  {
    question: "How is the battery life?",
    answers: [
      "Without a big screen or data-hungry apps, the dumbphone can last for several days or even a week or more on a single charge. No more charging ur phone every night.",
    ],
  },
  {
    question: "Do I own the phone?",
    answers: ["Yep- it's all urs 2 keep!"],
  },
  {
    question: "Does it have data?",
    answers: [
      "Unlimited calling & texting, 100 hours of emergency data",
      "Data resets at each billing period renewal.",
    ],
  },
  {
    question: "What if I run out of the 100 hrs of data?",
    answers: [],
  },
  {
    question: "Help, I'm a victim of 2-factor authentication!!",
    answers: [],
  },
  {
    question: "What are The Dumbphone I subscription terms?",
    answers: [
      "The Dumbphone I includes a 3-month minimum commitment.",
      "After the first 3 months, it auto-renews monthly.",
      "Month-to-month, no long-term contracts.",
    ],
  },
  {
    question: "Can I cancel my subscription?",
    answers: [
      "Yes -- after the 3-month minimum, u can cancel anytime by calling 404-716-3605 (our Dumb Line). U will always get a real-life pro-dummy on the other end.",
      "Ur service will continue until the end of ur paid billing period. Please note, the phone number will be lost once cancelled.",
    ],
  },
  {
    question: "Can I cancel my order?",
    answers: [
      "Yes -- as long as the physical phone has not shipped yet, u will receive a 100% refund. Once the phone has shipped, orders cannot be canceled or refunded.",
    ],
  },
  {
    question: "Do u offer refunds?",
    answers: [
      "As a very small (but mighty) company, we r currently only able 2 offer refunds on The Dumbphone I for manufacturer defects. This means defects caused during production -- not damage from drops, water, misuse, or wear and tear.",
      "No partial refunds are issued 4 unused billing time. Service continues through the paid period.",
    ],
  },
  {
    question: "What happens if my payment fails?",
    answers: [
      "We'll send a reminder so u can update ur payment info. Late payments are subject 2 phone number cancellations.",
    ],
  },
  {
    question: "Do u offer phone replacements?",
    answers: [
      "We sure do. We'll ship out a replacement for a $65 fee, no q's asked.",
    ],
  },
  {
    question: "What phone service does it use?",
    answers: ["T-Mobile is our current mobile carrier 4 The Dumbphone I."],
  },
  {
    question: "Can I pause my subscription?",
    answers: [
      "We are unable 2 pause service at this time. We can cancel ur plan, but the phone number will be lost.",
    ],
  },
  {
    question: "How does billing work?",
    answers: [
      <>
        Billing occurs on a rolling 30-day cycle. U can check out billing +
        subscription info via the {" "}
        <a
          href="https://billing.stripe.com/p/login/aFa6oA8tO7b4aTNeAU8N200"
          target="_blank"
          rel="noreferrer"
        >
          Stripe portal
        </a>
        .
      </>,
      "We require a valid payment method which will be billed automatically every month. If payment fails, we'll notify u ASAP 2 update payment info and avoid any interruptions. Late payments are subject 2 phone number cancellations.",
    ],
  },
  {
    question: "Can I call or text internationally?",
    answers: [
      "Unfortunately we do not currently offer international calling and texting, but hope 2 offer this in the future.",
    ],
  },
];

function FAQs() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
    );
  };

  return (
    <div className="faq-page">
      <div className="faq-card">
        <div className="faq-header">
          <p className="faq-kicker">dumb.co/faq</p>
          <h1>FREQUENTLY ASKED QUESTIONS</h1>
        </div>
        <div className="faq-list" role="list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndexes.includes(index);
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div key={item.question} className="faq-item" role="listitem">
                <button
                  id={buttonId}
                  className="faq-question"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  type="button"
                  onClick={() => toggleIndex(index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-indicator">{isOpen ? "-" : "+"}</span>
                </button>
                <div
                  id={panelId}
                  className={`faq-panel ${isOpen ? "open" : ""}`}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                >
                  {item.answers.length > 0 ? (
                    item.answers.map((answer, answerIndex) => (
                      <p key={answerIndex}>{answer}</p>
                    ))
                  ) : (
                    <p className="faq-empty" aria-hidden="true"></p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FAQs;
