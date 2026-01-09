import { DRIVERS } from "./data/drivers.js";
import { CIRCUITS } from "./data/circuits.js";
import { RaceEngine } from "./engine/RaceEngine.js";
import { UIManager } from "./ui/UIManager.js";

const ui = new UIManager();
let engine = null;
let userDriverId = null;
let gameLoopId = null;

// Initial Setup
ui.renderSelectionGrids(DRIVERS, CIRCUITS, startRace);

function startRace(driverId, circuitId, tyreId, difficulty) {
    console.log("Starting Race:", { driverId, circuitId, tyreId, difficulty });
    userDriverId = driverId;
    const circuit = CIRCUITS.find(c => c.id === circuitId);
    if (!circuit) console.error("Circuit not found!", circuitId);

    engine = new RaceEngine(DRIVERS, circuit, userDriverId, tyreId, difficulty);
    engine.onUpdate = onGameUpdate;
    engine.onLapComplete = onLapComplete;
    engine.onRaceFinish = onRaceFinish;
    engine.onRadioMessage = (msg) => ui.addMessage(`📻 ${msg}`);

    // --- WET START CHECK ---
    const isSlicks = ['SOFT', 'MEDIUM', 'HARD'].includes(tyreId);
    if (engine.weather.type === 'RAIN' && isSlicks) {
        // Show Warning
        ui.showWeatherWarning(
            () => { // On Switch
                // Switch user to Inters
                const me = engine.drivers.find(d => d.id === userDriverId);
                if (me) {
                    me.tyre = 'INTER';
                    ui.addMessage("Strategic Switch: Starting on Intermediates.");
                }
                beginGameLoop(circuit);
            },
            () => { // On Stay
                ui.addMessage("Brave Call: Starting on Slicks in the Rain!", true);
                beginGameLoop(circuit);
            }
        );
    } else {
        beginGameLoop(circuit);
    }
}

function beginGameLoop(circuit) {
    engine.start();
    ui.initRaceView(circuit.name, circuit.laps, circuit.path);
    setupControls();

    let lastTime = performance.now();
    gameLoopId = requestAnimationFrame(function loop(now) {
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        // Time Scale: 5x real time
        engine.update(dt * 5);

        if (!engine.isRaceOver) requestAnimationFrame(loop);
    });
}

function onGameUpdate(drivers, laps, temp, weather, scActive) {
    const scBanner = document.getElementById('sc-banner');
    if (scBanner) scBanner.style.display = scActive ? 'block' : 'none';

    ui.updateLeaderboard(drivers, userDriverId);
    ui.elements.lapCounter.textContent = `Lap ${laps} / ${engine.laps}`;

    // Update Temp
    if (temp) {
        const el = document.getElementById('track-temp');
        if (el) {
            el.textContent = `${temp.toFixed(0)}°C`;
            // Color coding
            if (temp > 30) el.style.color = '#ef4444'; // Hot
            else if (temp < 20) el.style.color = '#3b82f6'; // Cold
            else el.style.color = '#ff9f43'; // Normal
        }
    }

    // Update Weather
    if (weather) {
        const icon = document.getElementById('weather-icon');
        const text = document.getElementById('weather-text');
        const forecastEl = document.getElementById('weather-forecast');

        if (icon && text) {
            if (weather.type === 'RAIN') {
                icon.textContent = '🌧️';
                text.textContent = 'Rain';
            } else {
                icon.textContent = '☀️';
                text.textContent = 'Dry';
            }
        }

        if (forecastEl) {
            forecastEl.textContent = engine.getForecastText();
        }
    }

    const me = drivers.find(d => d.id === userDriverId);
    if (me) {
        ui.updateTelemetry(me);
        ui.updateTrackMap(me, engine.getTrackLength());
    }
}

function onLapComplete(driver) {
    if (driver.id === userDriverId) {
        let msg = `Lap ${driver.lap} Complete.`;

        if (driver.position === 1) {
            msg += " You are leading the race.";
        } else {
            // Find car ahead
            const ahead = engine.drivers.find(d => d.position === driver.position - 1);
            if (ahead) {
                const lastName = ahead.name.split(' ').pop();
                const gap = driver.gapToAhead.toFixed(1);
                msg += ` Gap to ${lastName}: +${gap}s`;
            } else {
                msg += ` Gap to Leader: +${driver.gapToLeader.toFixed(1)}s`;
            }
        }
        ui.addMessage(msg);
    }
}

function onRaceFinish(results) {
    cancelAnimationFrame(gameLoopId);
    ui.renderPostRace(results, userDriverId, () => {
        console.log("Returning to Garage...");
        window.location.reload();
    });
}

function setupControls() {
    const me = () => engine.drivers.find(d => d.id === userDriverId);

    document.querySelectorAll('.strat-btn').forEach(btn => {
        btn.onclick = () => {
            const driver = me();
            if (!driver) return;

            document.querySelectorAll('.strat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            driver.mode = btn.dataset.mode.toUpperCase();
            ui.addMessage(`Mode switched to: ${driver.mode}`, true);
        };
    });

    // Radio Toggle
    const radioBtn = document.getElementById('radio-toggle-btn');
    if (radioBtn) {
        radioBtn.onclick = () => {
            const txt = document.getElementById('radio-mode-text');
            if (engine.radioVerbosity === 'VERBOSE') {
                engine.radioVerbosity = 'MINIMAL';
                if (txt) txt.textContent = 'MIN';
                ui.addMessage("Radio: Minimal Mode (Critical Only)");
            } else {
                engine.radioVerbosity = 'VERBOSE';
                if (txt) txt.textContent = 'MAX';
                ui.addMessage("Radio: Verbose Mode (Strategy & Weather)");
            }
        };
    }

    const boxBtn = document.getElementById('box-btn');
    const pitOptions = document.getElementById('pit-options');

    boxBtn.onclick = () => {
        const driver = me();
        if (driver.boxThisLap) {
            // Cancel Box (if not already entered)
            if (!driver.isInPit) {
                driver.boxThisLap = false;
                boxBtn.classList.remove('pending');
                pitOptions.classList.add('hidden');
                ui.addMessage("Pit Call CANCELLED.");
            }
        } else {
            driver.boxThisLap = true;
            boxBtn.classList.add('pending');
            pitOptions.classList.remove('hidden');
            ui.addMessage("BOX BOX BOX. Confirm Tyre Choice.", true);
        }
    };

    document.querySelectorAll('.tyre-select').forEach(btn => {
        btn.onclick = () => {
            const driver = me();
            if (driver.boxThisLap) {
                driver.pitPendingTyre = btn.dataset.tyre;
                ui.addMessage(`Tyre Selection Confirmed: ${btn.dataset.tyre}`);
                // Don't close menu to allow changes
            }
        };
    });
}
