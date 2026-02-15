export interface ClearOptions {
  failureRate?: number;
}

export async function mockClearFunds(
  txId: string,
  { failureRate = 0 }: ClearOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failureRate > 0 && Math.random() < failureRate) {
        reject(new Error(`Settlement failed for ${txId}`));
      } else {
        resolve();
      }
    }, 1500);
  });
}
