import type { Metadata } from "next"
import Breadcrumbs from "@/components/breadcrumbs"
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/structured-data"

export const metadata: Metadata = {
  title: "Frequently Asked Questions | RWA Directory",
  description: "Find answers to common questions about tokenized real-world assets and our directory",
  keywords: ["FAQ", "RWA", "tokenized assets", "frequently asked questions", "RWA investing"],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app"}/faq`,
  },
  openGraph: {
    title: "Frequently Asked Questions | TokenDirectory by RWA Investors",
    description: "Find answers to common questions about tokenized real-world assets and our directory",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app"}/faq`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Frequently Asked Questions | TokenDirectory by RWA Investors",
    description: "Find answers to common questions about tokenized real-world assets and our directory",
  },
}

// In a real app, this would come from a database
const faqs = [
  {
    id: "1",
    question: "What are tokenized real-world assets (RWAs)?",
    answer:
      "Tokenized real-world assets are physical assets like real estate, art, or commodities that have been represented as digital tokens on a blockchain. This allows for fractional ownership, increased liquidity, and programmable compliance.",
  },
  {
    id: "2",
    question: "How are projects verified on this platform?",
    answer:
      'All projects undergo a thorough verification process that includes legal compliance checks, security audits, and verification of the underlying assets. Only projects that meet our strict criteria receive the "Verified" badge.',
  },
  {
    id: "3",
    question: "What information do I need to submit a project?",
    answer:
      "To submit a project, you need to provide basic information such as the project name, asset type, blockchain, expected ROI, project URL, a detailed description, and a contact email. Additional documentation may be requested during the review process.",
  },
  {
    id: "4",
    question: "How long does the project review process take?",
    answer:
      "The typical review process takes 3-5 business days. Complex projects or those requiring additional verification may take longer. You will be notified via email once the review is complete.",
  },
  {
    id: "5",
    question: "Are the ROI figures guaranteed?",
    answer:
      "No, the ROI figures listed are expected returns based on historical performance or project projections. All investments carry risk, and actual returns may vary. Always conduct your own research before investing.",
  },
  {
    id: "6",
    question: "How can I invest in these projects?",
    answer:
      'Each project has its own investment process. You can visit the project website by clicking the "Visit Project" button on the project detail page to learn more about their specific investment requirements and procedures.',
  },
  {
    id: "7",
    question: "What blockchains are supported?",
    answer:
      "We currently support projects on Ethereum, Polygon, and Solana blockchains. We plan to expand to additional blockchains in the future based on market demand and security considerations.",
  },
]

export default function FAQPage() {
  // Generate breadcrumb items for structured data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app";
  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "FAQ", url: `${baseUrl}/faq` }
  ];

  return (
    <div className="container py-8 px-4 md:px-6">
      <Breadcrumbs />
      {/* Add structured data */}
      <FAQSchema />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tighter mb-6">Frequently Asked Questions</h1>

        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6" id={`faq-${faq.id}`} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <h3 className="text-xl font-semibold mb-3" itemProp="name">{faq.question}</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p className="text-gray-300" itemProp="text">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional FAQ sections */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">More Information</h2>
          <p className="text-gray-300 mb-4">
            If you have additional questions that aren't covered in our FAQ, please feel free to
            <a href="/contact" className="text-amber-500 hover:underline ml-1">contact our support team</a>.
          </p>
          <p className="text-gray-300">
            For more detailed information about tokenized real-world assets and investment opportunities,
            check out our <a href="/blog" className="text-amber-500 hover:underline">blog</a> where we regularly
            publish articles about the latest developments in the RWA space.
          </p>
        </section>

        {/* Glossary section to help with SEO */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">RWA Glossary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Tokenization</h3>
              <p className="text-sm text-gray-300">The process of converting rights to an asset into a digital token on a blockchain.</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Fractional Ownership</h3>
              <p className="text-sm text-gray-300">Dividing an asset into smaller, more affordable shares that can be purchased by multiple investors.</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Smart Contract</h3>
              <p className="text-sm text-gray-300">Self-executing contracts with the terms directly written into code that automate transactions.</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">TVL (Total Value Locked)</h3>
              <p className="text-sm text-gray-300">The total value of assets held within a project or protocol.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
