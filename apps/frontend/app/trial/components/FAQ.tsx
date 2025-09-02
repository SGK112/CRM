'use client';

export function FAQ() {
  const faqs = [
    {
      q: 'How does the free trial work?',
      a: 'You get full access to all Remodely CRM features for 14 days. No credit card required. You can cancel anytime during the trial period with no charges.',
    },
    {
      q: 'What happens after my trial ends?',
      a: "After your 14-day trial, you can choose a paid plan to continue using Remodely CRM. If you don't upgrade, your account will be paused but your data will be saved for 30 days.",
    },
    {
      q: 'Can I change plans later?',
      a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated based on your usage.',
    },
    {
      q: 'Is my data secure?',
      a: 'Absolutely. We use enterprise-grade security with 256-bit SSL encryption, regular backups, and comply with industry security standards to keep your data safe.',
    },
    {
      q: 'Do you offer customer support?',
      a: 'Yes! All plans include customer support. Starter plans get email support, while Professional and Enterprise plans get priority and phone support respectively.',
    },
  ];

  return (
    <div className="bg-slate-950 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold text-center text-slate-100 mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">{faq.q}</h3>
              <p className="text-slate-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
