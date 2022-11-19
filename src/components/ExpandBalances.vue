<!--
 * @Author: hanjiangyanhuo hjpyh@foxmail.com
 * @Date: 2022-10-27 16:11:24
 * @LastEditors: hanjiangyanhuo hjpyh@foxmail.com
 * @LastEditTime: 2022-11-17 17:52:22
 * @FilePath: /vue-element-admin/src/components/seacrh.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <el-table
      :data="list"
      border
      fit
      v-loading="loading"
      style="width: 361px;margin-left: 56px;">
      <el-table-column
        prop="currency"
        label="币种"
        width="120">
      </el-table-column>
      <el-table-column
        prop="balance"
        label="余额"
        width="120">
      </el-table-column>
      <el-table-column
        prop="freeze"
        width="120"
        label="冻结余额">
      </el-table-column>
    </el-table>
  </template>
  
  <script>
  import utilsApi from '@/utils/utilsApi'

  export default {
    props: {
        row: {
        type: Object,
        default: function() {
          return {}
        }
      },
    },
    data() {
        return {
            list: [],
            loading: false
        }
    },
    watch:{
        row:{
        handler () {
            this.getList()
        },
        immediate: true,
        deep: true
      }
    },
    async mounted() {
        // if(this.row.id) {
        //     this.getList()
        // }
    },
    methods: {
      async getList() {
        if(!this.row.id) {
            return
        }
        this.loading = true
        let res = await utilsApi.searchBalances({code: this.row.merchantCode || this.row.code})
        this.loading = false
        this.list = res.data
      }
    }
  }
  </script>
  
  <style lang="scss" >
 
  </style>
  