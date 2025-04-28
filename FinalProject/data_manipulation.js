import * as d3 from 'd3-dsv';
import { sum } from 'd3';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// To simulate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadCsvs() {
    try {
        const surveyPath = path.join(__dirname, 'static/fish_survey_clean.csv');
        const csvData = await fs.readFile(surveyPath, 'utf8');

        const surveys = d3.csvParse(csvData, (row) => ({
            lake_name: row.Lake_Name,
            lake_id: row.Lake_ID.toLowerCase(),
            year: Number(row.Year),
            species: row.Species,
            size1Count: Number(row["0-5 INCHES"]),
            size2Count: Number(row["6-7 INCHES"]),
            size3Count: Number(row["8-9 INCHES"]),
            size4Count: Number(row["10-11 INCHES"]),
            size5Count: Number(row["12-14 INCHES"]),
            size6Count: Number(row["15-19 INCHES"]),
            size7Count: Number(row["20-24 INCHES"]),
            size8Count: Number(row["25-29 INCHES"]),
            size9Count: Number(row["31-34 INCHES"]),
            size10Count: Number(row["35-39 INCHES"]),
            size11Count: Number(row["40-44 INCHES"]),
            size12Count: Number(row["45-49 INCHES"]),
            size13Count: Number(row["50+INCHES"]),
            totalCount: (Number(row["0-5 INCHES"]) + Number(row["6-7 INCHES"]) + Number(row["8-9 INCHES"]) + Number(row["10-11 INCHES"]) + Number(row["12-14 INCHES"]) + Number(row["15-19 INCHES"]) + Number(row["20-24 INCHES"]) + Number(row["25-29 INCHES"]) + Number(row["31-34 INCHES"]) +
                Number(row["35-39 INCHES"]) + Number(row["40-44 INCHES"]) + Number(row["45-49 INCHES"]) + Number(row["50+INCHES"]))
        }));

        const trustedLakeNames = new Set([
            "Mud", "Cass", "Kabetogama", "Lake of the Woods",
            "Leech", "Mille Lacs", "Minnetonka", "Vermillion",
            "Winnibigoshish"
        ]);

        const trustedSurveys = surveys.filter(row =>
            trustedLakeNames.has(row.lake_name)
        );

        await fs.writeFile(
            path.join(__dirname, 'static/trusted_filtered_surveys.json'),
            JSON.stringify(trustedSurveys, null, 2)
        );

        console.log(`✅ Filtered trusted surveys saved. Lakes: ${trustedLakeNames.size} Entries: ${trustedSurveys.length}`);
    } catch (error) {
        console.error("❌ Error loading CSV or writing JSON:", error);
    }
}

async function readSurveys() {
    try {
        const filePath = path.join(__dirname, 'static/trusted_filtered_surveys.json');
        const rawData = await fs.readFile(filePath, 'utf8');
        const surveys = JSON.parse(rawData);
        console.log("✅ Surveys loaded from JSON:", surveys.length, "entries");
        return surveys;
    } catch (err) {
        console.error("❌ Error reading or parsing JSON:", err);
    }
}

async function generateSpeciesPopulationTimeJson(surveys) {
    const yearSpeciesLakeCounts = {}; // year -> species -> [counts]
    const yearLakeSet = {};           // year -> Set of lake_ids
    const speciesYearMap = {};        // species -> Set of years

    for (const survey of surveys) {
        const { year, species, lake_id, totalCount } = survey;

        // Track years each species appears
        if (!speciesYearMap[species]) {
            speciesYearMap[species] = new Set();
        }
        speciesYearMap[species].add(year);

        // Initialize data structures
        if (!yearSpeciesLakeCounts[year]) {
            yearSpeciesLakeCounts[year] = {};
            yearLakeSet[year] = new Set();
        }

        if (!yearSpeciesLakeCounts[year][species]) {
            yearSpeciesLakeCounts[year][species] = [];
        }

        yearSpeciesLakeCounts[year][species].push(totalCount);
        yearLakeSet[year].add(lake_id);
    }

    // Determine species to keep (those in > 75% of years)
    const totalYears = Object.keys(yearSpeciesLakeCounts).length;
    const validSpecies = new Set();

    for (const [species, years] of Object.entries(speciesYearMap)) {
        if (years.size >= 0.75 * totalYears) {
            validSpecies.add(species);
        }
    }

    const result = {};

    for (const year of Object.keys(yearSpeciesLakeCounts)) {
        const lakeCount = yearLakeSet[year].size;
        const speciesData = yearSpeciesLakeCounts[year];
        if (year < 1999) continue;
        result[year] = {};

        for (const [species, counts] of Object.entries(speciesData)) {
            if (!validSpecies.has(species)) continue;

            const total = sum(counts);
            const average = total / lakeCount;
            result[year][species] = Math.round(average * 100) / 100;
        }
    }

    await fs.writeFile(
        path.join(__dirname, 'src/lib/average_species_population_over_time.json'),
        JSON.stringify(result, null, 2)
    );

    // Computing weighted average
    const weightedAvgResult = {}
    for (const year of Object.keys(result)) {
        let total = 0;
        Object.keys(result[year]).forEach((species) => {
            const count = result[year][species];
            total += count;
        })

        let weightedSum = 0;
        Object.keys(result[year]).forEach((species) => {
            const weight = result[year][species] / total;
            weightedSum += (result[year][species] * weight);
        })

        weightedAvgResult[year] = {}
        weightedAvgResult[year]["Weighted Average"] = weightedSum / 100;
    }

    console.log(weightedAvgResult)
    await fs.writeFile(
        path.join(__dirname, 'src/lib/weighted_average_species_population_over_time.json'),
        JSON.stringify(weightedAvgResult, null, 2)
    );

    return result;
}

async function generateLakePopulationOverTime(surveys) {
    const yearToLakePopulations = {};
    for (const survey of surveys) {
        const { year, lake_name, totalCount } = survey;

        if (!yearToLakePopulations[year]) {
            yearToLakePopulations[year] = {}
        }

        if (!yearToLakePopulations[year][lake_name]) {
            yearToLakePopulations[year][lake_name] = 0;
        }
        yearToLakePopulations[year][lake_name] += totalCount;
    }

    const lakePopulationLst = [];
    for (const year of Object.keys(yearToLakePopulations).sort()) {
        if (year < 1999) continue;
        const lakePopulationCounts = yearToLakePopulations[year];

        for (const [lake_name, count] of Object.entries(lakePopulationCounts)) {
            const lakePopulationEntry = { "year": year, "value": count, "name": lake_name };
            lakePopulationLst.push(lakePopulationEntry);
        }
    }

    await fs.writeFile(
        path.join(__dirname, 'src/lib/lake_populations_over_time.json'),
        JSON.stringify(lakePopulationLst, null, 2)
    );

    return lakePopulationLst;
}

function calculateAverageLakeSurveyCountDiff(surveys) {
    let preEventYears = 6;
    let averagePreEvent = 0;

    let postEventYears = 18;
    let averagePostEvent = 0;

    const yearToLakePopulations = {};
    for (const survey of surveys) {
        const { year, lake_name } = survey;

        if (!yearToLakePopulations[year]) {
            yearToLakePopulations[year] = new Set()
        }

        yearToLakePopulations[year].add(lake_name);
    }

    for (const year of Object.keys(yearToLakePopulations).sort()) {
        if (year < 1999) continue;
        const numLakes = yearToLakePopulations[year].size;
        if (year == 2006) console.log(numLakes)
        if (year < 2006) {
            averagePreEvent += numLakes;
        } else {
            averagePostEvent += numLakes;
        }
    }

    averagePreEvent /= preEventYears;
    averagePostEvent /= postEventYears;
    console.log(averagePreEvent, averagePostEvent)
    return [averagePreEvent, averagePostEvent]
}

async function buildViolinDataset(surveys) {
    const fishRecords = {}; // year -> records of fish, their size and lake found in

    const fish = new Set([
        'white sucker',
        'walleye',
        'pumpkinseed',
        'bluegill',
        'largemouth bass',
        'yellow perch',
        'rock bass',
        'tullibee (cisco)',
        'brown bullhead',
        'northern pike',
        'black crappie',
        'yellow bullhead',
        'burbot',
        'shorthead redhorse'
    ]);

    for (const survey of surveys) {
        const { year, lake_name, species, size1Count, size2Count, size3Count, size4Count, size5Count, size6Count, size7Count, size8Count, size9Count, size10Count, size11Count, size12Count, size13Count } = survey;

        if (year < 1999 || !fish.has(species)) continue;
        if (!fishRecords[year]) {
            fishRecords[year] = [];
        }

        const counts = [size1Count, size2Count, size3Count, size4Count, size5Count, size6Count, size7Count, size8Count, size9Count, size10Count, size11Count, size12Count, size13Count];
        const sizes = [2.5, 6.5, 8.5, 10.5, 13, 17, 22, 27, 33, 37, 42, 47, 50];
        for (let i = 0; i < counts.length; i++) {
            const size = sizes[i];
            for (let j = 0; j < counts[i]; j++) {
                fishRecords[year].push({ "lake": lake_name, "size": size });
            }
        }
    }

    await fs.writeFile(
        path.join(__dirname, 'src/lib/fish_size_violin_data.json'),
        JSON.stringify(fishRecords, null, 2)
    );

    return fishRecords;
}

async function buildSpeciesToLakeComposition(surveys) {
    const yearOfInterest = 2022;
    const lakeTotals = {}; // lake -> total fish surveyed
    const speciesByLake = {}; // species -> lake -> count

    const fish = new Set([
        'white sucker',
        'walleye',
        'pumpkinseed',
        'bluegill',
        'largemouth bass',
        'yellow perch',
        'rock bass',
        'tullibee (cisco)',
        'brown bullhead',
        'northern pike',
        'black crappie',
        'yellow bullhead',
        'burbot',
        'shorthead redhorse'
    ]);

    for (const survey of surveys) {
        const { year, lake_name, species, totalCount } = survey;
        if (year !== yearOfInterest || !fish.has(species)) continue;

        if (!lakeTotals[lake_name]) {
            lakeTotals[lake_name] = 0;
        }
        lakeTotals[lake_name] += totalCount;

        if (!speciesByLake[species]) {
            speciesByLake[species] = {};
        }
        if (!speciesByLake[species][lake_name]) {
            speciesByLake[species][lake_name] = 0;
        }
        speciesByLake[species][lake_name] += totalCount;
    }

    const speciesToLakeComposition = {};
    for (const species in speciesByLake) {
        speciesToLakeComposition[species] = {};
        for (const lake in speciesByLake[species]) {
            const lakeTotal = lakeTotals[lake];
            if (lakeTotal > 0) {
                speciesToLakeComposition[species][lake] = speciesByLake[species][lake] / lakeTotal;
            }
        }
    }

    await fs.writeFile(
        path.join(__dirname, 'src/lib/speciesToLake.json'),
        JSON.stringify(speciesByLake, null, 2)
    );

    return speciesToLakeComposition;
}


// await loadCsvs();
const surveys = await readSurveys();
// const speciesPopulationByYear = await generateSpeciesPopulationTimeJson(surveys);
// await generateLakePopulationOverTime(surveys);
// calculateAverageLakeSurveyCountDiff(surveys);
await buildViolinDataset(surveys);
await buildSpeciesToLakeComposition(surveys);
