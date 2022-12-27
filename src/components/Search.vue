<!--
 * @Author: hanjiangyanhuo hjpyh@foxmail.com
 * @Date: 2022-10-27 16:11:24
 * @LastEditors: hanjiangyanhuo hjpyh@foxmail.com
 * @LastEditTime: 2022-12-27 17:05:31
 * @FilePath: /vue-element-admin/src/components/seacrh.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div>
    <el-card header="查询条件">
        <el-form :inline="true" label-width="120px">
            <span v-for="(item,index) in searchData" :key="index">
                <el-form-item :label="item.label"  >
                    <el-input style="width:183px;" v-model="item.value" v-if="!item.type" :placeholder="item.label"></el-input>
                    <el-select style="width:183px;" clearable filterable v-if="item.type == 'select'" v-model="item.value" :placeholder="item.label">
                      <el-option v-for="(option,index) in item.list" :key="index" :label="option.name" :value="option.value"></el-option>
                    </el-select>
                    <el-date-picker
                      v-if="item.type == 'date'"
                      v-model="item.value"
                      type="daterange"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      :default-time="['00:00:00', '23:59:59']">
                    </el-date-picker>
                </el-form-item>
            </span>
          </el-form>
          <el-row style="display:flex;justify-content:center;">
            <el-button style="margin-left: 10px;"  class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
              {{ $t('table.search') }}
            </el-button>
            <el-button v-if="!hideAddButtonList.includes(type)" class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-edit" @click="addData">
              {{ $t('table.add') }}
            </el-button>
            <el-button style="margin-left: 10px;" v-if="showExportButtonList.includes(type)" :loading="exportLoading"  class="filter-item" type="primary" icon="el-icon-download" @click="handleExport">
              {{exportLoading ? "导出中..." : "导出excel" }}
            </el-button>
            <el-button v-if="showCountButtonList.includes(type)" class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-edit" @click="countData">
              统计
            </el-button>
          </el-row>
    </el-card>
    <el-card style="margin-top: 12px;" v-if="showCount" v-loading="showCountLoading">
      <div slot="header" class="clearfix">
        <span style="line-height: 36px;">统计</span>
        <el-button type="primary" icon="el-icon-delete" style="float: right;" circle @click="showCount = false"></el-button>
      </div>
      <el-descriptions v-for="item in countList" :key="item.currency" style="margin-top: 8px;" :column="3" :size="'mini'" border>
        <el-descriptions-item>
          <template slot="label">
            币种
          </template>
          {{ item.currency }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            订单总数
          </template>
          {{ item.total }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            订单总金额
          </template>
          {{ item.totalAmount }} {{ item.currency }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            平台收益
          </template>
          {{ item.systemGain }} {{ item.currency }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            成功的订单数
          </template>
          {{ item.success }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            成功订单金额
          </template>
          {{ item.successAmount }} {{ item.currency }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
  </template>
  
  <script>
import utilsApi from '@/utils/utilsApi'
  export default {
    props: {
      searchFields: {
        type: Array,
        default: function() {
          return []
        }
      },
      type: {
        type: String,
        default: function() {
          return ''
        }
      }
    },
    data() {
      return {
        searchData: this.searchFields.filter(item => item.filter == true),
        hideAddButtonList: ['pay','payOut','MerchantOffline','FundsRecords'],
        showCountButtonList: ['pay','payOut'],
        showExportButtonList: ['pay','payOut'],
        showCount: false,
        showCountLoading: false,
        countList: [],
        exportLoading: false
      }
    },
    // watch:{
    //   searchFields:{
    //     handler () {
    //       this.searchData = this.searchFields.filter(item => item.filter == true)
    //     },
    //     immediate: true,
    //     deep: true
    //   }
    // },
    methods: {
      searchObj() {
            let obj = {}
            for(let i of this.searchData){
                if(i.filter)obj[i.key] = i.value
            }
            return obj
      },
      handleFilter() {
        this.$emit('searchData')
      },
      addData() {
        this.$emit('addData')
      },
      async countData() {
        this.showCount = true
        this.showCountLoading = true
        let res
        if(this.type == 'pay'){
          res = await utilsApi.orderStatistic(this.searchObj())
        }else if(this.type == 'payOut'){
          res = await utilsApi.payOutStatistic(this.searchObj())
        }
        if(res.code == 0){
          this.countList = res.data
        }
        this.showCountLoading = false
      },
      async handleExport() {
        this.exportLoading = true
        let res,name
        if(this.type == 'pay'){
          res = await utilsApi.excelOrder(this.searchObj())
          name = '代收订单.xlsx'
        }else if(this.type == 'payOut'){
          res = await utilsApi.excelPayOut(this.searchObj())
          name = '代付订单.xlsx'
        }
        if (res) {
            let blob = new Blob([res], { type: 'application/x-xls' })
            const a = document.createElement('a')
            // 创建URL
            const blobUrl = window.URL.createObjectURL(blob)
            a.download = name
            a.href = blobUrl
            document.body.appendChild(a)
            // 下载文件
            a.click()
            // 释放内存
            URL.revokeObjectURL(blobUrl)
            document.body.removeChild(a)
        }
        this.exportLoading = false
      }
    }
  }
  </script>
  
  <style lang="scss" >
 
  </style>
  