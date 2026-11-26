import * as XLSX from 'xlsx';
import { BACTERIAL_STRAINS } from '../config/assayTypes.js';

/**
 * Analysis Service
 * Handles data extraction and processing for different assays and readers.
 */

/**
 * Main entry point for analysis
 */
export async function analyzeData(formData, assayConfig) {
  const { assayType, plateReader, file } = formData;

  if (assayType === 'mic' && plateReader === 'tecan-spark') {
    return await processMicTecanSpark(formData, assayConfig);
  }

  if (assayType === 'mic' && plateReader === 'pe-victor') {
    return await processMicPerkinElmerVictor(formData, assayConfig);
  }

  if (assayType === 'biofilm' && plateReader === 'tecan-spark') {
    return await processBiofilmTecanSpark(formData, assayConfig);
  }

  if (assayType === 'viability') {
    return await processViabilityAssay(formData, assayConfig);
  }

  if (assayType === 'anti-inflammatory') {
    return await processAntiInflammatoryAssay(formData, assayConfig);
  }

  // Fallback for other combinations
  throw new Error(`Analysis for ${assayType} with ${plateReader} is not yet implemented.`);
}

/**
 * Process MIC Assay data from Tecan Spark Excel readout
 */
async function processMicTecanSpark(formData, assayConfig) {
  const { file, assayDate, investigator } = formData;
  const { selectedStrains, concentrationUnit, sets, platesPerSet } = assayConfig;

  // 1. Read the uploaded file
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetNames = workbook.SheetNames;

  console.log(`Analyzing ${sheetNames.length} sheets for ${sets.length} sets...`);

  const results = [];

  // Map strain IDs to their database names for the ASSAY_NAME column
  const strainMap = {};
  BACTERIAL_STRAINS.forEach(s => {
    strainMap[s.id] = s.assayName;
  });

  // 2. Iterate through sets
  // Each set has 'platesPerSet' plates (sheets)
  for (let setIdx = 0; setIdx < sets.length; setIdx++) {
    const currentSet = sets[setIdx];
    const setBaseIdx = setIdx * platesPerSet;
    
    console.log(`Processing Set ${currentSet.setIndex} (Base sheet index: ${setBaseIdx})`);

    // Iterate through plates (strains) in this set
    for (let plateIdx = 0; plateIdx < platesPerSet; plateIdx++) {
      const globalSheetIdx = setBaseIdx + plateIdx;
      const sheetName = sheetNames[globalSheetIdx];
      
      if (!sheetName) {
        console.warn(`Set ${currentSet.setIndex}: No sheet found at index ${globalSheetIdx}`);
        continue;
      }

      console.log(`- Set ${currentSet.setIndex}, Plate ${plateIdx + 1}: Using sheet "${sheetName}"`);

      const worksheet = workbook.Sheets[sheetName];
      const strainId = selectedStrains[plateIdx];
      const assayName = strainMap[strainId] || 'Unknown Strain';

      // 3. Process each sample slot (s1 to s5)
      // Each slot corresponds to a column pair in the 96-well grid
      // s1: C/D, s2: E/F, s3: G/H, s4: I/J, s5: K/L
      const colPairs = [
        { col1: 'C', col2: 'D' }, // s1
        { col1: 'E', col2: 'F' }, // s2
        { col1: 'G', col2: 'H' }, // s3
        { col1: 'I', col2: 'J' }, // s4
        { col1: 'K', col2: 'L' }, // s5
      ];

      for (let sIdx = 0; sIdx < colPairs.length; sIdx++) {
        const uiSampleName = currentSet.samples[sIdx];
        
        // Skip if sample ID is empty in the UI
        if (!uiSampleName || uiSampleName.trim() === '') {
          continue;
        }

        const pair = colPairs[sIdx];

        // 4. Iterate through rows 42 to 49 (8 rows per sample slot)
        for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
          const rowNum = 42 + rowIdx;
          
          const val1 = getCellValue(worksheet, `${pair.col1}${rowNum}`);
          const val2 = getCellValue(worksheet, `${pair.col2}${rowNum}`);

          // Step 5: Average of duplicates
          const activity = (val1 + val2) / 2;

          // Step 6: Qualitative result
          let qualResult = 'I'; // Default: Inactive (> 0.09)
          if (activity < 0.05) {
            qualResult = 'A'; // Active
          } else if (activity <= 0.09) {
            qualResult = 'Q'; // Qualified
          }

          // Step 4 & 8: Construct Row
          // Material ID is SampleName-RowIndex
          const materialId = `${uiSampleName}-${rowIdx + 1}`;

          results.push({
            "MATERIAL_ID": materialId,
            "MATERIAL_TYPE": "F",
            "PLATE_ID": "",
            "WELL_ID": "",
            "ASSAY_CATEGORY": "ANTI-BACTERIAL",
            "ASSAY_NAME": assayName,
            "ACTIVITY": activity.toFixed(4),
            "UNITS": "ABS600",
            "ASSAY_QUAL_RESULT": qualResult,
            "ACTIVITY_2": "",
            "UNITS_2": "",
            "ACTIVITY_3": "",
            "UNITS_3": "",
            "ASSAY_DATE": assayDate,
            "PROJECT_ID": "MARBIO",
            "DEPARTMENT_ID": "MARBIO",
            "CONCENTRATION": "100",
            "CONC_UNITS": concentrationUnit,
            "ADMIN": "201028MAL_Run3_1 20-0002(XX)",
            "INVESTIGATOR": investigator,
            "NOTEBOOK": "B_MIC_1",
            "COMMENTS": "",
            "EXTRA": "",
            "PLATE_ID_2": "",
            "WELL_ID_2": "NONE"
          });
        }
      }
    }
  }

  // 7. Generate Output Excel
  const outputWs = XLSX.utils.json_to_sheet(results);
  ensureNoIndexColumn(outputWs, "MATERIAL_ID");
  const outputWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(outputWb, outputWs, "Analysis Results");

  // Return the blob for download
  const wbout = XLSX.write(outputWb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/octet-stream' });
}


/**
 * Process MIC Assay data from PerkinElmer VICTOR Excel readout.
 *
 * Unlike Tecan Spark (one sheet per plate), the Victor puts ALL plates
 * stacked vertically in a single sheet called "Plate_Page1".
 *
 * Each plate block is 15 rows:
 *   Row 0: Header (Plate | Repeat | End time | Start temp. | End temp. | BarCode)
 *   Row 1: Plate metadata (plate number, repeat, time, temps, barcode)
 *   Row 2: Empty
 *   Row 3: "AB600 (A)"
 *   Row 4: Baseline value
 *   Row 5: Empty
 *   Rows 6-13: 8 rows × 12 columns of OD data (plate rows A-H, columns 1-12)
 *   Row 14: Empty separator
 *
 * Column mapping for PerkinElmer VICTOR:
 *   s1: B/C, s2: D/E, s3: F/G, s4: H/I, s5: J/K (plate cols 2/3, 4/5, 6/7, 8/9, 10/11)
 */
async function processMicPerkinElmerVictor(formData, assayConfig) {
  const { file, assayDate, investigator } = formData;
  const { selectedStrains, concentrationUnit, sets, platesPerSet } = assayConfig;

  // 1. Read the uploaded file
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);

  // Victor uses a single sheet called "Plate_Page1"
  const worksheet = workbook.Sheets['Plate_Page1'];
  if (!worksheet) {
    throw new Error('Sheet "Plate_Page1" not found. Please ensure this is a PerkinElmer VICTOR export file.');
  }

  console.log(`Analyzing PerkinElmer VICTOR file for ${sets.length} sets (${platesPerSet} plates/set)...`);

  const results = [];

  // Map strain IDs to their database names for the ASSAY_NAME column
  const strainMap = {};
  BACTERIAL_STRAINS.forEach(s => {
    strainMap[s.id] = s.assayName;
  });

  // Column mapping for PerkinElmer VICTOR:
  // s1: B/C (cols 2 & 3), s2: D/E (cols 4 & 5), s3: F/G (cols 6 & 7), s4: H/I (cols 8 & 9), s5: J/K (cols 10 & 11)
  const colPairs = [
    { col1: 'B', col2: 'C' }, // s1 (Plate cols 2 & 3)
    { col1: 'D', col2: 'E' }, // s2 (Plate cols 4 & 5)
    { col1: 'F', col2: 'G' }, // s3 (Plate cols 6 & 7)
    { col1: 'H', col2: 'I' }, // s4 (Plate cols 8 & 9)
    { col1: 'J', col2: 'K' }, // s5 (Plate cols 10 & 11)
  ];

  // 2. Iterate through sets
  for (let setIdx = 0; setIdx < sets.length; setIdx++) {
    const currentSet = sets[setIdx];
    const setBaseIdx = setIdx * platesPerSet;

    console.log(`Processing Set ${currentSet.setIndex} (base plate index: ${setBaseIdx})`);

    // Iterate through plates (strains) in this set
    for (let plateIdx = 0; plateIdx < platesPerSet; plateIdx++) {
      const globalPlateIdx = setBaseIdx + plateIdx;
      const strainId = selectedStrains[plateIdx];
      const assayName = strainMap[strainId] || 'Unknown Strain';

      // Each plate block is 15 rows. Data starts at offset 6 within each block.
      // Row number (1-indexed) = globalPlateIdx * 15 + 7
      const dataStartRow = globalPlateIdx * 15 + 7;

      console.log(`- Set ${currentSet.setIndex}, Plate ${plateIdx + 1} (${assayName}): data rows ${dataStartRow}-${dataStartRow + 7}`);

      // 3. Process each sample slot (s1 to s5)
      for (let sIdx = 0; sIdx < colPairs.length; sIdx++) {
        const uiSampleName = currentSet.samples[sIdx];

        // Skip if sample ID is empty in the UI
        if (!uiSampleName || uiSampleName.trim() === '') {
          continue;
        }

        const pair = colPairs[sIdx];

        // 4. Iterate through 8 dilution rows
        for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
          const rowNum = dataStartRow + rowIdx;

          const val1 = getCellValue(worksheet, `${pair.col1}${rowNum}`);
          const val2 = getCellValue(worksheet, `${pair.col2}${rowNum}`);

          // Step 5: Average of duplicates
          const activity = (val1 + val2) / 2;

          // Step 6: Qualitative result
          let qualResult = 'I'; // Default: Inactive (> 0.09)
          if (activity < 0.05) {
            qualResult = 'A'; // Active
          } else if (activity <= 0.09) {
            qualResult = 'Q'; // Qualified
          }

          // Construct row — identical output format to Tecan Spark
          const materialId = `${uiSampleName}-${rowIdx + 1}`;

          results.push({
            "MATERIAL_ID": materialId,
            "MATERIAL_TYPE": "F",
            "PLATE_ID": "",
            "WELL_ID": "",
            "ASSAY_CATEGORY": "ANTI-BACTERIAL",
            "ASSAY_NAME": assayName,
            "ACTIVITY": activity.toFixed(4),
            "UNITS": "ABS600",
            "ASSAY_QUAL_RESULT": qualResult,
            "ACTIVITY_2": "",
            "UNITS_2": "",
            "ACTIVITY_3": "",
            "UNITS_3": "",
            "ASSAY_DATE": assayDate,
            "PROJECT_ID": "MARBIO",
            "DEPARTMENT_ID": "MARBIO",
            "CONCENTRATION": "100",
            "CONC_UNITS": concentrationUnit,
            "ADMIN": "201028MAL_Run3_1 20-0002(XX)",
            "INVESTIGATOR": investigator,
            "NOTEBOOK": "B_MIC_1",
            "COMMENTS": "",
            "EXTRA": "",
            "PLATE_ID_2": "",
            "WELL_ID_2": "NONE"
          });
        }
      }
    }
  }

  // Generate Output Excel — same format as Tecan Spark
  const outputWs = XLSX.utils.json_to_sheet(results);
  ensureNoIndexColumn(outputWs, "MATERIAL_ID");
  const outputWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(outputWb, outputWs, "Analysis Results");

  const wbout = XLSX.write(outputWb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/octet-stream' });
}


/**
 * Safely get a numeric cell value
 */
function getCellValue(worksheet, address) {
  const cell = worksheet[address];
  if (!cell) return 0;
  const val = parseFloat(cell.v);
  return isNaN(val) ? 0 : val;
}

/**
 * Process Biofilm Assay data from Tecan Spark Excel readout
 */
async function processBiofilmTecanSpark(formData, assayConfig) {
  const { file, assayDate, investigator } = formData;
  const { concentrationUnit, plateCount, plates } = assayConfig;

  // 1. Read the uploaded file
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetNames = workbook.SheetNames;

  console.log(`Analyzing Biofilm Assay: ${sheetNames.length} sheets, ${plateCount} plates...`);

  const results = [];

  // Column groups mapping for the 3 sample series
  const seriesCols = [
    { col1: 'B', col2: 'C', col3: 'D' }, // Series 1
    { col1: 'E', col2: 'F', col3: 'G' }, // Series 2
    { col1: 'H', col2: 'I', col3: 'J' }, // Series 3
  ];

  // Validation: Ensure uploaded file has the same number of sheets as plateCount
  if (sheetNames.length !== plateCount) {
    throw new Error(
      `The uploaded Excel file has ${sheetNames.length} sheet(s), but Plates Count is set to ${plateCount}. The uploaded file must contain exactly ${plateCount} sheet(s) (1 sheet per plate).`
    );
  }

  // 2. Iterate through plates
  for (let pIdx = 0; pIdx < plateCount; pIdx++) {
    const sheetName = sheetNames[pIdx];
    if (!sheetName) {
      console.warn(`Biofilm Assay Plate ${pIdx + 1}: No sheet found at index ${pIdx}`);
      continue;
    }

    console.log(`Processing Biofilm Plate ${pIdx + 1} using sheet "${sheetName}"`);
    const worksheet = workbook.Sheets[sheetName];
    const plateConf = plates[pIdx];

    // Calculate Positive Control Plate Average: AVERAGE(K42:K49)
    const controlVals = [];
    for (let r = 42; r <= 49; r++) {
      controlVals.push(getCellValue(worksheet, `K${r}`));
    }
    const avgControlAbs = controlVals.length > 0
      ? controlVals.reduce((sum, v) => sum + v, 0) / controlVals.length
      : 0;

    console.log(`Plate ${pIdx + 1} Positive Control Average (K42:K49): ${avgControlAbs}`);

    // 3. Iterate through 8 dilution rows (Excel rows 42 to 49)
    for (let rIdx = 0; rIdx < 8; rIdx++) {
      const rowNum = 42 + rIdx;

      // Iterate through 3 column series
      for (let sIdx = 0; sIdx < 3; sIdx++) {
        // Retrieve the user-specified Sample ID for this cell
        const sampleId = plateConf.grid[rIdx][sIdx];

        // Skip if empty
        if (!sampleId || sampleId.trim() === '') {
          continue;
        }

        const cols = seriesCols[sIdx];
        const val1 = getCellValue(worksheet, `${cols.col1}${rowNum}`);
        const val2 = getCellValue(worksheet, `${cols.col2}${rowNum}`);
        const val3 = getCellValue(worksheet, `${cols.col3}${rowNum}`);

        // Average of triplicates
        const sampleAbs = (val1 + val2 + val3) / 3;

        // Calculate % Biofilm Formation using plate-wide AVERAGE(K42:K49)
        let biofilmFormation = 0;
        let qualResult = 'I';
        if (avgControlAbs > 0) {
          biofilmFormation = (sampleAbs / avgControlAbs) * 100;

          // Determine qualitative result:
          // Active (A): < 30%
          // Questionable (Q): 30% - 40%
          // Inactive (I): > 40%
          if (biofilmFormation < 30) {
            qualResult = 'A';
          } else if (biofilmFormation <= 40) {
            qualResult = 'Q';
          } else {
            qualResult = 'I';
          }
        }

        // Populate database row model
        results.push({
          "MATERIAL_ID": sampleId,
          "MATERIAL_TYPE": "F",
          "PLATE_ID": "",
          "WELL_ID": "",
          "ASSAY_CATEGORY": "ANTI-BACTERIAL",
          "ASSAY_NAME": "SEPIDERM_BIOFILM",
          "ACTIVITY": biofilmFormation.toFixed(4),
          "UNITS": "PCT",
          "ASSAY_QUAL_RESULT": qualResult,
          "ACTIVITY_2": "",
          "UNITS_2": "",
          "ACTIVITY_3": "",
          "UNITS_3": "",
          "ASSAY_DATE": assayDate,
          "PROJECT_ID": "MARBIO",
          "DEPARTMENT_ID": "MARBIO",
          "CONCENTRATION": "100",
          "CONC_UNITS": concentrationUnit,
          "ADMIN": "201009MAL_Run1_1 biofilm (9)",
          "INVESTIGATOR": investigator,
          "NOTEBOOK": "B_BIOFILM_1",
          "COMMENTS": "",
          "EXTRA": "",
          "PLATE_ID_2": "",
          "WELL_ID_2": "NONE"
        });
      }
    }
  }

  // 4. Generate Output Excel Workbook
  const outputWs = XLSX.utils.json_to_sheet(results);
  ensureNoIndexColumn(outputWs, "MATERIAL_ID");
  const outputWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(outputWb, outputWs, "Analysis Results");

  // Return the blob for browser download
  const wbout = XLSX.write(outputWb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/octet-stream' });
}


/**
 * Process Cell Viability Assay Excel readouts.
 */
async function processViabilityAssay(formData, assayConfig) {
  const { file, assayDate, investigator } = formData;
  const { concentrationUnit, maxConcentration, plateCount, layoutType, cellLines, plates } = assayConfig;

  // 1. Read the uploaded file
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetNames = workbook.SheetNames;

  // Validation: Ensure the uploaded file has the exact same number of sheets as plateCount
  if (sheetNames.length !== plateCount) {
    throw new Error(
      `The uploaded Excel file contains ${sheetNames.length} sheet(s), but Plates Count is set to ${plateCount}. The uploaded file must contain exactly ${plateCount} sheet(s) (1 sheet per plate).`
    );
  }

  const results = [];
  const cellLineName = (cellLines && cellLines[0]) ? cellLines[0] : 'Unknown Cell Line';

  // Helper: scan columns to find the row where plate data starts ('A' followed by 'B')
  const findDataStartRow = (sheet) => {
    // Check column A
    for (let row = 1; row <= 100; row++) {
      const cellA = sheet[`A${row}`];
      if (cellA && String(cellA.v).trim().toUpperCase() === 'A') {
        const cellB = sheet[`A${row + 1}`];
        if (cellB && String(cellB.v).trim().toUpperCase() === 'B') {
          return row;
        }
      }
    }
    // Also check column B in case col A has headers or row numbers
    for (let row = 1; row <= 100; row++) {
      const cellA = sheet[`B${row}`];
      if (cellA && String(cellA.v).trim().toUpperCase() === 'A') {
        const cellB = sheet[`B${row + 1}`];
        if (cellB && String(cellB.v).trim().toUpperCase() === 'B') {
          return row;
        }
      }
    }
    return null;
  };

  // Helper to resolve raw 96-well plate coordinates using detected data start row
  const getWellValue = (sheet, well, dataStartRow) => {
    const match = well.match(/^([A-H])(\d+)$/);
    if (!match) return 0;
    const rowLetter = match[1];
    const colNum = parseInt(match[2]);
    const excelRow = dataStartRow + (rowLetter.charCodeAt(0) - 65);
    const excelColLetter = String.fromCharCode(66 + (colNum - 1));
    const cellRef = `${excelColLetter}${excelRow}`;
    return getCellValue(sheet, cellRef);
  };

  // 2. Iterate through plates (1 sheet per plate)
  console.log(`Viability Assay: Processing ${plateCount} plate(s) across ${sheetNames.length} sheet(s)...`);

  for (let pIdx = 0; pIdx < plateCount; pIdx++) {
    const sheetName = sheetNames[pIdx];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" for Plate ${pIdx + 1} not found in workbook.`);
    }

    const dataStartRow = findDataStartRow(worksheet) || 34;
    console.log(`Processing Viability Plate ${pIdx + 1} using sheet "${sheetName}" (Detected data start row = ${dataStartRow})`);

    const plateConf = plates[pIdx] || (plates[0] ? plates[0] : { sampleIds: [] });

    // Compute Negative & Positive Controls averages
    // Negative Control: Col 11, Rows B through G (6 wells)
    // Positive Control: Col 12, Rows B through G (6 wells)
    const negControlWells = ['B11', 'C11', 'D11', 'E11', 'F11', 'G11'];
    const posControlWells = ['B12', 'C12', 'D12', 'E12', 'F12', 'G12'];

    const negVals = negControlWells.map(w => getWellValue(worksheet, w, dataStartRow));
    const posVals = posControlWells.map(w => getWellValue(worksheet, w, dataStartRow));

    const avgNeg = negVals.reduce((a, b) => a + b, 0) / negVals.length;
    const avgPos = posVals.reduce((a, b) => a + b, 0) / posVals.length;

    console.log(`Plate ${pIdx + 1} ("${sheetName}") averages:`, {
      avgNeg,
      avgPos
    });

    // ── Well-mapping matrices for the 3 layout types ──

    // Bacteria: 3 samples × 6 dilutions, triplicates across columns
    // Sample 1: Cols 2,3,4 — Rows B..G → Dilutions 1..6
    // Sample 2: Cols 5,6,7 — Rows B..G → Dilutions 1..6
    // Sample 3: Cols 8,9,10 — Rows B..G → Dilutions 1..6
    const bacteriaWells = [
      // Sample 1 dilutions
      ['B2', 'B3', 'B4'],   // S1-1
      ['C2', 'C3', 'C4'],   // S1-2
      ['D2', 'D3', 'D4'],   // S1-3
      ['E2', 'E3', 'E4'],   // S1-4
      ['F2', 'F3', 'F4'],   // S1-5
      ['G2', 'G3', 'G4'],   // S1-6
      // Sample 2 dilutions
      ['B5', 'B6', 'B7'],   // S2-1
      ['C5', 'C6', 'C7'],   // S2-2
      ['D5', 'D6', 'D7'],   // S2-3
      ['E5', 'E6', 'E7'],   // S2-4
      ['F5', 'F6', 'F7'],   // S2-5
      ['G5', 'G6', 'G7'],   // S2-6
      // Sample 3 dilutions
      ['B8', 'B9', 'B10'],  // S3-1
      ['C8', 'C9', 'C10'],  // S3-2
      ['D8', 'D9', 'D10'],  // S3-3
      ['E8', 'E9', 'E10'],  // S3-4
      ['F8', 'F9', 'F10'],  // S3-5
      ['G8', 'G9', 'G10'],  // S3-6
    ];

    // Invertebrate: 2 samples × 8 dilutions, triplicates across rows
    // Sample 1: Rows B,C,D — Cols 2..9 → Dilutions 1..8
    // Sample 2: Rows E,F,G — Cols 2..9 → Dilutions 1..8
    const invertebrateWells = [
      // Sample 1 dilutions
      ['B2', 'C2', 'D2'],   // S1-1
      ['B3', 'C3', 'D3'],   // S1-2
      ['B4', 'C4', 'D4'],   // S1-3
      ['B5', 'C5', 'D5'],   // S1-4
      ['B6', 'C6', 'D6'],   // S1-5
      ['B7', 'C7', 'D7'],   // S1-6
      ['B8', 'C8', 'D8'],   // S1-7
      ['B9', 'C9', 'D9'],   // S1-8
      // Sample 2 dilutions
      ['E2', 'F2', 'G2'],   // S2-1
      ['E3', 'F3', 'G3'],   // S2-2
      ['E4', 'F4', 'G4'],   // S2-3
      ['E5', 'F5', 'G5'],   // S2-4
      ['E6', 'F6', 'G6'],   // S2-5
      ['E7', 'F7', 'G7'],   // S2-6
      ['E8', 'F8', 'G8'],   // S2-7
      ['E9', 'F9', 'G9'],   // S2-8
    ];

    // Bio-2608: 18 samples at single concentration, triplicates across rows
    // S1..S9:   Rows B,C,D — Cols 2..10
    // S10..S18: Rows E,F,G — Cols 2..10
    const bio2608Wells = [
      ['B2', 'C2', 'D2'],   // S1
      ['B3', 'C3', 'D3'],   // S2
      ['B4', 'C4', 'D4'],   // S3
      ['B5', 'C5', 'D5'],   // S4
      ['B6', 'C6', 'D6'],   // S5
      ['B7', 'C7', 'D7'],   // S6
      ['B8', 'C8', 'D8'],   // S7
      ['B9', 'C9', 'D9'],   // S8
      ['B10', 'C10', 'D10'], // S9
      ['E2', 'F2', 'G2'],   // S10
      ['E3', 'F3', 'G3'],   // S11
      ['E4', 'F4', 'G4'],   // S12
      ['E5', 'F5', 'G5'],   // S13
      ['E6', 'F6', 'G6'],   // S14
      ['E7', 'F7', 'G7'],   // S15
      ['E8', 'F8', 'G8'],   // S16
      ['E9', 'F9', 'G9'],   // S17
      ['E10', 'F10', 'G10'], // S18
    ];

    // Select layout based on layoutType
    let sampleWells;
    if (layoutType === 'invertebrate') {
      sampleWells = invertebrateWells;
    } else if (layoutType === 'bio2608') {
      sampleWells = bio2608Wells;
    } else {
      sampleWells = bacteriaWells;
    }

    // Process each sample input from the configuration
    const sampleIds = plateConf.sampleIds || [];
    const hasAnyCustomId = sampleIds.some(id => id && id.trim() !== '');

    for (let sIdx = 0; sIdx < sampleWells.length; sIdx++) {
      let sampleId = sampleIds[sIdx] ? sampleIds[sIdx].trim() : '';
      if (!sampleId) {
        if (!hasAnyCustomId) {
          // If no custom sample IDs were provided, default to sequential index across plates (1..16, 17..32...)
          sampleId = `${(pIdx * sampleWells.length) + (sIdx + 1)}`;
        } else {
          continue;
        }
      }

      const wells = sampleWells[sIdx];
      const sampleVals = wells.map(w => getWellValue(worksheet, w, dataStartRow));
      const avgSample = sampleVals.reduce((a, b) => a + b, 0) / sampleVals.length;

      // Formula: (average of raw data of sample - Average of positive control) * 100 / (average of negative control - average of positive control)
      let activity = 0;
      const divisor = avgNeg - avgPos;
      if (divisor !== 0) {
        activity = ((avgSample - avgPos) * 100) / divisor;
      }

      // Qualitative threshold categorization:
      // activity < 50% -> A
      // 50% <= activity <= 60% -> Q
      // activity > 60% -> I
      let qualResult = 'I';
      if (activity < 50) {
        qualResult = 'A';
      } else if (activity <= 60) {
        qualResult = 'Q';
      }

      console.log(`Sample: ${sampleId}, Wells: ${wells.join(',')}, Raw: [${sampleVals.join(', ')}], Avg: ${avgSample.toFixed(6)}, PosAvg: ${avgPos.toFixed(6)}, NegAvg: ${avgNeg.toFixed(6)}, SurvivalRate: ${activity.toFixed(4)}%`);

      results.push({
        "MATERIAL_ID": sampleId,
        "MATERIAL_TYPE": "F",
        "PLATE_ID": "",
        "WELL_ID": wells.join(','),
        "ASSAY_CATEGORY": "ANTI-CANCER",
        "ASSAY_NAME": cellLineName,
        "ACTIVITY": activity.toFixed(4),
        "UNITS": "PCT_SURVIVAL",
        "ASSAY_QUAL_RESULT": qualResult,
        "ASSAY_DATE": assayDate,
        "PROJECT_ID": "MARBIO",
        "DEPARTMENT_ID": "MARBIO",
        "CONCENTRATION": maxConcentration,
        "CONC_UNITS": concentrationUnit,
        "ADMIN": "MARBIO",
        "INVESTIGATOR": investigator,
        "NOTEBOOK": "CA_AQOS_1",
        "COMMENTS": ""
      });
    }
  }

  // 3. Generate Output Excel
  const VIABILITY_HEADERS = [
    "MATERIAL_ID",
    "MATERIAL_TYPE",
    "PLATE_ID",
    "WELL_ID",
    "ASSAY_CATEGORY",
    "ASSAY_NAME",
    "ACTIVITY",
    "UNITS",
    "ASSAY_QUAL_RESULT",
    "ASSAY_DATE",
    "PROJECT_ID",
    "DEPARTMENT_ID",
    "CONCENTRATION",
    "CONC_UNITS",
    "ADMIN",
    "INVESTIGATOR",
    "NOTEBOOK",
    "COMMENTS"
  ];

  const outputWs = XLSX.utils.json_to_sheet(results, { header: VIABILITY_HEADERS });
  ensureNoIndexColumn(outputWs, "MATERIAL_ID");

  const outputWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(outputWb, outputWs, "Analysis Results");

  const wbout = XLSX.write(outputWb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/octet-stream' });
}

/**
 * Process Anti-inflammatory Assay data from Tecan Spark Excel readout
 */
async function processAntiInflammatoryAssay(formData, assayConfig) {
  const { file, assayDate, investigator } = formData;
  const { concentrationUnit, maxConcentration, plateCount, plates } = assayConfig;

  // 1. Read the uploaded file
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetNames = workbook.SheetNames;

  console.log(`Analyzing Anti-inflammatory Assay: ${sheetNames.length} sheet(s), ${plateCount} plate(s)...`);

  // Validation: Ensure uploaded file has the exact same number of sheets as plateCount
  if (sheetNames.length !== plateCount) {
    throw new Error(
      `The uploaded Excel file contains ${sheetNames.length} sheet(s), but Plate Count is set to ${plateCount}. The uploaded file must contain exactly ${plateCount} sheet(s) (1 sheet per plate).`
    );
  }

  const results = [];
  const summaryRows = [];

  // 4 series column pairs for samples (each tested in duplicates across rows 42..49):
  // S1..S8:   Cols 1 & 2 (Excel B & C)
  // S9..S16:  Cols 3 & 4 (Excel D & E)
  // S17..S24: Cols 5 & 6 (Excel F & G)
  // S25..S32: Cols 7 & 8 (Excel H & I)
  const seriesColPairs = [
    { col1: 'B', col2: 'C', plateCol1: 1, plateCol2: 2 },
    { col1: 'D', col2: 'E', plateCol1: 3, plateCol2: 4 },
    { col1: 'F', col2: 'G', plateCol1: 5, plateCol2: 6 },
    { col1: 'H', col2: 'I', plateCol1: 7, plateCol2: 8 },
  ];
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const stdCurveConcs = [2000, 1000, 500, 250, 125, 62.5, 31.3, 0];

  // Helper to detect data start row (scanning for 'A' then 'B', fallback to row 42)
  const findDataStartRow = (sheet) => {
    for (let row = 1; row <= 100; row++) {
      const cellA = sheet[`A${row}`];
      if (cellA && String(cellA.v).trim().toUpperCase() === 'A') {
        const cellB = sheet[`A${row + 1}`];
        if (cellB && String(cellB.v).trim().toUpperCase() === 'B') {
          return row;
        }
      }
    }
    for (let row = 1; row <= 100; row++) {
      const cellB = sheet[`B${row}`];
      if (cellB && String(cellB.v).trim().toUpperCase() === 'A') {
        const cellB2 = sheet[`B${row + 1}`];
        if (cellB2 && String(cellB2.v).trim().toUpperCase() === 'B') {
          return row;
        }
      }
    }
    return 42;
  };

  // 2. Iterate through plates
  for (let pIdx = 0; pIdx < plateCount; pIdx++) {
    const sheetName = sheetNames[pIdx];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" for Plate ${pIdx + 1} not found in workbook.`);
    }

    const dataStartRow = findDataStartRow(worksheet);
    console.log(`Processing Anti-inflammatory Plate ${pIdx + 1} ("${sheetName}") with dataStartRow = ${dataStartRow}`);

    const plateConf = plates[pIdx] || (plates[0] ? plates[0] : { sampleIds: [] });
    const sampleIds = plateConf.sampleIds || [];

    // Step A: Standard Curve linear regression
    // Standard Curve duplicate columns: L & M, across 8 rows (42..49)
    const stdCurvePoints = [];
    for (let rIdx = 0; rIdx < 8; rIdx++) {
      const rowNum = dataStartRow + rIdx;
      const valL = getCellValue(worksheet, `L${rowNum}`);
      const valM = getCellValue(worksheet, `M${rowNum}`);
      const avgOD = (valL + valM) / 2;
      stdCurvePoints.push({ x: stdCurveConcs[rIdx], y: avgOD });
    }

    // Linear regression: y = mx + b
    // x = Concentration (pg/mL), y = OD (Absorbance)
    const N = stdCurvePoints.length; // 8
    const sumX = stdCurvePoints.reduce((acc, p) => acc + p.x, 0);
    const sumY = stdCurvePoints.reduce((acc, p) => acc + p.y, 0);
    const meanX = sumX / N;
    const meanY = sumY / N;

    let num = 0;
    let den = 0;
    let ssTot = 0;
    let ssRes = 0;
    for (const p of stdCurvePoints) {
      num += (p.x - meanX) * (p.y - meanY);
      den += (p.x - meanX) * (p.x - meanX);
    }

    // 1. Chart trendline (OD vs Conc, as shown on Excel chart: y = mx + b where y=OD, x=Conc)
    const slopeChart = den !== 0 ? num / den : 0;
    const interceptChart = meanY - slopeChart * meanX;

    for (const p of stdCurvePoints) {
      const yPred = slopeChart * p.x + interceptChart;
      ssRes += (p.y - yPred) * (p.y - yPred);
      ssTot += (p.y - meanY) * (p.y - meanY);
    }
    const r2 = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

    // 2. Excel FORECAST / TREND regression (Conc vs OD, exactly as Excel's =FORECAST(od, concs, ods))
    let numInv = 0;
    let denInv = 0;
    for (const p of stdCurvePoints) {
      numInv += (p.y - meanY) * (p.x - meanX);
      denInv += (p.y - meanY) * (p.y - meanY);
    }
    const slopeForecast = denInv !== 0 ? numInv / denInv : 0;
    const interceptForecast = meanX - slopeForecast * meanY;

    // Helper: calculate TNF pg/mL from OD using Excel FORECAST/TREND regression
    const calcTNF = (od) => {
      return slopeForecast * od + interceptForecast;
    };

    // Step B: Controls
    // Cell Control: K42, K43, K44 (average of 3 wells, then * 2)
    const cellCtrlWells = [`K${dataStartRow}`, `K${dataStartRow + 1}`, `K${dataStartRow + 2}`];
    const cellCtrlVals = cellCtrlWells.map(w => getCellValue(worksheet, w));
    const avgCellCtrlOD = cellCtrlVals.reduce((a, b) => a + b, 0) / cellCtrlVals.length;
    const tnfCellCtrl = calcTNF(avgCellCtrlOD) * 2;

    // LPS Control: J42, J43, J44 (average of 3 wells, then * 20)
    const lpsCtrlWells = [`J${dataStartRow}`, `J${dataStartRow + 1}`, `J${dataStartRow + 2}`];
    const lpsCtrlVals = lpsCtrlWells.map(w => getCellValue(worksheet, w));
    const avgLpsCtrlOD = lpsCtrlVals.reduce((a, b) => a + b, 0) / lpsCtrlVals.length;
    const tnfLpsCtrl = calcTNF(avgLpsCtrlOD) * 20;

    console.log(`Plate ${pIdx + 1} Controls & Curve:`, {
      slopeChart,
      interceptChart,
      slopeForecast,
      interceptForecast,
      r2,
      avgCellCtrlOD,
      tnfCellCtrl,
      avgLpsCtrlOD,
      tnfLpsCtrl
    });

    summaryRows.push({
      "Plate": pIdx + 1,
      "Sheet Name": sheetName,
      "Trendline Equation": `y = ${slopeChart.toFixed(6)}x + ${interceptChart.toFixed(6)}`,
      "R²": r2.toFixed(4),
      "Cell Ctrl Avg OD": avgCellCtrlOD.toFixed(4),
      "Cell Ctrl TNF (pg/mL) [x2]": tnfCellCtrl.toFixed(2),
      "LPS Ctrl Avg OD": avgLpsCtrlOD.toFixed(4),
      "LPS Ctrl TNF (pg/mL) [x20]": tnfLpsCtrl.toFixed(2),
      "Std 2000 OD": stdCurvePoints[0].y.toFixed(4),
      "Std 1000 OD": stdCurvePoints[1].y.toFixed(4),
      "Std 500 OD": stdCurvePoints[2].y.toFixed(4),
      "Std 250 OD": stdCurvePoints[3].y.toFixed(4),
      "Std 125 OD": stdCurvePoints[4].y.toFixed(4),
      "Std 62.5 OD": stdCurvePoints[5].y.toFixed(4),
      "Std 31.3 OD": stdCurvePoints[6].y.toFixed(4),
      "Std 0 OD": stdCurvePoints[7].y.toFixed(4),
    });

    const divisor = tnfLpsCtrl - tnfCellCtrl;

    // Step C: Process 32 Samples
    for (let s = 0; s < 32; s++) {
      let sampleId = sampleIds[s] ? sampleIds[s].trim() : '';
      if (!sampleId) {
        sampleId = `S${s + 1}`;
      }

      const seriesIdx = Math.floor(s / 8); // 0..3
      const rowIdx = s % 8;                // 0..7
      const rowNum = dataStartRow + rowIdx;
      const pair = seriesColPairs[seriesIdx];
      const wellLetter = rowLetters[rowIdx];
      const wellId = `${wellLetter}${String(pair.plateCol1).padStart(2, '0')}`;

      const val1 = getCellValue(worksheet, `${pair.col1}${rowNum}`);
      const val2 = getCellValue(worksheet, `${pair.col2}${rowNum}`);
      const avgSampleOD = (val1 + val2) / 2;

      // Sample TNF value (pg/mL) = calculated value * 20
      const tnfSample = calcTNF(avgSampleOD) * 20;

      // Formula: 100 - (sample - CellControl) / (LPSCtrl - CellCtrl) * 100
      let pctInhibition = 0;
      if (divisor !== 0) {
        pctInhibition = 100 - ((tnfSample - tnfCellCtrl) / divisor) * 100;
      }

      // Qualitative threshold categorization:
      // Active (A): % Inhibition >= 10%
      // Qualified (Q): 5% < % Inhibition < 10%
      // Inactive (I): % Inhibition <= 5%
      let qualResult = 'I';
      if (pctInhibition >= 10) {
        qualResult = 'A';
      } else if (pctInhibition > 5) {
        qualResult = 'Q';
      }

      results.push({
        "MATERIAL_ID": sampleId,
        "MATERIAL_TYPE": "F",
        "PLATE_ID": "",
        "WELL_ID": wellId,
        "ASSAY_CATEGORY": "ANTI-INFLAMMATORY",
        "ASSAY_NAME": "TNF_THP-1",
        "ACTIVITY": pctInhibition.toFixed(4),
        "UNITS": "PCT_INHIBITION",
        "ASSAY_QUAL_RESULT": qualResult,
        "ACTIVITY_2": "",
        "UNITS_2": "",
        "ACTIVITY_3": "",
        "UNITS_3": "",
        "ASSAY_DATE": assayDate,
        "PROJECT_ID": "MARBIO",
        "DEPARTMENT_ID": "MARBIO",
        "CONCENTRATION": maxConcentration,
        "CONC_UNITS": concentrationUnit,
        "ADMIN": "Structure-101_2023(1) 16023",
        "INVESTIGATOR": investigator,
        "NOTEBOOK": "B03",
        "COMMENTS": "",
        "EXTRA": "",
        "PLATE_ID_2": "",
        "WELL_ID_2": "NONE"
      });
    }
  }

  // 3. Generate Output Excel
  const AI_HEADERS = [
    "MATERIAL_ID",
    "MATERIAL_TYPE",
    "PLATE_ID",
    "WELL_ID",
    "ASSAY_CATEGORY",
    "ASSAY_NAME",
    "ACTIVITY",
    "UNITS",
    "ASSAY_QUAL_RESULT",
    "ACTIVITY_2",
    "UNITS_2",
    "ACTIVITY_3",
    "UNITS_3",
    "ASSAY_DATE",
    "PROJECT_ID",
    "DEPARTMENT_ID",
    "CONCENTRATION",
    "CONC_UNITS",
    "ADMIN",
    "INVESTIGATOR",
    "NOTEBOOK",
    "COMMENTS",
    "EXTRA",
    "PLATE_ID_2",
    "WELL_ID_2"
  ];

  const outputWs = XLSX.utils.json_to_sheet(results, { header: AI_HEADERS });
  ensureNoIndexColumn(outputWs, "MATERIAL_ID");

  const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
  ensureNoIndexColumn(summaryWs, "Plate");

  const outputWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(outputWb, outputWs, "Analysis Results");
  XLSX.utils.book_append_sheet(outputWb, summaryWs, "Controls & Curve Summary");

  const wbout = XLSX.write(outputWb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/octet-stream' });
}


/**
 * Remove unwanted index column if present at column A
 */
function ensureNoIndexColumn(worksheet, expectedFirstHeader = 'MATERIAL_ID') {
  if (!worksheet || !worksheet['!ref']) return;
  const a1 = worksheet['A1'];
  const b1 = worksheet['B1'];
  // If A1 is empty or a numeric index, while B1 holds the expected first header
  if ((!a1 || a1.v === '' || typeof a1.v === 'number' || a1.v === undefined) && b1 && b1.v === expectedFirstHeader) {
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C < range.e.c; ++C) {
        const nextCell = worksheet[XLSX.utils.encode_cell({ r: R, c: C + 1 })];
        const currCoord = XLSX.utils.encode_cell({ r: R, c: C });
        if (nextCell) {
          worksheet[currCoord] = nextCell;
        } else {
          delete worksheet[currCoord];
        }
      }
      delete worksheet[XLSX.utils.encode_cell({ r: R, c: range.e.c })];
    }
    range.e.c--;
    worksheet['!ref'] = XLSX.utils.encode_range(range);
  }
}
