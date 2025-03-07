import type { Metadata } from "next";
import Breadcrumbs from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Legal & Compliance | TokenDirectory",
  description: "Legal information and compliance details for the TokenDirectory platform",
};

export default function LegalPage() {
  return (
    <div className="container py-8 px-4 md:px-6">
      <Breadcrumbs />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tighter mb-6">Legal & Compliance</h1>

        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Automated Scam & Compliance Checks</CardTitle>
              <CardDescription>
                What we check and what we don't
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                We perform basic automated checks on listed tokens, including:
              </p>
              <ul className="list-disc pl-5 text-gray-300 space-y-1">
                <li>Cross-referencing with scam databases (Chainabuse).</li>
                <li>Screening for OFAC-sanctioned addresses.</li>
                <li>Monitoring public smart contract audits (if available).</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Regulatory Disclaimers</CardTitle>
              <CardDescription>
                Important information regarding regulations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">MiCA (EU)</h3>
                <p className="text-gray-300">
                  Some tokens may qualify as Asset-Referenced Tokens (ART) under EU Markets in Crypto-Assets 
                  Regulation (MiCA). We do not validate compliance with MiCA requirements.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">SEC (USA)</h3>
                <p className="text-gray-300">
                  Tokens listed here may be classified as securities under the Howey Test. We are not 
                  registered with the U.S. Securities and Exchange Commission (SEC) and do not provide 
                  investment advice.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>General Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                This directory does not endorse or guarantee the safety of any token. The information 
                provided on this platform is for informational purposes only and is not intended to be 
                investment advice. We are not responsible for any losses that may occur from using the 
                information provided on this platform.
              </p>
              <p className="text-gray-300 mt-4">
                <strong className="text-amber-500">Use at your own risk.</strong> We strongly recommend performing 
                thorough due diligence before interacting with any token or project listed on this platform.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Methodology</CardTitle>
              <CardDescription>
                How our automated checks work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Scam Database Checks</h3>
                <p className="text-gray-300">
                  We automatically query public scam databases for reports related to the token's 
                  contract address, website, and associated addresses. These checks are performed 
                  daily but may not catch the newest scams.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Sanction Screening</h3>
                <p className="text-gray-300">
                  We check if contract addresses or known developer addresses appear on the OFAC 
                  Specially Designated Nationals and Blocked Persons List.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Smart Contract Audits</h3>
                <p className="text-gray-300">
                  We check if the token's smart contract has been audited by a known security firm 
                  based on publicly available information. An "Unverified" status does not necessarily 
                  mean the contract is unsafe, just that we cannot confirm a professional audit.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
