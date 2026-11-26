# Marbio Assay Calculations Documentation

This document outlines the calculation formulas and qualitative threshold criteria used by the Marbio Assay Analyzer for each supported assay type.

## 1. MIC (Minimum Inhibitory Concentration) Assay
*Supported Readers: Tecan Spark, PerkinElmer Victor*

For each sample at a specific dilution level, the assay measures absorbance in duplicates.

**Calculations:**
- **Activity (Average):** The raw activity is the arithmetic mean of the two duplicate wells.
  $$ \text{Activity} = \frac{ \text{Val}_1 + \text{Val}_2 }{ 2 } $$

**Qualitative Result Thresholds:**
- **Active (A):** Activity < 0.05
- **Qualified (Q):** 0.05 ≤ Activity ≤ 0.09
- **Inactive (I):** Activity > 0.09

---

## 2. Biofilm Assay
*Supported Readers: Tecan Spark*

For each sample at a specific dilution level, the assay measures absorbance in triplicates. It calculates the Positive Control average from column K across all 8 dilution rows (rows 42 to 49).

**Calculations:**
- **Sample Absorbance (Average):** The arithmetic mean of the three triplicate wells.
  $$ \text{SampleAbs} = \frac{ \text{Val}_1 + \text{Val}_2 + \text{Val}_3 }{ 3 } $$
- **Positive Control Absorbance (Average of K42:K49):** The arithmetic mean of the 8 positive control wells on the plate.
  $$ \text{ControlAbs} = \frac{\sum_{r=42}^{49} \text{K}_r}{8} $$
- **% Biofilm Formation:** Calculated relative to the plate's positive control average.
  $$ \% \text{ Biofilm Formation} = \left( \frac{\text{SampleAbs}}{\text{ControlAbs}} \right) \times 100 $$

**Qualitative Result Thresholds:**
- **Active (A):** % Biofilm Formation < 30%
- **Questionable (Q):** 30% ≤ % Biofilm Formation ≤ 40%
- **Inactive (I):** % Biofilm Formation > 40%

---

## 3. Cell Viability Assay

This assay measures cell survival across 96-well microplates using sample triplicates, negative controls, and positive controls.

### Control Wells (Shared across all layouts)
- **Negative Control ($Avg_{Neg}$):** Mean of the 6 negative control wells in Column 11 (`B11:G11`).
  $$ Avg_{Neg} = \frac{\sum_{r=B}^{G} \text{Well}(r, 11)}{6} $$
- **Positive Control ($Avg_{Pos}$):** Mean of the 6 positive control wells in Column 12 (`B12:G12`).
  $$ Avg_{Pos} = \frac{\sum_{r=B}^{G} \text{Well}(r, 12)}{6} $$

### Calculation Formula
- **Average Sample Absorbance ($Avg_{Sample}$):** Mean of the 3 triplicate wells corresponding to the sample/dilution.
  $$ Avg_{Sample} = \frac{\text{Val}_1 + \text{Val}_2 + \text{Val}_3}{3} $$
- **% Survival (Activity):**
  $$ \% \text{ Survival} = \frac{(Avg_{Sample} - Avg_{Pos}) \times 100}{Avg_{Neg} - Avg_{Pos}} $$

### Qualitative Result Thresholds
- **Active (A):** % Survival < 50%
- **Qualified (Q):** 50% ≤ % Survival ≤ 60%
- **Inactive (I):** % Survival > 60%

### Plate Layout Configurations

1. **Bacteria Samples (3 Samples × 6 Dilutions in Triplicates):**
   - **Sample 1 Dilutions (S1-1 to S1-6):** Triplicates across columns 2–4 for each row B–G
     - S1-1: `B2, B3, B4`
     - S1-2: `C2, C3, C4`
     - S1-3: `D2, D3, D4`
     - S1-4: `E2, E3, E4`
     - S1-5: `F2, F3, F4`
     - S1-6: `G2, G3, G4`
   - **Sample 2 Dilutions (S2-1 to S2-6):** Triplicates across columns 5–7 for each row B–G
     - S2-1: `B5, B6, B7`
     - S2-2: `C5, C6, C7`
     - S2-3: `D5, D6, D7`
     - S2-4: `E5, E6, E7`
     - S2-5: `F5, F6, F7`
     - S2-6: `G5, G6, G7`
   - **Sample 3 Dilutions (S3-1 to S3-6):** Triplicates across columns 8–10 for each row B–G
     - S3-1: `B8, B9, B10`
     - S3-2: `C8, C9, C10`
     - S3-3: `D8, D9, D10`
     - S3-4: `E8, E9, E10`
     - S3-5: `F8, F9, F10`
     - S3-6: `G8, G9, G10`
   - **Negative Control:** `B11:G11`
   - **Positive Control:** `B12:G12`

2. **Invertebrate Samples (2 Samples × 8 Dilutions in Triplicates):**
   - **Sample 1 Dilutions (S1-1 to S1-8):** Triplicates across rows B–D for columns 2–9
     - S1-1: `B2, C2, D2`
     - S1-2: `B3, C3, D3`
     - S1-3: `B4, C4, D4`
     - S1-4: `B5, C5, D5`
     - S1-5: `B6, C6, D6`
     - S1-6: `B7, C7, D7`
     - S1-7: `B8, C8, D8`
     - S1-8: `B9, C9, D9`
   - **Sample 2 Dilutions (S2-1 to S2-8):** Triplicates across rows E–G for columns 2–9
     - S2-1: `E2, F2, G2`
     - S2-2: `E3, F3, G3`
     - S2-3: `E4, F4, G4`
     - S2-4: `E5, F5, G5`
     - S2-5: `E6, F6, G6`
     - S2-6: `E7, F7, G7`
     - S2-7: `E8, F8, G8`
     - S2-8: `E9, F9, G9`
   - **Negative Control:** `B11:G11`
   - **Positive Control:** `B12:G12`

3. **Bio-2608 Course (18 Samples, Single Concentration in Triplicates):**
   - **Samples 1–9 (S1 to S9):** Triplicates across rows B–D for columns 2–10
     - S1: `B2, C2, D2`
     - S2: `B3, C3, D3`
     - S3: `B4, C4, D4`
     - S4: `B5, C5, D5`
     - S5: `B6, C6, D6`
     - S6: `B7, C7, D7`
     - S7: `B8, C8, D8`
     - S8: `B9, C9, D9`
     - S9: `B10, C10, D10`
   - **Samples 10–18 (S10 to S18):** Triplicates across rows E–G for columns 2–10
     - S10: `E2, F2, G2`
     - S11: `E3, F3, G3`
     - S12: `E4, F4, G4`
     - S13: `E5, F5, G5`
     - S14: `E6, F6, G6`
     - S15: `E7, F7, G7`
     - S16: `E8, F8, G8`
     - S17: `E9, F9, G9`
     - S18: `E10, F10, G10`
   - **Negative Control:** `B11:G11`
   - **Positive Control:** `B12:G12`

---

## 4. Anti-inflammatory Assay
*Supported Readers: Tecan Spark*

This assay evaluates the inhibition of inflammatory cytokine release (TNF-$\alpha$) in human monocytic leukemia cells (THP-1 model) across 96-well microtiter plates. Each plate contains 32 samples tested in duplicate, a cell control, an LPS-stimulated control, and an 8-point standard curve.

### Plate Layout & Raw Well Locations (Excel Rows 42–49)
- **Samples (S1–S32 in duplicates):**
  - **S1 to S8:** Columns B & C (`B42:C42` down to `B49:C49`, Rows A–H)
  - **S9 to S16:** Columns D & E (`D42:E42` down to `D49:E49`, Rows A–H)
  - **S17 to S24:** Columns F & G (`F42:G42` down to `F49:G49`, Rows A–H)
  - **S25 to S32:** Columns H & I (`H42:I42` down to `H49:I49`, Rows A–H)
- **LPS Control:** Wells `J42, J43, J44` (Column 9, Rows A–C)
- **Cell Control:** Wells `K42, K43, K44` (Column 10, Rows A–C)
- **Standard Curve:** Columns L & M (`L42:M42` to `L49:M49`, Rows A–H) in duplicate across 8 known concentrations:
  - Row 42 (A): 2000 pg/mL
  - Row 43 (B): 1000 pg/mL
  - Row 44 (C): 500 pg/mL
  - Row 45 (D): 250 pg/mL
  - Row 46 (E): 125 pg/mL
  - Row 47 (F): 62.5 pg/mL
  - Row 48 (G): 31.3 pg/mL
  - Row 49 (H): 0 pg/mL

### Calculations

1. **Standard Curve Regression:**
   The average absorbance (OD) for each standard dilution $r \in [42..49]$ is calculated as $y_r = \frac{L_r + M_r}{2}$.
   - **Chart Trendline Display ($y = mx + b$):** Plots OD ($y$) against Concentration ($x$), yielding the visual equation:
     $$ \text{OD} = m \cdot \text{Conc} + b \quad (R^2 = 0.9952) $$
   - **Excel `=TREND` / `=FORECAST` Interpolation:** To convert an unknown OD into TNF concentration ($\text{pg/mL}$), the analysis uses the exact linear regression of Concentration ($Y$) against OD ($X$), matching Excel's built-in `=FORECAST(OD, known_concs, known_ODs)` / `=TREND(...)`:
     $$ \text{TNF}_{\text{unadjusted}} = m_{\text{forecast}} \cdot \text{OD} + b_{\text{forecast}} $$
     *(where $m_{\text{forecast}} \approx 1973.21$ and $b_{\text{forecast}} \approx -212.73$)*

2. **Cell Control & LPS Control (Adjusted for Dilution):**
   - **Cell Control ($Avg_{\text{CellCtrl}}$):** Mean OD of wells `K42, K43, K44`. Dilution factor is 2:
     $$ \text{TNF}_{\text{CellCtrl}} = \text{TNF}_{\text{unadjusted}}(Avg_{\text{CellCtrl}}) \times 2 \approx 3351 \text{ pg/mL} $$
   - **LPS Control ($Avg_{\text{LPSCtrl}}$):** Mean OD of wells `J42, J43, J44`. Dilution factor is 20:
     $$ \text{TNF}_{\text{LPSCtrl}} = \text{TNF}_{\text{unadjusted}}(Avg_{\text{LPSCtrl}}) \times 20 \approx 31215 \text{ pg/mL} $$

3. **Sample TNF (pg/mL) & % Inhibition:**
   - **Sample TNF:** Mean OD of sample duplicates, adjusted for 20× dilution:
     $$ \text{TNF}_{\text{Sample}} = \text{TNF}_{\text{unadjusted}}(Avg_{\text{Sample}}) \times 20 $$
   - **% Inhibition:**
     $$ \% \text{ Inhibition} = 100 - \left( \frac{\text{TNF}_{\text{Sample}} - \text{TNF}_{\text{CellCtrl}}}{\text{TNF}_{\text{LPSCtrl}} - \text{TNF}_{\text{CellCtrl}}} \right) \times 100 $$

### Qualitative Result Thresholds
- **Active (A):** % Inhibition ≥ 10%
- **Qualified (Q):** 5% < % Inhibition < 10%
- **Inactive (I):** % Inhibition ≤ 5%

---

## 5. Unimplemented Assays
The following assay is currently scaffolded in the application but lacks calculation implementations:
- **DPP-IV Assay**

Calculations for this assay will be activated once the formulas and implementation plans are confirmed.
