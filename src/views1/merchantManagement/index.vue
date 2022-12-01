<template>
    <div class="app-container">
        <div v-if="type != 'business'">
            <div class="filter-container">
                <search :searchFields='merchant' @searchData='handleFilter' @addData='handleCreate'/>
              </div>
          
              <el-table
                :key="tableKey"
                v-loading="listLoading"
                :data="list"
                border
                fit
                ref="table"
                highlight-current-row
                @expand-change="searchBalances"
              >
              <!-- @sort-change="sortChange" -->
                <el-table-column type="expand" label="余额" width="55">
                  <template slot-scope="{row}">
                    <expandBalances :type="'merchant'" :row="row"></expandBalances>
                  </template>
                </el-table-column>
                <el-table-column v-for="item,index in merchant" :key="index" :label="item.label" :width="item.width || '120px'" align="center">
                    <template slot-scope="{row}">
                      <span v-if="item.type == 'select'">
                        {{ item.list.find(i => i.value == row[item.key]).name }}
                      </span>
                      <span v-else>{{ row[item.key] }}</span>
                    </template>
                  </el-table-column>
                <el-table-column :label="'操作'" align="center" width="230" class-name="small-padding fixed-width">
                  <template slot-scope="{row}">
                    <el-button type="success" v-if="row.status == 'N'" size="mini" @click="handleStatus(row,'Y')">
                        启用
                    </el-button>
                    <el-button type="danger" v-if="row.status == 'Y'" size="mini" @click="handleStatus(row,'N')">
                        禁用
                    </el-button>
                    <el-button type="primary" size="mini" @click="handleBusiness(row)">
                        业务
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
          
              <pagination style="margin-top:0" v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
        </div>
        <div v-else>
            <el-table
                :key="1"
                v-loading="listLoading"
                :data="rateList"
                border
                fit
                highlight-current-row
              >
              <!-- @sort-change="sortChange" -->
                <el-table-column v-for="item,index in merchantRate" :key="index" :label="item.label" :width="item.width || '80px'" align="center">
                    <template slot-scope="{row}">
                      <span v-if="item.listType == 'custom'">
                          {{ row['businessName'] }}
                      </span>
                      <span v-else-if="item.type == 'select' && item.key == 'status'">
                        {{ item.list.find(i => i.value == row[item.key]) ? item.list.find(i => i.value == row[item.key]).name : '' }}
                      </span>
                      <span v-else-if="item.type == 'select' && item.listType != 'custom'">
                        {{ item.list.find(i => i.value == row.rate[item.key]) ? item.list.find(i => i.value == row.rate[item.key]).name : '' }}
                      </span>
                      <span v-else>{{ row.rate[item.key] == -1 ? '不限' : row.rate[item.key] }}</span>
                    </template>
                  </el-table-column>
                <el-table-column :label="'操作'"  align="center"  class-name="small-padding fixed-width">
                  <template slot-scope="{row}">
                    <el-button type="success" v-if="row.status == 'N'" size="mini" @click="handleBusinessStatus(row,'Y')">
                        启用
                    </el-button>
                    <el-button type="danger" v-if="row.status == 'Y'" size="mini" @click="handleBusinessStatus(row,'N')">
                        禁用
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-row style="display:flex;justify-content:center;margin-top: 16px;">
                <el-button style="margin-left: 10px;"  class="filter-item" type="primary"  @click="rateAdd">
                  新增
                </el-button>
                <el-button class="filter-item" style="margin-left: 10px;" type="primary"  @click="type = ''">
                  返回
                </el-button>
              </el-row>
        </div>
      <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:36px;">
            <el-form-item  :label="'代理商'" required :prop="'agentCode'" :rules="formRules({key: 'agentCode',type: 'select',label: '代理商',required: true})">
                <el-select  filterable  v-model="temp.agentCode" :placeholder="'代理商'">
                    <el-option v-for="(option,index) in agentList" :key="index" :label="option.name" :value="option.code"></el-option>
                  </el-select>
            </el-form-item>
            <div v-for="item,index in merchant" :key="index">
                <el-form-item v-if="item.key != 'code' && !(item.hidden && item.hidden.indexOf('form')>=0)"  :label="item.label"  :prop="item.key" :required="item.required" :rules="formRules(item)">
                    <el-input v-if="!item.type" v-model="temp[item.key]" :disabled="dialogStatus==='编辑' && item.editDisabled" :placeholder="item.label"/>
                    <el-select  filterable v-if="item.type == 'select'" v-model="temp[item.key]" :placeholder="item.label">
                        <el-option v-for="(option,index) in item.list" :key="index" :label="option.name" :value="option.value"></el-option>
                      </el-select>
                </el-form-item>
            </div>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button type="primary" :loading="buttonLoading" @click="dialogStatus==='新增'?createData():updateData()">
            {{ $t('table.confirm') }}
          </el-button>
        </div>
      </el-dialog>
      <el-dialog :title="dialogStatus1" :visible.sync="dialogFormVisible1">
        <el-form ref="dataForm1" :model="temp1" label-position="left" label-width="140px" style="width: 400px; margin-left:36px;">
            <div v-for="item,index in merchantRate" :key="index">
                <el-alert
                        v-if="item.key == 'mixFee'"
                        title="以下字段-1代表不限制"
                        :closable="false"
                        style="margin-bottom: 12px;"
                        type="warning">
                    </el-alert>
                <el-form-item  :label="item.label"  :prop="item.key" :required="item.required" :rules="formRules(item)">
                    <el-input v-if="!item.type" v-model="temp1[item.key]" :disabled="dialogStatus1 ==='编辑' && item.editDisabled" :placeholder="item.label"/>
                    <el-select  filterable v-if="item.type == 'select'" v-model="temp1[item.key]" :placeholder="item.label">
                        <el-option v-for="(option,index) in item.list" :key="index" :label="option.name" :value="option.value"></el-option>
                      </el-select>
                </el-form-item>
            </div>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible1 = false">
            {{ $t('table.cancel') }}
          </el-button>
          <el-button type="primary" :loading="buttonLoading" @click="dialogStatus1==='新增'?createData1():updateData1()">
            {{ $t('table.confirm') }}
          </el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination
  import utilsApi from '@/utils/utilsApi'
  import moment from 'moment'
  import Search from '@/components/Search'
  import ExpandBalances from '@/components/ExpandBalances'
  import { merchant, formRules, merchantRate } from '@/utils/table'
  
  export default {
    name: 'Merchant',
    components: { Pagination, Search, ExpandBalances },
    data() {
      return {
        buttonLoading: false,
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
        dialogFormVisible1: false,
        dialogStatus: '',
        dialogStatus1: '',
        textMap: {
          update: '编辑',
          create: '新增'
        },
        merchant,
        merchantRate,
        type: '',
        temp1: {},
        rateList: [{rate:{}}],
        currentRow: {},
        agentList: []
      }
    },
    async created() {
      for(let i of merchant){
        this.temp[i.key] = i.value
        if(i.type == 'select'){
            i.list = (await utilsApi.dictionaryFindPage({type: i.listKey || i.key})).data.records
        }
      }
      this.getList()
      this.getAgentList()
      for(let i of merchantRate){
            this.temp1[i.key] = i.value
            if(i.type == 'select'){
                if(i.listType == 'custom'){
                    let res = (await utilsApi.businessFindAll()).data
                    for(let i of res){
                        i.value = i.code
                    }
                    i.list = res
                }else{
                    i.list = (await utilsApi.dictionaryFindPage({type:  i.listKey || i.key})).data.records
                }
            }
        }
        console.log(merchantRate)
    },
    methods: {
      formRules,
      searchObj() {
        let obj = {}
        for(let i of this.merchant){
            if(i.filter)obj[i.key] = i.value
        }
        return obj
      },
      async getAgentList() {
        let res = await utilsApi.agentFindAll()
        this.agentList = res.data
      },
      async getList() {
        this.listLoading = true
        let data = {
            page: this.listQuery.page,
            size: this.listQuery.size,
        }
        let res = await utilsApi.merchantPage(Object.assign(data, this.searchObj()))
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
      handleCreate() {
        this.temp = {}
        this.dialogStatus = '新增'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      async rateAdd(){
        this.temp1 = {
            mixFee: '-1',
            fee: '-1',
            maxFee: '-1',
            mixPriceLimit: '-1',
            maxPriceLimit: '-1',
            dayCountLimit: '-1',
            monthCountLimit: '-1',
            dayPriceLimit: '-1',
            monthPriceLimit: '-1',
        }
        this.dialogStatus1 = '新增'
        this.dialogFormVisible1 = true
        this.$nextTick(() => {
          this.$refs['dataForm1'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate(async (valid) => {
          if (valid) {
            let data = JSON.parse(JSON.stringify(this.temp))
            delete data.id
            this.buttonLoading = true
            let res = await utilsApi.merchantSave(data)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '创建成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
                this.dialogFormVisible = false
            }
          }
        })
      },
      createData1() {
        this.$refs['dataForm1'].validate(async (valid) => {
          if (valid) {
            let data = {}
            data.rate = JSON.parse(JSON.stringify(this.temp1))
            delete data.id
            delete data.rate.businessCode
            data.businessCode = this.temp1.businessCode
            data.merchantCode = this.currentRow.merchantCode
            this.buttonLoading = true
            let res = await utilsApi.merchantInsterbusiness(data)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '创建成功',
                    type: 'success',
                    duration: 2000
                })
                this.findMerchantRate()
                this.dialogFormVisible1 = false
            }
          }
        })
      },
      handleUpdate(row) {
        this.temp = row
        this.dialogStatus = '编辑'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      handleUpdate1(row) {
        this.temp1 = row
        this.dialogStatus1 = '编辑'
        this.dialogFormVisible1 = true
        this.$nextTick(() => {
          this.$refs['dataForm1'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate(async(valid) => {
          if (valid) {
            this.buttonLoading = true
            let res = await utilsApi.merchantSave(this.temp)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '更新成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
                this.dialogFormVisible = false
            }
          }
        })
      },
      updateData1() {
        this.$refs['dataForm1'].validate(async(valid) => {
          if (valid) {
            this.buttonLoading = true
            let res = await utilsApi.merchantInsert(this.temp1)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '更新成功',
                    type: 'success',
                    duration: 2000
                })
                this.findAgencyCode()
                this.dialogFormVisible1 = false
            }
          }
        })
      },
      async handleDelete(row, index) {
        this.$alert('确定删除该数据？', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.delDictionary({id: row.id})
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '删除成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
            }
          }
        });
      },
      async handleBusinessStatus(row,status){
        this.$alert(`确定${status == 'Y' ? '启用' : '禁用'}该商户业务？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.updateBusinessStatus({merchantBusinessId: row.id,status})
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: `${status == 'Y' ? '启用' : '禁用'}成功`,
                    type: 'success',
                    duration: 2000
                })
                this.findMerchantRate()
            }
          }
        });
      },
      async handleStatus(row,status){
        this.$alert(`确定${status == 'Y' ? '启用' : '禁用'}该商户？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.updateMerchantStatus({merchantCode: row.merchantCode,status})
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: `${status == 'Y' ? '启用' : '禁用'}成功`,
                    type: 'success',
                    duration: 2000
                })
                this.getList()
            }
          }
        });
      },
      async handleBusiness(row){
        this.type = 'business'
        this.currentRow = JSON.parse(JSON.stringify(row)) 
        this.findMerchantRate()
      },
      async findMerchantRate(code) {
        this.listLoading = true
        let res = await utilsApi.findMerchantRate({merchantCode: this.currentRow.merchantCode})
        this.listLoading = false
        this.rateList = res.data
      },
      async searchBalances(row,expandRows) {
        // if(expandRows.length <= 0){
        //   return
        // }
        // for(let i of expandRows){
        //   let res = await utilsApi.searchBalances({code: i.merchantCode})
        //   // i.balances = res.data
        //   this.$set(i, 'balances', res.data)
        //   this.$nextTick(() => {
        //     this.$refs.table.toggleRowExpansion(i, true)
        //   })
        // }
        
      }
    }
  }
  </script>
  