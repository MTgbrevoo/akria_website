import { useEffect, type ReactNode } from 'react';
import { ArrowLeft, ExternalLink, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
    ['verantwortlicher', 'Verantwortlicher'],
    ['allgemeines', 'Allgemeine Hinweise'],
    ['hosting', 'Hosting durch Vercel'],
    ['supabase', 'Supabase als Backend'],
    ['warteliste', 'Bestellungen und E-Mails'],
    ['resend', 'Versand über Resend'],
    ['herkunftsparameter', 'Herkunftsparameter'],
    ['speicher', 'Cookies und lokaler Speicher'],
    ['schriftarten', 'Lokale Schriftarten'],
    ['medien', 'Medien aus Supabase Storage'],
    ['empfaenger', 'Empfänger und Drittlandtransfers'],
    ['rechte', 'Deine Rechte'],
    ['bereitstellung', 'Bereitstellung und Entscheidungen'],
    ['aktualitaet', 'Aktualität und Änderungen'],
] as const;

function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
    return (
        <section id={id} className="scroll-mt-8 border-t border-white/10 py-10 md:py-12">
            <h2 className="mb-5 font-display text-xl font-bold tracking-tight text-white md:text-2xl">
                {title}
            </h2>
            <div className="space-y-4 text-[0.95rem] font-light leading-7 text-white/75 md:text-base">
                {children}
            </div>
        </section>
    );
}

function PrivacyLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-primary"
        >
            {children}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </a>
    );
}

export default function Datenschutz() {
    useEffect(() => {
        const previousTitle = document.title;
        const existingDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        const previousDescription = existingDescription?.getAttribute('content') ?? null;
        const description = existingDescription ?? document.createElement('meta');

        if (!existingDescription) {
            description.name = 'description';
            document.head.appendChild(description);
        }

        document.title = 'Datenschutzerklärung | AKRIA';
        description.content = 'Datenschutzerklärung von AKRIA zur Website, Bestellabwicklung, E-Mail-Kommunikation und den eingesetzten Dienstleistern.';

        return () => {
            document.title = previousTitle;
            if (existingDescription) {
                if (previousDescription === null) {
                    existingDescription.removeAttribute('content');
                } else {
                    existingDescription.content = previousDescription;
                }
            } else {
                description.remove();
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-primary text-white">
            <header className="border-b border-white/10 bg-[#041e3a]/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-5 sm:px-8 md:py-6">
                    <Link
                        to="/"
                        className="group inline-flex items-center gap-2 rounded-full text-sm font-semibold text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-primary"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                        Zurück zur Startseite
                    </Link>
                    <Link
                        to="/"
                        aria-label="AKRIA Startseite"
                        className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-primary"
                    >
                        <img src="/assets/logo.png" alt="AKRIA" className="h-8 w-auto md:h-10" />
                    </Link>
                </div>
            </header>

            <main>
                <div className="relative overflow-hidden border-b border-white/10">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/10 blur-[100px]" />
                    <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
                    <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                            Datenschutz bei AKRIA
                        </div>
                        <h1 className="max-w-4xl font-serif text-4xl font-black italic leading-tight text-white sm:text-5xl md:text-7xl">
                            Datenschutz&shy;erklärung
                        </h1>
                        <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-white/50">Stand: März 2026</p>
                        <p className="mt-8 max-w-3xl text-base font-light leading-8 text-white/70 md:text-lg">
                            Hier informieren wir dich darüber, welche personenbezogenen Daten beim Besuch unserer Website und bei Bestellungen und der Anmeldung zu AKRIA-Neuigkeiten verarbeitet werden.
                        </p>
                    </div>
                </div>

                <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16 lg:py-16">
                    <aside className="lg:sticky lg:top-8 lg:self-start">
                        <nav aria-label="Inhaltsübersicht" className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
                            <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-accent">Inhalt</h2>
                            <ol className="space-y-2.5 text-sm text-white/60">
                                {sections.map(([id, label], index) => (
                                    <li key={id}>
                                        <a
                                            href={`#${id}`}
                                            className="block rounded-md py-0.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                        >
                                            <span className="mr-2 text-white/30">{String(index + 1).padStart(2, '0')}</span>
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </aside>

                    <article className="min-w-0">
                        <LegalSection id="verantwortlicher" title="1. Verantwortlicher">
                            <p>Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
                            <address className="not-italic text-white/85">
                                <strong className="font-semibold text-white">Meyer &amp; Tiffert GbR</strong><br />
                                vertreten durch Denis Tiffert und Zeno Meyer<br />
                                Hofwiese 27<br />
                                79809 Weilheim<br />
                                Deutschland
                            </address>
                            <p>
                                E-Mail:{' '}
                                <a
                                    href="mailto:meyertiffertgbr@gmail.com"
                                    className="inline-flex items-center gap-1.5 text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                    <Mail className="h-4 w-4" aria-hidden="true" />
                                    meyertiffertgbr@gmail.com
                                </a>
                            </p>
                        </LegalSection>

                        <LegalSection id="allgemeines" title="2. Allgemeine Hinweise zur Datenverarbeitung">
                            <p>
                                Wir verarbeiten personenbezogene Daten nur, soweit dies für die Bereitstellung dieser Website, die technische Sicherheit, die Bearbeitung deiner Bestellung und Newsletter-Anmeldung und die gewünschte E-Mail-Kommunikation erforderlich ist. Je nach Verarbeitung stützen wir uns auf deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Durchführung vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO), gesetzliche Pflichten (Art. 6 Abs. 1 lit. c DSGVO) oder unsere berechtigten Interessen an einem sicheren und wirtschaftlichen Webangebot sowie der Zuordnung eigener Kampagnen (Art. 6 Abs. 1 lit. f DSGVO).
                            </p>
                            <p>
                                Wir treffen angemessene technische und organisatorische Sicherheitsmaßnahmen. Die Datenübertragung zwischen deinem Browser und der Website erfolgt verschlüsselt über HTTPS/TLS. Empfänger erhalten Daten nur, soweit dies für den jeweiligen Zweck erforderlich ist oder eine gesetzliche Verpflichtung besteht.
                            </p>
                        </LegalSection>

                        <LegalSection id="hosting" title="3. Hosting durch Vercel">
                            <p>
                                Diese Website wird über Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA („Vercel“) bereitgestellt. Beim Aufruf können insbesondere IP-Adresse, Datum und Uhrzeit, aufgerufene URL, Referrer-URL, Browser- und Geräteinformationen, HTTP-Statuscode und übertragene Datenmenge in Server- und Sicherheitsprotokollen verarbeitet werden.
                            </p>
                            <p>
                                Die Verarbeitung dient der Auslieferung der Website, der Stabilität, Fehleranalyse und Abwehr von Missbrauch. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Protokolldaten werden nur so lange gespeichert, wie sie für Betrieb und Sicherheit erforderlich sind; die konkrete Dauer kann von den im Vercel-Konto gewählten Einstellungen und den Sicherheitsanforderungen des Anbieters abhängen. Danach werden sie gelöscht oder anonymisiert, soweit keine gesetzliche Aufbewahrungspflicht besteht.
                            </p>
                            <p>
                                Mit Vercel ist eine Auftragsverarbeitung nach Art. 28 DSGVO vorzusehen. Wegen des Sitzes in den USA kann ein Zugriff aus einem Drittland nicht vollständig ausgeschlossen werden. Weitere Informationen findest du in der{' '}
                                <PrivacyLink href="https://vercel.com/legal/privacy-policy">Datenschutzerklärung von Vercel</PrivacyLink>.
                            </p>
                        </LegalSection>

                        <LegalSection id="supabase" title="4. Supabase als Backend">
                            <p>
                                Wir nutzen Dienste von Supabase, Inc., einem Anbieter mit Sitz in den USA („Supabase“), für Authentifizierung, Datenbank und Dateispeicher. Das AKRIA-Projekt ist nach unseren Einstellungen in einer EU-Region angelegt. Vor Veröffentlichung ist die tatsächlich konfigurierte Projektregion noch einmal im Betreiberkonto zu prüfen.
                            </p>
                            <h3 className="pt-2 font-semibold text-white">Authentifizierung und Double-Opt-in</h3>
                            <p>
                                Bestellungen sind ohne Benutzerkonto und ohne Bestätigungsklick möglich. Für freiwillige AKRIA-Neuigkeiten verwenden wir einen separaten Double-Opt-in-Link. Dabei speichern wir Anmeldung, Einwilligungstext und Bestätigung. Bereits versendete Links aus der früheren Warteliste können über Supabase Auth verarbeitet werden; dabei fallen Authentifizierungsdaten und Sitzungsinformationen an.
                            </p>
                            <h3 className="pt-2 font-semibold text-white">Datenbank und Storage</h3>
                            <p>
                                In der Datenbank werden Kontakte, Bestellungen, Newsletter-Einwilligungen und Versandaufträge gespeichert. Jede Bestellung enthält die bei ihrer Aufgabe angegebenen Namen, Adressdaten und Preise. Über Supabase Storage stellen wir außerdem Bilder und Videos der Website bereit. Dabei entstehen die unter Abschnitt 10 beschriebenen technischen Abrufdaten. Die Verarbeitung erfolgt zur Bestellabwicklung auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, für den Newsletter auf Grundlage deiner Einwilligung und für den sicheren technischen Betrieb auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
                            </p>
                            <p>
                                Mit Supabase ist eine Auftragsverarbeitung nach Art. 28 DSGVO vorzusehen. Auch bei einer EU-Projektregion können Zugriffe des Anbieters aus Drittländern nicht vollständig ausgeschlossen werden. Weitere Informationen enthält die{' '}
                                <PrivacyLink href="https://supabase.com/privacy">Datenschutzerklärung von Supabase</PrivacyLink>.
                            </p>
                        </LegalSection>

                        <LegalSection id="warteliste" title="5. Bestellungen und E-Mail-Kommunikation">
                            <p>Bei einer Bestellung verarbeiten wir Vorname, Nachname, E-Mail-Adresse, Straße, Hausnummer, PLZ, Ort, Land, Stückzahl, Preis, Bestellnummer, Zeitpunkt sowie gegebenenfalls den Akquisitionscode. Wir benötigen diese Daten zur Bearbeitung deiner Bestellung, zur Eingangsbestätigung und zur späteren Abstimmung von Lieferung und Zahlung (Art. 6 Abs. 1 lit. b DSGVO). Eine Bestellung meldet dich nicht automatisch zum Newsletter an.</p>
                            <p>Mit deiner separaten freiwilligen Einwilligung informieren wir dich per E-Mail über kommende Ernten und neue AKRIA-Produkte (Art. 6 Abs. 1 lit. a DSGVO). Neue Anmeldungen werden erst durch den Double-Opt-in-Link bestätigt. Wir speichern den Einwilligungstext beziehungsweise seine Version sowie Anmelde-, Bestätigungs- und gegebenenfalls Abmeldezeitpunkte.</p>
                            <p>Du kannst deine Newsletter-Einwilligung jederzeit über den Abmeldelink oder per E-Mail an <a href="mailto:meyertiffertgbr@gmail.com" className="text-accent underline">meyertiffertgbr@gmail.com</a> widerrufen. Deine Bestellungen und dafür erforderliche Kommunikation bleiben davon unberührt. Der Widerruf berührt die Rechtmäßigkeit der vorherigen Verarbeitung nicht.</p>
                            <p>Bestelldaten speichern wir für die Abwicklung und anschließend soweit gesetzliche Aufbewahrungspflichten oder die Geltendmachung beziehungsweise Abwehr von Ansprüchen dies erfordern. Newsletterdaten speichern wir bis zum Widerruf oder Wegfall des Zwecks; erforderliche Einwilligungsnachweise können darüber hinaus eingeschränkt aufbewahrt werden.</p>
                            <p>Zum Schutz vor missbräuchlichen Bestellungen und Mailversand verarbeiten wir kurzzeitig einen mit einem geheimen Wert gehashten Netzwerkbezug und Anfragezähler. Offene Bestellvorgänge und die letzte Bestätigung werden im sessionStorage deines Browsers gespeichert, damit Wiederholungen keine doppelten Bestellungen auslösen. Diese Speicherung dient der von dir angeforderten Bestellfunktion und endet üblicherweise beim Schließen des Tabs. Bei einer weiteren Bestellung wird die vorherige Bestätigung entfernt.</p>
                        </LegalSection>

                        <LegalSection id="resend" title="6. Versanddienst Resend">
                            <p>
                                Für Bestätigungs- und Informationsmails wird der Versanddienst Resend, Resend, Inc., San Francisco, USA („Resend“), eingesetzt. Dabei werden die für den Versand erforderlichen Daten verarbeitet, insbesondere Empfänger- und Absenderadresse, E-Mail-Inhalt, Versandzeitpunkt sowie technische Versand-, Zustell- und Fehlerdaten.
                            </p>
                            <p>
                                Resend verarbeitet diese Daten als Versanddienstleister in unserem Auftrag. Grundlage für die inhaltliche Kommunikation ist deine Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO; die technische Absicherung und Dokumentation des Versands stützt sich ergänzend auf Art. 6 Abs. 1 lit. f DSGVO. Versanddaten werden nur so lange aufbewahrt, wie dies für Versand, Zustellbarkeit, Fehlerbehebung und erforderliche Nachweise notwendig ist. Die konkrete Dauer richtet sich nach den Einstellungen im Resend-Konto und ist vor Veröffentlichung dort zu prüfen.
                            </p>
                            <p>
                                Mit Resend ist eine Auftragsverarbeitung nach Art. 28 DSGVO vorzusehen. Wegen des US-Bezugs kann eine Drittlandverarbeitung nicht ausgeschlossen werden. Weitere Informationen findest du in der{' '}
                                <PrivacyLink href="https://resend.com/legal/privacy-policy">Datenschutzerklärung von Resend</PrivacyLink>.
                            </p>
                        </LegalSection>

                        <LegalSection id="herkunftsparameter" title="7. Herkunfts- und Akquisitionsparameter">
                            <p>
                                Enthält die aufgerufene Adresse den Parameter <code className="rounded bg-white/10 px-1.5 py-0.5 text-white">src</code>, speichern wir dessen Wert während der aktuellen Browser-Sitzung im <code className="rounded bg-white/10 px-1.5 py-0.5 text-white">sessionStorage</code>. Bei einer Bestellung wird dieser Quellcode gemeinsam mit der Bestellung gespeichert. Ohne Parameter wird der allgemeine Wert „website“ verwendet.
                            </p>
                            <p>
                                Zweck ist die Zuordnung eigener Kampagnen und Zugangswege. Es findet dadurch kein anbieter- oder websiteübergreifendes Tracking statt. Rechtsgrundlage ist unser berechtigtes Interesse an der Bewertung eigener Kampagnen nach Art. 6 Abs. 1 lit. f DSGVO. Der Wert im sessionStorage wird in der Regel beim Schließen des Tabs beziehungsweise der Browsersitzung gelöscht; der mit einer Bestellung übernommene Wert wird im Rahmen der Bestelldaten gespeichert.
                            </p>
                        </LegalSection>

                        <LegalSection id="speicher" title="8. Cookies und ähnliche Technologien">
                            <p>
                                Die Website verwendet nach der erkennbaren Implementierung keine optionalen Analyse- oder Marketing-Cookies. Sie nutzt jedoch technisch erforderlichen beziehungsweise funktionalen Browser-Speicher:
                            </p>
                            <ul className="list-disc space-y-3 pl-5 marker:text-accent">
                                <li><strong className="font-semibold text-white">sessionStorage:</strong> für den oben beschriebenen Akquisitionscode bis zum Ende der Browsersitzung.</li>
                                <li><strong className="font-semibold text-white">localStorage:</strong> für den Status, dass du den Speicherhinweis bestätigt hast. Dieser Eintrag bleibt grundsätzlich gespeichert, bis du ihn über die Browser-Einstellungen löschst.</li>
                                <li><strong className="font-semibold text-white">Supabase-Sitzungsspeicher:</strong> Supabase Auth speichert technische Sitzungs- und Tokeninformationen standardmäßig persistent im lokalen Browser-Speicher, damit die Bestätigung und Sitzung verarbeitet werden können. Die Daten bleiben bis zum Ablauf beziehungsweise zur Beendigung der Sitzung oder bis zur Löschung des Browser-Speichers erhalten.</li>
                            </ul>
                            <p>
                                Soweit ein Zugriff auf Endeinrichtungen im Sinne des § 25 TDDDG erfolgt, ist er für die von dir angeforderte Funktion beziehungsweise den sicheren Betrieb erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Der Hinweis dient daher der Transparenz und enthält keine Auswahl für optionale Trackingdienste.
                            </p>
                        </LegalSection>

                        <LegalSection id="schriftarten" title="9. Lokal eingebundene Schriftarten">
                            <p>
                                Die verwendeten Schriftarten werden als Bestandteile der Website lokal ausgeliefert. Beim Anzeigen der Texte wird keine Verbindung zu Google Fonts oder einem vergleichbaren externen Schriftanbieter hergestellt.
                            </p>
                        </LegalSection>

                        <LegalSection id="medien" title="10. Medien aus Supabase Storage">
                            <p>
                                Ein Teil der Bilder und Videos wird aus dem öffentlichen Supabase Storage des AKRIA-Projekts geladen. Beim Abruf werden technisch bedingt insbesondere IP-Adresse, Datum und Uhrzeit, angeforderte Datei, Referrer sowie Browser- und Geräteinformationen an Supabase übermittelt. Dies ist für die Darstellung der Website erforderlich und erfolgt auf Grundlage unseres berechtigten Interesses an einer ansprechenden und leistungsfähigen Website nach Art. 6 Abs. 1 lit. f DSGVO. Technische Abrufdaten werden nur so lange gespeichert, wie dies für Bereitstellung, Sicherheit und Fehleranalyse erforderlich ist.
                            </p>
                        </LegalSection>

                        <LegalSection id="empfaenger" title="11. Empfänger, Auftragsverarbeitung und Drittlandübermittlungen">
                            <p>
                                Empfänger personenbezogener Daten sind innerhalb unseres Betriebs nur die Personen, die sie für die genannten Zwecke benötigen. Als Auftragsverarbeiter beziehungsweise technische Dienstleister kommen insbesondere Vercel, Supabase und Resend zum Einsatz. Soweit erforderlich, schließen wir Verträge zur Auftragsverarbeitung nach Art. 28 DSGVO.
                            </p>
                            <p>
                                Vercel, Supabase und Resend weisen Bezüge zu den USA oder anderen Staaten außerhalb des Europäischen Wirtschaftsraums auf. Auch wenn Daten primär in einer EU-Region gespeichert werden, können Support-, Sicherheits- oder Administrationszugriffe aus Drittländern möglich sein. Eine Übermittlung erfolgt nur, wenn die Voraussetzungen der Art. 44 ff. DSGVO erfüllt sind, etwa auf Grundlage eines Angemessenheitsbeschlusses oder – soweit erforderlich – geeigneter Garantien wie den Standardvertragsklauseln der Europäischen Kommission und ergänzender Schutzmaßnahmen. Welche Transfermechanismen im konkreten Betreiberkonto gelten, ist vor Veröffentlichung anhand der jeweiligen Verträge und Einstellungen zu verifizieren.
                            </p>
                        </LegalSection>

                        <LegalSection id="rechte" title="12. Deine Datenschutzrechte">
                            <p>Unter den gesetzlichen Voraussetzungen hast du insbesondere folgende Rechte:</p>
                            <ul className="list-disc space-y-3 pl-5 marker:text-accent">
                                <li>Auskunft über deine verarbeiteten Daten (Art. 15 DSGVO),</li>
                                <li>Berichtigung unrichtiger oder Vervollständigung unvollständiger Daten (Art. 16 DSGVO),</li>
                                <li>Löschung deiner Daten (Art. 17 DSGVO),</li>
                                <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
                                <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
                                <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen aus Gründen, die sich aus deiner besonderen Situation ergeben (Art. 21 DSGVO), und</li>
                                <li>jederzeitiger Widerruf einer Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).</li>
                            </ul>
                            <p>
                                Zur Ausübung deiner Rechte genügt eine Nachricht an die oben genannte E-Mail-Adresse. Du hast außerdem das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren (Art. 77 DSGVO). Für unseren Sitz ist voraussichtlich zuständig:
                            </p>
                            <address className="not-italic text-white/85">
                                Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg<br />
                                Lautenschlagerstraße 20<br />
                                70173 Stuttgart<br />
                                <PrivacyLink href="https://www.baden-wuerttemberg.datenschutz.de/">www.baden-wuerttemberg.datenschutz.de</PrivacyLink>
                            </address>
                            <p>Dein Recht, dich an eine andere gesetzlich zuständige Aufsichtsbehörde zu wenden, bleibt unberührt.</p>
                        </LegalSection>

                        <LegalSection id="bereitstellung" title="13. Pflicht zur Bereitstellung und automatisierte Entscheidungen">
                            <p>
                                Die Nutzung der frei zugänglichen Website ist ohne Angabe von Bestelldaten möglich. Für eine Bestellung benötigen wir die als Pflichtfelder gekennzeichneten Kontakt-, Adress- und Mengenangaben. Ohne diese können wir deine Bestellung nicht bearbeiten. Die Newsletter-Anmeldung ist freiwillig und keine Voraussetzung einer Bestellung.
                            </p>
                            <p>
                                Eine automatisierte Entscheidungsfindung einschließlich Profiling im Sinne des Art. 22 DSGVO findet nicht statt.
                            </p>
                        </LegalSection>

                        <LegalSection id="aktualitaet" title="14. Aktualität und Änderungen">
                            <p>
                                Wir passen diese Datenschutzerklärung an, wenn sich die Website, die eingesetzten Dienste oder die Rechtslage ändern. Es gilt die jeweils auf dieser Seite veröffentlichte Fassung. Betreiberverträge, konkrete Account-Einstellungen, Speicherfristen und die Supabase-Projektregion sollten vor dem Livegang und anschließend regelmäßig überprüft werden.
                            </p>
                        </LegalSection>
                    </article>
                </div>
            </main>

            <footer className="border-t border-white/10 bg-[#041e3a]">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-white/40 sm:px-8 md:flex-row md:items-center md:justify-between">
                    <p>© 2026 AKRIA · Meyer &amp; Tiffert GbR</p>
                    <a href="mailto:meyertiffertgbr@gmail.com" className="rounded-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        Datenschutzanfrage per E-Mail
                    </a>
                </div>
            </footer>
        </div>
    );
}
