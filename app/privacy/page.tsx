import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated="June 28, 2025"
      intro="GrantClient helps nonprofits discover and apply for grants. This Privacy Policy explains what information we collect, how we use it, and the choices you have when using our service."
      sections={[
        {
          title: "Information we collect",
          body: [
            "Account information such as your name, email address, and authentication credentials when you register or sign in.",
            "Organization profile information you provide during onboarding, including mission categories, location, budget ranges, and funding preferences.",
            "Usage data such as pages visited, grants saved, and features used, collected through standard application logs and analytics.",
            "Content you create in the platform, including saved grants, application drafts, and organization settings.",
          ],
        },
        {
          title: "How we use your information",
          body: [
            "To provide grant discovery, matching, and application drafting features.",
            "To personalize recommendations based on your organization profile.",
            "To maintain account security, prevent abuse, and improve product performance.",
            "To communicate with you about your account, product updates, and support requests.",
          ],
        },
        {
          title: "How we share information",
          body: [
            "We do not sell your personal information.",
            "We use service providers such as Supabase for authentication and database hosting, and may use AI providers to power drafting features. These providers process data only to deliver the service.",
            "We may disclose information if required by law or to protect the rights, safety, and security of GrantClient and our users.",
          ],
        },
        {
          title: "Data retention",
          body: [
            "We retain account and organization data while your account is active.",
            "You may request deletion of your account and associated data by contacting support.",
          ],
        },
        {
          title: "Your choices",
          body: [
            "You can review and update organization profile information in Settings.",
            "You may opt out of non-essential communications by contacting support.",
            "You can stop using the service at any time by deleting your account or ceasing use of the platform.",
          ],
        },
        {
          title: "Security",
          body: [
            "We use industry-standard safeguards including encrypted connections, access controls, and row-level database security.",
            "No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
          ],
        },
        {
          title: "Children's privacy",
          body: [
            "GrantClient is intended for use by organizations and authorized adults. We do not knowingly collect personal information from children under 13.",
          ],
        },
        {
          title: "Changes to this policy",
          body: [
            "We may update this Privacy Policy from time to time. When we do, we will revise the last updated date above and, where appropriate, notify you through the service.",
          ],
        },
      ]}
    />
  );
}
