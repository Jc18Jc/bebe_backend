import { Client } from "langsmith";
import { winstonLogger } from "src/logger/winston-logger";

const client = new Client({ apiKey: process.env.LANGSMITH_API_KEY });

export async function saveToDataset(datasetName: string, inputs: any, outputs: any): Promise<void> {
  try {
    // 기존 데이터셋 찾기
    const datasets = [];
    for await (const ds of client.listDatasets()) {
      datasets.push(ds);
    }
    const dataset = datasets.find((ds) => ds.name === datasetName);

    if (!dataset) {
      throw new Error(`Dataset ${datasetName} not found.`);
    }

    // 예제 추가
    await client.createExamples({
      inputs: [inputs],
      outputs: [outputs],
      datasetId: dataset.id
    });
  } catch (error) {
    winstonLogger.error(`function saveToDataset, 데이터셋 저장 중 에러: ${error.message}`);
  }
}
