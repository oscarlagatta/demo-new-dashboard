export const isValidTransactionId = (id: string): boolean => {
  // Transaction ID should be alphanumeric and between 8-32 characters
  const regex = /^[A-Za-z0-9]{8,32}$/
  return regex.test(id)
}

export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 999999999.99
}

export const isValidCurrency = (currency: string): boolean => {
  // ISO 4217 currency codes are 3 letters
  const regex = /^[A-Z]{3}$/
  return regex.test(currency)
}

export const isValidSystemId = (id: string): boolean => {
  // System ID should be alphanumeric with hyphens, 3-50 characters
  const regex = /^[A-Za-z0-9-]{3,50}$/
  return regex.test(id)
}

export const validatePaymentData = (data: {
  transactionId: string
  amount: number
  currency: string
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!isValidTransactionId(data.transactionId)) {
    errors.push("Invalid transaction ID format")
  }

  if (!isValidAmount(data.amount)) {
    errors.push("Invalid amount")
  }

  if (!isValidCurrency(data.currency)) {
    errors.push("Invalid currency code")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
