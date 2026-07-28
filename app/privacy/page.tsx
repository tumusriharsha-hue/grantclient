import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Grantclient collects, uses, shares, and protects information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lastUpdated="July 27, 2026"
      intro="This Privacy Policy explains how Grantclient collects, uses, shares, and protects information when you use our website, accounts, grant-discovery tools, AI-assisted features, and related services (collectively, the “Service”). It also explains the choices available to you. By using the Service, you acknowledge the practices described here."
      sections={[
        {
          title: "Information you provide",
          body: [
            "Account and authentication information, such as your name, email address, password-related authentication records, and information received when you sign in with Google. Grantclient does not receive your Google password.",
            "Organization-profile information, such as organization name, mission, programs, location, budget and funding ranges, populations served, nonprofit status, contact details, funding needs, and preferences.",
            "Application and workspace content, including saved grants, project details, application answers, generated or edited drafts, organization settings, and other information you enter.",
            "Files you choose to upload, such as PDFs, Word or Excel files, images, and their file names, types, sizes, and storage records. Uploaded files may contain personal or confidential information selected by you.",
            "Communications you send to us, including support requests, feedback, and the email address and message content associated with them.",
          ],
        },
        {
          title: "Information collected automatically",
          body: [
            "When you use the Service, our systems and hosting providers may automatically receive technical and activity information such as IP address, browser and device type, operating system, requested pages, referring pages, timestamps, authentication events, saved-grant and feature activity, error data, and security logs.",
            "We use cookies and similar browser storage that are necessary to authenticate users, maintain sessions, protect accounts, remember limited application state, and operate the Service. We do not currently use advertising cookies or sell information for targeted advertising.",
          ],
        },
        {
          title: "How we use information",
          body: [
            "We use information to create and secure accounts; provide grant search, matching, saving, application drafting, document storage, and other requested functionality; personalize recommendations; respond to support; maintain and troubleshoot the Service; prevent abuse; enforce our Terms; and comply with law.",
            "We may use limited usage, error, and performance information to understand and improve the Service. We may also create aggregated or de-identified information that cannot reasonably identify you and use it for service analysis and improvement.",
            "We do not use your uploaded documents or application content to train our own general-purpose AI model.",
          ],
        },
        {
          title: "AI-assisted features",
          body: [
            "When you request AI matching, explanations, or drafting, Grantclient sends the information needed for that request to NVIDIA’s hosted AI services. Depending on the feature, this can include selected organization-profile fields, application answers, grant information, and instructions. Uploaded document files are not sent to the AI provider unless a feature clearly tells you otherwise before you use it.",
            "AI responses and related operational records—such as model name, request hash, status, timestamps, and generated output—may be stored in Supabase to provide the feature, prevent duplicate requests, apply usage limits, troubleshoot failures, and preserve your drafts.",
            "NVIDIA processes submitted information as a service provider under its applicable terms and privacy commitments. Avoid entering unnecessary sensitive personal information into AI-enabled fields.",
          ],
        },
        {
          title: "How we disclose information",
          body: [
            "We do not sell personal information, and we do not share it for cross-context behavioral advertising.",
            "We disclose information to providers that help operate the Service. These currently include Supabase for authentication, databases, and file storage; Google when you choose Google sign-in; NVIDIA for requested AI features; and infrastructure or hosting providers that deliver and secure the website. Providers may access information only as needed to perform services for us, subject to their contractual and legal obligations.",
            "We may disclose information when reasonably necessary to comply with law or legal process; protect the rights, safety, and security of users, Grantclient, or others; investigate fraud or abuse; or enforce our agreements.",
            "If Grantclient or the Service is involved in a merger, acquisition, financing, reorganization, bankruptcy, or transfer of assets, information may be disclosed to advisers and transferred as part of that transaction, subject to applicable law and appropriate confidentiality protections.",
            "We may disclose information at your direction or with your consent, and may disclose aggregated or de-identified information that cannot reasonably identify you.",
          ],
        },
        {
          title: "Data retention",
          body: [
            "We generally retain account information, organization profiles, saved grants, drafts, uploaded files, and related records while your account is active so we can provide the Service.",
            "If you delete an individual document through the Service, we remove the active file and its associated database record. If you request account deletion, we will delete or de-identify personal information associated with the account after reasonably verifying the request, except information we must or are permitted to retain for security, fraud prevention, dispute resolution, legal compliance, or enforcement.",
            "Residual copies may remain temporarily in backups and system logs until they are overwritten under ordinary retention cycles. We retain security, error, and operational logs only for as long as reasonably necessary for the purposes described in this policy. Retention may be longer when law requires it or a legal dispute requires preservation.",
          ],
        },
        {
          title: "Your choices and privacy rights",
          body: [
            "You can review and update much of your organization information in Settings and remove uploaded documents through the document manager. You may stop using the Service at any time.",
            "You may email support@grantclient.com to request access to, correction of, or deletion of your personal information, or to ask for a portable copy where applicable. Depending on your location, you may also have rights to object to or restrict certain processing, withdraw consent, appeal a denied request, or complain to your local data-protection authority.",
            "We may ask you to verify your identity and authority over an organization before completing a request. Applicable law may allow or require us to deny or limit a request. Authorized agents may submit requests where permitted by law, subject to verification.",
            "Grantclient does not currently send promotional marketing email. You cannot opt out of essential account, security, legal, or service messages.",
          ],
        },
        {
          title: "Security",
          body: [
            "We use reasonable administrative, technical, and organizational safeguards designed to protect information, including encrypted network connections, access controls, private user-scoped storage paths, and database row-level security where configured.",
            "No service can guarantee absolute security. You are responsible for using a strong password, protecting your sign-in methods, and keeping independent copies of important application materials.",
          ],
        },
        {
          title: "International processing",
          body: [
            "Grantclient and its providers may process and store information in the United States and other countries where they operate. Those countries may have privacy laws different from those where you live. Where required, providers use legally recognized safeguards for international transfers.",
          ],
        },
        {
          title: "Children’s privacy",
          body: [
            "The Service is intended for organizations and adults and is not directed to children under 13. We do not knowingly collect personal information directly from children under 13. If you believe a child has provided personal information, contact support@grantclient.com so we can investigate and delete it as appropriate.",
          ],
        },
        {
          title: "Third-party services",
          body: [
            "The Service may link to funder websites and other third-party services. This policy does not govern third parties’ independent collection or use of information. Review their privacy policies before providing information to them.",
          ],
        },
        {
          title: "Changes to this policy",
          body: [
            "We may update this policy as the Service, law, or our practices change. We will post the revised policy and update the date above. If changes are material, we will provide additional notice when reasonably practical. Your continued use after the effective date is subject to the updated policy.",
          ],
        },
        {
          title: "Contact us",
          body: [
            "For privacy questions or requests, including account-deletion requests, email support@grantclient.com.",
          ],
        },
      ]}
    />
  );
}
