export interface InnerTransaction {
  txId: string
  kind: string
  exitCode: string
  data: string
  memo?: string
}

export interface TransactionWrapper {
  txId: string
  feePayer: string
  gasUsed: number
  gasLimit: number
  amountPerGasUnit: number
  exitCode: string
  innerTransactions: InnerTransaction[]
}

export type TransactionDetails = TransactionWrapper

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

export function formatAmount(amount: string): string {
  // Convert from micro units (1e-6) to whole units
  const wholeAmount = Number(amount) / 1e6
  return wholeAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6
  })
} 