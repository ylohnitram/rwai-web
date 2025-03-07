import type { Metadata } from "next"
import Breadcrumbs from "@/components/breadcrumbs"

export const metadata: Metadata = {
  title: "Privacy Policy | TokenDirectory",
  description: "Privacy policy for the TokenDirectory platform",
}

export default function PrivacyPage() {
  return (
    <div className="container py-8 px-4 md:px-6">
      <Breadcrumbs />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tighter mb-6">Privacy Policy</h1>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Introduction</h2>
            <p className="text-gray-300">
              At TokenDirectory, we take your privacy seriously. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you visit our website.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
            <p className="text-gray-300">
              We may collect personal information that you voluntarily provide to us when you register on the website,
              express interest in obtaining information about us or our products and services, participate in activities
              on the website, or otherwise contact us.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="text-gray-300">
              We use the information we collect to provide, maintain, and improve our services, to develop new ones, and
              to protect TokenDirectory and our users.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-300">
              If you have questions or concerns about this Privacy Policy, please contact us at
              privacy@rwa-investors.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

