
<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

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
    countData: {
      type: Object,
      default: () => {
        return {
          success: 0,
          successAmount: 0,
          systemGain: 0,
          total: 0,
          totalAmount: 0
        }
      }
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    countData: {
      handler: function(){
        this.setOption(this.countData)
      },
      deep: true,
      immediate: false
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
      if(!this?.chart){
          this.chart = echarts.init(this.$el, 'macarons')
      }
      this.setOption(this.countData)
    },
    setOption(countData){
      this.chart.setOption({
        title: [
          {
            left: 'left',
            text: '订单成功率'
          }
        ],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: ['成功订单数', '失败订单数']
        },
        series: [
          {
            name: '订单成功率',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 165],
            center: ['50%', '48%'],
            data: [
              { value: countData.success || 0, name: '成功订单数' },
              { value: countData.total - countData.success || 0, name: '失败订单数' },
            ],
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      },true)
    }
  }
}
</script>
