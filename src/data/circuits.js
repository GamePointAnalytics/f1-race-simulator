export const TYRE_COMPOUNDS = {
    SOFT: { name: "Soft", color: "#FF3333", speedParams: { base: -0.6, deg: 0.05 }, life: 34 },
    MEDIUM: { name: "Medium", color: "#FFFF33", speedParams: { base: 0.2, deg: 0.05 }, life: 40 },
    HARD: { name: "Hard", color: "#FFFFFF", speedParams: { base: 1.5, deg: 0.02 }, life: 65 },
    INTER: { name: "Inter", color: "#33CC33", speedParams: { base: 6.0, deg: 0.05 }, life: 40 },
    WET: { name: "Wet", color: "#3333FF", speedParams: { base: 12.0, deg: 0.05 }, life: 30 }
};

export const CIRCUITS = [
    {
        id: "oz",
        name: "Australia",
        country: "Australia",
        laps: 58,
        baseLapTime: 78.0,
        rainProbability: 0.1,
        tyreWearFactor: 1.1,
        pitTimeLoss: 22.0,
        drsZones: [[0.1, 0.2], [0.75, 0.85]],
        // Albert Park: High Speed Lake
        path: "M 300 100 L 700 100 Q 750 100 750 150 L 730 300 Q 720 330 750 350 L 800 400 Q 820 430 800 450 L 600 500 Q 550 510 500 480 L 400 420 Q 350 400 300 420 L 200 450 Q 150 470 120 420 L 100 280 Q 90 230 150 180 L 250 130 Q 280 110 300 100 Z"
    },
    {
        id: "china",
        name: "China",
        country: "China",
        laps: 56,
        baseLapTime: 95.0,
        rainProbability: 0.2,
        tyreWearFactor: 1.2,
        pitTimeLoss: 24.0,
        drsZones: [[0.45, 0.55], [0.92, 0.98]],
        // Shanghai: The "Shang" spiral T1 + Long Back Straight
        // Start/Finish straight -> T1 Spiral (Right) -> T6 Hairpin -> Back Straight -> Final Hairpin
        path: "M 250 450 L 600 450 L 650 450 Q 750 450 750 350 Q 750 250 650 250 Q 550 250 500 300 L 450 350 L 350 350 Q 300 350 300 300 L 300 150 Q 300 100 350 100 L 850 100 L 900 150 Q 920 200 850 200 L 800 200 L 600 200 L 500 150 L 400 150 L 300 200 L 250 300 L 250 400 L 250 450 Z"
    },
    {
        id: "suzuka",
        name: "Japan",
        country: "Japan",
        laps: 53,
        baseLapTime: 90.0,
        rainProbability: 0.25,
        tyreWearFactor: 1.3,
        pitTimeLoss: 26.0,
        drsZones: [[0.05, 0.15]],
        // Suzuka: True Figure 8. 
        // Start -> S Curves (Up) -> Degner -> Underpass -> Hairpin -> Spoon -> Crossover (Over) -> 130R -> Casio
        path: "M 200 400 L 400 400 Q 450 400 450 350 L 400 300 Q 350 250 400 200 L 500 200 Q 550 200 550 250 L 500 300 L 600 300 L 700 250 Q 750 200 700 150 L 600 150 L 500 150 Q 450 150 450 200 L 450 250 L 450 300 L 400 300 Q 350 300 300 350 L 250 400 Q 200 450 200 400 Z"
    },
    {
        id: "bahrain",
        name: "Bahrain",
        country: "Bahrain",
        laps: 57,
        baseLapTime: 91.0,
        rainProbability: 0.0,
        tyreWearFactor: 1.4,
        pitTimeLoss: 23.0,
        drsZones: [[0.1, 0.2], [0.4, 0.5], [0.9, 0.98]],
        // Sakhir: Stop-start
        path: "M 200 500 L 600 500 Q 650 500 650 450 L 600 400 L 450 400 Q 400 400 400 350 L 400 250 Q 400 200 450 200 L 700 200 Q 750 200 750 250 L 800 350 Q 820 400 850 350 L 900 300 Q 920 250 880 220 L 700 100 Q 650 50 600 100 L 400 200 L 300 200 Q 250 200 220 250 L 200 350 Q 180 450 200 500 Z"
    },
    {
        id: "jeddah",
        name: "Saudi Arabia",
        country: "Saudi Arabia",
        laps: 50,
        baseLapTime: 88.0,
        rainProbability: 0.0,
        tyreWearFactor: 0.9,
        pitTimeLoss: 20.0,
        drsZones: [[0.2, 0.3], [0.6, 0.7], [0.9, 0.95]],
        // Jeddah: Fast flowing snake
        path: "M 100 500 C 150 450 200 450 250 500 T 350 500 T 450 500 T 550 500 T 650 500 T 750 500 L 850 400 C 800 350 750 350 700 400 T 600 400 T 500 400 T 400 400 T 300 400 T 200 400 Z"
    },
    {
        id: "miami",
        name: "Miami",
        country: "USA",
        laps: 57,
        baseLapTime: 89.0,
        rainProbability: 0.1,
        tyreWearFactor: 1.0,
        pitTimeLoss: 22.0,
        drsZones: [[0.3, 0.45], [0.8, 0.9]],
        // Miami: Around the stadium
        path: "M 200 450 L 600 450 Q 650 450 650 400 L 650 300 Q 650 250 600 250 L 500 250 L 450 200 L 500 150 L 700 150 Q 750 150 720 100 L 600 50 L 400 50 Q 300 50 300 150 L 300 300 Q 300 350 250 400 L 200 450 Z"
    },
    {
        id: "imola",
        name: "Imola",
        country: "Italy",
        laps: 63,
        baseLapTime: 76.0,
        rainProbability: 0.15,
        tyreWearFactor: 1.1,
        pitTimeLoss: 24.0,
        drsZones: [[0.0, 0.15]],
        // Imola: Anti-clockwise Park
        path: "M 500 500 L 200 500 Q 150 500 150 450 L 120 300 Q 100 250 150 200 L 300 150 L 400 100 Q 450 80 500 100 L 700 200 Q 750 220 700 250 L 600 300 L 800 400 Q 820 450 750 450 L 600 450 Q 550 450 500 500 Z"
    },
    {
        id: "monaco",
        name: "Monaco",
        country: "Monaco",
        laps: 78,
        baseLapTime: 71.0,
        rainProbability: 0.15,
        tyreWearFactor: 1.2,
        pitTimeLoss: 24.0,
        drsZones: [[0.0, 0.1]],
        path: "M 250 450 L 450 450 Q 480 450 480 420 L 460 350 Q 450 320 480 300 L 550 280 Q 580 270 580 240 L 570 200 Q 560 170 530 180 L 500 190 Q 470 200 460 170 L 450 140 Q 440 110 470 110 L 550 110 Q 600 110 650 140 L 750 200 Q 800 230 750 260 L 650 280 Q 620 290 620 320 L 620 350 Q 620 380 580 380 L 500 380 Q 470 380 450 410 L 430 430 Q 410 450 350 450 Z"
    },
    {
        id: "barcelona",
        name: "Spain",
        country: "Spain",
        laps: 66,
        baseLapTime: 78.0,
        rainProbability: 0.05,
        tyreWearFactor: 1.4,
        pitTimeLoss: 22.0,
        drsZones: [[0.0, 0.15], [0.45, 0.55]],
        path: "M 200 450 L 600 450 Q 650 450 680 400 L 700 350 Q 720 300 680 280 L 600 250 Q 550 230 550 200 L 550 150 Q 550 100 500 100 L 350 100 Q 300 100 280 150 L 250 250 Q 230 300 200 350 L 150 400 Q 120 450 200 450 Z"
    },
    {
        id: "canada",
        name: "Canada",
        country: "Canada",
        laps: 70,
        baseLapTime: 73.0,
        rainProbability: 0.2,
        tyreWearFactor: 1.0,
        pitTimeLoss: 18.0,
        drsZones: [[0.45, 0.55], [0.9, 0.98]],
        // Montreal: Long straights + Hairpin
        path: "M 200 450 L 700 450 L 800 400 L 800 300 L 750 250 L 700 250 L 650 200 L 300 200 Q 250 200 220 250 L 200 400 L 200 450 Z"
    },
    {
        id: "austria",
        name: "Austria",
        country: "Austria",
        laps: 71,
        baseLapTime: 65.0,
        rainProbability: 0.3,
        tyreWearFactor: 1.1,
        pitTimeLoss: 20.0,
        drsZones: [[0.0, 0.15], [0.25, 0.4]],
        // RBR: Simple angular
        path: "M 200 400 L 600 300 L 800 300 Q 850 300 850 350 L 800 450 L 400 450 L 200 400 Z"
    },
    {
        id: "silverstone",
        name: "Great Britain",
        country: "UK",
        laps: 52,
        baseLapTime: 87.0,
        rainProbability: 0.25,
        tyreWearFactor: 1.3,
        pitTimeLoss: 29.0,
        drsZones: [[0.2, 0.35], [0.6, 0.75]],
        path: "M 400 500 L 600 500 Q 650 500 680 470 L 750 400 Q 800 350 750 300 L 700 250 Q 680 230 700 210 L 750 160 Q 800 110 750 60 L 600 50 Q 550 40 500 60 L 400 100 L 200 100 Q 150 100 120 130 L 100 200 L 150 300 Q 180 350 220 350 L 300 350 Q 350 350 370 400 L 400 500 Z"
    },
    {
        id: "spa",
        name: "Belgium",
        country: "Belgium",
        laps: 44,
        baseLapTime: 104.0,
        rainProbability: 0.4,
        tyreWearFactor: 1.2,
        pitTimeLoss: 28.0,
        drsZones: [[0.05, 0.2], [0.8, 0.95]],
        path: "M 350 450 L 400 500 L 450 450 L 550 400 Q 600 380 650 380 L 800 380 Q 850 380 880 350 L 900 300 Q 920 250 880 220 L 800 180 L 700 150 Q 650 130 650 100 L 650 50 Q 650 20 620 20 L 550 20 Q 520 20 500 50 L 400 150 Q 380 170 350 170 L 200 170 Q 150 170 130 200 L 100 250 Q 80 280 100 310 L 150 350 Q 180 380 220 380 L 300 380 Q 330 380 350 420 Z"
    },
    {
        id: "hungary",
        name: "Hungary",
        country: "Hungary",
        laps: 70,
        baseLapTime: 76.0,
        rainProbability: 0.2,
        tyreWearFactor: 1.0,
        pitTimeLoss: 21.0,
        drsZones: [[0.0, 0.1], [0.15, 0.25]],
        // Hungaroring: Twisty bowl
        path: "M 300 500 L 700 500 Q 750 500 750 450 L 700 400 L 600 400 Q 550 400 550 350 L 600 300 L 700 300 L 800 250 Q 850 200 800 150 L 700 150 Q 650 150 600 200 L 500 200 Q 450 200 400 150 L 300 150 Q 250 150 250 200 L 250 350 Q 250 400 200 400 L 150 400 Q 100 450 150 500 L 300 500 Z"
    },
    {
        id: "zandvoort",
        name: "Netherlands",
        country: "Netherlands",
        laps: 72,
        baseLapTime: 71.0,
        rainProbability: 0.25,
        tyreWearFactor: 1.3,
        pitTimeLoss: 22.0,
        drsZones: [[0.0, 0.15], [0.3, 0.4]],
        // Zandvoort: Flowing dunes
        path: "M 300 500 L 600 500 Q 700 500 700 400 L 650 300 L 700 200 L 800 150 Q 850 100 800 50 L 600 50 Q 500 50 450 100 L 400 150 L 300 150 Q 200 150 150 250 L 150 400 Q 150 450 200 500 L 300 500 Z"
    },
    {
        id: "monza",
        name: "Italy",
        country: "Italy",
        laps: 53,
        baseLapTime: 81.0,
        rainProbability: 0.1,
        tyreWearFactor: 0.9,
        pitTimeLoss: 26.0,
        drsZones: [[0.1, 0.3], [0.7, 0.9]],
        path: "M 150 450 L 500 450 Q 520 450 530 430 L 540 410 Q 550 400 560 410 L 570 430 Q 580 450 600 450 L 800 450 Q 900 450 900 350 L 900 200 Q 900 150 850 150 L 820 150 Q 800 150 790 130 L 780 110 Q 770 100 760 110 L 750 130 Q 740 150 720 150 L 600 150 Q 500 150 450 100 L 400 50 Q 350 0 300 50 L 250 100 L 150 400 Q 100 450 150 450 Z"
    },
    {
        id: "baku",
        name: "Azerbaijan",
        country: "Azerbaijan",
        laps: 51,
        baseLapTime: 103.0,
        rainProbability: 0.05,
        tyreWearFactor: 0.9,
        pitTimeLoss: 21.0,
        drsZones: [[0.0, 0.2], [0.4, 0.5]],
        // Baku: Square city + Castle tight
        path: "M 100 500 L 900 500 L 900 400 L 800 400 L 800 300 L 700 300 L 700 200 L 600 200 L 500 200 Q 450 200 450 250 L 400 250 L 300 250 L 250 300 L 200 300 L 150 350 L 100 400 L 100 500 Z"
    },
    {
        id: "singapore",
        name: "Singapore",
        country: "Singapore",
        laps: 62,
        baseLapTime: 96.0,
        rainProbability: 0.3,
        tyreWearFactor: 1.1,
        pitTimeLoss: 28.0,
        drsZones: [[0.0, 0.1], [0.4, 0.5]],
        // Marina Bay: Complex city
        path: "M 200 500 L 600 500 L 650 450 L 700 450 L 750 400 L 800 400 L 850 350 L 850 300 L 800 250 L 700 250 L 650 200 L 600 200 L 550 150 L 400 150 L 350 200 L 300 200 L 250 250 L 200 300 L 150 400 L 200 500 Z"
    },
    {
        id: "austin",
        name: "USA (Austin)",
        country: "USA",
        laps: 56,
        baseLapTime: 96.0,
        rainProbability: 0.1,
        tyreWearFactor: 1.2,
        pitTimeLoss: 22.0,
        drsZones: [[0.2, 0.35], [0.9, 0.98]],
        // COTA: Hill + Esses
        path: "M 400 500 L 600 500 Q 650 450 600 400 Q 550 350 600 300 Q 650 250 600 200 L 400 200 L 300 200 Q 250 200 200 250 L 150 350 Q 120 400 150 450 L 200 500 L 400 500 Z"
    },
    {
        id: "mexico",
        name: "Mexico",
        country: "Mexico",
        laps: 71,
        baseLapTime: 77.0,
        rainProbability: 0.1,
        tyreWearFactor: 0.9,
        pitTimeLoss: 22.0,
        drsZones: [[0.0, 0.2], [0.3, 0.4]],
        // Mexico City: Stadium + Long Straight
        path: "M 200 500 L 800 500 Q 850 500 850 450 L 800 400 L 600 400 L 500 350 Q 450 300 500 250 L 600 200 L 500 150 Q 400 100 300 150 L 200 200 Q 150 250 200 300 L 200 500 Z"
    },
    {
        id: "interlagos",
        name: "Brazil",
        country: "Brazil",
        laps: 71,
        baseLapTime: 70.0,
        rainProbability: 0.3,
        tyreWearFactor: 1.0,
        pitTimeLoss: 25.0,
        drsZones: [[0.1, 0.25], [0.9, 1.0]],
        path: "M 300 450 L 600 500 Q 700 520 750 450 L 800 350 Q 820 300 750 250 L 600 250 Q 550 250 530 220 L 500 150 Q 480 100 450 120 L 350 150 Q 300 170 280 220 L 250 300 Q 230 350 260 400 L 300 450 Z"
    },
    {
        id: "vegas",
        name: "Las Vegas",
        country: "USA",
        laps: 50,
        baseLapTime: 93.0,
        rainProbability: 0.0,
        tyreWearFactor: 0.8,
        pitTimeLoss: 20.0,
        drsZones: [[0.3, 0.6], [0.8, 0.9]],
        // Vegas: The Pig
        path: "M 200 500 L 500 500 L 500 400 L 800 400 L 800 200 L 700 150 L 600 150 L 600 200 L 500 200 L 400 200 L 300 250 Q 250 300 200 400 L 200 500 Z"
    },
    {
        id: "qatar",
        name: "Qatar",
        country: "Qatar",
        laps: 57,
        baseLapTime: 82.0,
        rainProbability: 0.0,
        tyreWearFactor: 1.4,
        pitTimeLoss: 24.0,
        drsZones: [[0.0, 0.15]],
        // Lusail: Flowing Moto
        path: "M 300 500 L 700 500 Q 750 500 750 450 L 700 400 L 750 350 L 700 300 L 750 250 L 700 200 L 600 200 L 550 150 L 400 150 Q 350 150 350 200 L 300 300 L 200 300 Q 150 350 200 400 L 250 450 L 300 500 Z"
    },
    {
        id: "abudhabi",
        name: "Abu Dhabi",
        country: "UAE",
        laps: 58,
        baseLapTime: 84.0,
        rainProbability: 0.0,
        tyreWearFactor: 1.0,
        pitTimeLoss: 22.0,
        drsZones: [[0.3, 0.45], [0.55, 0.7]],
        // Yas Marina: Pistol shape
        path: "M 200 500 L 600 500 Q 650 500 650 450 L 650 400 L 800 400 L 850 350 L 800 300 L 650 300 L 600 250 L 500 250 L 500 200 L 400 200 L 400 300 L 300 300 Q 250 350 200 400 L 200 500 Z"
    },
    {
        id: "testing",
        name: "Testing - Barcelona",
        country: "Spain",
        laps: 5,
        baseLapTime: 78.0,
        rainProbability: 0.05,
        tyreWearFactor: 1.4,
        pitTimeLoss: 22.0,
        drsZones: [[0.0, 0.15], [0.45, 0.55]],
        // Reusing Barcelona Path
        path: "M 200 450 L 600 450 Q 650 450 680 400 L 700 350 Q 720 300 680 280 L 600 250 Q 550 230 550 200 L 550 150 Q 550 100 500 100 L 350 100 Q 300 100 280 150 L 250 250 Q 230 300 200 350 L 150 400 Q 120 450 200 450 Z"
    }
];
