<template>
  <main class="app-shell">
    <section class="top-ticker" aria-label="免责声明滚动说明">
      <p class="ticker-label">风险提示</p>
      <div class="ticker-track" role="marquee" aria-live="off">
        <div class="ticker-content">
          <span>本工具结果基于您填写的参数和当前内置计算规则（含购置税政策）自动估算，仅供方案对比，不构成法律、税务或金融建议；贷款方案、利率、返息贴息、税费及提前还款条件以金融机构审批、门店报价、合同条款及当地税务机关实际执行为准。</span>
          <span aria-hidden="true">本工具结果基于您填写的参数和当前内置计算规则（含购置税政策）自动估算，仅供方案对比，不构成法律、税务或金融建议；贷款方案、利率、返息贴息、税费及提前还款条件以金融机构审批、门店报价、合同条款及当地税务机关实际执行为准。</span>
        </div>
      </div>
    </section>

    <section class="hero-card" aria-label="购车方式选择">
      <div class="hero-top">
        <div class="hero-copy">
          <p class="eyebrow">购车成本测算</p>
          <h1>购车方案计算器</h1>
          <p>用于快速估算全款与贷款购车成本，方便与门店报价对比。</p>
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
          <span>{{ form.activePlan === "loan" ? "预计首付 + 还款总额 - 返息 - 减免优惠" : "车价 + 购置税 + 保险 + 杂费 + 其他费用 - 减免优惠" }}</span>
        </article>

        <article class="metric-card" v-if="form.activePlan === 'loan'">
          <p>总支付差价</p>
          <h3>{{ formatMoney(comparison.totalDifference) }}</h3>
          <span>{{ totalDiffText }}，差异约 {{ diffRatio.toFixed(1) }}%</span>
        </article>

        <article class="metric-card" v-if="form.activePlan === 'loan'">
          <p>提前还款</p>
          <h3>{{ earlyRepaymentMonthNormalized > 0 ? `${earlyRepaymentMonthNormalized} 月` : "不提前" }}</h3>
          <span>可在下方调整提前还款时间</span>
        </article>

        <article class="metric-card" v-else>
          <p>{{ form.vehicleEnergyType === "nev" ? "购置税（新能源）" : "购置税（11%）" }}</p>
          <h3>{{ formatMoney(autoPurchaseTax) }}</h3>
          <span>{{ purchaseTaxPolicy.policyTag }}｜计税基数 {{ formatMoney(purchaseTaxBase) }}</span>
        </article>
      </div>
    </section>

    <section class="content-grid">
      <article ref="inputPanelRef" class="panel input-panel">
        <header class="panel-head">
          <h3>参数输入</h3>
          <p>请按实际报价填写，未填写项默认按 0 处理。</p>
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
            <span>减免优惠（厂补、区补、省补、国补等额外优惠）</span>
            <div class="control">
              <em>￥</em>
              <input v-model.number="form.totalReliefDiscount" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>
          <!-- <label class="field-row">
            <span>其他额外费用</span>
            <div class="control">
              <em>￥</em>
              <input v-model.number="form.cashExtraFee" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label> -->

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

          <label class="field-row compact">
            <span>能源类型</span>
            <div class="control select-wrap">
              <select v-model="form.vehicleEnergyType">
                <option value="fuel">燃油/其他</option>
                <option value="nev">新能源（纯电/插混/增程）</option>
              </select>
            </div>
          </label>

          <label v-if="form.vehicleEnergyType === 'nev'" class="field-row">
            <span>购车年份（政策年度）</span>
            <div class="control">
              <input v-model.number="form.purchaseYear" type="number" min="2024" step="1" inputmode="numeric" />
            </div>
          </label>

          <label v-if="form.vehicleEnergyType === 'nev'" class="switch-row">
            <span>已纳入购置税减免目录车型</span>
            <input v-model="form.nevInCatalog" type="checkbox" />
          </label>

          <label class="switch-row">
            <span>现金优惠计入购置税计税基数</span>
            <input v-model="form.discountAffectsTax" type="checkbox" />
          </label>

          <article class="tax-card">
            <p>{{ form.vehicleEnergyType === "nev" ? "购置税（新能源）" : "购置税（11%）" }}</p>
            <small>当前计税基数：{{ formatMoney(purchaseTaxBase) }}</small>
            <small v-if="purchaseTaxPolicy.reduction > 0">减免税额：{{ formatMoney(purchaseTaxPolicy.reduction) }}</small>
            <strong>{{ formatMoney(autoPurchaseTax) }}</strong>
          </article>
        </div>

        <div v-if="form.activePlan === 'loan'" class="field-group">
          <h4>贷款参数（按合同填写）</h4>

          <label class="field-row">
            <span>贷款本金</span>
            <div class="control">
              <em>￥</em>
              <input v-model.number="form.loanAmount" type="number" min="0" step="1000" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row">
            <span>返息/贴息金额</span>
            <div class="control">
              <em>￥</em>
              <input v-model.number="form.interestRebate" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row compact term-row">
            <span>贷款期限</span>
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
                <option value="equal_principal_interest">等本等息（每月固定）</option>
                <option value="equal_installment">等额本息（每月固定）</option>
                <option value="equal_principal">等额本金（逐月递减）</option>
              </select>
            </div>
          </label>

          <label v-if="form.repaymentMethod === 'equal_principal'" class="field-row">
            <span>等额本金首月月供（按合同）</span>
            <div class="control">
              <em>￥</em>
              <input v-model.number="form.equalPrincipalFirstPayment" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>

          <label v-else class="field-row">
            <span>{{ form.repaymentMethod === "equal_principal_interest" ? "等本等息月供（按合同）" : "等额本息月供（按合同）" }}</span>
            <div class="control">
              <em>￥</em>
              <input v-model.number="form.equalInstallmentPayment" type="number" min="0" step="100" inputmode="decimal" />
            </div>
          </label>

          <label class="field-row">
            <span>计划提前还款时间（0 表示不提前）</span>
            <div class="range-wrap">
              <input v-model.number="form.earlyRepaymentMonth" class="range-input" type="range" min="0" :max="Math.max(0, repaymentMonths - 1)" step="1" />
              <div class="range-meta">
                <small>0 月</small>
                <strong>{{ earlyRepaymentMonthNormalized > 0 ? `${earlyRepaymentMonthNormalized} 月` : "不提前" }}</strong>
                <small>{{ Math.max(0, repaymentMonths - 1) }} 月</small>
              </div>
            </div>
          </label>

          <p v-if="loanAmountOverflow" class="warn">贷款本金超过优惠后车价，已按优惠后车价上限计算。</p>
          <p v-if="repaymentInputWarning" class="warn">{{ repaymentInputWarning }}</p>
        </div>

        <footer class="panel-foot">
          <button class="ghost-btn" type="button" @click="resetAll">恢复默认参数</button>
        </footer>
      </article>

      <aside class="panel result-panel" :style="resultPanelStyle" aria-live="polite">
        <header class="panel-head">
          <h3>{{ form.activePlan === "loan" ? "贷款结果" : "全款结果" }}</h3>
          <p>{{ form.activePlan === "loan" ? `当前按 ${repaymentMonths} 月测算，可在左侧调整。` : "展示全款总成本及费用构成。" }}</p>
        </header>

        <p class="calc-disclaimer">结果基于当前输入与内置规则测算，仅供参考；最终费用以门店报价、合同条款、金融机构审批及当地税务机关实际征收为准。</p>

        <template v-if="form.activePlan === 'cash'">
          <section class="result-focus">
            <p>全款总成本</p>
            <h4>{{ formatMoney(comparison.cashPlan.totalCost) }}</h4>
            <span>优惠后车价 + 购置税 + 保险 + 杂费 - 减免优惠</span>
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
            <p>贷款总成本（当前参数）</p>
            <h4>{{ formatMoney(comparison.loanPlan.totalCost) }}</h4>
            <span>对比全款 {{ formatMoney(comparison.cashPlan.totalCost) }}，{{ totalDiffText }}</span>
          </section>

          <div class="kpi-grid">
            <article class="kpi-item initial-payment">
              <span>预计首付</span>
              <strong>{{ formatMoney(estimatedInitialPayment) }}</strong>
              <small>含车价未贷款部分、购置税、保险、上牌及杂费、额外费用（已扣除返息/贴息）</small>
            </article>
            <article class="kpi-item">
              <span>总支付差价</span>
              <strong>{{ formatMoney(comparison.totalDifference) }}</strong>
            </article>
            <article class="kpi-item">
              <span>贷款总利息</span>
              <strong>{{ formatMoney(comparison.loanPlan.totalInterest) }}</strong>
            </article>
            <article class="kpi-item">
              <span>相对全款差异</span>
              <strong>{{ diffRatio.toFixed(1) }}%</strong>
            </article>
          </div>

          <section class="result-block">
            <h4>全款与贷款总成本对比</h4>
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
            <h4>贷款方案费用构成</h4>
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
            <summary>关键明细（贷款）</summary>
            <div class="details-grid">
              <article v-for="item in summaryItems" :key="item.label" class="detail-item">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
              <article class="detail-item">
                <span>提前还款月份</span>
                <strong>{{ earlyRepaymentMonthNormalized > 0 ? `${earlyRepaymentMonthNormalized} 月` : "不提前" }}</strong>
              </article>
              <article class="detail-item">
                <span>首月月供（估算）</span>
                <strong>{{ formatMoney(comparison.loanPlan.firstMonthPayment) }}</strong>
              </article>
              <article class="detail-item">
                <span>最后一期月供（估算）</span>
                <strong>{{ formatMoney(comparison.loanPlan.lastMonthPayment) }}</strong>
              </article>
            </div>
          </details>

          <details class="details-block">
            <summary>还款计划（估算）</summary>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>月份</th>
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

    <section class="quote-vault" aria-label="报价方案收藏">
      <header class="vault-head">
        <div>
          <p class="vault-eyebrow">QUOTE VAULT</p>
          <h3>报价方案收藏</h3>
        </div>
        <span class="vault-count">已保存 {{ savedQuotes.length }} 条</span>
      </header>

      <div class="vault-save-row">
        <label class="vault-name-field">
          <span>方案名称</span>
          <input v-model.trim="quoteDraftName" type="text" maxlength="24" placeholder="例如：A店 36期低首付" />
        </label>
        <button class="vault-save-btn" type="button" @click="saveCurrentQuote">保存当前报价</button>
      </div>

      <p v-if="savedQuotes.length === 0" class="vault-empty">还没有保存的方案，先保存当前报价做对比吧。</p>

      <ul v-if="savedQuotes.length > 0" class="vault-list">
        <li v-for="item in savedQuotes" :key="item.id" class="vault-item">
          <div class="vault-item-main">
            <h4>{{ item.name }}</h4>
            <p>{{ item.activePlan === "loan" ? "贷款方案" : "全款方案" }} · {{ item.savedAtText }}</p>
            <div class="vault-item-kpis">
              <span v-if="item.activePlan === 'loan'">预计首付 {{ formatMoney(item.initialPayment) }}</span>
              <span v-if="item.activePlan === 'loan'">首月月供 {{ formatMoney(item.monthlyPayment) }}</span>
              <span v-if="item.activePlan === 'loan'">{{ item.earlyRepaymentMonth > 0 ? item.earlyRepaymentMonth : item.repaymentMonths }} 月</span>
              <span v-if="item.activePlan === 'loan' && item.earlyRepaymentMonth > 0" class="vault-early-tag">提前还款</span>
              <span v-else>一次性支付</span>
            </div>
          </div>

          <div class="vault-item-metric">
            <span>总成本</span>
            <strong>{{ formatMoney(item.totalCost) }}</strong>
            <small v-if="quoteRankings.totalCostRank[item.id] > 0">总成本第 {{ quoteRankings.totalCostRank[item.id] }} 名</small>
          </div>

          <div class="vault-item-actions">
            <span v-if="quoteRankings.totalCostRank[item.id] === 1" class="vault-ribbon">总成本最低</span>
            <span v-else-if="quoteRankings.monthlyPaymentRank[item.id] === 1" class="vault-ribbon">月供最低</span>
            <span v-else-if="quoteRankings.initialPaymentRank[item.id] === 1" class="vault-ribbon">首付最低</span>
            <button type="button" class="vault-btn apply" @click="applySavedQuote(item.id)">套用</button>
            <button type="button" class="vault-btn remove" @click="removeSavedQuote(item.id)">删除</button>
          </div>
        </li>
      </ul>
    </section>

    <details class="formula-panel">
      <summary>计算说明</summary>
      <div class="formula-list">
        <p>优惠后车价 = 裸车价 - 现金优惠</p>
        <p>燃油车购置税 = 计税基数 x 11%，计税基数可切换是否计入现金优惠</p>
        <p>新能源购置税：2024-2025 年免征（每辆减免上限 3 万）；2026-2027 年减半征收（每辆减税上限 1.5 万）</p>
        <p>提前还款：所选月份按结清处理，当月利息记为 0，并一次性归还剩余本金</p>
        <p>贷款总成本 = 预计首付 + 还款总额 - 返息金额 - 减免优惠</p>
        <p>减免优惠仅在最终总成本阶段扣减，不影响购置税计税基数和税额，适用于厂补、区补、省补、国补等额外优惠</p>
        <p>利息点 = 贷款总利息 / 贷款本金 x 100%（用于粗略比较）</p>
        <p>年化利率（估算）= 贷款总利息 / 贷款本金 / 贷款年限 x 100%</p>
        <p>总成本差额 = 贷款总成本 - 全款总成本</p>
        <p>贷款总利息 = 还款总额 - 贷款本金（不含返息）</p>
      </div>
    </details>
  </main>
</template>

<script setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue"
  import { DEFAULTS } from "./constants/defaults.js"
  import { calcComparison, calcPurchaseTaxWithPolicy, formatMoney, toRepaymentMonths } from "./utils/calculator.js"

  const form = reactive({ ...DEFAULTS })
  const SAVED_QUOTES_KEY = "carCalculator.savedQuotes.v1"
  const quoteDraftName = ref("")
  const savedQuotes = ref([])
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
      overflowX: "hidden",
    }
  })

  const normalize = (value) => {
    const num = Number(value)
    return Number.isFinite(num) ? Math.max(0, num) : 0
  }

  const baseCarPrice = computed(() => normalize(form.carPrice))
  const cashDiscount = computed(() => normalize(form.cashDiscount))
  const totalReliefDiscount = computed(() => normalize(form.totalReliefDiscount))

  const effectiveCarPrice = computed(() => {
    return Math.max(0, baseCarPrice.value - cashDiscount.value)
  })

  const purchaseTaxBase = computed(() => {
    return form.discountAffectsTax ? effectiveCarPrice.value : baseCarPrice.value
  })

  const purchaseTaxPolicy = computed(() => {
    return calcPurchaseTaxWithPolicy({
      basePrice: purchaseTaxBase.value,
      rate: 0.11,
      vehicleEnergyType: form.vehicleEnergyType,
      purchaseYear: form.purchaseYear,
      nevInCatalog: form.nevInCatalog,
    })
  })

  const autoPurchaseTax = computed(() => {
    return purchaseTaxPolicy.value.payableTax
  })

  const repaymentMonths = computed(() => {
    return toRepaymentMonths(form.termValue, form.termUnit)
  })

  const earlyRepaymentMonthNormalized = computed(() => {
    const month = Math.round(normalize(form.earlyRepaymentMonth))
    if (month <= 0) {
      return 0
    }

    return Math.min(month, Math.max(0, repaymentMonths.value - 1))
  })

  const comparison = computed(() => {
    return calcComparison({
      carPrice: effectiveCarPrice.value,
      purchaseTax: autoPurchaseTax.value,
      insuranceFee: normalize(form.insuranceFee),
      otherFee: normalize(form.otherFee),
      cashExtraFee: normalize(form.cashExtraFee),
      totalReliefDiscount: totalReliefDiscount.value,
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

  const normalizedLoanAmount = computed(() => {
    return Math.min(normalize(form.loanAmount), effectiveCarPrice.value)
  })

  const minPrincipalPerMonth = computed(() => {
    if (repaymentMonths.value <= 0) {
      return 0
    }
    return normalizedLoanAmount.value / repaymentMonths.value
  })

  const repaymentInputWarning = computed(() => {
    if (form.activePlan !== "loan" || normalizedLoanAmount.value <= 0) {
      return ""
    }

    if (form.repaymentMethod === "equal_principal") {
      const firstPayment = normalize(form.equalPrincipalFirstPayment)
      if (firstPayment < minPrincipalPerMonth.value) {
        return `等额本金首月月供低于最低可行值 ${formatMoney(minPrincipalPerMonth.value)}，系统将按可结清口径测算。`
      }
      return ""
    }

    const monthlyPayment = normalize(form.equalInstallmentPayment)
    if (monthlyPayment < minPrincipalPerMonth.value) {
      const methodLabel = form.repaymentMethod === "equal_principal_interest" ? "等本等息" : "等额本息"
      return `${methodLabel}月供低于最低可行值 ${formatMoney(minPrincipalPerMonth.value)}，系统将按可结清口径测算。`
    }

    return ""
  })

  const estimatedInitialPayment = computed(() => {
    return comparison.value.loanPlan.downPayment + comparison.value.loanPlan.purchaseTax + normalize(form.otherFee) + normalize(form.insuranceFee) + normalize(form.cashExtraFee) - normalize(form.interestRebate)
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
          { label: "车价首付", value: comparison.value.loanPlan.downPayment, color: palette[0] },
          { label: "还款总额", value: comparison.value.loanPlan.totalRepayment, color: palette[1] },
          { label: "购置税", value: autoPurchaseTax.value, color: palette[2] },
          { label: "保险", value: normalize(form.insuranceFee), color: palette[3] },
          { label: "上牌及杂费", value: normalize(form.otherFee), color: palette[4] },
        ]
      : [
          { label: "车价", value: effectiveCarPrice.value, color: palette[0] },
          { label: "购置税", value: autoPurchaseTax.value, color: palette[1] },
          { label: "保险", value: normalize(form.insuranceFee), color: palette[2] },
          { label: "上牌及杂费", value: normalize(form.otherFee), color: palette[3] },
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
      { label: "购置税（含政策）", value: formatMoney(autoPurchaseTax.value) },
      { label: "贷款本金", value: formatMoney(loanPlan.loanAmount) },
      { label: "返息金额", value: formatMoney(loanPlan.interestRebate) },
      { label: "减免优惠", value: formatMoney(totalReliefDiscount.value) },
      { label: "还款利息(当前方案)", value: formatMoney(loanPlan.totalInterest) },
      { label: "贷款利息", value: formatMoney(loanPlan.totalInterestWithoutEarly) },
      { label: "年利率", value: `${loanPlan.annualInterestRate.toFixed(2)}%` },
      { label: "利息点", value: `${loanPlan.interestPoints.toFixed(2)}%` },
      { label: "还款总额", value: formatMoney(loanPlan.totalRepayment) },
    ]
  })

  const formatSavedTime = (timestamp) => {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) {
      return "未知时间"
    }

    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const persistSavedQuotes = () => {
    if (typeof window === "undefined") {
      return
    }

    window.localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(savedQuotes.value))
  }

  const loadSavedQuotes = () => {
    if (typeof window === "undefined") {
      return
    }

    const raw = window.localStorage.getItem(SAVED_QUOTES_KEY)
    if (!raw) {
      savedQuotes.value = []
      return
    }

    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        savedQuotes.value = []
        return
      }

      savedQuotes.value = parsed
        .map((item) => ({
          id: String(item.id ?? ""),
          name: String(item.name ?? "未命名方案"),
          activePlan: item.activePlan === "cash" ? "cash" : "loan",
          totalCost: normalize(item.totalCost),
          initialPayment: normalize(item.initialPayment),
          monthlyPayment: normalize(item.monthlyPayment),
          repaymentMonths: Math.max(0, Math.round(normalize(item.repaymentMonths))),
          earlyRepaymentMonth: Math.max(0, Math.round(normalize(item.earlyRepaymentMonth))),
          savedAt: normalize(item.savedAt),
          savedAtText: formatSavedTime(item.savedAt),
          form: item.form && typeof item.form === "object" ? item.form : {},
        }))
        .filter((item) => item.id)
    } catch {
      savedQuotes.value = []
    }
  }

  const captureCurrentForm = () => {
    return Object.fromEntries(Object.keys(DEFAULTS).map((key) => [key, form[key]]))
  }

  const saveCurrentQuote = () => {
    const now = Date.now()
    const activePlan = form.activePlan === "cash" ? "cash" : "loan"
    const fallbackName = (activePlan === "loan" ? "贷款" : "全款") + "报价 " + (savedQuotes.value.length + 1)

    const snapshot = {
      id: "quote_" + now + "_" + Math.random().toString(36).slice(2, 7),
      name: quoteDraftName.value || fallbackName,
      activePlan,
      totalCost: activePlan === "loan" ? comparison.value.loanPlan.totalCost : comparison.value.cashPlan.totalCost,
      initialPayment: activePlan === "loan" ? estimatedInitialPayment.value : 0,
      monthlyPayment: activePlan === "loan" ? comparison.value.loanPlan.firstMonthPayment : 0,
      repaymentMonths: activePlan === "loan" ? (earlyRepaymentMonthNormalized.value > 0 ? earlyRepaymentMonthNormalized.value : repaymentMonths.value) : 0,
      earlyRepaymentMonth: activePlan === "loan" ? earlyRepaymentMonthNormalized.value : 0,
      savedAt: now,
      savedAtText: formatSavedTime(now),
      form: captureCurrentForm(),
    }

    savedQuotes.value = [snapshot, ...savedQuotes.value].slice(0, 20)
    quoteDraftName.value = ""
    persistSavedQuotes()
  }

  const applySavedQuote = (quoteId) => {
    const target = savedQuotes.value.find((item) => item.id === quoteId)
    if (!target) {
      return
    }

    Object.entries(DEFAULTS).forEach(([key, value]) => {
      form[key] = Object.prototype.hasOwnProperty.call(target.form, key) ? target.form[key] : value
    })
    form.activePlan = target.activePlan
    nextTick(syncResultPanelHeight)
  }

  const removeSavedQuote = (quoteId) => {
    savedQuotes.value = savedQuotes.value.filter((item) => item.id !== quoteId)
    persistSavedQuotes()
  }

  const quoteRankings = computed(() => {
    const totalSorted = [...savedQuotes.value].sort((a, b) => a.totalCost - b.totalCost)
    const totalCostRank = Object.fromEntries(totalSorted.map((item, index) => [item.id, index + 1]))

    const loanItems = savedQuotes.value.filter((item) => item.activePlan === "loan")
    const initialSorted = [...loanItems].filter((item) => item.initialPayment > 0).sort((a, b) => a.initialPayment - b.initialPayment)
    const initialPaymentRank = Object.fromEntries(initialSorted.map((item, index) => [item.id, index + 1]))

    const monthlySorted = [...loanItems].filter((item) => item.monthlyPayment > 0).sort((a, b) => a.monthlyPayment - b.monthlyPayment)
    const monthlyPaymentRank = Object.fromEntries(monthlySorted.map((item, index) => [item.id, index + 1]))

    return {
      totalCostRank,
      initialPaymentRank,
      monthlyPaymentRank,
      lowestTotalCost: totalSorted[0] || null,
      lowestInitialPayment: initialSorted[0] || null,
      lowestMonthlyPayment: monthlySorted[0] || null,
    }
  })
  const resetAll = () => {
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      form[key] = value
    })
  }
  onMounted(() => {
    loadSavedQuotes()
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









