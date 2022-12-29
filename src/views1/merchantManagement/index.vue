<template>
    <div class="app-container">
        <div v-if="type != 'business'">
            <div class="filter-container">
                <search :searchFields='merchant' @searchData='handleFilter' @addData='handleCreate'/>
              </div>
              <el-alert
                  title="重置的登录密码和支付密码：admin123456"
                  :closable="false"
                  style="margin-bottom: 12px;"
                  type="warning">
              </el-alert>
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
                <el-table-column :label="'操作'" align="center" width="550" class-name="small-padding fixed-width">
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
                    <el-button type="success" size="mini" @click="handleIpVerify(row)">
                      安全校验
                    </el-button>
                    <el-button type="warning" size="mini" @click="handleClearGooleAuth(row)">
                      清除谷歌验证器
                    </el-button>
                    <el-button type="warning" size="mini" @click="resetPayPassword(row)">
                      重置支付密码
                    </el-button>
                    <el-button type="warning" size="mini" @click="resetLogPassword(row)">
                      重置登录密码
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
                <el-table-column :label="'操作'" width="160"  align="center"  class-name="small-padding fixed-width">
                  <template slot-scope="{row}">
                    <el-button type="success" v-if="row.status == 'N'" size="mini" @click="handleBusinessStatus(row,'Y')">
                        启用
                    </el-button>
                    <el-button type="danger" v-if="row.status == 'Y'" size="mini" @click="handleBusinessStatus(row,'N')">
                        禁用
                    </el-button>
                    <el-button type="primary" size="mini" @click="handleUpdate1(row)">
                      修改
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
                <el-form-item  :label="item.label" v-if="!['status','businessCode'].includes(item.key) || dialogStatus1 !=='编辑' "  :prop="item.key" :required="item.required" :rules="formRules(item)">
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
      <el-dialog title="安全校验" :visible.sync="ipVerifyDialog" center>
        <el-form ref="dataForm2" :model="temp2" :rules="rules2" label-position="left" label-width="120px" style="width: 400px; margin-left:36px;">
            <el-form-item label="开启/关闭" prop="ipVerify">
                <el-select v-model="temp2.ipVerify" filterable placeholder="请选择">
                  <el-option
                    v-for="item in ipVerifyList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value">
                  </el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="'ip地址(逗号,隔开)'" :prop="temp2.ipVerify == 'Y' ? 'ips' : undefined">
                <el-input type="textarea"  v-model="temp2.ips" placeholder="ip地址，逗号,隔开"/>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="ipVerifyDialog = false">
              {{ $t('table.cancel') }}
            </el-button>
            <el-button type="primary" :loading="buttonLoading" @click="ipVerifyConfirm">
              {{ $t('table.confirm') }}
            </el-button>
        </div>
      </el-dialog>
      <el-dialog :title="`解冻审核`" :visible.sync="dialogClearGooleAuth" center>
        <el-form ref="clearGooleAuthForm" :model="temp3" :rules="rules3" label-position="left" label-width="140px" style="width: 400px; margin-left:36px;">
          <el-form-item :label="'邮箱验证码'" prop="emailCode" class="emailCode">
            <el-input  v-model="temp3.emailCode" placeholder="邮箱验证码">
              <template slot="append">
                <el-button type="primary" :disabled="disabledSendCode" :loading="codeLoading"  @click="sendCode">
                  {{ disabledSendCode ? countdown + 's' : '发送验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>  
          <el-form-item :label="'谷歌验证码'" prop="verifCode">
                <el-input  v-model="temp3.verifCode" placeholder="谷歌验证码"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogClearGooleAuth = false">
              {{ $t('table.cancel') }}
            </el-button>
            <el-button type="primary" :loading="buttonLoading" @click="clearGooleAuthConfirm">
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
        dialogClearGooleAuth: false,
        disabledSendCode: false,
        codeLoading: false,
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
        agentList: [],
        ipVerifyDialog: false,
        temp2: {},
        rules2: {
          ipVerify: [{ required: true, message: '请选择ip认证', trigger: 'change' }],
          ips: [{ required: true, message: '请输入ip', trigger: 'blur' }],
        },
        temp3:{},
        rules3: {
          verifCode: [{ required: true, message: '请输入谷歌验证码', trigger: 'blur' }],
          emailCode: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }],
        },
        countdown: 60
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
    computed: {
      ipVerifyList() {
        for(let i of merchant) {
          if(i.key ==  'ipVerify') {
            return i.list
          }
        }
      },
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
      handleIpVerify(row) {
        this.temp2 = {
          ips: '',
          ipVerify: ''
        }
        this.temp2.ipVerify = row.ipVerify
        this.temp2.ips = row.ips
        this.currentRow = row
        this.ipVerifyDialog = true
        this.$nextTick(() => {
          this.$refs['dataForm2'].clearValidate()
        })
      },
      ipVerifyConfirm() {
        this.$refs['dataForm2'].validate(async (valid) => {
          if (valid) {
            let data = JSON.parse(JSON.stringify(this.temp2))
            data.merchantCode = this.currentRow.merchantCode
            this.buttonLoading = true
            let res = await utilsApi.ipVerify(data)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '设置成功',
                    type: 'success',
                    duration: 2000
                })
                this.getList()
                this.ipVerifyDialog = false
            }
          }
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
        this.temp1 = JSON.parse(JSON.stringify(row.rate)) 
        this.temp1.id = row.id
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
            this.buttonLoading = true
            let data = {
              id: this.temp1.id,
              rate: this.temp1
            }
            delete data.rate.id
            let res = await utilsApi.updateMerchantBusinessRate(data)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '更新成功',
                    type: 'success',
                    duration: 2000
                })
                this.findMerchantRate()
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
      resetLogPassword(row) {
        this.$alert(`确定重置该商户的登录密码吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.resetLogPassword({merchantCode: row.merchantCode})
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: `重置登录密码成功`,
                    type: 'success',
                    duration: 2000
                })
            }
          }
        });
      },
      resetPayPassword(row) {
        this.$alert(`确定重置该商户的支付密码吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          callback: async action => {
            if(action != 'confirm'){
                return
            }
            let res = await utilsApi.resetPayPassword({merchantCode: row.merchantCode})
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: `重置支付密码成功`,
                    type: 'success',
                    duration: 2000
                })
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
        
      },
      handleClearGooleAuth() {
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
        this.currentRow = row
        this.dialogClearGooleAuth = true
        this.temp3 = {
          verifCode: undefined,
          emailCode: undefined
        }
        this.$nextTick(() => {
          this.$refs['clearGooleAuthForm'].clearValidate()
        })
      },
      async sendCode() {
        this.codeLoading = true
        let res = await utilsApi.sendCode({type: '清除商户谷歌验证器'})
        this.codeLoading = false
        this.disabledSendCode = true 
        if(res.code == 0) {
          this.countdown = 60
          this.interval = setInterval(() => {
            if(this.countdown == 0){
              clearInterval(this.interval)
              this.disabledSendCode = false 
            }else{
              this.countdown -= 1
            }
          }, 1000);
        }else{
          clearInterval(this.interval)
          this.disabledSendCode = false 
        }
      },
      clearGooleAuthConfirm() {
        this.$refs['clearGooleAuthForm'].validate(async (valid) => {
          if (valid) {
            this.buttonLoading = true
            let res = await utilsApi.clearMercahntGoolAuth({id: this.currentRow.id,verifCode: this.temp3.verifCode,emailCode: this.temp3.emailCode})
            this.buttonLoading = false
            this.dialogClearGooleAuth = false
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
        })
      },
    }
  }
  </script>
  