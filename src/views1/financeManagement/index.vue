<template>
    <div class="app-container">
      <div class="filter-container">
        <search :searchFields.sync='adjustAccountsList' :type="'FundsRecords'" @searchData='handleFilter' />
      </div>
  
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
      >
      <!-- @sort-change="sortChange" -->
        <el-table-column :label="$t('table.id')" type="index"  align="center" width="80" >
        </el-table-column>
        <el-table-column prop="amount" label="金额" align="center" width="160" >
            <template slot-scope="{row}">
                <el-tag effect="dark" v-if="row.type == 'IN'" type="success" round>{{ `加余额 ${row.amount+' '+ row.currency}` }}</el-tag>
                <el-tag effect="dark" v-else type="danger" round>{{ `减余额 ${row.amount+' '+ row.currency}` }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column v-for="item,index in adjustAccountsList" :key="index" :label="item.label" :width="item.width || '120px'" align="center">
            <template slot-scope="{row}">
                <span v-if="item.type == 'select'">
                    {{ item.list.find(i => i.value == row[item.key]).name }}
                  </span>
                  <span v-else>{{ row[item.key] }}</span>
            </template>
          </el-table-column>
          <el-table-column  label="创建时间" align="center" width="100" >
            <template slot-scope="{row}">
                <span >{{ moment(row.createdTime).format('YYYY/DD/MM HH:mm:ss') }}</span>
            </template>
        </el-table-column>
        <el-table-column :label="'操作'" align="center" width="120" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button v-if="row.status == 'N'" type="primary" size="mini" @click="review(row)">
                审核
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
  
      <pagination style="margin-top:0" v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
    </div>
  </template>
  
  <script>
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination
  import utilsApi from '@/utils/utilsApi'
  import moment from 'moment'
  import Search from '@/components/Search'
  import { adjustAccountsList } from '@/utils/table'
  
  export default {
    name: 'FinanceManagement',
    components: { Pagination, Search },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          size: 10,
        },
        temp: {},
        dialogFormVisible: false,
        dialogStatus: '',
        adjustAccountsList,
        moment
      }
    },
    async created() {
      for(let i of adjustAccountsList){
            if(i.type == 'select'){
                i.list = (await utilsApi.dictionaryFindPage({type:  i.listKey || i.key})).data.records
            }
      }
      this.getList()
    },
    methods: {
        searchObj() {
            let obj = {}
            for(let i of this.adjustAccountsList){
                if(i.filter)obj[i.key] = i.value
            }
            return obj
        },
      async getList() {
        this.listLoading = true
        let data = {
            page: this.listQuery.page,
            size: this.listQuery.size,
        }
        let res = await utilsApi.balancePage(Object.assign(data, this.searchObj()))
        this.listLoading = false
        if(res.code == 0){
            this.list = res.data.records
            this.total = res.data.total
        }
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      review(row) {
        this.$alert(`确定${row.type == 'IN' ? '增加' : '减少'}该商户/代理商余额吗？`, '余额审核', {
          confirmButtonText: '确定',
          type: 'warning',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.balanceReview({id: row.id})
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '审核成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
            }
          }
        });
      },
    }
  }
  </script>
  