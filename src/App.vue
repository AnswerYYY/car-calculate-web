<template>
  <main class="app-shell">
    <section class="hero-card" aria-label="购车方式选择">
      <div class="hero-top">
        <div class="hero-copy">
          <p class="eyebrow">Auto Finance Lab</p>
          <h1>购车方案计算器</h1>
          <p>先看关键结论，再按需展开明细，减少同屏信息负担。</p>
        </div>

        <div class="plan-toggle" role="tablist" aria-label="购车方式">
          <button type="button" class="tab-btn" :class="{ active: form.activePlan === 'cash' }" @click="form.activePlan = 'cash'">全款购车</button>
          <button type="button" class="tab-btn" :class="{ active: form.activePlan === 'loan' }" @click="form.activePlan = 'loan'">贷款购车</button>
        </div>
      </div>

      <div class="headline-metrics" aria-live="polite">
        <article class="metric-card primary">
          <p>{{ form.activePlan === "loan" ? "贷款总成本" : "全款总成本" }}</p>
          <h2>{{ formatMoney(form.activePlan === "loan" ? comparison.loanPlan.totalCost : comparison.cashPlan.totalCost) }}</h2>
          <span>{{ form.activePlan === "loan" ? "含首付、税费、还款总额与返息" : "含车价、税费、保险、杂费与额外费用" }}</span>
        </article>

        <article class="metric-card" v-if="form.activePlan === 'loan'">
          <p>总支付差价</p>
          <h3>{{ formatMoney(comparison.totalDifference) }}</h3>
          <span>{{ totalDiffText }}，差异约 {{ diffRatio.toFixed(1) }}%</span>
        </article>

        <article class="metric-card" v-if="form.activePlan === 'loan'">
          <p>提前还款</p>
          <h3>{{ earlyRepaymentMonthNormalized > 0 ? `${earlyRepaymentMonthNormalized} 月` : "不提前" }}</h3>
          <span>当前还款周期 {{ repaymentMonths }} 月</span>
        </article>

        <article class="metric-card" v-else>
          <p>购置税（11%）</p>
          <h3>{{ formatMoney(autoPurchaseTax) }}</h3>
          <span>计税基数 {{ formatMoney(purchaseTaxBase) }}</span>
        </article>
      </div>
    </section>

    <section class="content-grid">
      <article ref="inputPanelRef" class="panel input-panel">
        <header class="panel-head">
          <h3>参数输入</h3>
          <p>先填通用参数，贷款参数仅在贷款模式展示。</p>
        </header>

        <div class="field-group">
          <h4>通用参数</h4>

          <label class="field-row">
            <span>裸车价</span>
            <div class="control">
              <em>￥</em>
              <input v-model.number="form.carPrice" type="number" min="0" step="1000" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row">
            <span>现金优惠</span>
            <div class="control">
              <em>￥</em>
              <input v-model.number="form.cashDiscount" type="number" min="0" step="500" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row">
            <span>额外费用</span>
            <div class="control">
              <em>￥</em>
              <input v-model.number="form.cashExtraFee" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row">
            <span>保险费用</span>
            <div class="control">
              <em>￥</em>
              <input v-model.number="form.insuranceFee" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row">
            <span>上牌及杂费</span>
            <div class="control">
              <em>￥</em>
              <input v-model.number="form.otherFee" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>

          <label class="switch-row">
            <span>现金优惠叠加在购置税基数</span>
            <input v-model="form.discountAffectsTax" type="checkbox" />
          </label>

          <article class="tax-card">
            <p>购置税（11%）</p>
            <small>计税基数：{{ formatMoney(purchaseTaxBase) }}</small>
            <strong>{{ formatMoney(autoPurchaseTax) }}</strong>
          </article>
        </div>

        <div v-if="form.activePlan === 'loan'" class="field-group">
          <h4>贷款参数</h4>

          <label class="field-row">
            <span>贷款金额</span>
            <div class="control">
              <em>￥</em>
              <input v-model.number="form.loanAmount" type="number" min="0" step="1000" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row">
            <span>返息金额</span>
            <div class="control">
              <em>￥</em>
              <input v-model.number="form.interestRebate" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row compact term-row">
            <span>还款时间</span>
            <div class="control term-control">
              <input v-model.number="form.termValue" class="term-value" type="number" min="1" step="1" inputmode="numeric" />
              <div class="term-unit-wrap">
                <select v-model="form.termUnit" aria-label="还款时间单位">
                  <option value="month">月</option>
                  <option value="year">年</option>
                </select>
              </div>
            </div>
          </label>

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
              <em>￥</em>
              <input v-model.number="form.equalPrincipalFirstPayment" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>

          <label v-else class="field-row">
            <span>{{ form.repaymentMethod === "equal_principal_interest" ? "等本等息月供金额" : "等额本息月供金额" }}</span>
            <div class="control">
              <em>￥</em>
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

          <p v-if="loanAmountOverflow" class="warn">贷款金额超过优惠后车价，系统会按优惠后车价上限计算。</p>
        </div>

        <footer class="panel-foot">
          <button class="ghost-btn" type="button" @click="resetAll">恢复默认参数</button>
        </footer>
      </article>

      <aside class="panel result-panel" :style="resultPanelStyle" aria-live="polite">
        <header class="panel-head">
          <h3>{{ form.activePlan === "loan" ? "贷款结果" : "全款结果" }}</h3>
          <p>{{ form.activePlan === "loan" ? `当前还款周期：${repaymentMonths} 月` : "全款模式展示总成本与成本构成" }}</p>
        </header>

        <template v-if="form.activePlan === 'cash'">
          <section class="result-focus">
            <p>全款总成本</p>
            <h4>{{ formatMoney(comparison.cashPlan.totalCost) }}</h4>
            <span>优惠后车价 + 购置税 + 保险 + 杂费 + 额外费用</span>
          </section>

          <section class="result-block">
            <h4>购车成本构成</h4>
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
          <section class="result-focus loan">
            <p>贷款方案总成本</p>
            <h4>{{ formatMoney(comparison.loanPlan.totalCost) }}</h4>
            <span>相较全款 {{ formatMoney(comparison.cashPlan.totalCost) }}，{{ totalDiffText }}</span>
          </section>

          <div class="kpi-grid">
            <article class="kpi-item">
              <span>总支付差价</span>
              <strong>{{ formatMoney(comparison.totalDifference) }}</strong>
            </article>
            <article class="kpi-item">
              <span>总利息</span>
              <strong>{{ formatMoney(comparison.loanPlan.totalInterest) }}</strong>
            </article>
            <article class="kpi-item">
              <span>差异比例</span>
              <strong>{{ diffRatio.toFixed(1) }}%</strong>
            </article>
            <article class="kpi-item">
              <span>首付金额</span>
              <strong>{{ formatMoney(comparison.loanPlan.downPayment) }}</strong>
            </article>
          </div>

          <section class="result-block">
            <h4>全款与贷款成本对比</h4>
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

          <section class="result-block">
            <h4>贷款成本构成</h4>
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

          <details class="details-block" open>
            <summary>关键明细</summary>
            <div class="details-grid">
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
          </details>

          <details class="details-block">
            <summary>还款计划表</summary>
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
          </details>
        </template>
      </aside>
    </section>

    <details class="formula-panel">
      <summary>计算口径说明</summary>
      <div class="formula-list">
        <p>优惠后车价 = 裸车价 - 现金优惠（最低为 0）</p>
        <p>购置税 = 计税基数 x 11%，计税基数可切换是否叠加现金优惠</p>
        <p>提前还款：所选当月利息记为 0，并一次性归还剩余本金</p>
        <p>贷款总成本 = 首付 + 税费保险杂费 + 还款总额 - 返息金额</p>
        <p>利息点 = 贷款总利息 / 贷款本金 x 100%</p>
        <p>年利率 = 贷款总利息 / 贷款本金 / 贷款年限 x 100%</p>
        <p>总支付差价 = 贷款总成本 - 全款总成本</p>
        <p>利息差价 = 贷款还款总利息</p>
      </div>
    </details>
  </main>
</template>

<script setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue"
  import { DEFAULTS } from "./constants/defaults.js"
  import { calcComparison, calcPurchaseTax, formatMoney, toRepaymentMonths } from "./utils/calculator.js"

  const form = reactive({ ...DEFAULTS })
  const inputPanelRef = ref(null)
  const resultPanelHeight = ref("")
  let resizeObserver = null

  const syncResultPanelHeight = () => {
    if (typeof window === "undefined") {
      return
    }

    if (window.matchMedia("(max-width: 1080px)").matches) {
      resultPanelHeight.value = ""
      return
    }

    const inputEl = inputPanelRef.value
    if (!inputEl) {
      return
    }

    resultPanelHeight.value = `${Math.ceil(inputEl.getBoundingClientRect().height)}px`
  }

  const resultPanelStyle = computed(() => {
    if (!resultPanelHeight.value) {
      return {}
    }

    return {
      height: resultPanelHeight.value,
      overflowY: "auto",
    }
  })

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

  const pieData = computed(() => {
    const palette = ["#f06a2f", "#2d7ef7", "#18b47f", "#f7be2d", "#d94a6f"]
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
  onMounted(() => {
    nextTick(syncResultPanelHeight)
    window.addEventListener("resize", syncResultPanelHeight)

    if (typeof ResizeObserver !== "undefined" && inputPanelRef.value) {
      resizeObserver = new ResizeObserver(() => {
        syncResultPanelHeight()
      })
      resizeObserver.observe(inputPanelRef.value)
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener("resize", syncResultPanelHeight)
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  })
</script>
