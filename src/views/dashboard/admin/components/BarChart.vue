<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

const animationDuration = 6000

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    },
    setOptions({  timeLabel, totalPaySuccessAmountData, totalPayOutSuccessAmountData } = {}) {
      this.chart.setOption({
        title: [
          {
            left: 'left',
            text: '总/成功订单金额柱形图'
          }
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        grid: {
          top: 40,
          left: '2%',
          right: '2%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: timeLabel,
          axisTick: {
            alignWithLabel: true
          }
        }],
        legend: {
          data: ['代收成功金额', '代付成功金额']
        },
        yAxis: [{
          type: 'value',
          axisTick: {
            show: false
          }
        }],
        series: [{
          name: '代收成功金额',
          type: 'bar',
          barWidth: '40%',
          data: totalPaySuccessAmountData,
          animationDuration
        }, {
          name: '代付成功金额',
          type: 'bar',
          barWidth: '40%',
          data: totalPayOutSuccessAmountData,
          animationDuration
        }]
      })
    }
  }
}
</script>
