<template>
    <div class="app-container">
        <div v-if="type != 'business'">
            <div class="filter-container">
                <search :searchFields='agent' @searchData='handleFilter' @addData='handleCreate'/>
              </div>
          
              <el-table
                style="width:766px"
                :key="tableKey"
                v-loading="listLoading"
                :data="list"
                border
                fit
                highlight-current-row
              >
              <!-- @sort-change="sortChange" -->
              <el-table-column type="expand" label="余额" width="55">
                <template slot-scope="{row}">
                  <expandBalances :row="row"></expandBalances>
                </template>
              </el-table-column>
                <el-table-column v-for="item,index in agent" :key="index" :label="item.label" :width="item.width || '120px'" align="center">
                    <template slot-scope="{row}">
                      <span v-if="item.type == 'select'">
                        {{ item.list.find(i => i.value == row[item.key]).name }}
                      </span>
                      <span v-else>{{ row[item.key] }}</span>
                    </template>
                  </el-table-column>
                <el-table-column :label="'操作'"  align="center" width="230" class-name="small-padding fixed-width">
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
            <el-row style="display:flex;justify-content:center;margin-top: 16px;margin-bottom: 16px;">
                <el-button style="margin-left: 10px;"  class="filter-item" type="primary"  @click="addbuinessList">
                  新增业务产品
                </el-button>
                <el-button class="filter-item" style="margin-left: 10px;" type="primary"  @click="type = ''">
                  返回
                </el-button>
              </el-row>
              <div v-if="buinessList && buinessList.length > 0">
                <el-tabs v-model="businessValue" type="card" @tab-click="tabClick">
                    <el-tab-pane
                    v-for="(item) in  buinessList"
                    :key="item.name"
                    :label="item.name"
                    :name="item.code"
                    >
                    </el-tab-pane>
                </el-tabs>
                <el-row style="display:flex;justify-content:center;margin-bottom: 16px;">
                    <el-button style="margin-left: 10px;"  class="filter-item" type="primary"  @click="rateAdd">
                        新增费率
                    </el-button>
                </el-row>
                <el-table
                    :key="1"
                    v-loading="listLoading"
                    :data="rateList"
                    border
                    fit
                    highlight-current-row
                >
                <!-- @sort-change="sortChange" -->
                    <el-table-column prop="agencyCode" label="通道编号" align="center" width="100" >
                    </el-table-column>
                    <el-table-column prop="agencyMerchant" label="通道商户号" align="center" width="100" >
                    </el-table-column>
                    <el-table-column v-for="item,index in agentRate" :key="index" :label="item.label" :width="item.width || '80px'" align="center">
                        <template slot-scope="{row}">
                            <span v-if="item.listType == 'custom'">
                                {{ row.rate[item.key] }}
                            </span>
                            <span v-else-if="item.type == 'select' && item.listType != 'custom'">
                                {{ item.list.find(i => i.value == row.rate[item.key]) ? item.list.find(i => i.value == row.rate[item.key]).name : '' }}
                            </span>
                            <span v-else>{{ row.rate[item.key] == -1 ? '不限' : row.rate[item.key] }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="'操作'" fixed="right" align="center" width="100" class-name="small-padding fixed-width">
                      <template slot-scope="{row}">
                          <!-- <el-button type="primary" size="mini" @click="bindMerchant(row)">
                            集群
                        </el-button> -->
                        <el-button type="primary" size="mini" @click="handleUpdate1(row)">
                          修改
                        </el-button>
                      </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    <el-dialog :title="'新增'" :visible.sync="businessDialog">
        <el-form ref="dataForm" :model="business" label-position="left" label-width="120px" style="width: 400px; margin-left:36px;">
            <el-form-item  :label="'业务产品'"  prop="businessSelected" :rules="formRules({required: true, type: 'select', label: '业务产品'})">
                <el-select  filterable v-model="business.businessSelected" :placeholder="'选择业务产品'">
                    <template v-for="(option,index) in allBuinessList">
                        <el-option  v-if="!buinessList.map(item => item.code).includes(option.code)" :key="index" :label="option.name" :value="option.code"></el-option>
                    </template>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="businessDialog = false">
            {{ $t('table.cancel') }}
            </el-button>
            <el-button type="primary" @click="handleAddbuinessList">
            {{ $t('table.confirm') }}
            </el-button>
        </div>
      </el-dialog>
      <el-dialog :title="'集群'" :visible.sync="bindMerchantDialog" width="750px" center>
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
          <el-tab-pane label="已绑定" name="1"></el-tab-pane>
          <el-tab-pane label="待绑定" name="2"></el-tab-pane>
        </el-tabs>
        <el-table
            :key="1"
            :data="merchantList"
            border
            fit
            highlight-current-row
        >
        <!-- @sort-change="sortChange" -->
            <el-table-column prop="merchantCode" label="商户编码" align="center" width="100" >
            </el-table-column>
            <el-table-column prop="merchantName" label="商户名称" align="center" width="100" >
            </el-table-column>
            <el-table-column prop="businessCode" label="业务编码" align="center" width="100" >
            </el-table-column>
            <el-table-column prop="businessName" label="业务名称" align="center" width="100" >
            </el-table-column>
            <el-table-column prop="rate" label="手续费（%）" align="center" width="110" >
            </el-table-column>
            <el-table-column prop="agentCode" label="固定手续费" align="center" width="100" >
              <template slot-scope="{row}">
                <span>{{row.fee == -1 ? '无' : row.fee}}</span>
              </template>
            </el-table-column>
            <el-table-column :label="'操作'"   align="center" width="100" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
                <el-button v-if="activeName == 2"  type="primary" size="mini" @click="handleBindMerchant(row)">
                  绑定
                </el-button>
                <span v-else>-</span>
            </template>
            </el-table-column>
        </el-table>
        <div slot="footer">
            <el-button @click="bindMerchantDialog = false" >
              关闭
            </el-button>
        </div>
      </el-dialog>
      <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:36px;">
            <div v-for="item,index in agent" :key="index">
                <el-form-item v-if="item.key != 'code'"  :label="item.label"  :prop="item.key" :required="item.required" :rules="formRules(item)">
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
            <el-form-item  :label="'通道&商户'" required v-if="dialogStatus1 == '新增'">
                <el-cascader ref="cascader" v-if="dialogFormVisible1"  :props="props"></el-cascader>
            </el-form-item>
            <div v-for="item,index in agentRate" :key="index">
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
          <el-button :loading="buttonLoading" type="primary" @click="dialogStatus1==='新增'?createData1():updateData1()">
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
  import { agent, formRules, agentRate } from '@/utils/table'
import { array } from 'jszip/lib/support'
  
  export default {
    name: 'Agent',
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
        agent,
        agentRate,
        type: '',
        temp1: {},
        rateList: [{rate:{}}],
        currentRow: {},
        buinessList: [],
        businessValue: '',
        allBuinessList: [],
        businessDialog: false,
        business: {
            businessSelected: ''
        },
        props: {
          lazy: true,
          lazyLoad: this.lazyLoad
        },
        bindMerchantDialog: false,
        merchantList: [],
        bindMerchantList: [],
        currentBindMerchant: [],
        activeName: '',
      }
    },
    async created() {
      for(let i of agent){
        this.temp[i.key] = i.value
        if(i.type == 'select'){
            i.list = (await utilsApi.dictionaryFindPage({type: i.listKey || i.key})).data.records
        }
      }
      this.getList()
      for(let i of agentRate){
            this.temp1[i.key] = i.value
            if(i.type == 'select'){
                i.list = (await utilsApi.dictionaryFindPage({type:  i.listKey || i.key})).data.records
            }
        }
        this.getAllBuinessList()
    },
    methods: {
      formRules,
      searchObj() {
        let obj = {}
        for(let i of this.agent){
            if(i.filter)obj[i.key] = i.value
        }
        return obj
      },
      async lazyLoad (node, resolve) {
        if(node.root){
            let res = await utilsApi.findAgencyBusiness({code: this.businessValue})
            for(let i of res.data){
                i.value = i.code
                i.leaf = node.level >= 2
                i.label = i.agencyCode
            }
            resolve(res.data);
        }else{
            let res = await utilsApi.agencyMerchant({agencyCode: node.data.agencyCode,businessCode: this.businessValue})
            for(let i of res.data){
                i.value = i.merchant
                i.label = i.merchant
                i.leaf = true
            }
            resolve(res.data);
        }
      },
      getAllBuinessList() {
        utilsApi.businessFindAll().then((res)=>{
            if(res.code == 0){
                this.allBuinessList = res.data
            }
        })
      },
      async getbuinessList(data) {
        let res = await utilsApi.findAgentType(data)
        if(res.code == 0){
            for(let i of res.data) {
                i.name = i.businessName
                i.code = i.businessCode
            }
            this.buinessList = res.data
        }
      },
      async getList() {
        this.listLoading = true
        let data = {
            page: this.listQuery.page,
            size: this.listQuery.size,
        }
        let res = await utilsApi.agentPage(Object.assign(data, this.searchObj()))
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
            let res = await utilsApi.agentInsert(data)
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
        let selectData = this.$refs.cascader.getCheckedNodes()[0]
        if(!selectData){
            this.$notify({
                    title: '警告',
                    message: '请先选择通道/商户！',
                    type: 'warning',
                    duration: 2000
                })
            return
        }
        this.$refs['dataForm1'].validate(async (valid) => {
          if (valid) {
            let data = {}
            data.rate = JSON.parse(JSON.stringify(this.temp1))
            delete data.id
            data.agencyMerchant = selectData.data.merchant
            data.agencyCode = selectData.parent.data.agencyCode
            data.businessCode = this.businessValue
            data.agentCode = this.currentRow.code
            this.buttonLoading = true
            let res = await utilsApi.agentInsterbusiness([data])
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '创建成功',
                    type: 'success',
                    duration: 2000
                })
                this.findAgencyRate()
                this.dialogFormVisible1 = false
            }
          }
        })
      },
      handleUpdate(row) {
        this.temp = row.rate
        this.dialogStatus = '编辑'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      handleUpdate1(row) {
        this.temp1 = row.rate
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
            let res = await utilsApi.updateDictionary(this.temp)
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
            let data = {
              id: this.temp1.id,
              rate: this.temp1
            }
            delete data.rate.id
            let res = await utilsApi.updateAgentBusinessRate(data)
            this.buttonLoading = false
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '更新成功',
                    type: 'success',
                    duration: 2000
                })
                this.findAgencyRate()
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
        this.currentRow = JSON.parse(JSON.stringify(row)) 
        await this.getbuinessList({agentCode: this.currentRow.code})
        if(this.buinessList && this.buinessList.length >0){
            this.businessValue = this.buinessList[0].code
            this.findAgencyRate()
        }
      },
      async findAgencyRate(code) {
        this.listLoading = true
        let res = await utilsApi.findAgentRate({agentCode: this.currentRow.code, businessCode: code || this.businessValue})
        this.listLoading = false
        this.rateList = res.data
      },
      addbuinessList() {
        this.businessDialog = true
        this.business = {
            businessSelected: ''
        }
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      handleAddbuinessList() {
        this.$refs['dataForm'].validate(async(valid) => {
          if (valid) {
            this.buinessList.push(this.allBuinessList.find(item => item.code == this.business.businessSelected))
            this.businessValue = this.business.businessSelected
            this.businessDialog = false
            this.findAgencyRate()
          }
        })
      },
      tabClick(item) {
        this.findAgencyRate(item.name)
      },
      async bindMerchant(row) {
        this.bindMerchantDialog = true
        this.agentBusinessMerchant = row
        this.activeName = '1'
        this.handleClick('1')
      },
      async findAgentBusinessMerchant() {
        let res = await utilsApi.findAgentBusinessMerchant({agentBusinessId: this.agentBusinessMerchant.id})
        this.merchantList = res.data
        this.bindMerchantList = res.data
      },
      async getMerchantByBusiness() {
        let res = await utilsApi.getMerchantByBusiness({agentCode: this.currentRow.code,businessCode: this.agentBusinessMerchant.businessCode})
        let arr = this.bindMerchantList.map(item => item.merchantBusinerssId)
        for(let i = res.data.length -1;i>=0;i--){
          if(arr.includes(res.data[i].merchantBusinerssId)){
            res.data.splice(i,1)
          }
        }
        this.merchantList = res.data
      },
      async handleBindMerchant(row) {
        let res = await utilsApi.agentInsertMerchantBusiness({agentBusinessId: this.agentBusinessMerchant.id, merchantBussinessId: row.merchantBusinerssId})
            if(res.code == 0){
                this.$notify({
                    title: '成功',
                    message: '绑定成功',
                    type: 'success',
                    duration: 2000
                })
                this.handleClick()
            }
      },
      handleClick() {
        this.merchantList = []
        if(this.activeName == 1) {
          this.findAgentBusinessMerchant()
        }else{
          this.getMerchantByBusiness()
        }
      },
    }
  }
  </script>
  