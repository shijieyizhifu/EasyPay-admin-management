<template>
    <div class="app-container">
        <div v-if="type != 'business'">
            <div class="filter-container">
                <search :searchFields='ChannelMerchant' @searchData='handleFilter' @addData='handleCreate'/>
              </div>
          
              <el-table
                style="width:911px"
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
                <template v-for="item in ChannelMerchant" >
                    <el-table-column :key="item.label" v-if="!['md5Private', 'rsaPrivate', 'rsaPublic', 'agencyPublic'].includes(item.key)"   :label="item.label" :width="item.width || '120px'" align="center">
                        <template slot-scope="{row}">
                            <div>
                                <span v-if="item.type == 'select'">
                                    {{ item.list.find(i => i.value == row[item.key]).name }}
                                  </span>
                                  <span v-else>{{ row[item.key] }}</span>
                            </div>
                        </template>
                      </el-table-column>
                </template>
                <el-table-column :label="'操作'" align="center" width="230" class-name="small-padding fixed-width">
                  <template slot-scope="{row}">
                    <el-button type="success" v-if="row.status == 'N'" size="mini" @click="handleStatus(row,'Y')">
                        启用
                    </el-button>
                    <el-button type="danger" v-if="row.status == 'Y'" size="mini" @click="handleStatus(row,'N')">
                        禁用
                    </el-button>
                    <el-button type="success" size="mini" @click="handleUpdate(row)">
                        {{ $t('table.edit') }}
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
                style="width:1081px"
                :key="1"
                v-loading="listLoading"
                :data="rateList"
                border
                fit
                highlight-current-row
              >
              <!-- @sort-change="sortChange" -->
                <!-- <el-table-column :label="$t('table.id')" type="index"  align="center" width="80" >
                </el-table-column> -->
                <template v-for="item in ChannelMerchantRate">
                    <el-table-column  :key="item.label" v-if="!['merchant', 'agencyCode', 'businessCode'].includes(item.key)" :label="item.label" :width="item.width || '80px'" align="center">
                      <template slot-scope="{row}">
                        <span v-if="item.listType == 'custom'">
                            {{ row['businessName'] }}
                        </span>
                      <span v-else-if="item.type == 'select' && item.listType != 'custom'">
                        {{ item.list.find(i => i.value == row.rate[item.key]) ? item.list.find(i => i.value == row.rate[item.key]).name : '' }}
                      </span>
                      <span v-else>{{ row.rate[item.key] == -1 ? '不限' : row.rate[item.key] }}</span>
                    </template>
                    </el-table-column>
                </template>
                <el-table-column :label="'操作'"  align="center" width="120" class-name="small-padding fixed-width">
                  <template slot-scope="{row}">
                    <el-button type="primary" size="mini" @click="handleUpdate1(row)">
                        修改
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-row style="display:flex;justify-content:center;margin-top: 16px;">
                <el-button style="margin-left: 10px;"  class="filter-item" type="primary"  @click="businessAdd">
                  新增
                </el-button>
                <el-button class="filter-item" style="margin-left: 10px;" type="primary"  @click="type = ''">
                  返回
                </el-button>
              </el-row>
        </div>
      <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:36px;">
            <div v-for="item,index in ChannelMerchant" :key="index">
                <el-form-item  :label="item.label"  :prop="item.key" :required="item.required" :rules="formRules(item)">
                    <el-input v-if="!item.type && !(item.hidden && item.hidden.indexOf('form')>=0)" v-model="temp[item.key]" :disabled="dialogStatus==='编辑' && item.editDisabled" :placeholder="item.label"/>
                    <el-select  filterable v-if="item.type == 'select'  && !(item.hidden && item.hidden.indexOf('form')>=0)" :disabled="dialogStatus==='编辑' && item.editDisabled" v-model="temp[item.key]" :placeholder="item.label">
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
            <div v-for="item,index in ChannelMerchantRate" :key="index">
                <el-form-item v-if="item.key == 'mixFee'"  :label="'谷歌验证码'" required :prop="'verifCode'" :rules="formRules({key: 'verifCode',label: '谷歌验证码',required: true})">
                  <el-input  v-model="temp1.verifCode" :placeholder="'谷歌验证码'"/>
                </el-form-item>
                <el-alert
                    v-if="item.key == 'mixFee'"
                    title="以下字段-1代表不限制"
                    :closable="false"
                    style="margin-bottom: 12px;"
                    type="warning">
                </el-alert>
                <el-form-item v-if="item.key != 'businessCode'"  :label="item.label"  :prop="item.key" :required="item.required" :rules="formRules(item)">
                    <el-input v-if="!item.type  && !(item.hidden && item.hidden.indexOf('form')>=0)" v-model="temp1[item.key]" :disabled="dialogStatus1 ==='编辑' && item.editDisabled" :placeholder="item.label"/>
                    <el-select  filterable v-if="item.type == 'select'  && !(item.hidden && item.hidden.indexOf('form')>=0)" v-model="temp1[item.key]" :placeholder="item.label" :disabled="dialogStatus1 ==='编辑' && item.editDisabled">
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
  import { ChannelMerchant, formRules, ChannelMerchantRate } from '@/utils/table'
  
  export default {
    name: 'ChannelMerchant',
    components: { Pagination, Search },
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
        ChannelMerchant,
        ChannelMerchantRate,
        type: '',
        temp1: {},
        rateList: [],
        currentRow: {}
      }
    },
    async created() {
      for(let i of ChannelMerchant){
        this.temp[i.key] = i.value
        if(i.type == 'select'){
                if(i.listType == 'custom'){
                    let res = (await utilsApi.agencyFindAll()).data
                    for(let i of res){
                        i.value = i.code
                    }
                    i.list = res
                }else{
                    i.list = (await utilsApi.dictionaryFindPage({type:  i.listKey || i.key})).data.records
                }
            }
      }
      this.getList()
    },
    methods: {
        formRules,
        searchObj() {
            let obj = {}
            for(let i of this.ChannelMerchant){
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
        let res = await utilsApi.agencyMerchantPage(Object.assign(data, this.searchObj()))
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
      businessAdd(){
        let user = JSON.parse(sessionStorage.getItem('user'))
        if(!user.is_auth){
          this.$notify({
                    title: '警告',
                    message: '请先去右上角绑定谷歌验证器，再进行该操作！',
                    type: 'warning',
                    duration: 2000
                })
            return
        }
        this.temp1 = {
            agencyCode: this.currentRow.agencyCode,
            merchant: this.currentRow.merchant,
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
            let res = await utilsApi.saveAgencyMerchant(data)
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
      getBusinessCode(name) {
        console.log(name)
        console.log(ChannelMerchantRate)
        return ChannelMerchantRate.find(item => item.key == 'businessName').list.find(item => item.name == name).businessCode
      },
      createData1() {
        this.$refs['dataForm1'].validate(async (valid) => {
          if (valid) {
            let data = {}
            data.rate = JSON.parse(JSON.stringify(this.temp1))
            data.merchant = data.rate.merchant
            data.agencyCode = data.rate.agencyCode
            data.businessCode = this.getBusinessCode(this.temp1.businessName)
            data.verifCode = this.temp1.verifCode
            delete data.id
            delete data.rate.verifCode
            this.buttonLoading = true
            let res = await utilsApi.merchantRateSave(data)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '创建成功',
                    type: 'success',
                    duration: 2000
                })
                this.findAgencyMerchantRate()
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
        let user = JSON.parse(sessionStorage.getItem('user'))
        if(!user.is_auth){
          this.$notify({
                    title: '警告',
                    message: '请先去右上角绑定谷歌验证器，再进行该操作！',
                    type: 'warning',
                    duration: 2000
                })
            return
        }
        row.rateObj = JSON.parse(JSON.stringify(row.rate))
        for(let i in row.rateObj){
          row[i] = row.rateObj[i]
        }
        delete row.rateObj
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
            let res = await utilsApi.saveAgencyMerchant(this.temp)
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
            let data = {}
            data.rate = JSON.parse(JSON.stringify(this.temp1))
            data.merchant = data.rate.merchant
            data.agencyCode = data.rate.agencyCode
            data.businessCode = this.getBusinessCode(this.temp1.businessName)
            data.verifCode = this.temp1.verifCode
            data.id = this.temp1.id
            delete data.rate.id
            delete data.rate.verifCode
            delete data.rate.rateId
            delete data.rate.agencyCode
            delete data.rate.businessCode
            delete data.rate.businessName
            delete data.rate.merchant
            this.buttonLoading = true
            let res = await utilsApi.merchantRateSave(data)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '更新成功',
                    type: 'success',
                    duration: 2000
                })
                this.findAgencyMerchantRate()
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
      async handleStatus(row,status){
        this.$alert(`确定${status == 'Y' ? '启用' : '禁用'}该通道？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.updateStatusAgency({id: row.id,status})
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
        this.listLoading = true
        this.currentRow = JSON.parse(JSON.stringify(row)) 
        for(let i of ChannelMerchantRate){
            this.temp1[i.key] = i.value
            if(i.type == 'select'){
                if(i.listType == 'custom'){
                    let res = (await utilsApi.findAgencyCode({code: row.agencyCode})).data
                    for(let i of res){
                        i.value = i.name
                    }
                    i.list = res
                }else{
                    i.list = (await utilsApi.dictionaryFindPage({type:  i.listKey || i.key})).data.records
                }
            }
        }
        let res = await this.findAgencyMerchantRate()
        this.listLoading = false
      },
      async findAgencyMerchantRate() {
        let res = await utilsApi.findAgencyMerchantRate({agencyCode: this.currentRow.agencyCode, merchant: this.currentRow.merchant})
        this.rateList = res.data
      }
    }
  }
  </script>
  