# F1 Race Engineer Simulator

A real-time strategy simulation where you take on the role of a Race Engineer on the F1 pitwall. Your goal is to manage your driver's pace, tyre strategy, and pit stops to secure the best possible race result against a grid of AI opponents.

🏁 **Play the game live:** [https://raceengineer.tech/](https://raceengineer.tech/)

## Features

### 🏎️ Live Race Simulation
- **Physics Engine**: Simulates lap times, tyre degradation, and fuel loads based on realistic F1 parameters.
- **Dynamic AI**: Opponents race each other, use DRS, defend via "dirty air", and execute independent pit strategies.
- **Track Map**: Real-time visualization of car positions on accurate SVG maps of famous circuits.

### 📊 Strategy & Telemetry
- **Start Procedure**: Choose your driver (from the 2025 grid) and starting tyre compound.
- **Live Telemetry**: Monitor tyre health, gap to leader/car ahead, and lap times.
- **Radio Comms**: Receive updates from your driver and race control.
- **Strategic Modes**:
    - **PUSH**: Maximize pace at the cost of high tyre wear. Use for overtakes.
    - **BALANCED**: Optimal race pace.
    - **CONSERVE**: Save tyres to extend stint length.
- **Pit Stops**: Call "Box Box" to pit. Choose Soft, Medium, or Hard compounds. Pit loss time varies by track (e.g., 29s at Silverstone vs 24s at Monaco).

### 🌍 Circuits
Includes 5 iconic tracks with specific characteristics (tyre wear, overtake difficulty, DRS zones):
- **Monza** (Italy)
- **Monaco** (Monaco)
- **Spa-Francorchamps** (Belgium)
- **Silverstone** (UK)
- **Interlagos** (Brazil)

## Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3.
- **Design**: Responsive grid layout with a dark "Pitwall" aesthetic.
- **No Dependencies**: Runs natively in any modern browser.

## How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/GamePointAnalytics/f1-race-simulator.git
   ```
2. Navigate to the folder:
   ```bash
   cd f1-race-simulator
   ```
3. Start a local server (e.g., using Python):
   ```bash
   python -m http.server 8080
   ```
4. Open your browser to:
   `http://localhost:8080`

## Credits
Built as a custom simulation project. Not affiliated with Formula 1 or FIA.
