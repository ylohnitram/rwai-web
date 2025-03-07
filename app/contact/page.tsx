import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us | TokenDirectory",
  description: "Get in touch with the TokenDirectory team",
}

export default function ContactPage() {
  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tighter mb-6">Contact Us</h1>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              For general inquiries: <a href="mailto:info@rwa-investors.com" className="text-amber-500 hover:underline">info@rwa-investors.com</a>
            </p>
            <p className="text-gray-300">
              For project submissions: <a href="mailto:submissions@rwa-investors.com" className="text-amber-500 hover:underline">submissions@rwa-investors.com</a>
            </p>
            <p className="text-gray-300">
              For partnership opportunities: <a href="mailto:partners@rwa-investors.com" className="text-amber-500 hover:underline">partners@rwa-investors.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
