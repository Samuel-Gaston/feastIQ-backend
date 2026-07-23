// ml-training/preprocess.ts — run with: npx ts-node src/ml-training/preprocess.ts
import * as fs from 'fs';
import * as path from 'path';


const POPULATION_DEFAULTS = { hr: 75, spo2: 97, sleep: 7, steps: 6000, medCount: 0 };

type Sample = { features: number[]; labels: [number, number, number] };

function parseCsv(filePath: string): string[][] {
  const raw = fs.readFileSync(filePath, 'utf8').trim().split('\n');
  return raw.map(line => line.split(',').map(v => v.trim()));
}

// ── Pima Indians Diabetes: HAS a header row — Pregnancies,Glucose,BloodPressure,SkinThickness,Insulin,BMI,DiabetesPedigreeFunction,Age,Outcome ──
function loadPima(): Sample[] {
  const rows = parseCsv(path.join(__dirname, 'raw/pima-diabetes.csv'));
  const [header, ...data] = rows; // header row correctly skipped here
  return data
    .filter(r => r.length >= 9 && r[8] !== '')
    .map(r => {
      const glucose = Number(r[1]);
      const diastolic = Number(r[2]);
      const bmi = Number(r[5]);
      const age = Number(r[7]);
      const outcome = Number(r[8]);
      return {
        features: [
          age, bmi,
          POPULATION_DEFAULTS.hr, 120, diastolic,
          glucose, POPULATION_DEFAULTS.spo2, POPULATION_DEFAULTS.sleep, POPULATION_DEFAULTS.steps,
          POPULATION_DEFAULTS.medCount, outcome === 1 ? 1 : 0, 0,
        ],
        labels: [outcome, 0, 0] as [number, number, number],
      };
    });
}

// ── UCI Heart Disease (processed.cleveland.data): NO header row —
// age,sex,cp,trestbps,chol,fbs,restecg,thalach,exang,oldpeak,slope,ca,thal,num
// Missing values marked '?'. num: 0 = no disease, 1-4 = disease presence (binarize to 1) ──
function loadHeartDisease(): Sample[] {
  const rows = parseCsv(path.join(__dirname, 'raw/heart-disease.csv'));
  return rows // ← FIXED: no header to skip, use all rows directly
    .filter(r => r.length >= 14 && !r.includes('?'))
    .map(r => {
      const age = Number(r[0]);
      const sex = Number(r[1]);
      const trestbps = Number(r[3]);
      const chol = Number(r[4]);
      const thalach = Number(r[7]);
      const target = Number(r[13]) > 0 ? 1 : 0;

      return {
        features: [
          age, 25,
          thalach, trestbps, 80,
          chol > 0 ? chol / 2 : 95, POPULATION_DEFAULTS.spo2,
          POPULATION_DEFAULTS.sleep, POPULATION_DEFAULTS.steps,
          POPULATION_DEFAULTS.medCount, target === 1 ? 1 : 0, sex,
        ],
        labels: [0, 0, target] as [number, number, number],
      };
    });
}

function normalize(samples: Sample[]) {
  const numFeatures = samples[0].features.length;
  const means: number[] = [];
  const stds: number[] = [];

  for (let i = 0; i < numFeatures; i++) {
    const values = samples.map(s => s.features[i]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    means.push(mean);
    stds.push(Math.sqrt(variance) || 1);
  }

  const normalized = samples.map(s => ({
    features: s.features.map((v, i) => (v - means[i]) / stds[i]),
    labels: s.labels,
  }));

  return { normalized, means, stds };
}

function main() {
  const pima = loadPima();
  const heart = loadHeartDisease();
  console.log(`Pima: ${pima.length} samples, Heart Disease: ${heart.length} samples`);

  const combined = [...pima, ...heart];

  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  const { normalized, means, stds } = normalize(combined);

  const splitIdx = Math.floor(normalized.length * 0.8);
  const train = normalized.slice(0, splitIdx);
  const val = normalized.slice(splitIdx);

  fs.mkdirSync(path.join(__dirname, 'processed'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'processed/train.json'), JSON.stringify(train));
  fs.writeFileSync(path.join(__dirname, 'processed/val.json'), JSON.stringify(val));
  fs.writeFileSync(path.join(__dirname, 'processed/normalization.json'), JSON.stringify({ means, stds }));

  console.log(`Total: ${combined.length} | Train: ${train.length} | Val: ${val.length}`);
}

main();