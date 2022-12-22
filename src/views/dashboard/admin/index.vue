<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <h3 style="text-align: center;">今日代收数据</h3>
          <panel-group  :countData="countData.pay"/>
          <pie-chart :countData="countData.pay"/>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <h3 style="text-align: center;">今日代付数据</h3>
          <panel-group  :countData="countData.payOut"/>
          <pie-chart :countData="countData.payOut"/>
        </div>
      </el-col>
    </el-row>

    <el-row style="background:#fff;padding:16px;margin-bottom:32px;">
      <el-date-picker
        style="margin-right: 16px;"
        v-model="dates"
        type="daterange"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :clearable="false"
        :default-time="['00:00:00', '23:59:59']"
        @change="handleFilter"
        >
      </el-date-picker>
      <span>（默认本月）</span>
    </el-row>

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="chartData" />
    </el-row>

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <bar-chart :chart-data="chartData" />
    </el-row>

    <!-- <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row> -->

    <!-- <el-row :gutter="8">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 12}" :xl="{span: 12}" style="padding-right:8px;margin-bottom:30px;">
        <transaction-table />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <todo-list />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <box-card />
      </el-col>
    </el-row> -->
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import BarChart from './components/BarChart'
import PieChart from './components/PieChart'
import utilsApi from '@/utils/utilsApi'
import moment from 'moment'

const lineChartData = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
}

export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup,
    LineChart,
    BarChart,
    PieChart
  },
  data() {
    return {
      lineChartData: lineChartData.newVisitis,
      from: {
        startTime: '',
        endTime: ''
      },
      dates: [],
      countData: {
        pay: {},
        payOut: {}
      },
      chartData:{
        totalPayData: [],
        totalPaySuccessData: [],
        totalPayOutData: [], 
        totalPayOutSuccessData: [],
        timeLabel: [],
        totalPaySuccessAmountData: [],
        totalPayOutSuccessAmountData: [],
      }
    }
  },
  created() {
    this.getTodayData()
    this.handleFilter()
  },
  methods: {
    async getTodayData() {
      let res = await utilsApi.todayData()
      if(res.code == 0) {
        this.countData = res.data
      }
    },
    async getTodayData() {
      let res = await utilsApi.todayData()
      if(res.code == 0) {
        this.countData = res.data
      }
    },
    async handleFilter() {
      this.from.startTime = new Date(this.dates[0]).getTime()
      this.from.endTime = new Date(this.dates[1]).getTime()
      let res = await utilsApi.timeStatistics(this.from)
      this.chartData = {
        totalPayData: [],
        totalPaySuccessData: [],
        totalPayOutData: [], 
        totalPayOutSuccessData: [],
        timeLabel: [],
        totalPaySuccessAmountData: [],
        totalPayOutSuccessAmountData: [],
      }
      if(res.code == 0) {
        for(let i of res.data.pay) {
          this.chartData.timeLabel.push(moment(i.time).format('MM/DD'))
          this.chartData.totalPayData.push(i.total)
          this.chartData.totalPaySuccessData.push(i.success)
          this.chartData.totalPaySuccessAmountData.push(i.successAmount)
        }
        for(let i of res.data.payout) {
          this.chartData.totalPayOutData.push(i.total)
          this.chartData.totalPayOutSuccessData.push(i.success)
          this.chartData.totalPayOutSuccessAmountData.push(i.successAmount)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
