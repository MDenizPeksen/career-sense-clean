import LegalShell, { Section } from './LegalShell';

/**
 * Impressum / Legal Notice. Required for a publicly available website operated
 * from Germany under § 5 DDG (Digitale-Dienste-Gesetz, which replaced § 5 TMG).
 * Bracketed placeholders ([...]) MUST be filled with the operator's real details
 * before publishing — an incomplete or missing Impressum can be subject to
 * warnings (Abmahnung).
 */
const Impressum = () => (
  <LegalShell title="Impressum / Legal Notice" lastUpdated="12 June 2026">
    <Section heading="Angaben gemäß § 5 DDG (Information pursuant to § 5 DDG)">
      <p>
        [Your full legal name]
        <br />
        [Street and house number]
        <br />
        [Postal code and city]
        <br />
        Germany
      </p>
    </Section>

    <Section heading="Kontakt (Contact)">
      <p>
        Email: [your-email]
        <br />
        {/* A phone number is recommended for quick electronic contact, but an
            email plus the contact form is generally accepted. */}
        Web: <a href="/contact" className="text-blue-600 underline">Contact form</a>
      </p>
    </Section>

    <Section heading="Verantwortlich für den Inhalt (Responsible for content)">
      <p>
        [Your full legal name], address as above.
      </p>
    </Section>

    <Section heading="Haftung für Inhalte (Liability for content)">
      <p>
        As a service provider we are responsible for our own content on these
        pages in accordance with general law. We are not obligated to monitor
        transmitted or stored third-party information, or to investigate
        circumstances that indicate unlawful activity. Obligations to remove or
        block the use of information under general law remain unaffected.
      </p>
    </Section>

    <Section heading="EU dispute resolution">
      <p>
        The European Commission provides a platform for online dispute resolution
        (ODR):{' '}
        <a
          href="https://ec.europa.eu/consumers/odr/"
          className="text-blue-600 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://ec.europa.eu/consumers/odr/
        </a>
        . We are neither obligated nor willing to participate in dispute
        resolution proceedings before a consumer arbitration board.
      </p>
    </Section>
  </LegalShell>
);

export default Impressum;
