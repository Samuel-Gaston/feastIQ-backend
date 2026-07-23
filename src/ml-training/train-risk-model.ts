// src/ml-training/train-risk-model.ts — run with: npx ts-node src/ml-training/train-risk-model.ts
import * as tf from '@tensorflow/tfjs';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const train = JSON.parse(fs.readFileSync(path.join(__dirname, 'processed/train.json'), 'utf8'));
  const val = JSON.parse(fs.readFileSync(path.join(__dirname, 'processed/val.json'), 'utf8'));

  const trainXs = tf.tensor2d(train.map((s: any) => s.features));
  const trainYs = tf.tensor2d(train.map((s: any) => s.labels));
  const valXs = tf.tensor2d(val.map((s: any) => s.features));
  const valYs = tf.tensor2d(val.map((s: any) => s.labels));

  const model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [12], units: 64, activation: 'relu' }),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({ units: 32, activation: 'relu' }),
      tf.layers.dense({ units: 3, activation: 'sigmoid' }),
    ],
  });

  model.compile({ optimizer: tf.train.adam(0.001), loss: 'binaryCrossentropy', metrics: ['accuracy'] });

  const history = await model.fit(trainXs, trainYs, {
    epochs: 100,
    batchSize: 32,
    validationData: [valXs, valYs],
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch}: loss=${logs?.loss.toFixed(4)} val_loss=${logs?.val_loss?.toFixed(4)} acc=${logs?.acc?.toFixed(4)} val_acc=${logs?.val_acc?.toFixed(4)}`);
      },
    },
  });

  fs.writeFileSync(
    path.join(__dirname, 'processed/training-history.json'),
    JSON.stringify({ loss: history.history.loss, val_loss: history.history.val_loss, acc: history.history.acc, val_acc: history.history.val_acc }),
  );

  // ── Save to server/ml-models/risk-model — same location Model 1 uses ──
  const modelDir = path.join(__dirname, '../../ml-models/risk-model'); // src/ml-training → src → server, then into ml-models
  fs.mkdirSync(modelDir, { recursive: true });
  await model.save(
    tf.io.withSaveHandler(async (artifacts) => {
      fs.writeFileSync(path.join(modelDir, 'weights.bin'), Buffer.from(artifacts.weightData as ArrayBuffer));
      fs.writeFileSync(
        path.join(modelDir, 'model.json'),
        JSON.stringify({
          modelTopology: artifacts.modelTopology,
          weightSpecs: artifacts.weightSpecs,
          format: artifacts.format,
          generatedBy: artifacts.generatedBy,
          convertedBy: artifacts.convertedBy,
        }),
      );
      return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } };
    }),
  );

  console.log('Model saved to', modelDir);

  const valPredictions = model.predict(valXs) as tf.Tensor;
  const predArr = (await valPredictions.array()) as number[][];
  const labelArr = (await valYs.array()) as number[][];

  const classNames = ['diabetes', 'hypertension', 'heartDisease'];
  classNames.forEach((name, classIdx) => {
    const scores = predArr.map(p => p[classIdx]);
    const labels = labelArr.map(l => l[classIdx]);
    const auc = computeAUC(scores, labels);
    console.log(`AUC-ROC (${name}): ${isNaN(auc) ? 'N/A (no positive examples in this class)' : auc.toFixed(4)}`);
  });
}

function computeAUC(scores: number[], labels: number[]): number {
  const paired = scores.map((s, i) => ({ score: s, label: labels[i] }));
  paired.sort((a, b) => a.score - b.score);

  let rankSum = 0;
  paired.forEach((p, i) => {
    if (p.label === 1) rankSum += i + 1;
  });

  const nPos = labels.filter(l => l === 1).length;
  const nNeg = labels.length - nPos;
  if (nPos === 0 || nNeg === 0) return NaN;

  return (rankSum - (nPos * (nPos + 1)) / 2) / (nPos * nNeg);
}

main();