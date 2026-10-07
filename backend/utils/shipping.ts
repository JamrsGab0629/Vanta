// Shipping estimate based on distance from the store (Bulacan).
// Distance is measured from the store to the province capital, then scaled up
// because roads are longer than a straight line. Tune the numbers below.

export interface ShippingRate {
    province: string;
    region: string;
    fee: number;
    delivery: string;
}

export const METRO_MANILA = "Metro Manila (NCR)";

// ---- Pricing knobs ---------------------------------------------------------
const STORE = { lat: 14.84, lng: 120.81 }; // Malolos, Bulacan
const BASE_FEE = 80;        // ₱ for local delivery
const PER_KM = 0.25;        // ₱ per road kilometre
const SEA_SURCHARGE = 100;  // ₱ extra when a ferry / RoRo crossing is needed
const MAX_FEE = 650;        // never charge more than this
const ROAD_FACTOR = 1.3;    // straight line -> typical road distance
// -----------------------------------------------------------------------------

type Group = "Luzon" | "Visayas" | "Mindanao";
// [name, latitude, longitude, island?]  island = Luzon-group province that needs a ferry
type Row = [string, number, number, boolean?];

// Not served: Sulu and Batanes (left out on purpose).
const UNSERVED = ["sulu", "batanes"];

const REGIONS: { region: string; group: Group; provinces: Row[] }[] = [
    { region: "National Capital Region", group: "Luzon", provinces: [
        [METRO_MANILA, 14.60, 121.00],
    ]},
    { region: "Ilocos Region", group: "Luzon", provinces: [
        ["Ilocos Norte", 18.20, 120.59], ["Ilocos Sur", 17.57, 120.39],
        ["La Union", 16.62, 120.32], ["Pangasinan", 16.02, 120.23],
    ]},
    { region: "Cagayan Valley", group: "Luzon", provinces: [
        ["Cagayan", 17.61, 121.73], ["Isabela", 17.15, 121.89],
        ["Nueva Vizcaya", 16.48, 121.15], ["Quirino", 16.50, 121.52],
    ]},
    { region: "Central Luzon", group: "Luzon", provinces: [
        ["Aurora", 15.76, 121.56], ["Bataan", 14.68, 120.54], ["Bulacan", 14.84, 120.81],
        ["Nueva Ecija", 15.54, 121.09], ["Pampanga", 15.03, 120.69],
        ["Tarlac", 15.48, 120.60], ["Zambales", 15.33, 119.98],
    ]},
    { region: "CALABARZON", group: "Luzon", provinces: [
        ["Batangas", 13.76, 121.06], ["Cavite", 14.28, 120.87], ["Laguna", 14.28, 121.42],
        ["Quezon", 13.94, 121.62], ["Rizal", 14.59, 121.18],
    ]},
    { region: "MIMAROPA", group: "Luzon", provinces: [
        ["Marinduque", 13.45, 121.84, true], ["Occidental Mindoro", 13.22, 120.59, true],
        ["Oriental Mindoro", 13.41, 121.18, true], ["Palawan", 9.74, 118.74, true],
        ["Romblon", 12.58, 122.27, true],
    ]},
    { region: "Bicol Region", group: "Luzon", provinces: [
        ["Albay", 13.14, 123.74], ["Camarines Norte", 14.11, 122.96],
        ["Camarines Sur", 13.58, 123.28], ["Catanduanes", 13.58, 124.23, true],
        ["Masbate", 12.37, 123.62, true], ["Sorsogon", 12.97, 124.00],
    ]},
    { region: "Cordillera Administrative Region", group: "Luzon", provinces: [
        ["Abra", 17.60, 120.62], ["Apayao", 18.03, 121.18], ["Benguet", 16.46, 120.59],
        ["Ifugao", 16.79, 121.12], ["Kalinga", 17.41, 121.44], ["Mountain Province", 17.09, 120.98],
    ]},
    { region: "Western Visayas", group: "Visayas", provinces: [
        ["Aklan", 11.70, 122.36], ["Antique", 10.75, 121.94], ["Capiz", 11.58, 122.75],
        ["Guimaras", 10.60, 122.60], ["Iloilo", 10.72, 122.56], ["Negros Occidental", 10.68, 122.95],
    ]},
    { region: "Central Visayas", group: "Visayas", provinces: [
        ["Bohol", 9.65, 123.85], ["Cebu", 10.32, 123.89],
        ["Negros Oriental", 9.31, 123.31], ["Siquijor", 9.21, 123.51],
    ]},
    { region: "Eastern Visayas", group: "Visayas", provinces: [
        ["Biliran", 11.56, 124.40], ["Eastern Samar", 11.61, 125.43], ["Leyte", 11.24, 125.00],
        ["Northern Samar", 12.50, 124.64], ["Samar", 11.78, 124.89], ["Southern Leyte", 10.13, 124.84],
    ]},
    { region: "Zamboanga Peninsula", group: "Mindanao", provinces: [
        ["Zamboanga del Norte", 8.59, 123.34], ["Zamboanga del Sur", 7.83, 123.44],
        ["Zamboanga Sibugay", 7.78, 122.59],
    ]},
    { region: "Northern Mindanao", group: "Mindanao", provinces: [
        ["Bukidnon", 8.15, 125.13], ["Camiguin", 9.25, 124.72], ["Lanao del Norte", 8.05, 123.99],
        ["Misamis Occidental", 8.49, 123.80], ["Misamis Oriental", 8.48, 124.65],
    ]},
    { region: "Davao Region", group: "Mindanao", provinces: [
        ["Davao de Oro", 7.61, 125.97], ["Davao del Norte", 7.45, 125.81],
        ["Davao del Sur", 6.75, 125.36], ["Davao Occidental", 6.41, 125.61],
        ["Davao Oriental", 6.95, 126.22],
    ]},
    { region: "SOCCSKSARGEN", group: "Mindanao", provinces: [
        ["Cotabato", 7.01, 125.09], ["Sarangani", 6.10, 125.29],
        ["South Cotabato", 6.50, 124.85], ["Sultan Kudarat", 6.63, 124.60],
    ]},
    { region: "Caraga", group: "Mindanao", provinces: [
        ["Agusan del Norte", 9.12, 125.53], ["Agusan del Sur", 8.60, 125.91],
        ["Dinagat Islands", 10.00, 125.57], ["Surigao del Norte", 9.79, 125.49],
        ["Surigao del Sur", 9.08, 126.20],
    ]},
    { region: "BARMM", group: "Mindanao", provinces: [
        ["Basilan", 6.70, 121.97], ["Lanao del Sur", 8.00, 124.29],
        ["Maguindanao del Norte", 7.20, 124.25], ["Maguindanao del Sur", 6.72, 124.80],
        ["Tawi-Tawi", 5.03, 119.77],
    ]},
];

const toRad = (deg: number) => (deg * Math.PI) / 180;

const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
};

const buildRate = (name: string, region: string, group: Group, lat: number, lng: number, island: boolean): ShippingRate => {
    const roadKm = haversineKm(STORE.lat, STORE.lng, lat, lng) * ROAD_FACTOR;
    const sea = group !== "Luzon" || island;

    const raw = BASE_FEE + roadKm * PER_KM + (sea ? SEA_SURCHARGE : 0);
    const fee = Math.round(Math.min(raw, MAX_FEE) / 5) * 5; // nearest ₱5

    const minDays = 1 + Math.ceil(roadKm / 400) + (sea ? 2 : 0);
    const maxDays = minDays + (sea ? 2 : 1);

    const area =
        name === "Bulacan" ? "Local Delivery"
        : name === METRO_MANILA ? "Metro Manila"
        : group === "Luzon" ? (island ? "Luzon Islands" : "Rest of Luzon")
        : group;

    return { province: name, region, fee, delivery: `${minDays} to ${maxDays} business days (${area})` };
};

const RATES: ShippingRate[] = REGIONS.flatMap(({ region, group, provinces }) =>
    provinces.map(([name, lat, lng, island]) => buildRate(name, region, group, lat, lng, !!island))
).sort((a, b) => a.province.localeCompare(b.province));

const BY_NAME = new Map(RATES.map((r) => [r.province.toLowerCase(), r]));

export const listShippingRates = (): ShippingRate[] => RATES;

export const getShippingQuote = (province: unknown): ShippingRate | null =>
    typeof province === "string" ? BY_NAME.get(province.trim().toLowerCase()) ?? null : null;

export const isUnservedProvince = (province: unknown): boolean =>
    typeof province === "string" && UNSERVED.includes(province.trim().toLowerCase());
