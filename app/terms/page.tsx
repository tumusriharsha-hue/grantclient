import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern use of Grantclient.",
};

export default function TermsOfServicePage() {
  return (
    <LegalDocument
      title="Terms of Service"
      lastUpdated="July 28, 2026"
      intro="These Terms of Service (“Terms”) govern your access to and use of Grantclient, including its website, grant-discovery tools, AI-assisted features, and related services (collectively, the “Service”). By creating an account, signing in, or otherwise using the Service, you agree to these Terms and acknowledge our Privacy Policy. If you do not agree, do not use the Service."
      sections={[
        {
          title: "Who may use the Service",
          body: [
            "You must be at least 18 years old and legally capable of agreeing to these Terms. If you use the Service for an organization, you represent that you are authorized to accept these Terms on its behalf.",
            "You must provide accurate information, keep it reasonably current, and use the Service in compliance with laws and rules that apply to you and your organization.",
          ],
        },
        {
          title: "Accounts and security",
          body: [
            "You are responsible for safeguarding your login credentials and for activity under your account. Do not share an account in a way that compromises its security or misrepresents who is using it.",
            "Notify us promptly at support@grantclient.com if you believe your account has been accessed without authorization. We may require reasonable verification before assisting with an account.",
          ],
        },
        {
          title: "Free Service",
          body: [
            "Grantclient is currently provided free of charge. There are no subscription fees, automatic renewals, or paid in-product purchases.",
            "If we introduce a paid feature in the future, we will disclose its price and applicable payment, cancellation, and refund terms before you agree to purchase it. We will not charge you merely because you already have an account.",
          ],
        },
        {
          title: "Acceptable use",
          body: [
            "You may use the Service to discover funding opportunities, manage organization information, prepare grant materials, and use other functionality we make available.",
            "You may not use the Service to violate law or another person’s rights; submit malicious code; gain unauthorized access to accounts, systems, or data; disrupt or overload the Service; evade security or usage limits; impersonate another person or organization; send spam; or use automated means to scrape or extract the Service except with our written permission.",
            "You may not use AI features to create unlawful, fraudulent, deceptive, infringing, or harmful material. You remain responsible for how you use, edit, and distribute all output.",
          ],
        },
        {
          title: "Grant information and AI features",
          body: [
            "Grant listings, deadlines, eligibility details, award amounts, and funder information may come from third parties and may be incomplete, outdated, or inaccurate. Always verify material information and current requirements directly with the funder before acting or applying.",
            "AI-generated matches, explanations, drafts, and recommendations are assistive tools, not professional, legal, financial, tax, or fundraising advice. AI output may be inaccurate, incomplete, or unsuitable. You are solely responsible for reviewing, fact-checking, editing, approving, and submitting final materials.",
            "Grantclient does not represent funders and does not guarantee eligibility, application acceptance, funding, or any particular outcome.",
          ],
        },
        {
          title: "Your content",
          body: [
            "You retain ownership of organization information, application materials, documents, and other content you submit to the Service (“Your Content”). You represent that you have the rights and permissions needed to submit and use Your Content.",
            "You grant Grantclient a non-exclusive, worldwide, royalty-free license to host, store, reproduce, transmit, format, and otherwise process Your Content only as reasonably necessary to operate, secure, maintain, and improve the Service; provide features you request, including through our service providers; create requested AI output; comply with law; and enforce these Terms. This license ends when Your Content is deleted from our active systems, except where limited retention is reasonably required for backups, security, fraud prevention, or legal compliance.",
            "Do not upload highly sensitive information unless it is necessary for your use of the Service. You are responsible for removing unnecessary Social Security numbers, financial-account credentials, health information, or other confidential personal data from materials before uploading them.",
          ],
        },
        {
          title: "Grantclient materials",
          body: [
            "The Service, including its software, design, branding, and content supplied by Grantclient, is owned by Grantclient or its licensors and is protected by applicable intellectual-property laws.",
            "Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable right to use the Service for its intended purposes. These Terms do not transfer ownership of the Service or third-party content to you.",
            "If you provide feedback, you permit us to use it without restriction or compensation, but you are not required to provide feedback.",
          ],
        },
        {
          title: "Third-party services and content",
          body: [
            "The Service relies on third-party providers, including providers used for authentication, hosting, storage, AI-assisted features, and website analytics, and may link to funder websites or other external services. Our Privacy Policy explains how these providers may process information in connection with the Service.",
            "Third-party terms and privacy practices govern your direct use of third-party services. We do not control or endorse third-party content and are not responsible for its availability, accuracy, or conduct.",
          ],
        },
        {
          title: "Availability and changes",
          body: [
            "We may add, change, suspend, limit, or discontinue features or the Service. We do not promise that the Service will always be available, uninterrupted, secure, or error-free, or that stored content will never be lost. Keep independent copies of important materials and submitted applications.",
          ],
        },
        {
          title: "Disclaimers",
          body: [
            "TO THE FULLEST EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” GRANTCLIENT DISCLAIMS ALL EXPRESS, IMPLIED, AND STATUTORY WARRANTIES, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, AND QUIET ENJOYMENT.",
            "Some jurisdictions do not allow certain warranty exclusions, so some of the exclusions above may not apply to you. Nothing in these Terms limits rights that cannot lawfully be waived.",
          ],
        },
        {
          title: "Limitation of liability",
          body: [
            "TO THE FULLEST EXTENT PERMITTED BY LAW, GRANTCLIENT AND ITS CONTRIBUTORS, SERVICE PROVIDERS, AND REPRESENTATIVES WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE, DATA, GOODWILL, FUNDING OPPORTUNITIES, OR BUSINESS INTERRUPTION, ARISING FROM OR RELATED TO THE SERVICE.",
            "TO THE FULLEST EXTENT PERMITTED BY LAW, GRANTCLIENT’S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE WILL NOT EXCEED US$100.",
            "These limitations apply regardless of the legal theory and even if a remedy fails of its essential purpose. They do not exclude liability that cannot lawfully be limited.",
          ],
        },
        {
          title: "Indemnification",
          body: [
            "To the extent permitted by law, you agree to defend, indemnify, and hold harmless Grantclient and its contributors, representatives, and service providers from third-party claims, damages, losses, and reasonable costs arising from Your Content, your unlawful or unauthorized use of the Service, or your material violation of these Terms or another person’s rights.",
          ],
        },
        {
          title: "Suspension and termination",
          body: [
            "You may stop using the Service at any time and may request account deletion by emailing support@grantclient.com.",
            "We may suspend or terminate access, remove content, or take other reasonable protective action if you violate these Terms, create legal or security risk, misuse the Service, or if the Service is discontinued. Where practical, we will provide notice.",
            "Provisions that by their nature should survive termination—including provisions concerning ownership, disclaimers, liability, indemnification, and disputes—will survive.",
          ],
        },
        {
          title: "Changes to these Terms",
          body: [
            "We may update these Terms to reflect changes to the Service, law, or our practices. We will post the revised Terms and update the date above. If a change is material, we will provide additional notice when reasonably practical. Your continued use after revised Terms take effect means you accept them; if you do not agree, stop using the Service.",
          ],
        },
        {
          title: "Disputes and applicable law",
          body: [
            "Before filing a formal claim, please contact support@grantclient.com and describe the issue so we can try to resolve it informally.",
            "These Terms are governed by applicable law, without regard to conflict-of-law rules. Any dispute must be brought in a court with lawful jurisdiction over the parties and the dispute. Nothing in these Terms prevents either party from seeking appropriate injunctive relief or using a qualifying small-claims process.",
          ],
        },
        {
          title: "General terms",
          body: [
            "These Terms and the Privacy Policy are the entire agreement between you and Grantclient regarding the Service. If a provision is unenforceable, it will be enforced to the maximum extent permitted and the remaining provisions will remain in effect.",
            "Our failure to enforce a provision is not a waiver. You may not assign these Terms without our consent; we may assign them in connection with a reorganization, transfer of the Service, or operation by a successor. We are not responsible for delay or failure caused by circumstances beyond our reasonable control.",
          ],
        },
        {
          title: "Contact",
          body: [
            "Questions about these Terms may be sent to support@grantclient.com.",
          ],
        },
      ]}
    />
  );
}
