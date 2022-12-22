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
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
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
    setOptions({ totalPayData, totalPaySuccessData, totalPayOutData, totalPayOutSuccessData, timeLabel } = {}) {
      this.chart.setOption({
        title: [
          {
            left: 'left',
            text: '总/成功笔数折线图'
          }
        ],
        xAxis: {
          data: timeLabel,
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 40,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        legend: {
          data: ['代收总笔数', '代收成功笔数','代付总笔数', '代付成功笔数']
        },
        series: [{
          name: '代收总笔数', itemStyle: {
            normal: {
              color: '#FF005A',
              lineStyle: {
                color: '#FF005A',
                width: 2
              }
            }
          },
          smooth: true,
          type: 'line',
          data: totalPayData,
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        },
        {
          name: '代收成功笔数',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#67C23A',
              lineStyle: {
                color: '#67C23A',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: totalPaySuccessData,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },{
          name: '代付总笔数', itemStyle: {
            normal: {
              color: '#F56C6C',
              lineStyle: {
                color: '#F56C6C',
                width: 2
              }
            }
          },
          smooth: true,
          type: 'line',
          data: totalPayOutData,
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        },
        {
          name: '代付成功笔数',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#409EFF',
              lineStyle: {
                color: '#409EFF',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: totalPayOutSuccessData,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        }]
      })
    }
  }
}
</script>
