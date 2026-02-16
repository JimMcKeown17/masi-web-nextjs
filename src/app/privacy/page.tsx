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
          Our mobile applications are intended for staff, volunteers,
          and partners who deliver or support Masinyusane programs. They are not
          intended for children to use directly.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Information we collect</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Account and authentication data:</strong> name, email address,
            organization/role, and login identifiers needed to provide access.
          </li>
          <li>
            <strong>Program and session data:</strong> information entered by staff
            about educational sessions (e.g., date, location or site name,
            attendance counts, skills/letters covered, notes, outcomes).
          </li>
          <li>
            <strong>Child learning data (where applicable):</strong> assessment
            results or learning progress data that may be linked to a child
            identifier used for program monitoring and improvement.
          </li>
          <li>
            <strong>Device and usage data:</strong> basic technical information
            such as device type, operating system, app version, and diagnostics
            (e.g., crash logs) to maintain and improve the Services.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">How we use information</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>To provide, maintain, and secure access to the Services.</li>
          <li>
            To operate and improve education programs, including monitoring,
            evaluation, and reporting using aggregated and de-identified data
            where possible.
          </li>
          <li>To troubleshoot issues, prevent abuse, and protect our systems.</li>
          <li>To communicate about Service updates, support, and account issues.</li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">How we share information</h2>
        <p>
          We do not sell personal information. We may share information:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>With service providers</strong> who help us operate the
            Services (e.g., hosting, analytics, error monitoring), under
            confidentiality and security obligations.
          </li>
          <li>
            <strong>With partners and funders</strong> in aggregated or
            de-identified form for reporting on program results.
          </li>
          <li>
            <strong>For legal reasons</strong> if required to comply with law or
            to protect rights, safety, and security.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">Children's privacy</h2>
        <p>
          Our Services are not directed to children. Any child-related data we
          process is collected by authorized staff for educational program
          delivery, monitoring, and improvement. We aim to minimize personal
          identifiers and use de-identified or aggregated reporting where
          feasible.
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
          We use reasonable administrative, technical, and organizational
          measures to protect information. No system is 100% secure, but we
          continuously work to improve safeguards.
        </p>

        <h2 className="mt-8 text-xl font-semibold">Your choices</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Access and updates:</strong> authorized users may request
            updates to their account information.
          </li>
          <li>
            <strong>Deletion:</strong> where applicable, you may request deletion
            of your account data, subject to operational and legal requirements.
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold">Contact us</h2>
        <p>
          If you have questions about this Privacy Policy or our privacy
          practices, contact us at{" "}
          <a className="underline" href="mailto:info@masinyusane.org">
            info@masinyusane.org
          </a>
          .
        </p>

        <h2 className="mt-8 text-xl font-semibold">Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If we make
          material changes, we will update the "Last updated" date above.
        </p>
      </section>
    </main>
  );
}
