import { getAssetUrl } from "@/lib/imageUrl";

export const metadata = {
  title: "Privacy Policy | Masinyusane",
  description: "Privacy Policy for Masinyusane mobile and web applications.",
};

export default function PrivacyPolicyPage() {
  const updated = "February 15, 2026";

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Last updated: {updated}
      </p>

      <section className="mt-10 space-y-4">
        <p>
          Masinyusane ("we", "us", "our") is a nonprofit organization focused on
          early childhood education. This Privacy Policy explains how we
          collect, use, share, and protect information when you use our website
          and our mobile applications ("Services").
        </p>

        <h2 className="mt-8 text-xl font-semibold">Who this policy applies to</h2>
        <p>
          Our mobile applications are intended for authorized adults — staff,
          volunteers, and partners — who deliver or support Masinyusane programs.{" "}
          <strong>Users must be 18 years of age or older to create an account.</strong>{" "}
          The Services are not intended for children to use directly.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Information we collect</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Account and authentication data:</strong> name, email address,
            organization/role, and login identifiers needed to provide secure access.
            This data is required to use the Services.
          </li>
          <li>
            <strong>Program and session data:</strong> information entered by authorized
            staff about educational sessions (e.g., date, site, attendance, skills or
            letters covered, notes, and outcomes).
          </li>
          <li>
            <strong>Child learning data:</strong> limited personal information about
            children participating in Masinyusane programs, such as child names,
            identifiers, and assessment or learning progress data (including letter and
            skill scores), collected solely for educational program delivery, monitoring,
            and improvement. This data is entered by authorized staff, not by children
            themselves.
          </li>
          <li>
            <strong>Location data:</strong> the app may request permission to collect
            approximate or precise device location to verify session attendance,
            support program monitoring, and assist with operational logistics. Location
            access is requested at runtime and can be denied without losing access to
            core app features. Precise location is used only when necessary for session
            verification; approximate location is used for general program monitoring.
          </li>
          <li>
            <strong>Device and usage data:</strong> basic technical information such as
            device type, operating system, app version, and diagnostic data (for
            example, crash logs) to maintain and improve the Services.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">How we use information</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>To provide, maintain, and secure access to the Services.</li>
          <li>
            To support delivery, monitoring, and improvement of Masinyusane education
            programs.
          </li>
          <li>
            To verify session activity and locations where relevant to program
            integrity.
          </li>
          <li>
            To generate aggregated and de-identified reports for internal management,
            partners, and funders.
          </li>
          <li>To troubleshoot issues, prevent abuse, and protect our systems.</li>
          <li>To communicate about Service updates, support, and account matters.</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">How we share information</h2>
        <p>
          We do not sell personal information. We may share information:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>With service providers</strong> who help us operate the Services,
            under confidentiality and security obligations (see "Third-party service
            providers" below).
          </li>
          <li>
            <strong>With partners and funders</strong> in aggregated or de-identified
            form for reporting on program results.
          </li>
          <li>
            <strong>For legal reasons</strong> if required to comply with law or to
            protect rights, safety, and security.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">Third-party service providers</h2>
        <p>
          We use the following third-party services to operate the Services. Each
          processes data only as necessary to provide their function and is bound by
          appropriate data protection obligations:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Clerk (clerk.com):</strong> handles user authentication and account
            management, including storing account credentials and session tokens.
          </li>
          <li>
            <strong>Google Cloud Storage (cloud.google.com):</strong> used for secure
            cloud storage of application data and uploaded files.
          </li>
          <li>
            <strong>Render (render.com):</strong> hosts the backend API and database
            infrastructure.
          </li>
        </ul>
        <p>
          We do not use third-party advertising networks or data brokers.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Children's privacy</h2>
        <p>
          Our mobile applications are intended for use by authorized adults (such as
          staff, volunteers, and partners), not by children directly. However,
          authorized users may enter limited information about children participating
          in Masinyusane programs, including names and assessment data, for legitimate
          educational and program monitoring purposes.
        </p>
        <p>
          We aim to minimize the personal data collected about children and use
          aggregated or de-identified reporting where feasible. We do not knowingly
          permit children to create accounts in the Services.
        </p>
        <p>
          Access to child-related data is restricted to authorized personnel with a
          legitimate programmatic need. We implement role-based access controls and
          other safeguards designed to protect sensitive information.
        </p>
        <p>
          Masinyusane maintains a comprehensive Child Protection Policy that governs
          how all staff, volunteers, and partners are expected to handle interactions
          with and data about children in our programs. You can read the full policy
          here:{" "}
          <a
            className="underline"
            href={getAssetUrl("reports/Masinyusane - Child Protection Policy.pdf")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Masinyusane Child Protection Policy (PDF)
          </a>
          .
        </p>

        <h2 className="mt-8 text-xl font-semibold">Data retention</h2>
        <p>
          We retain information for as long as necessary to provide the Services,
          support program operations, meet contractual obligations, and comply
          with legal requirements. We may retain aggregated or de-identified data
          for research and reporting purposes.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Security</h2>
        <p>
          We use reasonable administrative, technical, and organizational measures to
          protect information, including encrypted data transmission (HTTPS),
          authentication controls via Clerk, and role-based access restrictions. No
          system is 100% secure, but we continuously work to improve our safeguards.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Your choices</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Location permissions:</strong> location access is requested at
            runtime on your device. You may deny or revoke location permissions at any
            time in your device settings without losing access to core app features.
          </li>
          <li>
            <strong>Access and updates:</strong> authorized users may request updates
            to their account information by contacting us at{" "}
            <a className="underline" href="mailto:info@masinyusane.org">
              info@masinyusane.org
            </a>
            .
          </li>
          <li>
            <strong>Account deletion:</strong> you may request deletion of your account
            and associated personal data by emailing{" "}
            <a className="underline" href="mailto:info@masinyusane.org">
              info@masinyusane.org
            </a>{" "}
            with the subject line "Account Deletion Request". We will process your
            request within 30 days, subject to any operational or legal retention
            requirements. Note that program data entered on behalf of Masinyusane
            (such as session records) may be retained for legitimate organizational
            purposes even after account deletion.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">Contact us</h2>
        <p>
          If you have questions about this Privacy Policy or our privacy practices,
          contact us at{" "}
          <a className="underline" href="mailto:info@masinyusane.org">
            info@masinyusane.org
          </a>
          .
        </p>

        <h2 className="mt-8 text-xl font-semibold">Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If we make material
          changes, we will update the "Last updated" date above.
        </p>
      </section>
    </main>
  );
}
