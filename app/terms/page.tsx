import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsOfServicePage() {
  return (
    <LegalDocument
      title="Terms of Service"
      lastUpdated="June 28, 2025"
      intro="These Terms of Service govern your access to and use of GrantClient. By creating an account or using the service, you agree to these terms."
      sections={[
        {
          title: "Eligibility",
          body: [
            "You must be at least 18 years old and authorized to act on behalf of your organization to use GrantClient.",
            "You are responsible for ensuring that information you provide about your organization is accurate and kept up to date.",
          ],
        },
        {
          title: "Your account",
          body: [
            "You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.",
            "Notify us promptly if you suspect unauthorized access to your account.",
          ],
        },
        {
          title: "Permitted use",
          body: [
            "GrantClient is provided to help nonprofits and community organizations discover funding opportunities and prepare application materials.",
            "You may not misuse the service, attempt to access other users' data, scrape the platform in violation of applicable law, or use the service for unlawful purposes.",
          ],
        },
        {
          title: "Grant information and AI features",
          body: [
            "Grant listings, deadlines, and funder details are provided for informational purposes and may change without notice. You are responsible for verifying requirements directly with funders before applying.",
            "AI-generated drafts and recommendations are assistive tools only. You are solely responsible for reviewing, editing, and submitting final application materials.",
          ],
        },
        {
          title: "Intellectual property",
          body: [
            "GrantClient and its underlying software, design, and content are owned by us or our licensors.",
            "You retain ownership of content you submit. You grant us a limited license to host and process that content solely to operate the service.",
          ],
        },
        {
          title: "Disclaimers",
          body: [
            "The service is provided on an as-is and as-available basis without warranties of any kind, whether express or implied.",
            "We do not guarantee funding outcomes, grant award decisions, or the completeness of third-party grant information.",
          ],
        },
        {
          title: "Limitation of liability",
          body: [
            "To the fullest extent permitted by law, GrantClient will not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the service.",
            "Our total liability for any claim relating to the service will not exceed the amount you paid us, if any, in the twelve months before the claim arose.",
          ],
        },
        {
          title: "Termination",
          body: [
            "You may stop using GrantClient at any time.",
            "We may suspend or terminate access if you violate these terms or if continued operation poses a security or legal risk.",
          ],
        },
        {
          title: "Changes to these terms",
          body: [
            "We may update these Terms of Service from time to time. Continued use of the service after changes become effective constitutes acceptance of the revised terms.",
          ],
        },
        {
          title: "Governing law",
          body: [
            "These terms are governed by the laws applicable in the jurisdiction where GrantClient operates, without regard to conflict of law principles.",
          ],
        },
      ]}
    />
  );
}
