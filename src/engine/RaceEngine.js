import { TYRE_COMPOUNDS } from "../data/circuits.js";

export class RaceEngine {
    constructor(drivers, circuit, userDriverId, userStartTyre) {
        this.circuit = circuit;
        this.drivers = drivers.map(d => this.initDriver(d, userDriverId, userStartTyre));
        this.laps = circuit.laps;
        this.currentLap = 0; // Leading car lap
        this.weather = { type: 'DRY', rainIntensity: 0.0 }; // 0.0 to 1.0
        // Random Track Temp (15C to 40C)
        this.trackTemp = Math.floor(Math.random() * 25) + 15;
        this.isRaceOver = false;
        this.chequeredFlag = false;
        this.nextFinishRank = 1;

        // Game Loop State
        this.time = 0;
        this.leaderDistance = 0;

        // Events
        this.onUpdate = null;
        this.onLapComplete = null;
        this.onRaceFinish = null;
    }

    initDriver(data, userId, userStartTyre) {
        // AI Tyre Choice: Random Soft or Medium
        let startTyre = Math.random() > 0.5 ? 'SOFT' : 'MEDIUM';
        if (data.id === userId) startTyre = userStartTyre;

        return {
            ...data,
            isUser: data.id === userId,
            distance: 0, // meters
            lap: 0,
            lastLapTime: 0,
            gapToLeader: 0,
            position: 0,
            hasFinished: false,
            hasFinished: false,
            finishTime: 0, // Seconds
            lapsCompleted: 0,

            // Car State
            tyre: startTyre,
            tyreAge: 0, // Laps
            tyreHealth: 1.0, // 100%
            fuel: 100, // kg (not fully used yet)

            // Strategy State
            mode: 'BALANCED', // PUSH, BALANCED, CONSERVE
            boxThisLap: false,
            pitPendingTyre: null,
            isInPit: false,
            pitTimer: 0
        };
    }

    start() {
        // Sort grid by speed initially (Qualifying sim)
        this.drivers.sort((a, b) => b.speed - a.speed);
        this.drivers.forEach((d, i) => d.position = i + 1);
    }

    update(dt) { // dt in seconds
        // If everyone finished, stop
        if (this.drivers.every(d => d.hasFinished)) {
            if (!this.isRaceOver) this.finishRace();
            return;
        }

        this.time += dt;

        // Sort drivers by distance to determine position
        // This is simplified; in reality position checks happen at checkpoints.
        // We will just keep them sorted for the leaderboard.
        // Sort drivers: Finished drivers by Rank, Active by Distance
        const activeDrivers = [...this.drivers];
        activeDrivers.sort((a, b) => {
            if (a.hasFinished && b.hasFinished) return a.finishRank - b.finishRank;
            if (a.hasFinished) return -1; // a finished, b didn't -> a is ahead
            if (b.hasFinished) return 1;
            return b.distance - a.distance;
        });

        // Leader ref
        const leader = activeDrivers[0];

        // Flag Logic
        if (!this.chequeredFlag && leader.lap >= this.laps) {
            this.chequeredFlag = true; // Leader finished!
            leader.hasFinished = true;
            leader.finishRank = this.nextFinishRank++;
            leader.position = leader.finishRank;
            leader.finishTime = this.time;
            leader.lapsCompleted = leader.lap;
        }

        this.leaderDistance = leader.distance;
        this.currentLap = Math.min(Math.floor(leader.distance / this.getTrackLength()) + 1, this.laps); // Cap at max laps

        // Update each driver
        this.drivers.forEach(driver => {
            if (driver.hasFinished) return;

            // Pit Limit / Stop Logic
            if (driver.isInPit) {
                driver.pitTimer -= dt;
                if (driver.pitTimer <= 0) {
                    this.exitPit(driver);
                }
                return; // Not moving on track
            }

            // Move Car
            // Calculate Gap to Car Ahead
            let gapToAhead = 999;
            if (driver.position > 1) {
                const carAhead = activeDrivers.find(d => d.position === driver.position - 1);
                if (carAhead) {
                    // Gap in seconds approx
                    gapToAhead = (carAhead.distance - driver.distance) / 60.0;
                }
            }
            driver.gapToAhead = gapToAhead;

            const speed = this.calculateSpeed(driver, gapToAhead);
            const moveDist = speed * dt;
            const oldDist = driver.distance;
            driver.distance += moveDist;

            // Lap Complete Check
            const trackLen = this.getTrackLength();
            const currentLapCount = Math.floor(driver.distance / trackLen);
            const oldLapCount = Math.floor(oldDist / trackLen);

            if (currentLapCount > oldLapCount) {
                this.handleLapComplete(driver, currentLapCount);
            }

            // Finish Line Check (If Flag is out)
            // If flag is out (leader already finished), ANYONE crossing line finishes race
            // regardless of their lap count (lapped cars finish a lap down).
            const isCrossing = currentLapCount > oldLapCount;
            if (this.chequeredFlag && isCrossing) {
                if (!driver.hasFinished) {
                    driver.hasFinished = true;
                    driver.finishRank = this.nextFinishRank++;
                    driver.position = driver.finishRank; // Lock position
                    driver.finishTime = this.time;
                    driver.lapsCompleted = currentLapCount; // Store final laps
                }
                return;
            }

            // Pit Entry (Only if NOT last lap)
            if (driver.boxThisLap && currentLapCount > oldLapCount && !this.chequeredFlag && currentLapCount < this.laps) {
                // He actually crossed the line, but let's say pit entry is right before line.
                // We'll teleport him to pit state.
                this.enterPit(driver);
            }

            // Calculate Gap
            // Gap = (LeaderDist - DriverDist) / AvgSpeed
            // Very rough approx
            driver.gapToLeader = (this.leaderDistance - driver.distance) / 60.0; // Assume 60m/s avg

            // Tyre Wear
            this.applyTyreWear(driver, dt);
        });

        // Update positions array
        activeDrivers.forEach((d, i) => d.position = i + 1);

        if (this.onUpdate) this.onUpdate(activeDrivers, this.currentLap, this.trackTemp);
    }

    calculateSpeed(driver, gapToAhead) {
        // Base Speed (m/s)
        // Avg F1 track ~5000m. ~80s lap. => ~62m/s.
        const baseSpeed = this.getTrackLength() / this.circuit.baseLapTime;

        // Driver Skill Mod (Reduced impact for tighter racing)
        // Range 80-99. Delta 19. 19 * 0.05 = 0.95% variance (~0.8s/lap)
        const skillMod = (driver.speed - 90) * 0.08; // Increased slightly from 0.05

        // Tyre Mod
        // Wear effect: Max 1.5s drop off
        const wearPenalty = (1.0 - driver.tyreHealth) * 2.0; // Higher penalty for wear

        // Mode Mod
        let modeMod = 0;
        if (driver.mode === 'PUSH') modeMod = 1.2; // Reduced from 1.5
        if (driver.mode === 'CONSERVE') modeMod = -1.2;

        // DRS / Slipstream (If within 1s AND in DRS Zone)
        let drsMod = 0;

        // Calculate Lap Progress (0.0 - 1.0)
        const trackLen = this.getTrackLength();
        const progress = (driver.distance % trackLen) / trackLen;

        let inDrsZone = false;
        if (this.circuit.drsZones) {
            inDrsZone = this.circuit.drsZones.some(zone => {
                // Simplified: just standard ranges for now.
                return progress >= zone[0] && progress <= zone[1];
            });
        } else {
            inDrsZone = true;
        }

        let aeroMod = 0;

        if (gapToAhead < 1.0) {
            if (inDrsZone) {
                drsMod = 2.0; // Reduced from 3.5 to stabilize overtakes
            } else {
                // Dirty Air: Drag penalty when close but no DRS
                aeroMod = -0.5;
            }
        } else if (gapToAhead < 0.8) {
            // Slipstream (if very close) but logic above handles < 1.0
            // Let's leave slipstream as implied by reduced Aero drag in reality? 
            // In F1, corners = dirty air (bad), straights = tow (good).
            // Simplified: No DRS zone = dirty air penalty in corners.
        }

        // Random Fluctuation (Consistency check)
        // Consistency 80-99. 
        // high consistency = low random variance (e.g. +/- 0.1%)
        // low consistency = high random variance (e.g. +/- 0.5%)
        const variance = (100 - driver.consistency) * 0.05; // e.g. (100-80)*0.02 = 0.4%
        const randomPace = (Math.random() - 0.5) * variance;

        // Tyre Base Delta (converted to speed factor approx)
        // Hard is slower (positive base). Soft is faster (0 base).
        // 1.0s lap time diff on 80s lap is 1.25%.
        const tyre = TYRE_COMPOUNDS[driver.tyre];
        let tyrePaceDelta = -tyre.speedParams.base;

        // Temperature Performance Penalty (Hard tyres struggle in cold < 20C)
        if (driver.tyre === 'HARD' && this.trackTemp < 20) {
            // e.g. at 10C, penalty is severe. at 19C, mild.
            const coldFactor = (20 - this.trackTemp) * 0.1; // 0.1% per degree -> small speed loss
            tyrePaceDelta -= coldFactor;
        }

        const totalModPct = (skillMod + tyrePaceDelta + modeMod + drsMod + aeroMod - (wearPenalty * 10) + randomPace);

        return baseSpeed * (1 + (totalModPct / 100));
    }

    applyTyreWear(driver, dt) {
        const tyre = TYRE_COMPOUNDS[driver.tyre];

        // Base wear per second with some randomness per driver
        // Use ID char code as seed for consistent randomness? Just Math.random ok for now.
        let wearRate = 0.0004 * this.circuit.tyreWearFactor * (tyre.speedParams.deg * 10);

        // Temperature Degradation Factor
        // If Temp > 30C: Softs degrade much faster, Madiums faster.
        if (this.trackTemp > 30) {
            const heatFactor = (this.trackTemp - 30) * 0.05; // +5% wear per degree over 30
            if (driver.tyre === 'SOFT') {
                wearRate *= (1.0 + heatFactor * 2.0); // Softs double impact
            } else if (driver.tyre === 'MEDIUM') {
                wearRate *= (1.0 + heatFactor); // Mediums standard impact
            }
            // Hard is unaffected (or barely)
        }

        // Mode Multiplier
        if (driver.mode === 'PUSH') wearRate *= 1.25;
        if (driver.mode === 'CONSERVE') wearRate *= 0.8;

        // Dirty Air Wear
        if (driver.gapToAhead < 1.0) wearRate *= 1.1;

        driver.tyreHealth -= wearRate * dt;
        if (driver.tyreHealth < 0) driver.tyreHealth = 0;
    }

    handleLapComplete(driver, newLap) {
        driver.lap = newLap;
        driver.tyreAge++;

        // AI Logic: Box if tyres dead or strategy calls
        if (!driver.isUser) {
            this.aiStrategy(driver);
        }

        if (this.onLapComplete) this.onLapComplete(driver);
    }

    aiStrategy(driver) {
        // AI Strategy Update every lap

        // 1. Pit Logic
        // Diff box logic: Softs allow < 20%, Med < 15%, Hard < 10%
        // Randomize threshold to spread out stops
        let boxThreshold = 0.3; // Default
        if (driver.tyre === 'HARD') boxThreshold = 0.15;

        if (driver.tyreHealth < boxThreshold && !driver.boxThisLap) {
            driver.boxThisLap = true;
            // Choice logic
            const lapsRemaining = this.laps - driver.lap;
            driver.pitPendingTyre = lapsRemaining < 15 ? 'SOFT' : 'HARD';
            // Default to Med if mid-race
            if (lapsRemaining > 20 && lapsRemaining < 40) driver.pitPendingTyre = 'MEDIUM';

            // Allow override to Soft if aggressive
            if (Math.random() > 0.8) driver.pitPendingTyre = 'SOFT';
        }

        // 2. Pace Logic (Mode Switching)
        // If has DRS, PUSH to pass!
        if (driver.gapToAhead < 1.0) {
            driver.mode = 'PUSH';
        } else if (driver.tyreHealth < 0.4) {
            // Tyres dying, CONSERVE
            driver.mode = 'CONSERVE';
        } else {
            // Randomly switch modes
            const rand = Math.random();
            if (rand > 0.7) driver.mode = 'PUSH';
            else if (rand < 0.2) driver.mode = 'CONSERVE';
            else driver.mode = 'BALANCED';
        }
    }

    enterPit(driver) {
        driver.isInPit = true;
        driver.boxThisLap = false;
        // Total time loss in pit area specific to track
        driver.pitTimer = this.circuit.pitTimeLoss || 25.0;

        // Store pending choice
        if (!driver.pitPendingTyre) driver.pitPendingTyre = 'MEDIUM'; // Fallback

        // Reset Mode logic 
        driver.mode = 'BALANCED';
    }

    exitPit(driver) {
        // Change Tyres
        driver.tyre = driver.pitPendingTyre;
        driver.tyreHealth = 1.0;
        driver.tyreAge = 0;
        driver.pitPendingTyre = null;

        driver.isInPit = false;
    }

    finishRace() {
        this.isRaceOver = true;
        // Final Sort by Rank
        this.drivers.sort((a, b) => (a.finishRank || 99) - (b.finishRank || 99));
        if (this.onRaceFinish) this.onRaceFinish(this.drivers);
    }

    getTrackLength() {
        // Lap time (s) * Avg Speed (m/s). Let's fix track length to 5000m for physics.
        return 5000;
    }
}
