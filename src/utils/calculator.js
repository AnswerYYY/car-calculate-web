const toSafeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const clampNonNegative = (value) => {
  return Math.max(0, toSafeNumber(value));
};

export const calcPurchaseTax = (basePrice, rate = 0.11) => {
  return clampNonNegative(basePrice) * clampNonNegative(rate);
};

export const toRepaymentMonths = (termValue, termUnit) => {
  const value = clampNonNegative(termValue);
  if (value === 0) {
    return 1;
  }

  if (termUnit === "year") {
    return Math.max(1, Math.round(value * 12));
  }

  return Math.max(1, Math.round(value));
};

const inferMonthlyRateFromInstallment = (principal, monthlyPayment, months) => {
  const p = clampNonNegative(principal);
  const m = clampNonNegative(monthlyPayment);
  const n = Math.max(1, Math.round(months));

  if (p === 0 || m === 0 || m * n <= p) {
    return 0;
  }

  let low = 0;
  let high = 1;

  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const factor = Math.pow(1 + mid, n);
    const calc = (p * mid * factor) / (factor - 1);
    if (calc > m) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return (low + high) / 2;
};

const buildEqualInstallmentSchedule = ({ principal, months, monthlyPayment, earlyRepaymentMonth }) => {
  const p = clampNonNegative(principal);
  const n = Math.max(1, Math.round(months));
  const pay = clampNonNegative(monthlyPayment);
  const early = Math.max(0, Math.round(clampNonNegative(earlyRepaymentMonth)));

  const monthlyRate = inferMonthlyRateFromInstallment(p, pay, n);
  let remain = p;
  const schedule = [];

  for (let month = 1; month <= n; month += 1) {
    if (remain <= 0.01) {
      break;
    }

    if (early > 0 && month === early) {
      const principalPart = remain;
      const payment = principalPart;
      schedule.push({
        month,
        payment,
        principal: principalPart,
        interest: 0,
        remaining: 0,
        isEarlySettlement: true
      });
      remain = 0;
      break;
    }

    const interestPart = remain * monthlyRate;
    let principalPart = Math.max(0, pay - interestPart);

    if (principalPart > remain) {
      principalPart = remain;
    }

    const payment = principalPart + interestPart;
    remain = Math.max(0, remain - principalPart);

    schedule.push({
      month,
      payment,
      principal: principalPart,
      interest: interestPart,
      remaining: remain,
      isEarlySettlement: false
    });
  }

  return schedule;
};

const buildEqualPrincipalSchedule = ({ principal, months, firstMonthPayment, earlyRepaymentMonth }) => {
  const p = clampNonNegative(principal);
  const n = Math.max(1, Math.round(months));
  const firstPay = clampNonNegative(firstMonthPayment);
  const early = Math.max(0, Math.round(clampNonNegative(earlyRepaymentMonth)));

  if (p === 0) {
    return [];
  }

  const monthlyPrincipal = p / n;
  const inferredMonthlyRate = Math.max(0, (firstPay - monthlyPrincipal) / p);

  let remain = p;
  const schedule = [];

  for (let month = 1; month <= n; month += 1) {
    if (remain <= 0.01) {
      break;
    }

    if (early > 0 && month === early) {
      const principalPart = remain;
      const payment = principalPart;
      schedule.push({
        month,
        payment,
        principal: principalPart,
        interest: 0,
        remaining: 0,
        isEarlySettlement: true
      });
      remain = 0;
      break;
    }

    const interestPart = remain * inferredMonthlyRate;
    const principalPart = Math.min(monthlyPrincipal, remain);
    const payment = principalPart + interestPart;
    remain = Math.max(0, remain - principalPart);

    schedule.push({
      month,
      payment,
      principal: principalPart,
      interest: interestPart,
      remaining: remain,
      isEarlySettlement: false
    });
  }

  return schedule;
};

const buildEqualPrincipalInterestSchedule = ({ principal, months, monthlyPayment, earlyRepaymentMonth }) => {
  const p = clampNonNegative(principal);
  const n = Math.max(1, Math.round(months));
  const pay = clampNonNegative(monthlyPayment);
  const early = Math.max(0, Math.round(clampNonNegative(earlyRepaymentMonth)));

  if (p === 0) {
    return [];
  }

  const monthlyPrincipal = p / n;
  const inferredMonthlyRate = Math.max(0, (pay - monthlyPrincipal) / p);
  const monthlyInterest = p * inferredMonthlyRate;

  let remain = p;
  const schedule = [];

  for (let month = 1; month <= n; month += 1) {
    if (remain <= 0.01) {
      break;
    }

    if (early > 0 && month === early) {
      const principalPart = remain;
      const payment = principalPart;
      schedule.push({
        month,
        payment,
        principal: principalPart,
        interest: 0,
        remaining: 0,
        isEarlySettlement: true
      });
      remain = 0;
      break;
    }

    const principalPart = Math.min(monthlyPrincipal, remain);
    const interestPart = monthlyInterest;
    const payment = principalPart + interestPart;
    remain = Math.max(0, remain - principalPart);

    schedule.push({
      month,
      payment,
      principal: principalPart,
      interest: interestPart,
      remaining: remain,
      isEarlySettlement: false
    });
  }

  return schedule;
};

export const calcCashPlan = (payload) => {
  const carPrice = clampNonNegative(payload.carPrice);
  const purchaseTax = clampNonNegative(payload.purchaseTax);
  const insuranceFee = clampNonNegative(payload.insuranceFee);
  const otherFee = clampNonNegative(payload.otherFee);
  const cashExtraFee = clampNonNegative(payload.cashExtraFee);

  const extrasTotal = purchaseTax + insuranceFee + otherFee;
  const totalCost = carPrice + extrasTotal + cashExtraFee;

  return {
    mode: "cash",
    carPrice,
    purchaseTax,
    insuranceFee,
    otherFee,
    extrasTotal,
    cashExtraFee,
    totalCost
  };
};

export const calcLoanPlan = (payload) => {
  const carPrice = clampNonNegative(payload.carPrice);
  const purchaseTax = clampNonNegative(payload.purchaseTax);
  const insuranceFee = clampNonNegative(payload.insuranceFee);
  const otherFee = clampNonNegative(payload.otherFee);
  const interestRebate = clampNonNegative(payload.interestRebate);

  const rawLoanAmount = clampNonNegative(payload.loanAmount);
  const loanAmount = Math.min(rawLoanAmount, carPrice);
  const downPayment = Math.max(0, carPrice - loanAmount);
  const months = toRepaymentMonths(payload.termValue, payload.termUnit);
  const extrasTotal = purchaseTax + insuranceFee + otherFee;

  const repaymentMethod = payload.repaymentMethod === "equal_principal"
    ? "equal_principal"
    : payload.repaymentMethod === "equal_principal_interest"
      ? "equal_principal_interest"
      : "equal_installment";

  const buildSchedule = (earlyRepaymentMonth) => {
    if (repaymentMethod === "equal_principal") {
      return buildEqualPrincipalSchedule({
        principal: loanAmount,
        months,
        firstMonthPayment: payload.equalPrincipalFirstPayment,
        earlyRepaymentMonth
      });
    }

    if (repaymentMethod === "equal_principal_interest") {
      return buildEqualPrincipalInterestSchedule({
        principal: loanAmount,
        months,
        monthlyPayment: payload.equalInstallmentPayment,
        earlyRepaymentMonth
      });
    }

    return buildEqualInstallmentSchedule({
      principal: loanAmount,
      months,
      monthlyPayment: payload.equalInstallmentPayment,
      earlyRepaymentMonth
    });
  };

  const schedule = buildSchedule(payload.earlyRepaymentMonth);
  const scheduleWithoutEarly = buildSchedule(0);

  const totalRepayment = schedule.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalInterestWithoutEarly = scheduleWithoutEarly.reduce((sum, row) => sum + row.interest, 0);

  const interestPoints = loanAmount > 0 ? (totalInterestWithoutEarly / loanAmount) * 100 : 0;
  const annualInterestRate = loanAmount > 0 && months > 0
    ? (totalInterestWithoutEarly / loanAmount) * (12 / months) * 100
    : 0;
  const recommendedInterestRebate = loanAmount * 0.1;

  const grossTotalCost = downPayment + extrasTotal + totalRepayment;
  const totalCost = Math.max(0, grossTotalCost - interestRebate);

  const firstMonthPayment = schedule.length > 0 ? schedule[0].payment : 0;
  const lastMonthPayment = schedule.length > 0 ? schedule[schedule.length - 1].payment : 0;

  return {
    mode: "loan",
    carPrice,
    loanAmount,
    downPayment,
    months,
    purchaseTax,
    insuranceFee,
    otherFee,
    extrasTotal,
    repaymentMethod,
    firstMonthPayment,
    lastMonthPayment,
    totalRepayment,
    totalInterest,
    totalInterestWithoutEarly,
    annualInterestRate,
    interestPoints,
    recommendedInterestRebate,
    interestRebate,
    grossTotalCost,
    totalCost,
    schedule
  };
};

export const calcComparison = (payload) => {
  const cashPlan = calcCashPlan(payload);
  const loanPlan = calcLoanPlan(payload);

  return {
    cashPlan,
    loanPlan,
    totalDifference: loanPlan.totalCost - cashPlan.totalCost,
    interestDifference: loanPlan.totalInterest
  };
};

export const formatMoney = (value) => {
  return "¥" + Math.round(toSafeNumber(value)).toLocaleString("zh-CN");
};
