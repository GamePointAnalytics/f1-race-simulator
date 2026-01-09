import { TYRE_COMPOUNDS } from "../data/circuits.js";
import { TEAMS } from "../data/drivers.js";

export class RaceEngine {
    constructor(drivers, circuit, userDriverId, userStartTyre, difficulty = 'HARD') {
        this.circuit = circuit;
        this.difficulty = difficulty;
        this.drivers = drivers.map(d => this.initDriver(d, userDriverId, userStartTyre));
        this.laps = circuit.laps;
        this.laps = circuit.laps;
        this.currentLap = 0; // Leading car lap

        // Physics State
        this.trackTemp = 30 - (circuit.rainProbability * 10) + (Math.random() * 5);
        this.trackMoisture = 0.0;
        this.gameTime = 0; // Seconds since start

        // Weather System
        this.weather = { type: 'DRY', rainIntensity: 0.0 };
        this.forecast = []; // Array of weather blocks
        this.currentWeatherBlockIndex = 0;
        this.generateForecast();

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
            battery: 100, // ERS Percentage

            // Strategy State
            mode: 'BALANCED', // PUSH, BALANCED, CONSERVE
            boxThisLap: false,
            pitPendingTyre: null,
            isInPit: false,
            pitTimer: 0
        };
    }

    generateForecast() {
        const estRaceTime = this.laps * this.circuit.baseLapTime;
        let timeCovered = 0;
        let isRaining = Math.random() < (this.circuit.rainProbability * 1.5); // Initial state

        if (isRaining) this.trackMoisture = 0.5;

        while (timeCovered < estRaceTime + 600) { // Cover race + buffer
            const duration = 600 + Math.random() * 1200; // 10-30 mins blocks

            const block = {
                type: isRaining ? 'RAIN' : 'DRY',
                rainIntensity: isRaining ? (0.2 + Math.random() * 0.6) : 0.0,
                startTime: timeCovered,
                endTime: timeCovered + duration
            };

            this.forecast.push(block);
            timeCovered += duration;

            // Flip for next block based on probability
            if (!isRaining) {
                if (Math.random() < this.circuit.rainProbability * 2.0) isRaining = true;
            } else {
                if (Math.random() < 0.7) isRaining = false;
            }
        }

        // Set initial
        this.weather = {
            type: this.forecast[0].type,
            rainIntensity: this.forecast[0].rainIntensity
        };
        console.log("Weather Forecast Generated:", this.forecast);
    }

    getForecastText() {
        // Find next change
        const currentBlock = this.forecast[this.currentWeatherBlockIndex];
        const nextBlock = this.forecast[this.currentWeatherBlockIndex + 1];

        if (!nextBlock) return "Stable Conditions";

        const timeToChange = nextBlock.startTime - this.gameTime;
        const mins = Math.ceil(timeToChange / 60);

        if (mins <= 0) return "Transitioning...";
        return `${nextBlock.type} expected in ${mins} min`;
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
        const activeDrivers = [...this.drivers];
        activeDrivers.sort((a, b) => {
            if (a.hasFinished && b.hasFinished) return a.finishRank - b.finishRank;
            if (a.hasFinished) return -1;
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
        this.currentLap = Math.min(Math.floor(leader.distance / this.getTrackLength()) + 1, this.laps);

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
            // Calculate Gap
            let gapToAhead = 999;
            if (driver.position > 1) {
                const carAhead = activeDrivers.find(d => d.position === driver.position - 1);
                if (carAhead) {
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
            const isCrossing = currentLapCount > oldLapCount;
            if (this.chequeredFlag && isCrossing) {
                if (!driver.hasFinished) {
                    driver.hasFinished = true;
                    driver.finishRank = this.nextFinishRank++;
                    driver.position = driver.finishRank;
                    driver.finishTime = this.time;
                    driver.lapsCompleted = currentLapCount;
                }
                return;
            }

            // Pit Entry
            if (driver.boxThisLap && currentLapCount > oldLapCount && !this.chequeredFlag && currentLapCount < this.laps) {
                this.enterPit(driver);
            }

            // Calculate Gap
            driver.gapToLeader = (this.leaderDistance - driver.distance) / 60.0;

            // Tyre Wear & ERS
            this.updateCarPhysics(driver, dt);
        });

        // Update positions array
        // Update positions array
        activeDrivers.forEach((d, i) => d.position = i + 1);

        this.gameTime += dt;

        // --- WEATHER SCHEDULE UPDATE ---
        const currentBlock = this.forecast[this.currentWeatherBlockIndex];

        // Check if block finished
        if (currentBlock && this.gameTime >= currentBlock.endTime) {
            // Advance Block
            if (this.currentWeatherBlockIndex < this.forecast.length - 1) {
                this.currentWeatherBlockIndex++;
                const newBlock = this.forecast[this.currentWeatherBlockIndex];

                this.weather.type = newBlock.type;
                this.weather.rainIntensity = newBlock.rainIntensity;

                if (newBlock.type === 'DRY') {
                    // Start Drying Logic
                    // Calculate drying factor similar to before
                    let targetLaps = 3 + Math.random() * 4;
                    targetLaps -= (this.trackTemp - 20) * 0.1;
                    if (targetLaps < 2) targetLaps = 2;
                    const dryTime = targetLaps * this.circuit.baseLapTime;
                    this.dryingFactor = 1.0 / dryTime;
                }
            }
        }

        // --- TRACK TEMP DRIFT ---
        if (this.weather.type === 'RAIN') {
            if (this.trackTemp > 18) this.trackTemp -= dt * 0.05;
        } else {
            // Drifts up/down slightly
            if (Math.random() < 0.01) this.trackTemp += (Math.random() - 0.5);
            if (this.trackTemp < 20) this.trackTemp += 0.01;
        }

        // --- MOISTURE SIMULATION ---
        if (this.weather.type === 'RAIN') {
            const wettingRate = 0.002 + (this.weather.rainIntensity * 0.005);
            this.trackMoisture += wettingRate * dt;
            if (this.trackMoisture > 1.0) this.trackMoisture = 1.0;
        } else {
            // Drying
            const rate = this.dryingFactor || 0.001;
            this.trackMoisture -= rate * dt;
            if (this.trackMoisture < 0.0) this.trackMoisture = 0.0;
        }

        if (this.onUpdate) this.onUpdate(activeDrivers, this.currentLap, this.trackTemp, this.weather);
    }

    calculateSpeed(driver, gapToAhead) {
        // Base Speed
        let baseSpeed = this.getTrackLength() / this.circuit.baseLapTime;
        if (!Number.isFinite(baseSpeed)) baseSpeed = 50.0; // Fallback to avoid NaN

        // --- TEAM PERFORMANCE ---
        const teamData = TEAMS[driver.team];
        const teamPerf = teamData ? teamData.performance : 0.95;
        // Range 0.88 to 0.99. Mid 0.93.
        // Scale to % modifier. 
        // 0.99 -> +0.8%. 0.88 -> -0.8%.
        // Spread ~1.6% (approx 1.3s lap time diff from car alone).
        let teamMod = (teamPerf - 0.94) * 15;

        // --- DRIVER SKILL ---
        // Range 80-99. 
        // 99 -> +0.36%. 80 -> -0.4%.
        // Spread ~0.8%. (approx 0.6s lap time diff from driver).
        let skillMod = (driver.speed - 90) * 0.04; // Reduced from 0.08

        // --- TYRE BASE ---
        const tyre = TYRE_COMPOUNDS[driver.tyre];
        let tyrePaceDelta = -tyre.speedParams.base;

        // --- RAIN EQUALIZER ---
        // In Rain, Car matters less, Skill matters less (chaos/grip limit).
        if (this.weather.type === 'RAIN') {
            teamMod *= 0.3; // Car advantage neutralized
            skillMod *= 0.5; // Driver advantage reduced (hard to drive for everyone)
        }

        // --- PENALTIES & PHYSICS ---
        // Tyre Wear
        const wearPenalty = (1.0 - driver.tyreHealth) * 2.0;

        // Mode
        // Mode & ERS
        let modeMod = 0;
        if (driver.mode === 'PUSH') {
            if (driver.battery > 1.0) { // Needs >1% to deploy
                modeMod = 1.8; // ERS Boost
            } else {
                modeMod = 0; // No power
            }
        }
        if (driver.mode === 'CONSERVE') modeMod = -1.2;

        // DRS / Slipstream
        let drsMod = 0;
        let aeroMod = 0;
        const trackLen = this.getTrackLength();
        const progress = (driver.distance % trackLen) / trackLen;

        // Dirty Air / DRS
        if (gapToAhead < 1.0) {
            const inDrsZone = this.circuit.drsZones ? this.circuit.drsZones.some(z => progress >= z[0] && progress <= z[1]) : true;
            if (inDrsZone && this.weather.type !== 'RAIN') {
                drsMod = 1.8;
            } else {
                aeroMod = -0.4;
            }
        }

        // Random Fluctuation
        const variance = (100 - driver.consistency) * 0.03;
        const randomPace = (Math.random() - 0.5) * variance;

        // Tyre Warmup
        const warmUpLaps = { SOFT: 1, MEDIUM: 2, HARD: 4, INTER: 3, WET: 3 };
        const requiredWarmUp = warmUpLaps[driver.tyre] || 1;
        if (driver.tyreAge < requiredWarmUp) {
            const coldness = (requiredWarmUp - driver.tyreAge);
            tyrePaceDelta -= (coldness * 0.5); // Reduced cold penalty slightly
        }
        if (driver.tyre === 'HARD' && this.trackTemp < 20) {
            tyrePaceDelta -= (20 - this.trackTemp) * 0.2;
        }

        // Moisture Physics
        const moisture = this.trackMoisture;
        let moisturePenalty = 0;
        if (['SOFT', 'MEDIUM', 'HARD'].includes(driver.tyre)) {
            // Slicks: Good until ~0.15
            if (moisture < 0.15) {
                moisturePenalty = moisture * 10;
            } else {
                moisturePenalty = 1.5 + (moisture - 0.15) * 120; // Cliff
            }
        } else if (driver.tyre === 'INTER') {
            // Inters: 0.15 to 0.75
            if (moisture < 0.15) moisturePenalty = (0.15 - moisture) * 40;
            else if (moisture > 0.8) moisturePenalty = (moisture - 0.8) * 50;
        } else if (driver.tyre === 'WET') {
            if (moisture < 0.65) moisturePenalty = (0.65 - moisture) * 50;
        }
        tyrePaceDelta -= moisturePenalty;

        const totalModPct = (teamMod + skillMod + tyrePaceDelta + modeMod + drsMod + aeroMod - (wearPenalty * 10) + randomPace);

        return baseSpeed * (1 + (totalModPct / 100));
    }

    updateCarPhysics(driver, dt) {
        // --- 1. TYRE WEAR ---
        const tyre = TYRE_COMPOUNDS[driver.tyre];
        let wearRate = 0.0004 * (this.circuit.tyreWearFactor || 1.0) * (tyre.speedParams.deg * 10);

        // Temperature Degradation Factor
        if (this.trackTemp > 30) {
            const heatFactor = (this.trackTemp - 30) * 0.05;
            if (driver.tyre === 'SOFT') wearRate *= (1.0 + heatFactor * 2.0);
            else if (driver.tyre === 'MEDIUM') wearRate *= (1.0 + heatFactor);
        }

        // Moisture Wear
        if (driver.tyre === 'INTER' || driver.tyre === 'WET') {
            if (this.trackMoisture < 0.1) wearRate *= 4.0; // Melt
        }
        if (['SOFT', 'MEDIUM', 'HARD'].includes(driver.tyre)) {
            if (this.trackMoisture > 0.3) wearRate *= 0.6; // Slide
        }

        if (driver.mode === 'PUSH') wearRate *= 1.25;
        if (driver.mode === 'CONSERVE') wearRate *= 0.8;
        if (driver.gapToAhead < 1.0) wearRate *= 1.1;

        driver.tyreHealth -= wearRate * dt;
        if (driver.tyreHealth < 0) driver.tyreHealth = 0;

        // --- 2. ERS / BATTERY ---
        // Charge/Drain Rates (% per second)
        const DRAIN_RATE = 2.5; // Drains full in 40s
        const SLOW_CHARGE = 0.2; // Balanced
        const FAST_CHARGE = 1.2; // Conserve

        if (driver.mode === 'PUSH') {
            if (driver.battery > 0) {
                driver.battery -= DRAIN_RATE * dt;
            } else {
                driver.battery += 0.1 * dt; // Trickle if empty
            }
        } else if (driver.mode === 'BALANCED') {
            driver.battery += SLOW_CHARGE * dt;
        } else if (driver.mode === 'CONSERVE') {
            driver.battery += FAST_CHARGE * dt;
        }

        // Clamp
        if (driver.battery < 0) driver.battery = 0;
        if (driver.battery > 100) driver.battery = 100;
    }

    handleLapComplete(driver, newLap) {
        driver.lap = newLap;
        driver.tyreAge++;

        // AI Logic
        if (!driver.isUser) {
            this.aiStrategy(driver);
        }

        if (this.onLapComplete) this.onLapComplete(driver);
    }

    aiStrategy(driver) {
        // 1. Weather Reaction
        let weatherCall = false;

        if (this.weather.type === 'RAIN') {
            const isSlicks = ['SOFT', 'MEDIUM', 'HARD'].includes(driver.tyre);
            if (isSlicks && !driver.boxThisLap && !driver.isInPit) {
                driver.boxThisLap = true;
                driver.pitPendingTyre = 'INTER';
                weatherCall = true;
            }
        } else {
            const isInters = ['INTER', 'WET'].includes(driver.tyre);
            if (isInters && !driver.boxThisLap && !driver.isInPit) {
                // Decision Logic
                let shouldBox = false;

                if (this.difficulty === 'HARD') {
                    // Smart AI: Wait for track to dry enough (Crossover point ~0.15)
                    // If moisture is still high (> 0.2), stay on Inters
                    if (this.trackMoisture < 0.20) {
                        shouldBox = true;
                    }
                } else {
                    // Easy AI: Box immediately when Race Control says "DRY"
                    // They will pit too early and slide on the wet track
                    shouldBox = true;
                }

                if (shouldBox) {
                    driver.boxThisLap = true;
                    const lapsRemaining = this.laps - driver.lap;
                    driver.pitPendingTyre = lapsRemaining < 15 ? 'SOFT' : 'MEDIUM';
                    weatherCall = true;
                }
            }
        }

        if (weatherCall) return;

        // 2. Regular Wear / Strategy Logic
        let boxThreshold = 0.3;
        if (driver.tyre === 'HARD') boxThreshold = 0.15;
        if (driver.tyre === 'INTER') boxThreshold = 0.25;

        if (driver.tyreHealth < boxThreshold && !driver.boxThisLap) {
            driver.boxThisLap = true;
            const lapsRemaining = this.laps - driver.lap;

            if (this.weather.type === 'RAIN') {
                driver.pitPendingTyre = 'INTER';
            } else {
                driver.pitPendingTyre = lapsRemaining < 15 ? 'SOFT' : 'HARD';
                if (lapsRemaining > 20 && lapsRemaining < 40) driver.pitPendingTyre = 'MEDIUM';
                if (Math.random() > 0.8) driver.pitPendingTyre = 'SOFT';
            }
        }

        // 3. ERS / Mode Logic
        // AI Battery Management
        if (driver.battery < 20) {
            // Low Battery: Recharge
            driver.mode = Math.random() > 0.5 ? 'BALANCED' : 'CONSERVE';
        } else if (driver.battery > 90) {
            // Full Battery: Deploy
            driver.mode = 'PUSH';
        } else {
            // Normal Operation
            if (driver.gapToAhead < 0.8 && driver.battery > 40) {
                driver.mode = 'PUSH'; // Try to overtake
            } else if (driver.gapToLeader < 2.0 && driver.position === 2) {
                driver.mode = 'PUSH'; // Chase leader
            } else {
                driver.mode = 'BALANCED';
            }
        }

        // Pace Logic (Override based on Tyre Health)
        if (driver.tyreHealth < 0.4) {
            driver.mode = 'CONSERVE';
        }
    }

    enterPit(driver) {
        driver.isInPit = true;
        driver.boxThisLap = false;
        driver.pitTimer = this.circuit.pitTimeLoss || 25.0;
        if (!driver.pitPendingTyre) driver.pitPendingTyre = 'MEDIUM';
        driver.mode = 'BALANCED';
    }

    exitPit(driver) {
        driver.tyre = driver.pitPendingTyre;
        driver.tyreHealth = 1.0;
        driver.tyreAge = 0;
        driver.pitPendingTyre = null;
        driver.isInPit = false;
    }

    finishRace() {
        this.isRaceOver = true;
        // Final Sort: Laps DESC, Time ASC
        this.drivers.sort((a, b) => {
            const lapsA = a.lapsCompleted || 0;
            const lapsB = b.lapsCompleted || 0;
            if (lapsA !== lapsB) return lapsB - lapsA;
            return a.finishTime - b.finishTime;
        });

        this.drivers.forEach((d, i) => d.finishRank = i + 1);

        if (this.onRaceFinish) this.onRaceFinish(this.drivers);
    }

    getTrackLength() {
        // Lap time (s) * Avg Speed (m/s). Let's fix track length to 5000m for physics.
        return 5000;
    }
}
