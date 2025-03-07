import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-[#0F172A] py-8">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">
              <span className="text-amber-500">Token</span>Directory <span className="text-xs text-gray-400">by RWA Investors</span>
            </h3>
            <p className="text-sm text-gray-400">
              TokenDirectory by RWA Investors – The global platform for tokenized real-world assets and investment opportunities.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/directory" className="text-sm text-gray-400 hover:text-amber-500 transition-colors">
                  Directory
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-400 hover:text-amber-500 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-sm text-gray-400 hover:text-amber-500 transition-colors">
                  Submit Project
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-sm text-gray-400 hover:text-amber-500 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-amber-500 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-amber-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-sm text-gray-400 hover:text-amber-500 transition-colors">
                  Legal & Compliance
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Newsletter</h3>
            <p className="text-sm text-gray-400">Stay updated with the latest in RWA investments</p>
            <Link href="/newsletter" className="inline-block text-sm text-amber-500 hover:underline">
              Subscribe →
            </Link>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-800 pt-8">
          <p className="text-xs text-gray-400 mb-4">
            This platform serves purely informational purposes. We are not registered with any regulatory authority 
            (including the SEC or ESMA). While we perform automated scam checks (e.g., Chainabuse reports, OFAC sanctions), 
            we do not verify the legal status, legitimacy, or investment potential of listed tokens. 
            Users act at their own risk and must conduct their own due diligence.
            <Link href="/legal" className="text-amber-500 hover:underline ml-1">
              Full Disclaimer
            </Link>
          </p>
          <p className="text-xs text-gray-400 text-center">© {new Date().getFullYear()} TokenDirectory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
