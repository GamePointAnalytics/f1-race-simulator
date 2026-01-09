import { TYRE_COMPOUNDS } from "../data/circuits.js";
import { TEAMS } from "../data/drivers.js";

export class RaceEngine {
    constructor(drivers, circuit, userDriverId, userStartTyre, difficulty = 'HARD') {
        this.circuit = circuit;
        this.difficulty = difficulty;
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
        this.onRadioMessage = null; // New callback

        // Radio State
        this.radioVerbosity = 'VERBOSE'; // 'SILENT', 'MINIMAL', 'VERBOSE'
        this.nextRadioCheck = 0;
        this.lastGapMsgLap = -99;
        this.forecastWarnLevel = 0; // 0=None, 1=10m, 2=5m, 3=2m

        // Safety Car & Chaos
        this.safetyCarActive = false;
        this.safetyCarTimer = 0;
        this.accidentsEnabled = true;

        // Finish State
        this.chequeredFlag = false;
        this.nextFinishRank = 1;
        this.crossoverMsgSent = false;

        // Global Tyre Variance for this Session (+/- 10%)
        // Simulates track surface condition (green vs rubbered in)
        this.raceTyreScale = 0.90 + Math.random() * 0.20;

        // Init Drivers (After weather is set)
        this.drivers = drivers.map(d => this.initDriver(d, userDriverId, userStartTyre));
    }

    initDriver(data, userId, userStartTyre) {
        // AI Tyre Choice: Random Soft or Medium, unless Raining
        let startTyre = Math.random() > 0.5 ? 'SOFT' : 'MEDIUM';

        if (this.weather.type === 'RAIN') {
            startTyre = 'INTER';
        }

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
            pitTimer: 0,
            stops: 0
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
        // Drivers are passed in Grid Order from app.js (Qualifying results)
        // No sorting needed here.

        // Apply Grid Spacing (simulating standing start gaps)
        // P1 starts at 0. P2 at -8m. P3 at -16m.
        this.drivers.forEach((d, i) => {
            d.position = i + 1;
            d.distance = -(i * 8); // 8m grid spots
        });
    }

    update(dt) { // dt in seconds
        // Check if all active cars have finished (or DNF'd)
        const allFinished = this.drivers.every(d => d.hasFinished || d.isDNF);
        if (allFinished) {
            if (!this.isRaceOver) this.finishRace();
            return;
        }

        // Safety Timeout: Force finish 3 minutes after flag
        if (this.chequeredFlag) {
            if (!this.flagTimer) this.flagTimer = 0;
            this.flagTimer += dt;

            // Debug Log every 5 seconds
            if (this.flagTimer % 5.0 < dt) {
                const running = this.drivers.filter(d => !d.hasFinished && !d.isDNF);
                console.log(`[RaceEngine] Waiting for ${running.length} cars:`, running.map(d => `${d.name} (L${d.lap})`).join(', '));
            }

            if (this.flagTimer > 180) {
                console.warn("Force Finishing Race due to timeout.");
                this.finishRace();
                return;
            }
        }

        this.time += dt;

        // Sort drivers by distance to determine position
        // Sort drivers by Effective Distance (Fixes Lapped Car Jumps)
        const activeDrivers = [...this.drivers];
        const trackLen = this.getTrackLength();

        activeDrivers.sort((a, b) => {
            const getEffDist = (d) => {
                // If finished, their race distance is fixed at the line
                if (d.hasFinished) return d.lapsCompleted * trackLen;
                // If running, use actual distance
                return d.distance;
            };

            const distA = getEffDist(a);
            const distB = getEffDist(b);

            // Primary Sort: Distance
            if (Math.abs(distA - distB) > 1.0) {
                return distB - distA;
            }

            // Tie-Breaker: Crossing Order (if both finished)
            if (a.hasFinished && b.hasFinished) {
                return (a.finishRank || 999) - (b.finishRank || 999);
            }

            return distB - distA;
        });

        // Leader is always index 0 after separate physics update? 
        // Wait, we haven't updated physics for this frame yet. 
        // This sort is based on PREVIOUS frame. This is fine for Leader ID.
        const leader = activeDrivers[0];

        // Flag Logic
        if (!this.chequeredFlag && leader.lap >= this.laps) {
            this.chequeredFlag = true;
        }

        this.leaderDistance = leader.distance;
        this.currentLap = Math.min(Math.floor(leader.distance / trackLen) + 1, this.laps);

        // Update each driver (In Sorted Order)
        activeDrivers.forEach(driver => {
            // Pit Limit / Stop Logic
            if (driver.isInPit) {
                driver.pitTimer -= dt;
                if (driver.pitTimer <= 0) {
                    this.exitPit(driver);
                }
                return; // Not moving on track
            }

            // Move Car
            let speed;
            let gapToAhead = 999;

            // Only calculate gaps and complex physics if RACING
            if (!driver.hasFinished) {
                if (driver.position > 1) {
                    // Use array index from sorted list for 'Ahead'
                    // activeDrivers is sorted by distance, so index-1 is car ahead.
                    const myIdx = activeDrivers.indexOf(driver);
                    if (myIdx > 0) {
                        const carAhead = activeDrivers[myIdx - 1];
                        gapToAhead = (carAhead.distance - driver.distance) / 60.0;
                    }
                }
                driver.gapToAhead = gapToAhead;
                speed = this.calculateSpeed(driver, gapToAhead);
            } else {
                // Cooldown Lap: Cruise at 40% speed
                speed = (trackLen / this.circuit.baseLapTime) * 0.4;
            }

            // Move
            const moveDist = speed * dt;
            const oldDist = driver.distance;
            driver.distance += moveDist;

            // Integrity Checks & Racing Logic
            if (!driver.hasFinished) {
                const currentLapCount = Math.floor(driver.distance / trackLen);
                const oldLapCount = Math.floor(oldDist / trackLen);

                // Lap Complete
                if (currentLapCount > oldLapCount) {
                    this.handleLapComplete(driver, currentLapCount);
                }

                // Check Finish
                let shouldFinish = false;

                // 1. Completed Full Race Distance (Leader + Lead Lap cars)
                if (currentLapCount >= this.laps) {
                    shouldFinish = true;
                    if (!this.chequeredFlag) this.chequeredFlag = true; // Raise flag!
                }
                // 2. Crossed Line AFTER Flag is out (Lapped cars)
                else if (this.chequeredFlag && currentLapCount > oldLapCount) {
                    shouldFinish = true;
                }

                if (shouldFinish && !driver.hasFinished) {
                    driver.hasFinished = true;
                    // Assign rank based on current physical position in the field
                    driver.finishRank = activeDrivers.indexOf(driver) + 1;

                    driver.finishTime = this.time;
                    driver.lapsCompleted = currentLapCount;
                }

                // Pit Entry
                if (driver.boxThisLap && currentLapCount > oldLapCount && !driver.hasFinished && currentLapCount < this.laps) {
                    this.enterPit(driver);
                }

                // Calc Gap to Leader
                driver.gapToLeader = (this.leaderDistance - driver.distance) / 60.0;

                // Physics (Wear/Fuel)
                this.updateCarPhysics(driver, dt);
            }
        });

        // Update positions array based on the Sort performed AT START + Updates?
        // Ideally we re-sort to be 100% accurate for display, but start-of-frame is standard game loop.
        // We just assign index + 1 from the activeDrivers list we iterated.
        activeDrivers.forEach((d, i) => d.position = i + 1);

        this.gameTime += dt;

        // --- WEATHER SCHEDULE UPDATE ---
        const currentBlock = this.forecast[this.currentWeatherBlockIndex];

        // Check if block finished
        if (currentBlock && this.gameTime >= currentBlock.endTime) {
            // Advance Block
            if (this.currentWeatherBlockIndex < this.forecast.length - 1) {
                this.currentWeatherBlockIndex++;
                this.forecastWarnLevel = 0;
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

        // --- RADIO ---
        this.checkRadioEvents(dt);

        if (this.onUpdate) this.onUpdate(activeDrivers, this.currentLap, this.trackTemp, this.weather, this.safetyCarActive);
    }

    calculateSpeed(driver, gapToAhead) {
        if (driver.isDNF) return 0;

        // SC LIMIT
        if (this.safetyCarActive) {
            // Approx 60% of race pace
            return (this.getTrackLength() / this.circuit.baseLapTime) * 0.6;
        }

        // Base Speed
        let baseSpeed = this.getTrackLength() / this.circuit.baseLapTime;
        if (!Number.isFinite(baseSpeed)) baseSpeed = 50.0; // Fallback to avoid NaN

        // --- TEAM PERFORMANCE ---
        const teamData = TEAMS[driver.team];
        const teamPerf = teamData ? teamData.performance : 0.95;
        // Range 0.88 to 0.99. Mid 0.93.
        // Scale to % modifier. 
        // 0.995 (McLaren) -> +0.66%. 0.875 (Sauber) -> -0.78%.
        // Spread ~1.44%. (approx 1.3s lap time diff). Dominant factor.
        let teamMod = (teamPerf - 0.94) * 12; // Increased from 8 to 12

        // --- DRIVER SKILL ---
        // Range 80-99. 
        // 99 -> +0.22%. 80 -> -0.25%.
        // Spread ~0.5%. (approx 0.4s lap time diff from driver).
        let skillMod = (driver.speed - 90) * 0.025; // Reduced from 0.04

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

        // Aerodynamics & Battles
        if (gapToAhead < 900) { // Check if valid gap exists
            const inDrsZone = this.circuit.drsZones ? this.circuit.drsZones.some(z => progress >= z[0] && progress <= z[1]) : true;

            // --- MONACO SPECIAL RULES ---
            if (this.circuit.id === 'monaco') {
                // Monaco: Severe Dirty Air. Trulli Train Logic.
                if (gapToAhead > 1.5) {
                    aeroMod = 0.3; // Clean air reduced
                } else if (gapToAhead > 0.3) {
                    // Dirty Air: Massive penalty for just following
                    aeroMod = -3.0; // Was -1.2
                } else {
                    // Overtake Attempt: Hitting a wall
                    aeroMod = -5.0; // Was -2.5

                    if (inDrsZone && this.weather.type !== 'RAIN') {
                        drsMod = 0.5; // DRS almost useless
                    }
                }
            }
            // --- STANDARD TRACKS ---
            else {
                if (gapToAhead > 2.0) {
                    // Clean Air
                    aeroMod = 0.3;
                } else if (gapToAhead > 0.8) {
                    // Dirty Air (Wake)
                    aeroMod = -0.6;
                } else if (gapToAhead > 0.3) {
                    // Prime Overtaking Window (DRS)
                    aeroMod = -1.0; // Turbulence
                    if (inDrsZone && this.weather.type !== 'RAIN') {
                        drsMod = 3.5; // Massive boost to clear the air
                    }
                } else {
                    // Wheel-to-Wheel Battle (< 0.3s)
                    // Compromised racing lines slow both cars down
                    aeroMod = -1.5;
                    if (inDrsZone && this.weather.type !== 'RAIN') {
                        drsMod = 3.5;
                    }
                }
            }
        }

        // Random Fluctuation
        let variance = (100 - driver.consistency) * 0.03;

        // Wet/Inter Variability
        if (driver.tyre === 'INTER' || driver.tyre === 'WET') {
            variance *= 4.0; // Higher uncertainty in wet conditions
        }

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
                // Gradual Dropoff (Requested by User)
                // Gradual Dropoff (Requested: 60)
                moisturePenalty = 1.5 + (moisture - 0.15) * 60;
            }
        } else if (driver.tyre === 'INTER') {
            // Inters: 0.15 to 0.75
            if (moisture < 0.15) moisturePenalty = (0.15 - moisture) * 40;
            else if (moisture > 0.8) moisturePenalty = (moisture - 0.8) * 50;
        } else if (driver.tyre === 'WET') {
            if (moisture < 0.65) moisturePenalty = (0.65 - moisture) * 50;
        }
        tyrePaceDelta -= moisturePenalty;

        const totalModPct = (teamMod + skillMod + tyrePaceDelta + modeMod + drsMod + aeroMod - (wearPenalty * 5) + randomPace);

        let finalSpeed = baseSpeed * (1 + (totalModPct / 100));

        // Clamp: Prevent negative speed (Reverse)
        if (finalSpeed < 10.0) finalSpeed = 10.0; // Min ~36kph

        return finalSpeed;
    }

    updateCarPhysics(driver, dt) {
        // --- 1. TYRE WEAR ---
        const tyre = TYRE_COMPOUNDS[driver.tyre];

        // Calculate Base Duration in Seconds (Life (Laps) * LapTime (s))
        // Adjusted by Circuit Wear Factor AND Race-Day Variance
        const trackFactor = this.circuit.tyreWearFactor || 1.0;
        const raceVar = this.raceTyreScale || 1.0; // Randomized per session

        // Driver Skill: 99 -> 1.05 (+5% Life). 80 -> 0.95 (-5% Life).
        const skillFactor = 0.95 + ((driver.tyreMgmt - 80) * 0.005); // Approx +/- 5%

        // Effective Life in Laps
        const effectiveLifeLaps = tyre.life * raceVar * skillFactor;

        const totalLifeSeconds = (effectiveLifeLaps * this.circuit.baseLapTime) / trackFactor;

        // Base wear per second to reach 0% at end of life
        let wearRate = 1.0 / totalLifeSeconds;

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
        // SC Override
        if (this.safetyCarActive) {
            // Cheap Pit Window
            if (driver.tyreHealth < 0.5 && !driver.boxThisLap) {
                driver.boxThisLap = true;
                driver.pitPendingTyre = this.weather.type === 'RAIN' ? 'INTER' : 'MEDIUM';
                return;
            }
        }

        // 1. Weather Reaction
        let weatherCall = false;

        // Split Strategy Probability (not everyone pits same lap)
        // 30% chance to DELAY a necessary stop by 1 lap
        const canDelay = Math.random() > 0.3;

        if (this.weather.type === 'RAIN') {
            const isSlicks = ['SOFT', 'MEDIUM', 'HARD'].includes(driver.tyre);
            if (isSlicks && !driver.boxThisLap && !driver.isInPit) {
                // Indecision / Assessment Logic
                // Drivers wait for track to actually get wet before committing
                let pitProb = 0.05; // Default: Stay out if just starting

                // Check Forecast Duration (How long will it rain?)
                let rainDuration = 0;
                let idx = this.currentWeatherBlockIndex;
                while (idx < this.forecast.length && this.forecast[idx].type === 'RAIN') {
                    const block = this.forecast[idx];
                    const start = Math.max(block.startTime, this.gameTime);
                    rainDuration += (block.endTime - start);
                    idx++;
                }
                const isLongRain = rainDuration > 780; // > 13 mins

                // --- BACKMARKER GAMBLE LOGIC ---
                // Those at the back are more willing to gamble on the change
                const rankPct = driver.position / this.drivers.length;
                let gambleBias = 0;

                if (rankPct > 0.5) {
                    // Backmarker: Risk Taker
                    // Up to +40% probability boost to pit early
                    gambleBias = (rankPct - 0.5) * 0.8;
                }

                if (this.safetyCarActive) pitProb = 0.95;
                else if (this.trackMoisture > 0.40) pitProb = 0.95;
                else if (this.trackMoisture > 0.15) {
                    // Damp Track (Intermediates Zone)
                    // Conservative: 20%. Gambler: Up to 60%.
                    pitProb = 0.20 + gambleBias;
                }
                else if (this.weather.rainIntensity > 0.7) pitProb = 0.60;

                // Smart Strategy: If rain is here to stay, don't wait too long
                if (isLongRain && pitProb < 0.8) {
                    pitProb += 0.3;
                }

                if (Math.random() < pitProb) {
                    driver.boxThisLap = true;
                    driver.pitPendingTyre = 'INTER';
                    weatherCall = true;
                }
            }
        } else {
            const isInters = ['INTER', 'WET'].includes(driver.tyre);
            if (isInters && !driver.boxThisLap && !driver.isInPit) {
                // Decision Logic
                let shouldBox = false;

                // Backmarker Gamble: Switch early (higher moisture tolerance)
                const rankPct = driver.position / this.drivers.length;
                let tolerance = 0.20; // Standard AI threshold

                if (rankPct > 0.5) {
                    // Backmarker: Desperate
                    // Willing to switch even if track is still 35% wet (Risk of sliding)
                    // Scales up to 0.35 threshold
                    tolerance += (rankPct - 0.5) * 0.30;
                }

                if (this.difficulty === 'HARD') {
                    // Smart AI
                    if (this.trackMoisture < tolerance) shouldBox = true;
                } else {
                    // Easy AI
                    shouldBox = true;
                }

                // Random Error: small chance to NOT box even if threshold met (Hesitation)
                // Reduced for gamblers (they are decisively wrong/right)
                if (shouldBox && Math.random() < 0.1) shouldBox = false;

                if (shouldBox) {
                    if (this.safetyCarActive || !canDelay) {
                        driver.boxThisLap = true;
                        // Logic for tyre choice
                        const lapsRemaining = this.laps - driver.lap;
                        driver.pitPendingTyre = lapsRemaining < 15 ? 'SOFT' : 'MEDIUM';
                        weatherCall = true;
                    }
                }
            }
        }

        if (weatherCall) return;

        // 2. Regular Wear / Strategy Logic
        // Limit Stops: Target 2 stops (3 in wet/chaos)
        let maxStops = 2;
        if (this.weather.type === 'RAIN' || this.safetyCarActive) maxStops = 3;

        // Performance Thresholds (Pit when health drops below this)
        // Softs degrade fast, pit at ~35% left. Hards can go to 20%.
        let wearThreshold = 0.35;
        if (driver.tyre === 'MEDIUM') wearThreshold = 0.30;
        if (driver.tyre === 'HARD') wearThreshold = 0.20;
        if (driver.tyre === 'INTER') wearThreshold = 0.30;

        // If we've used our stops, force extended stint (unless dangerous < 5%)
        if (driver.stops >= maxStops && this.weather.type !== 'RAIN') {
            wearThreshold = 0.05;
        }

        if (driver.tyreHealth < wearThreshold && !driver.boxThisLap) {
            driver.boxThisLap = true;

            // Tyre Choice Logic
            const lapsRemaining = this.laps - driver.lap;

            if (this.weather.type === 'RAIN') {
                driver.pitPendingTyre = 'INTER';
            } else {
                // Dry Choice
                if (lapsRemaining <= 18) driver.pitPendingTyre = 'SOFT';
                else if (lapsRemaining <= 35) driver.pitPendingTyre = 'MEDIUM';
                else driver.pitPendingTyre = 'HARD';

                // Random variation for diversity
                if (lapsRemaining > 40 && Math.random() > 0.7) driver.pitPendingTyre = 'HARD';
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

        if (this.safetyCarActive) driver.mode = 'CONSERVE';
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
        driver.stops++;
        driver.isInPit = false;
    }

    finishRace() {
        this.isRaceOver = true;

        // Final Sort: Trust the finishRank assigned at line crossing
        this.drivers.sort((a, b) => {
            // Both Finished: Sort by Rank
            if (a.hasFinished && b.hasFinished) {
                return (a.finishRank || 999) - (b.finishRank || 999);
            }
            // Finished cars ahead of DNFs
            if (a.hasFinished) return -1;
            if (b.hasFinished) return 1;

            // DNFs: Sort by distance covered
            return b.distance - a.distance;
        });

        // finalize positions
        this.drivers.forEach((d, i) => {
            d.finishRank = i + 1;
            d.position = i + 1;
        });

        if (this.onRaceFinish) this.onRaceFinish(this.drivers);
    }

    checkRadioEvents(dt) {
        if (this.radioVerbosity === 'SILENT') return;

        const userDriver = this.drivers.find(d => d.isUser);
        if (!userDriver) return;

        // 1. WEATHER WARNINGS (Verbose Only)
        if (this.radioVerbosity === 'VERBOSE') {
            const nextBlockIndex = this.currentWeatherBlockIndex + 1;
            if (nextBlockIndex < this.forecast.length) {
                const nextBlock = this.forecast[nextBlockIndex];
                const timeToStart = nextBlock.startTime - this.gameTime;

                const type = nextBlock.type === 'RAIN' ? "Rain" : "Dry Conditions";

                // 10 Minute Warning (600s)
                if (timeToStart <= 600 && timeToStart > 590 && this.forecastWarnLevel < 1) {
                    this.sendRadio(`Weather Update: ${type} expected in 10 minutes.`);
                    this.forecastWarnLevel = 1;
                }

                // 5 Minute Warning (300s)
                else if (timeToStart <= 300 && timeToStart > 290 && this.forecastWarnLevel < 2) {
                    this.sendRadio(`Update: ${type} in 5 minutes.`);
                    this.forecastWarnLevel = 2;
                }

                // 2 Minute Warning (120s)
                else if (timeToStart <= 120 && timeToStart > 110 && this.forecastWarnLevel < 3) {
                    this.sendRadio(`Warning: ${type} in 2 minutes. Prepare strategy.`);
                    this.forecastWarnLevel = 3;
                }
            }
        }

        // 2. CROSSOVER ADVICE (Verbose Only)
        // Reset flag only when it starts raining again
        if (this.weather.type === 'RAIN') this.crossoverMsgSent = false;

        if (this.radioVerbosity === 'VERBOSE' && this.weather.type === 'DRY' && this.trackMoisture > 0.05) {
            if (this.trackMoisture <= 0.35 && !this.crossoverMsgSent) {
                this.crossoverMsgSent = true; // Latch immediately to prevent looping

                const diff = this.trackMoisture - 0.15;
                const rate = this.dryingFactor || 0.001;

                if (rate > 0) {
                    const seconds = diff / rate;
                    const laps = Math.max(1, Math.ceil(seconds / this.circuit.baseLapTime));
                    this.sendRadio(`Track is drying. Slick crossover estimated in ~${laps} laps.`);
                }
            }
        }

        // 3. GAP UPDATES
        if (this.radioVerbosity !== 'SILENT') {
            // Every 3 laps
            if (userDriver.lap > this.lastGapMsgLap + 2) {
                this.lastGapMsgLap = userDriver.lap;

                let parts = [];
                // Gap to Ahead
                if (userDriver.position > 1) {
                    const ahead = this.drivers.find(d => d.position === userDriver.position - 1);
                    if (ahead) {
                        const gap = Math.max(0, (ahead.distance - userDriver.distance) / 60.0).toFixed(1);
                        parts.push(`Gap to ${TEAMS[ahead.team].name}: +${gap}s`);
                    }
                }
                // Gap to Behind
                const behind = this.drivers.find(d => d.position === userDriver.position + 1);
                if (behind) {
                    const gap = Math.max(0, (userDriver.distance - behind.distance) / 60.0).toFixed(1);
                    parts.push(`Behind ${TEAMS[behind.team].name}: +${gap}s`);
                }

                if (parts.length > 0) {
                    this.sendRadio(parts.join('. '));
                }
            }
        }
    }

    sendRadio(msg) {
        if (this.onRadioMessage) this.onRadioMessage(msg);
    }

    getTrackLength() {
        // Lap time (s) * Avg Speed (m/s). Let's fix track length to 5000m for physics.
        return 5000;
    }
}
