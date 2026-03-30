<template>
  <main class="app-shell">
    <section class="hero-card" aria-label="购车方式选择">
      <div class="hero-head">
        <p class="eyebrow">Auto Finance Lab</p>
        <h1>购车方案计算器</h1>
        <p>全款与贷款独立查看，贷款模式支持提前还款及明细计划表。</p>

        <div class="icon-rack" aria-hidden="true">
          <span class="icon-chip">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 13L5 8h14l2 5v5h-2a2 2 0 01-4 0H9a2 2 0 01-4 0H3v-5z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="7" cy="16" r="1.3" fill="currentColor" />
              <circle cx="17" cy="16" r="1.3" fill="currentColor" />
            </svg>
            购车
          </span>
          <span class="icon-chip">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16v10H4z" stroke="currentColor" stroke-width="1.8" />
              <path d="M4 11h16" stroke="currentColor" stroke-width="1.8" />
              <path d="M8 15h4" stroke="currentColor" stroke-width="1.8" />
            </svg>
            贷款
          </span>
          <span class="icon-chip">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 18h16" stroke="currentColor" stroke-width="1.8" />
              <path d="M6 14l4-4 3 3 5-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            对比
          </span>
        </div>
      </div>

      <div class="plan-toggle" role="tablist" aria-label="购车方式">
        <button type="button" class="tab-btn" :class="{ active: form.activePlan === 'cash' }" @click="form.activePlan = 'cash'">全款购车</button>
        <button type="button" class="tab-btn" :class="{ active: form.activePlan === 'loan' }" @click="form.activePlan = 'loan'">贷款购车</button>
      </div>

      <!-- <article v-if="form.activePlan === 'loan'" class="headline-result spotlight" aria-live="polite">
        <p class="result-label">总支付差价（贷款 - 全款）</p>
        <h2>{{ formatMoney(comparison.totalDifference) }}</h2>
        <span>{{ totalDiffText }}，差异约 {{ diffRatio.toFixed(1) }}%</span>
      </article>

      <article v-else class="headline-result" aria-live="polite">
        <p class="result-label">全款总成本</p>
        <h2>{{ formatMoney(comparison.cashPlan.totalCost) }}</h2>
        <span>当前仅展示全款信息，切换到贷款可查看差价对比</span>
      </article> -->
    </section>

    <section class="content-grid">
      <article class="panel input-panel">
        <header class="panel-head">
          <h3>参数输入</h3>
          <p>税费/保险/杂费默认全部纳入计算。</p>
        </header>

        <div class="field-group">
          <h4>通用参数</h4>
          <label class="field-row">
            <span>裸车价</span>
            <div class="control">
              <em>¥</em>
              <input v-model.number="form.carPrice" type="number" min="0" step="1000" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row">
            <span>现金优惠</span>
            <div class="control">
              <em>¥</em>
              <input v-model.number="form.cashDiscount" type="number" min="0" step="500" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row">
            <span>额外费用</span>
            <div class="control">
              <em>¥</em>
              <input v-model.number="form.cashExtraFee" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>

          <label class="switch-row">
            <span>现金优惠叠加在购置税基数</span>
            <input v-model="form.discountAffectsTax" type="checkbox" />
          </label>

          <label class="field-row">
            <span>购置税（11%）</span>
            <div class="value-display">
              <small>计税基数：{{ formatMoney(purchaseTaxBase) }}</small>
              <strong>{{ formatMoney(autoPurchaseTax) }}</strong>
            </div>
          </label>

          <label class="field-row">
            <span>保险费用</span>
            <div class="control">
              <em>¥</em>
              <input v-model.number="form.insuranceFee" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row">
            <span>上牌及杂费</span>
            <div class="control">
              <em>¥</em>
              <input v-model.number="form.otherFee" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>
        </div>

        <div v-if="form.activePlan === 'loan'" class="field-group">
          <h4>贷款参数</h4>
          <label class="field-row">
            <span>贷款金额</span>
            <div class="control">
              <em>¥</em>
              <input v-model.number="form.loanAmount" type="number" min="0" step="1000" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row">
            <span>返息金额</span>
            <div class="control">
              <em>¥</em>
              <input v-model.number="form.interestRebate" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>

          <p v-if="loanAmountOverflow" class="warn">贷款金额超过优惠后车价，系统已按优惠后车价上限计算。</p>

          <div class="inline-grid">
            <label class="field-row compact">
              <span>还款时间</span>
              <div class="control">
                <input v-model.number="form.termValue" type="number" min="1" step="1" inputmode="numeric" />
              </div>
            </label>

            <label class="field-row compact">
              <span>时间单位</span>
              <div class="control select-wrap">
                <select v-model="form.termUnit">
                  <option value="month">按月</option>
                  <option value="year">按年</option>
                </select>
              </div>
            </label>
          </div>

          <label class="field-row compact">
            <span>还款方式</span>
            <div class="control select-wrap">
              <select v-model="form.repaymentMethod">
                <option value="equal_principal_interest">等本等息（月供）</option>
                <option value="equal_installment">等额本息（月供）</option>
                <option value="equal_principal">等额本金（首月月供）</option>
              </select>
            </div>
          </label>

          <label v-if="form.repaymentMethod === 'equal_principal'" class="field-row">
            <span>等额本金首月月供</span>
            <div class="control">
              <em>¥</em>
              <input v-model.number="form.equalPrincipalFirstPayment" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>

          <label v-else class="field-row">
            <span>{{ form.repaymentMethod === "equal_principal_interest" ? "等本等息月供金额" : "等额本息月供金额" }}</span>
            <div class="control">
              <em>¥</em>
              <input v-model.number="form.equalInstallmentPayment" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row">
            <span>提前还款时间（0 为不提前）</span>
            <div class="range-wrap">
              <input v-model.number="form.earlyRepaymentMonth" class="range-input" type="range" min="0" :max="repaymentMonths" step="1" />
              <div class="range-meta">
                <small>0 月</small>
                <strong>{{ earlyRepaymentMonthNormalized > 0 ? `${earlyRepaymentMonthNormalized} 月` : "不提前" }}</strong>
                <small>{{ repaymentMonths }} 月</small>
              </div>
            </div>
          </label>
        </div>

        <footer class="panel-foot">
          <button class="ghost-btn" type="button" @click="resetAll">恢复默认参数</button>
        </footer>
      </article>

      <aside class="panel result-panel" aria-live="polite">
        <header class="panel-head">
          <h3 v-if="form.activePlan === 'cash'">全款结果</h3>
          <h3 v-else>贷款结果</h3>
          <p v-if="form.activePlan === 'loan'">当前还款周期：{{ repaymentMonths }} 月</p>
          <p v-else>全款模式不展示贷款信息</p>
        </header>

        <template v-if="form.activePlan === 'cash'">
          <div class="result-cards single">
            <article class="result-card cash focus">
              <p>全款总成本</p>
              <h4>{{ formatMoney(comparison.cashPlan.totalCost) }}</h4>
              <span>优惠后车价 + 购置税 + 保险 + 杂费 + 额外费用</span>
            </article>
          </div>

          <section class="pie-section">
            <h4>购车成本构成饼图</h4>
            <div class="pie-layout">
              <div class="pie-chart" :style="pieData.chartStyle" aria-hidden="true"></div>
              <ul class="pie-legend">
                <li v-for="item in pieData.segments" :key="item.label">
                  <span class="dot" :style="{ background: item.color }"></span>
                  <em>{{ item.label }}</em>
                  <strong>{{ formatMoney(item.value) }}</strong>
                  <small>{{ item.ratio.toFixed(1) }}%</small>
                </li>
              </ul>
            </div>
          </section>
        </template>

        <template v-else>
          <section class="loan-board">
            <article class="loan-hero">
              <p>贷款方案结果</p>
              <h4>{{ formatMoney(comparison.loanPlan.totalCost) }}</h4>
              <span>对比全款 {{ formatMoney(comparison.cashPlan.totalCost) }}</span>
            </article>

            <div class="loan-strip">
              <article class="strip-item">
                <span>总支付差价</span>
                <strong>{{ formatMoney(comparison.totalDifference) }}</strong>
              </article>
              <article class="strip-item accent">
                <span>总利息</span>
                <strong>{{ formatMoney(comparison.loanPlan.totalInterest) }}</strong>
              </article>
              <article class="strip-item muted">
                <span>差异比例</span>
                <strong>{{ diffRatio.toFixed(1) }}%</strong>
              </article>
            </div>

            <div class="loan-bento">
              <article class="down-highlight">
                <p>首付金额</p>
                <strong>{{ formatMoney(comparison.loanPlan.downPayment) }}</strong>
                <span>约占优惠后车价 {{ downPaymentRatio.toFixed(1) }}%</span>
              </article>

              <section class="mini-chart loan-card">
                <h4>成本对比图</h4>
                <div class="bar-row">
                  <span>全款</span>
                  <div><i class="bar cash" :style="{ width: cashBar }"></i></div>
                  <strong>{{ formatMoney(comparison.cashPlan.totalCost) }}</strong>
                </div>
                <div class="bar-row">
                  <span>贷款</span>
                  <div><i class="bar loan" :style="{ width: loanBar }"></i></div>
                  <strong>{{ formatMoney(comparison.loanPlan.totalCost) }}</strong>
                </div>
              </section>

              <section class="pie-section loan-card insight-section">
                <h4>购车成本构成与关键提示</h4>
                <div class="pie-layout">
                  <div class="pie-chart" :style="pieData.chartStyle" aria-hidden="true"></div>
                  <ul class="pie-legend">
                    <li v-for="item in pieData.segments" :key="item.label">
                      <span class="dot" :style="{ background: item.color }"></span>
                      <em>{{ item.label }}</em>
                      <strong>{{ formatMoney(item.value) }}</strong>
                      <small>{{ item.ratio.toFixed(1) }}%</small>
                    </li>
                  </ul>
                </div>

                <div class="loan-details compact">
                  <article v-for="item in summaryItems" :key="item.label" class="detail-item">
                    <span>{{ item.label }}</span>
                    <strong>{{ item.value }}</strong>
                  </article>
                  <article class="detail-item">
                    <span>提前还款月</span>
                    <strong>{{ earlyRepaymentMonthNormalized > 0 ? `${earlyRepaymentMonthNormalized} 月` : "不提前" }}</strong>
                  </article>
                  <article class="detail-item">
                    <span>首月月供</span>
                    <strong>{{ formatMoney(comparison.loanPlan.firstMonthPayment) }}</strong>
                  </article>
                  <article class="detail-item">
                    <span>末期月供</span>
                    <strong>{{ formatMoney(comparison.loanPlan.lastMonthPayment) }}</strong>
                  </article>
                </div>
              </section>

              <section class="table-section loan-card table-full">
                <h4>还款计划表</h4>
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>期数</th>
                        <th>月供</th>
                        <th>本金</th>
                        <th>利息</th>
                        <th>剩余本金</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in comparison.loanPlan.schedule" :key="row.month" :class="{ early: row.isEarlySettlement }">
                        <td>{{ row.month }}</td>
                        <td>{{ formatMoney(row.payment) }}</td>
                        <td>{{ formatMoney(row.principal) }}</td>
                        <td>{{ formatMoney(row.interest) }}</td>
                        <td>{{ formatMoney(row.remaining) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </section>
        </template>
      </aside>
    </section>
    <section class="formula-panel">
      <h3>计算口径说明</h3>
      <p>优惠后车价 = 裸车价 - 现金优惠（最低为 0）</p>
      <p>购置税 = 计税基数 x 11%，计税基数可切换是否叠加现金优惠</p>
      <p>提前还款：所选当月利息记为 0，并一次性归还剩余本金</p>
      <p>贷款总成本 = 首付 + 税费保险杂费 + 还款总额 - 返息金额</p>
      <p>利息点 = 贷款总利息 / 贷款本金 x 100%</p>
      <p>年利率= 贷款总利息 / 贷款本金 / 贷款年限 x 100%</p>
      <p>总支付差价 = 贷款总成本 - 全款总成本</p>
      <p>利息差价 = 贷款还款总利息</p>
    </section>
  </main>
</template>
<script setup>
  import { computed, reactive } from "vue"
  import { DEFAULTS } from "./constants/defaults.js"
  import { calcComparison, calcPurchaseTax, formatMoney, toRepaymentMonths } from "./utils/calculator.js"

  const form = reactive({ ...DEFAULTS })

  const normalize = (value) => {
    const num = Number(value)
    return Number.isFinite(num) ? Math.max(0, num) : 0
  }

  const baseCarPrice = computed(() => normalize(form.carPrice))
  const cashDiscount = computed(() => normalize(form.cashDiscount))

  const effectiveCarPrice = computed(() => {
    return Math.max(0, baseCarPrice.value - cashDiscount.value)
  })

  const purchaseTaxBase = computed(() => {
    return form.discountAffectsTax ? effectiveCarPrice.value : baseCarPrice.value
  })

  const autoPurchaseTax = computed(() => {
    return calcPurchaseTax(purchaseTaxBase.value, 0.11)
  })

  const repaymentMonths = computed(() => {
    return toRepaymentMonths(form.termValue, form.termUnit)
  })

  const earlyRepaymentMonthNormalized = computed(() => {
    const month = Math.round(normalize(form.earlyRepaymentMonth))
    if (month <= 0) {
      return 0
    }

    return Math.min(month, repaymentMonths.value)
  })

  const comparison = computed(() => {
    return calcComparison({
      carPrice: effectiveCarPrice.value,
      purchaseTax: autoPurchaseTax.value,
      insuranceFee: normalize(form.insuranceFee),
      otherFee: normalize(form.otherFee),
      cashExtraFee: normalize(form.cashExtraFee),
      loanAmount: normalize(form.loanAmount),
      termValue: normalize(form.termValue),
      termUnit: form.termUnit,
      repaymentMethod: form.repaymentMethod,
      equalInstallmentPayment: normalize(form.equalInstallmentPayment),
      equalPrincipalFirstPayment: normalize(form.equalPrincipalFirstPayment),
      interestRebate: normalize(form.interestRebate),
      earlyRepaymentMonth: earlyRepaymentMonthNormalized.value,
    })
  })

  const loanAmountOverflow = computed(() => {
    return normalize(form.loanAmount) > effectiveCarPrice.value
  })

  const totalDiffText = computed(() => {
    const diff = comparison.value.totalDifference
    if (diff > 0) {
      return "贷款方案总支出更高"
    }
    if (diff < 0) {
      return "贷款方案总支出更低"
    }
    return "两种方案总支出相同"
  })

  const diffAbs = computed(() => Math.abs(comparison.value.totalDifference))

  const diffRatio = computed(() => {
    const base = comparison.value.cashPlan.totalCost
    if (base <= 0) {
      return 0
    }

    return (diffAbs.value / base) * 100
  })

  const maxCost = computed(() => {
    return Math.max(comparison.value.cashPlan.totalCost, comparison.value.loanPlan.totalCost, 1)
  })

  const cashBar = computed(() => `${(comparison.value.cashPlan.totalCost / maxCost.value) * 100}%`)
  const loanBar = computed(() => `${(comparison.value.loanPlan.totalCost / maxCost.value) * 100}%`)

  const downPaymentRatio = computed(() => {
    if (effectiveCarPrice.value <= 0) {
      return 0
    }
    return (comparison.value.loanPlan.downPayment / effectiveCarPrice.value) * 100
  })

  const pieData = computed(() => {
    const palette = ["#6f57ff", "#23b0ff", "#36c98f", "#ff9f43", "#ff6688"]
    const isLoan = form.activePlan === "loan"
    const segments = isLoan
      ? [
          { label: "首付", value: comparison.value.loanPlan.downPayment, color: palette[0] },
          { label: "还款总额", value: comparison.value.loanPlan.totalRepayment, color: palette[1] },
          { label: "购置税", value: autoPurchaseTax.value, color: palette[2] },
          { label: "保险", value: normalize(form.insuranceFee), color: palette[3] },
          { label: "杂费", value: normalize(form.otherFee), color: palette[4] },
        ]
      : [
          { label: "车价", value: effectiveCarPrice.value, color: palette[0] },
          { label: "购置税", value: autoPurchaseTax.value, color: palette[1] },
          { label: "保险", value: normalize(form.insuranceFee), color: palette[2] },
          { label: "杂费", value: normalize(form.otherFee), color: palette[3] },
          { label: "额外费用", value: normalize(form.cashExtraFee), color: palette[4] },
        ]

    const total = Math.max(
      1,
      segments.reduce((sum, item) => sum + item.value, 0),
    )
    let cursor = 0
    const gradientStops = segments.map((item) => {
      const start = (cursor / total) * 100
      cursor += item.value
      const end = (cursor / total) * 100
      return `${item.color} ${start}% ${end}%`
    })

    return {
      total,
      segments: segments.map((item) => ({
        ...item,
        ratio: (item.value / total) * 100,
      })),
      chartStyle: {
        background: `conic-gradient(${gradientStops.join(", ")})`,
      },
    }
  })

  const summaryItems = computed(() => {
    const loanPlan = comparison.value.loanPlan

    return [
      { label: "优惠后车价", value: formatMoney(effectiveCarPrice.value) },
      { label: "购置税(11%)", value: formatMoney(autoPurchaseTax.value) },
      { label: "贷款本金", value: formatMoney(loanPlan.loanAmount) },
      { label: "返息金额", value: formatMoney(loanPlan.interestRebate) },
      { label: "还款利息(当前方案)", value: formatMoney(loanPlan.totalInterest) },
      { label: "贷款利息", value: formatMoney(loanPlan.totalInterestWithoutEarly) },
      { label: "年利率", value: `${loanPlan.annualInterestRate.toFixed(2)}%` },
      { label: "利息点", value: `${loanPlan.interestPoints.toFixed(2)}%` },
      { label: "还款总额", value: formatMoney(loanPlan.totalRepayment) },
    ]
  })

  const resetAll = () => {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      form[key] = value
    })
  }
</script>
