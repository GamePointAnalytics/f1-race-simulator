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

function startRace(driverId, circuitId, tyreId) {
    userDriverId = driverId;
    const circuit = CIRCUITS.find(c => c.id === circuitId);

    engine = new RaceEngine(DRIVERS, circuit, userDriverId, tyreId);
    engine.onUpdate = onGameUpdate;
    engine.onLapComplete = onLapComplete;
    engine.onRaceFinish = onRaceFinish;
    engine.start();

    ui.initRaceView(circuit.name, circuit.laps, circuit.path);

    // Bind Controls
    setupControls();

    // Start Loop
    let lastTime = performance.now();
    gameLoopId = requestAnimationFrame(function loop(now) {
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        // Time Scale: 5x real time
        engine.update(dt * 5);

        if (!engine.isRaceOver) requestAnimationFrame(loop);
    });
}

function onGameUpdate(drivers, currentLap) {
    ui.updateLeaderboard(drivers, userDriverId);
    ui.elements.lapCounter.textContent = `Lap ${currentLap} / ${engine.laps}`;

    const startLights = document.getElementById('race-circuit-name'); // temp hack locator

    const me = drivers.find(d => d.id === userDriverId);
    if (me) {
        ui.updateTelemetry(me);
        ui.updateTrackMap(me, engine.getTrackLength());
    }
}

function onLapComplete(driver) {
    if (driver.id === userDriverId) {
        ui.addMessage(`Lap ${driver.lap} Complete. Gap to leader: ${driver.gapToLeader.toFixed(1)}s`);
    }
}

function onRaceFinish(results) {
    cancelAnimationFrame(gameLoopId);
    ui.renderPostRace(results, userDriverId, () => location.reload());
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
