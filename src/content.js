// BerthVellum — site facts used by the pages, the prerender step and the tests.
// A proposed product: pricing is illustrative; the domain, email and LinkedIn page are placeholders to confirm.
const site = {
  name: 'BerthVellum',
  slug: 'berthvellum',
  tagline: 'Turn shipping updates into actionable timelines.',
  about: 'BerthVellum helps freight forwarders turn scattered shipment emails and documents into one operational timeline. AI extracts milestones, reconciles conflicting updates and flags shipments that need attention — for operations staff to verify.',
  url: 'https://berthvellum.site',
  email: 'chukwudi@berthvellum.site',
  team: [
    {name: 'Chukwudi Okeke', role: 'Founder/CEO', initials: 'CO', bio: 'Chukwudi has run forwarding desks where a single missed email meant demurrage, and started BerthVellum so every shipment has one timeline the whole team can trust. He leads product and forwarder partnerships.'},
    {name: 'Yetunde Balogun', role: 'Co-founder', initials: 'YB', bio: 'Yetunde leads the platform: extracting milestones from correspondence and documents, reconciling conflicting updates, and the exception queue operations teams work from.'},
  ],
  stats: [
    {value: '80%+', label: 'Share of world trade by volume carried by sea.', source: 'UNCTAD, Review of Maritime Transport 2024', url: 'https://unctad.org/publication/review-maritime-transport-2024'},
    {value: '62.8%', label: 'Global container schedule reliability in December 2025 — more than a third of arrivals off schedule.', source: 'Sea-Intelligence', url: 'https://www.sea-intelligence.com/press-room/368-global-schedule-reliability-drops-to-62-8-in-december-2025'},
    {value: '70–80%', label: 'Typical schedule reliability in the decade before the pandemic, for comparison.', source: 'The Loadstar, citing Sea-Intelligence', url: 'https://theloadstar.com/unreliability-is-the-new-normal-for-container-shipping/'},
  ],
  app: {
    title: 'Shipment desk',
    subtitle: 'Verify milestones extracted from fictional shipment emails and documents, reconcile conflicting updates and work the exception queue.',
  },
};
export default site;
