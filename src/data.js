// Fictional forwarder desk: import shipments into Lagos (Apapa / Tin Can). Not real vessels or companies.
// Dates are day numbers in November (0 = 31 Oct, -7 = 24 Oct); null = no date stated. "Today" is 14 Nov.

export const today = 14;

export const milestones = ['Booked', 'Departed origin', 'Transshipped', 'ETA destination', 'Berthed', 'Discharged', 'Customs released', 'Delivery order', 'Delivered'];

export const roles = [
  {id: 'lead', label: 'Operations Lead', can: ['view', 'note', 'verify', 'resolve', 'close', 'export']},
  {id: 'coordinator', label: 'Shipment Coordinator', can: ['view', 'note', 'verify', 'resolve']},
  {id: 'customs', label: 'Customs Broker', can: ['view', 'note', 'verify']},
  {id: 'client', label: 'Client Viewer', can: ['view']},
];
export const people = {lead: 'Ngozi Ibe', coordinator: 'Kayode Ajayi', customs: 'Hassan Musa', client: 'Ruth Daniels'};

const ev = (id, milestone, day, source, quote, confidence) => ({id, milestone, day, source, quote, confidence, status: 'extracted'});
const sh = (o) => ({notes: [], resolved: {}, closed: null, ...o});

/** Each shipment's events come from correspondence and documents; status starts as 'extracted' until staff verify. */
export const shipments = [
  sh({id: 'BV-2041', client: 'Adewale Foods', container: 'MSKU 418273-5', route: 'Shanghai → Tema → Lagos (Apapa)', vessel: 'MV Orion Bay', freeDays: 7,
    docs: {bl: true, invoice: true, packing: true, form_m: false},
    events: [
      ev('e1', 'Departed origin', 2, 'Carrier email · 2 Nov', '“MV Orion Bay sailed Shanghai 02/11.”', 0.97),
      ev('e2', 'Transshipped', 9, 'Agent email · 10 Nov', '“Box loaded on feeder at Tema 09/11.”', 0.9),
      ev('e3', 'ETA destination', 15, 'Carrier arrival notice (PDF)', '“ETA Apapa: 15-Nov-2026”', 0.94),
      ev('e4', 'ETA destination', 18, 'Agent email · 12 Nov', '“Feeder delayed by congestion, now expecting the 18th.”', 0.86),
    ]}),
  sh({id: 'BV-2042', client: 'Lumen Pharma', container: 'CMAU 772910-1', route: 'Mumbai → Lagos (Tin Can)', vessel: 'MV Kestrel', freeDays: 4,
    docs: {bl: true, invoice: true, packing: true, form_m: true},
    events: [
      ev('e1', 'Departed origin', -7, 'Carrier email · 25 Oct', '“Sailed Nhava Sheva 24 Oct.”', 0.96),
      ev('e2', 'Berthed', 11, 'Terminal email · 11 Nov', '“MV Kestrel berthed Tin Can berth 4.”', 0.93),
      ev('e3', 'Discharged', 12, 'Terminal report (PDF)', '“Container CMAU7729101 discharged 12/11.”', 0.91),
    ]}),
  sh({id: 'BV-2043', client: 'Okafor Building Supplies', container: 'HLXU 330418-2', route: 'Antwerp → Lagos (Apapa)', vessel: 'MV Northern Star', freeDays: 7,
    docs: {bl: true, invoice: true, packing: false, form_m: true},
    events: [
      ev('e1', 'Departed origin', 1, 'Carrier email · 1 Nov', '“Vessel departed Antwerp 01.11.”', 0.95),
      ev('e2', 'Berthed', 13, 'Agent WhatsApp export', '“Northern Star don berth this morning.”', 0.72),
      ev('e3', 'Customs released', 13, 'Broker email · 13 Nov', '“Customs release obtained for HLXU3304182.”', 0.88),
      ev('e4', 'Customs released', null, 'Shipping line portal export', '“Release status: PENDING”', 0.81),
    ]}),
  sh({id: 'BV-2044', client: 'Greenfield Agro', container: 'TGHU 902114-7', route: 'Santos → Lagos (Apapa)', vessel: 'MV Coral Reach', freeDays: 10,
    docs: {bl: true, invoice: true, packing: true, form_m: true},
    events: [
      ev('e1', 'Departed origin', 4, 'Carrier email · 4 Nov', '“Sailed Santos 04/11.”', 0.97),
      ev('e2', 'ETA destination', 24, 'Carrier arrival notice (PDF)', '“ETA Lagos 24 November.”', 0.95),
    ]}),
  sh({id: 'BV-2045', client: 'Adewale Foods', container: 'MSCU 551203-9', route: 'Ningbo → Lomé → Lagos (Tin Can)', vessel: 'MV Harbour Light', freeDays: 5,
    docs: {bl: false, invoice: true, packing: true, form_m: true},
    events: [
      ev('e1', 'Departed origin', -4, 'Carrier email · 28 Oct', '“Departed Ningbo 27/10.”', 0.96),
      ev('e2', 'Berthed', 9, 'Terminal email · 9 Nov', '“Harbour Light alongside Tin Can.”', 0.92),
      ev('e3', 'Discharged', 10, 'Terminal report (PDF)', '“MSCU5512039 discharged 10/11.”', 0.9),
    ]}),
  sh({id: 'BV-2046', client: 'Kano Textiles', container: 'OOLU 640338-0', route: 'Chittagong → Colombo → Lagos (Apapa)', vessel: 'MV Bengal Tide', freeDays: 7,
    docs: {bl: true, invoice: true, packing: true, form_m: true},
    events: [
      ev('e1', 'Departed origin', 3, 'Carrier email · 3 Nov', '“Sailed Chittagong 03/11.”', 0.95),
      ev('e2', 'Transshipped', null, 'Agent email · 13 Nov', '“No confirmation yet of loading on mother vessel at Colombo.”', 0.64),
    ]}),
];

export const fmt = (day) => (day == null ? 'no date' : day >= 1 ? `${day} Nov` : `${31 + day} Oct`);
