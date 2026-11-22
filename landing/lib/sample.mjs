export const STUDIO = {
  cashToday: 6000,
  invoices: [
    { id: "INV-104", client: "Reddy\u2013Varma", amount: 11000, day: 3 },
    { id: "INV-105", client: "Lakshmi & Arjun", amount: 15000, day: 6 },
    { id: "INV-103", client: "Mehta Infotech", amount: 6000, day: 10 },
    { id: "INV-102", client: "Sai Teja", amount: 3500, day: 12 },
    { id: "INV-108", client: "Meghana & Rohit", amount: 20000, day: 30 },
    { id: "INV-106", client: "Lakshmi & Arjun", amount: 35000, day: 40 },
    { id: "INV-109", client: "Meghana & Rohit", amount: 45000, day: 75 },
  ],
  // INV-101 is overdue and deliberately NOT in the forecast.
  overdue: { id: "INV-101", client: "Kiran & Divya", amount: 8000 },
  bills: [
    { label: "Ravi crew", amount: 6000, day: 4, movable: 0 },
    { label: "LensHub", amount: 4000, day: 4, movable: 7 },
    { label: "Camera EMI", amount: 7500, day: 8, movable: 0 },
    { label: "Camera EMI", amount: 7500, day: 38, movable: 0 },
    { label: "Camera EMI", amount: 7500, day: 68, movable: 0 },
    { label: "Kavya editor", amount: 5000, day: 15, movable: 5 },
    { label: "Cloud storage", amount: 1500, day: 20, movable: 0 },
    { label: "Cloud storage", amount: 1500, day: 50, movable: 0 },
    { label: "Cloud storage", amount: 1500, day: 80, movable: 0 },
    { label: "Lakshmi & Arjun crew", amount: 12000, day: 21, movable: 0 },
    { label: "Photo lab", amount: 9000, day: 35, movable: 10 },
    { label: "Meghana & Rohit crew", amount: 14000, day: 60, movable: 0 },
  ],
};
